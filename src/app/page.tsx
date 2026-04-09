"use client";

import { useMemo } from "react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User as HeroUser,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { KpiCard, AreaChartCard, SparklineCell, SportBadge, sportTag, type ChartDataPoint } from "@/components/heroui-pro";
import { MOCK_CARDS, TRENDING_CHANGES, MOCK_VOLUMES, generatePriceHistory, generateSparkline } from "@/lib/mock-data";
import { formatCurrency, formatChange, playerInitials } from "@/lib/utils";

function buildChartData(): ChartDataPoint[] {
  const history = generatePriceHistory(100000);
  return history.slice(-30).map((p) => ({
    label: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: Math.round(p.price),
  }));
}

const ENRICHED = MOCK_CARDS.map((c, i) => ({
  ...c,
  change_pct: TRENDING_CHANGES[i % TRENDING_CHANGES.length],
  change_7d: TRENDING_CHANGES[(i + 3) % TRENDING_CHANGES.length] * 0.6,
  volume: MOCK_VOLUMES[i % MOCK_VOLUMES.length],
  sparkline: generateSparkline(c.base_price, TRENDING_CHANGES[i % TRENDING_CHANGES.length] >= 0),
}));

const TOP_GAINERS = [...ENRICHED].sort((a, b) => b.change_pct - a.change_pct).slice(0, 4);
const TOP_LOSERS = [...ENRICHED].sort((a, b) => a.change_pct - b.change_pct).slice(0, 4);

export default function HomePage() {
  const chartData = useMemo(() => buildChartData(), []);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Market Overview</h1>
            <p className="text-default-400 text-sm mt-0.5">Real-time sports card market data</p>
          </div>
          <Chip size="sm" variant="dot" color="success" classNames={{ content: "text-xs" }}>
            Updated 2m ago
          </Chip>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard title="Market Cap" value="$2.4B" change="+3.2%" changeType="positive" icon="solar:chart-2-linear" />
          <KpiCard title="24h Volume" value="$18.5M" change="+12.8%" changeType="positive" icon="solar:graph-up-linear" />
          <KpiCard title="Active Listings" value="145,200" change="-0.5%" changeType="negative" icon="solar:tag-price-linear" />
          <KpiCard title="Avg Card Value" value="$847" change="+1.4%" changeType="positive" icon="solar:wallet-money-linear" />
        </div>

        {/* Chart + Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <AreaChartCard title="Market Index" value="$2,412,000" change="+3.2%" changeType="positive" data={chartData} height={220} />
          </div>

          <Card className="border border-default-200 bg-content1">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Top Movers</h3>
                <Button as={Link} href="/movers" size="sm" variant="light" className="text-default-400 text-xs h-7">View All</Button>
              </div>

              <p className="text-tiny text-success font-medium uppercase tracking-wider mb-2">Gainers</p>
              <div className="space-y-1.5 mb-4">
                {TOP_GAINERS.map((c) => (
                  <Link key={c.id} href={`/card/${c.id}`} className="flex items-center justify-between py-1.5 hover:bg-default-50 -mx-2 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <SportBadge sport={c.sport} size="xs" />
                      <span className="text-xs font-medium truncate">{c.player_name}</span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-success shrink-0">{formatChange(c.change_pct)}</span>
                  </Link>
                ))}
              </div>

              <p className="text-tiny text-danger font-medium uppercase tracking-wider mb-2">Losers</p>
              <div className="space-y-1.5">
                {TOP_LOSERS.map((c) => (
                  <Link key={c.id} href={`/card/${c.id}`} className="flex items-center justify-between py-1.5 hover:bg-default-50 -mx-2 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <SportBadge sport={c.sport} size="xs" />
                      <span className="text-xs font-medium truncate">{c.player_name}</span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-danger shrink-0">{formatChange(c.change_pct)}</span>
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Trending table */}
        <Card className="border border-default-200 bg-content1 mb-6">
          <CardBody className="p-0">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Trending Cards</h3>
                <Chip size="sm" color="success" variant="flat" classNames={{ content: "text-[0.6rem] font-semibold" }}>Live</Chip>
              </div>
              <Button as={Link} href="/market" size="sm" variant="light" className="text-default-400 text-xs h-7">Full Market</Button>
            </div>
            <Table
              aria-label="Trending cards"
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
                <TableColumn align="end" className="hidden md:table-cell">7d</TableColumn>
                <TableColumn align="end" className="hidden lg:table-cell">Volume</TableColumn>
                <TableColumn align="end" className="hidden sm:table-cell">7d Chart</TableColumn>
              </TableHeader>
              <TableBody>
                {ENRICHED.map((card) => (
                  <TableRow key={card.id} href={`/card/${card.id}`} className="group">
                    <TableCell>
                      <HeroUser
                        name={card.player_name ?? card.name}
                        description={<span className="flex items-center gap-1.5"><SportBadge sport={card.sport} size="xs" /><span>{card.card_set} &middot; {card.year}</span></span>}
                        avatarProps={{
                          radius: "sm",
                          size: "sm",
                          name: playerInitials(card.player_name),
                          classNames: { base: "bg-default-200 text-[0.6rem] font-bold text-default-500" },
                        }}
                        classNames={{
                          name: "text-xs font-medium group-hover:text-primary transition-colors",
                          description: "text-[0.65rem] text-default-400",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" classNames={{ content: "text-[0.65rem] font-medium" }}>{card.grade}</Chip>
                    </TableCell>
                    <TableCell><span className="font-mono font-semibold text-sm">{formatCurrency(card.base_price)}</span></TableCell>
                    <TableCell>
                      <span className={`font-mono font-medium text-xs ${card.change_pct >= 0 ? "text-success" : "text-danger"}`}>{formatChange(card.change_pct)}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className={`font-mono font-medium text-xs ${card.change_7d >= 0 ? "text-success" : "text-danger"}`}>{formatChange(card.change_7d)}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="font-mono text-xs text-default-400">{card.volume.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex justify-end"><SparklineCell data={card.sparkline} positive={card.change_pct >= 0} /></div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Featured cards */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">Featured Cards</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ENRICHED.slice(0, 4).map((card) => (
              <Link key={card.id} href={`/card/${card.id}`}>
                <Card className="border border-default-200 bg-content1 hover:border-default-300 transition-colors cursor-pointer">
                  <CardBody className="p-4">
                    <div className="w-full aspect-[3/4] rounded-lg bg-default-100 flex flex-col items-center justify-center mb-3 border border-default-200">
                      <span className="text-2xl font-bold text-default-300 font-mono">{playerInitials(card.player_name)}</span>
                      <SportBadge sport={card.sport} size="xs" className="mt-1.5" />
                    </div>
                    <p className="text-xs font-medium truncate">{card.player_name}</p>
                    <p className="text-[0.65rem] text-default-400 truncate mb-2">{card.card_set} &middot; {card.grade}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-sm">{formatCurrency(card.base_price)}</span>
                      <Chip size="sm" variant="flat" color={card.change_pct >= 0 ? "success" : "danger"} classNames={{ content: "text-[0.6rem] font-mono font-semibold px-0.5" }}>
                        {formatChange(card.change_pct)}
                      </Chip>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
