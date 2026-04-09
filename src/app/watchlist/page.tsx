"use client";

import { Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_CARDS, TRENDING_CHANGES } from "@/lib/mock-data";
import { formatCurrency, formatChange, sportEmoji } from "@/lib/utils";

const WATCHED = MOCK_CARDS.slice(0, 6).map((c, i) => ({
  ...c,
  change_pct: TRENDING_CHANGES[i % TRENDING_CHANGES.length],
  alertPrice: i % 2 === 0 ? Math.round(c.base_price * 0.9) : null,
}));

export default function WatchlistPage() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Watchlist</h1>
          <p className="text-default-400 text-sm mt-0.5">Cards you&apos;re tracking</p>
        </div>

        <Card className="border border-default-200 bg-content1">
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default-200 text-default-500 text-[0.65rem] uppercase tracking-wider">
                  <th className="px-4 py-2.5 text-left font-medium">Card</th>
                  <th className="px-4 py-2.5 text-right font-medium">Price</th>
                  <th className="px-4 py-2.5 text-right font-medium">24h</th>
                  <th className="px-4 py-2.5 text-right hidden sm:table-cell font-medium">Alert</th>
                </tr>
              </thead>
              <tbody>
                {WATCHED.map((card) => (
                  <tr key={card.id} className="border-b border-default-100 hover:bg-default-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <Link href={`/card/${card.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <span className="text-sm">{sportEmoji(card.sport)}</span>
                        <div>
                          <p className="text-xs font-medium">{card.player_name}</p>
                          <p className="text-[0.65rem] text-default-400">{card.card_set} · {card.grade}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-xs">{formatCurrency(card.base_price)}</td>
                    <td className={`px-4 py-3 text-right font-mono font-medium text-xs ${card.change_pct >= 0 ? "text-success" : "text-danger"}`}>
                      {formatChange(card.change_pct)}
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      {card.alertPrice ? (
                        <Chip size="sm" variant="flat" color="warning" classNames={{ content: "text-[0.6rem] font-mono" }}>
                          {formatCurrency(card.alertPrice)}
                        </Chip>
                      ) : (
                        <span className="text-xs text-default-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
