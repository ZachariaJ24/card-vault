"use client";

import {
  Card, CardBody, Chip, Button,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  User as HeroUser,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { SparklineCell } from "@/components/heroui-pro";
import { MOCK_CARDS, TRENDING_CHANGES, generateSparkline } from "@/lib/mock-data";
import { formatCurrency, formatChange, sportEmoji } from "@/lib/utils";

const WATCHED = MOCK_CARDS.slice(0, 6).map((c, i) => ({
  ...c,
  change_pct: TRENDING_CHANGES[i % TRENDING_CHANGES.length],
  alertPrice: i % 2 === 0 ? Math.round(c.base_price * 0.9) : null,
  sparkline: generateSparkline(c.base_price, TRENDING_CHANGES[i % TRENDING_CHANGES.length] >= 0),
}));

export default function WatchlistPage() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Watchlist</h1>
            <p className="text-default-400 text-sm mt-0.5">{WATCHED.length} cards tracked</p>
          </div>
          <Button as={Link} href="/" size="sm" variant="flat" color="primary"
            startContent={<Icon icon="solar:add-circle-linear" width={14} />}>
            Add Cards
          </Button>
        </div>

        <Card className="border border-default-200 bg-content1">
          <CardBody className="p-0">
            <Table
              aria-label="Watchlist"
              removeWrapper
              classNames={{
                th: "bg-transparent text-default-500 text-[0.65rem] uppercase tracking-wider font-medium border-b border-default-200 py-2.5",
                td: "py-3 text-sm",
                tr: "hover:bg-default-50 transition-colors cursor-pointer border-b border-default-100 last:border-0",
              }}
            >
              <TableHeader>
                <TableColumn>Card</TableColumn>
                <TableColumn>Grade</TableColumn>
                <TableColumn align="end">Price</TableColumn>
                <TableColumn align="end">24h</TableColumn>
                <TableColumn align="end" className="hidden sm:table-cell">Alert</TableColumn>
                <TableColumn align="end" className="hidden md:table-cell">7d</TableColumn>
                <TableColumn align="center" className="w-10">
                  <span className="sr-only">Remove</span>
                </TableColumn>
              </TableHeader>
              <TableBody>
                {WATCHED.map((card) => (
                  <TableRow key={card.id} href={`/card/${card.id}`}>
                    <TableCell>
                      <HeroUser
                        name={card.player_name ?? card.name}
                        description={`${card.card_set} · ${card.year}`}
                        avatarProps={{
                          radius: "sm",
                          size: "sm",
                          name: sportEmoji(card.sport),
                          classNames: { base: "bg-default-100 text-lg" },
                        }}
                        classNames={{
                          name: "text-xs font-medium",
                          description: "text-[0.65rem] text-default-400",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" classNames={{ content: "text-[0.65rem] font-mono" }}>{card.grade}</Chip>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-semibold text-sm">{formatCurrency(card.base_price)}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono font-medium text-xs ${card.change_pct >= 0 ? "text-success" : "text-danger"}`}>
                        {formatChange(card.change_pct)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {card.alertPrice ? (
                        <Chip size="sm" variant="flat" color="warning" classNames={{ content: "text-[0.6rem] font-mono" }}>
                          {formatCurrency(card.alertPrice)}
                        </Chip>
                      ) : (
                        <span className="text-xs text-default-300">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex justify-end">
                        <SparklineCell data={card.sparkline} positive={card.change_pct >= 0} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" isIconOnly variant="light" color="danger"
                        onClick={(e) => e.stopPropagation()}>
                        <Icon icon="solar:close-circle-linear" width={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
