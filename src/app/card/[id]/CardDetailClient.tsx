"use client";

import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Chip, Tab, Tabs, Divider, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { AreaChartCard, KpiCard, SportBadge, type ChartDataPoint } from "@/components/heroui-pro";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Card as CardType, MockPricePoint } from "@/lib/types";
import type { User } from "@supabase/supabase-js";
import { formatCurrency, formatChange, playerInitials } from "@/lib/utils";

interface Props {
  card: CardType;
  chartData: MockPricePoint[];
  user: User | null;
  inWatchlist: boolean;
}

const GRADE_PRICES = [
  { grade: "PSA 10", multiplier: 1.0 },
  { grade: "PSA 9", multiplier: 0.45 },
  { grade: "BGS 9.5", multiplier: 0.85 },
  { grade: "BGS 9", multiplier: 0.4 },
  { grade: "RAW", multiplier: 0.12 },
];

const RECENT_SALES = [
  { grade: "PSA 10", price_mult: 1.0, days_ago: 1, source: "eBay" },
  { grade: "PSA 10", price_mult: 0.96, days_ago: 3, source: "PWCC" },
  { grade: "BGS 9.5", price_mult: 0.82, days_ago: 5, source: "eBay" },
  { grade: "PSA 9", price_mult: 0.43, days_ago: 7, source: "Goldin" },
  { grade: "PSA 10", price_mult: 1.04, days_ago: 9, source: "eBay" },
];

// Mock order book
function generateOrderBook(basePrice: number) {
  const bids = Array.from({ length: 5 }, (_, i) => ({
    price: Math.round(basePrice * (0.98 - i * 0.012)),
    qty: Math.floor(Math.random() * 8 + 1),
    total: 0,
  }));
  const asks = Array.from({ length: 5 }, (_, i) => ({
    price: Math.round(basePrice * (1.02 + i * 0.012)),
    qty: Math.floor(Math.random() * 8 + 1),
    total: 0,
  }));
  let bt = 0;
  for (const b of bids) { bt += b.qty; b.total = bt; }
  let at = 0;
  for (const a of asks) { at += a.qty; a.total = at; }
  return { bids, asks };
}

export default function CardDetailClient({ card, chartData, user, inWatchlist: initialWatchlist }: Props) {
  const [watched, setWatched] = useState(initialWatchlist);
  const [watchLoading, setWatchLoading] = useState(false);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const basePrice = chartData.length ? chartData[chartData.length - 1].price : 100;
  const firstPrice = chartData.length ? chartData[0].price : 100;
  const totalChange = ((basePrice - firstPrice) / firstPrice) * 100;
  const dayChange = chartData.length >= 2
    ? ((chartData[chartData.length - 1].price - chartData[chartData.length - 2].price) / chartData[chartData.length - 2].price) * 100
    : 0;

  const periodSlice = { "7d": 7, "30d": 30, "90d": 90 }[period];
  const displayData: ChartDataPoint[] = chartData.slice(-periodSlice).map((p) => ({
    label: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: Math.round(p.price),
  }));

  const { bids, asks } = generateOrderBook(basePrice);

  async function toggleWatchlist() {
    if (!user) return;
    setWatchLoading(true);
    const supabase = createSupabaseBrowserClient();
    if (watched) {
      await supabase.from("watchlist").delete().eq("user_id", user.id).eq("card_id", card.id);
      setWatched(false);
    } else {
      await supabase.from("watchlist").insert({ user_id: user.id, card_id: card.id });
      setWatched(true);
    }
    setWatchLoading(false);
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-default-400 mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Market</Link>
          <Icon icon="solar:alt-arrow-right-linear" width={12} />
          <span className="text-foreground">{card.player_name ?? card.name}</span>
        </div>

        {/* Top: Price header bar */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-default-100 border border-default-200">
              <span className="text-lg font-bold font-mono text-default-400">{playerInitials(card.player_name)}</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">{card.player_name ?? card.name}</h1>
              <p className="text-xs text-default-400">{card.card_set} &middot; {card.year} &middot; {card.team}</p>
            </div>
          </div>
          <div className="flex items-end gap-6">
            <div className="text-right">
              <p className="text-[0.65rem] text-default-400 uppercase tracking-wider">Price (PSA 10)</p>
              <p className="text-2xl font-bold font-mono">{formatCurrency(basePrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-[0.65rem] text-default-400">24h</p>
              <p className={cn("text-lg font-bold font-mono", dayChange >= 0 ? "text-success" : "text-danger")}>
                {formatChange(dayChange)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[0.65rem] text-default-400">{period}</p>
              <p className={cn("text-lg font-bold font-mono", totalChange >= 0 ? "text-success" : "text-danger")}>
                {formatChange(totalChange)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main content: chart + tabs (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Chart */}
            <Card className="border border-default-200 bg-content1">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  {(["7d", "30d", "90d"] as const).map((p) => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className={cn(
                        "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                        period === p ? "bg-primary/10 text-primary" : "text-default-400 hover:text-foreground",
                      )}>
                      {p}
                    </button>
                  ))}
                </div>
                <AreaChartCard
                  title=""
                  value=""
                  change=""
                  changeType={totalChange >= 0 ? "positive" : "negative"}
                  data={displayData}
                  height={220}
                  className="border-0 bg-transparent p-0"
                />
              </CardBody>
            </Card>

            {/* Buy/Sell buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                fullWidth
                size="lg"
                color="success"
                className="font-semibold"
                startContent={<Icon icon="solar:arrow-right-up-linear" width={18} />}
              >
                Buy
              </Button>
              <Button
                fullWidth
                size="lg"
                color="danger"
                variant="flat"
                className="font-semibold"
                startContent={<Icon icon="solar:arrow-right-down-linear" width={18} />}
              >
                Sell
              </Button>
            </div>

            {/* Tabbed content */}
            <Card className="border border-default-200 bg-content1">
              <CardBody className="p-0">
                <Tabs variant="underlined" classNames={{
                  tabList: "border-b border-default-200 px-4 gap-4",
                  cursor: "bg-primary",
                  tab: "text-xs",
                }}>
                  <Tab key="sales" title="Recent Sales">
                    <div className="px-4 pb-4 space-y-1.5">
                      {RECENT_SALES.map((sale, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-default-50 border border-default-100">
                          <div className="flex items-center gap-3">
                            <Chip size="sm" variant="flat" classNames={{ content: "text-[0.65rem] font-mono" }}>{sale.grade}</Chip>
                            <span className="text-xs text-default-400">{sale.source}</span>
                            <span className="text-[0.6rem] text-default-300">{sale.days_ago}d ago</span>
                          </div>
                          <span className="font-mono font-semibold text-sm">{formatCurrency(Math.round(basePrice * sale.price_mult))}</span>
                        </div>
                      ))}
                    </div>
                  </Tab>
                  <Tab key="grades" title="Grades">
                    <div className="px-4 pb-4 space-y-1.5">
                      {GRADE_PRICES.map((g) => (
                        <div key={g.grade} className="flex items-center justify-between p-2.5 rounded-lg bg-default-50 border border-default-100">
                          <Chip size="sm" variant="flat" classNames={{ content: "text-[0.65rem] font-mono" }}>{g.grade}</Chip>
                          <div>
                            <span className="font-mono font-semibold text-sm">{formatCurrency(Math.round(basePrice * g.multiplier))}</span>
                            <span className="text-[0.6rem] text-default-400 ml-2">{g.multiplier === 1 ? "base" : `${Math.round(g.multiplier * 100)}%`}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Tab>
                  <Tab key="pop" title="Population">
                    <div className="px-4 pb-4">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-default-200 text-default-500 text-[0.6rem] uppercase tracking-wider">
                            <th className="pb-2 text-left font-medium">Grade</th>
                            <th className="pb-2 text-right font-medium">Pop</th>
                            <th className="pb-2 text-right font-medium">Pop Higher</th>
                            <th className="pb-2 text-right font-medium">Total Graded</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { grade: "PSA 10", pop: 1245, higher: 0, total: 4580 },
                            { grade: "PSA 9", pop: 892, higher: 1245, total: 4580 },
                            { grade: "BGS 9.5", pop: 312, higher: 0, total: 1120 },
                            { grade: "BGS 9", pop: 445, higher: 312, total: 1120 },
                            { grade: "SGC 10", pop: 89, higher: 0, total: 340 },
                          ].map((r) => (
                            <tr key={r.grade} className="border-b border-default-100">
                              <td className="py-2"><Chip size="sm" variant="flat" classNames={{ content: "text-[0.6rem] font-mono" }}>{r.grade}</Chip></td>
                              <td className="py-2 text-right font-mono font-semibold">{r.pop.toLocaleString()}</td>
                              <td className="py-2 text-right font-mono text-default-400">{r.higher.toLocaleString()}</td>
                              <td className="py-2 text-right font-mono text-default-400">{r.total.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Tab>
                  <Tab key="ownership" title="Ownership">
                    <div className="px-4 pb-4 space-y-1.5">
                      {[
                        { buyer: "Collector_42", price: basePrice, date: "2 days ago" },
                        { buyer: "CardShark99", price: Math.round(basePrice * 0.96), date: "5 days ago" },
                        { buyer: "InvestorX", price: Math.round(basePrice * 0.92), date: "12 days ago" },
                        { buyer: "SlabKing", price: Math.round(basePrice * 0.88), date: "21 days ago" },
                      ].map((h, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-default-50 border border-default-100">
                          <div className="flex items-center gap-2">
                            <Icon icon="solar:user-circle-linear" className="text-default-400" width={16} />
                            <span className="text-xs font-medium">{h.buyer}</span>
                            <span className="text-[0.6rem] text-default-300">{h.date}</span>
                          </div>
                          <span className="font-mono font-semibold text-sm">{formatCurrency(h.price)}</span>
                        </div>
                      ))}
                    </div>
                  </Tab>
                </Tabs>
              </CardBody>
            </Card>
          </div>

          {/* Right sidebar (1 col) */}
          <div className="space-y-4">
            {/* Card image */}
            <Card className="border border-default-200 bg-content1">
              <CardBody className="p-4">
                <div className="w-full aspect-[2.5/3.5] rounded-lg bg-default-100 border border-default-200 flex items-center justify-center mb-3 overflow-hidden">
                  {card.image_url ? (
                    <img src={card.image_url} alt={card.player_name ?? card.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-3xl font-bold font-mono text-default-300">{playerInitials(card.player_name)}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {card.sport && <Chip size="sm" variant="flat" classNames={{ content: "text-[0.6rem]" }}>{card.sport}</Chip>}
                  {card.year && <Chip size="sm" variant="flat" color="default" classNames={{ content: "text-[0.6rem]" }}>{card.year}</Chip>}
                  {card.team && <Chip size="sm" variant="flat" color="default" classNames={{ content: "text-[0.6rem]" }}>{card.team}</Chip>}
                </div>
              </CardBody>
            </Card>

            {/* Quick stats */}
            <Card className="border border-default-200 bg-content1">
              <CardHeader className="px-4 pt-3 pb-0">
                <h3 className="text-[0.65rem] font-semibold uppercase tracking-wider text-default-500">Quick Stats</h3>
              </CardHeader>
              <CardBody className="px-4 pt-2 pb-3">
                <div className="space-y-2">
                  {[
                    { label: "PSA Pop (10)", value: "1,245" },
                    { label: "Last Sale", value: formatCurrency(basePrice) },
                    { label: "Avg (30d)", value: formatCurrency(Math.round(basePrice * 0.97)) },
                    { label: "All-Time High", value: formatCurrency(Math.round(basePrice * 1.3)) },
                    { label: "All-Time Low", value: formatCurrency(Math.round(basePrice * 0.55)) },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-[0.65rem] text-default-400">{s.label}</span>
                      <span className="text-[0.65rem] font-mono font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Order book */}
            <Card className="border border-default-200 bg-content1">
              <CardHeader className="px-4 pt-3 pb-0">
                <h3 className="text-[0.65rem] font-semibold uppercase tracking-wider text-default-500">Order Book</h3>
              </CardHeader>
              <CardBody className="px-4 pt-2 pb-3">
                {/* Asks (sells) */}
                <p className="text-[0.6rem] text-danger font-medium uppercase tracking-wider mb-1">Asks</p>
                <div className="space-y-0.5 mb-3">
                  {asks.reverse().map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-[0.65rem] py-0.5 relative">
                      <div className="absolute left-0 top-0 bottom-0 bg-danger/5 rounded-sm" style={{ width: `${Math.min((a.total / 20) * 100, 100)}%` }} />
                      <span className="font-mono text-danger relative">{formatCurrency(a.price)}</span>
                      <span className="font-mono text-default-400 relative">{a.qty}</span>
                    </div>
                  ))}
                </div>

                {/* Spread */}
                <div className="flex items-center justify-center py-1.5 border-y border-default-100 mb-3">
                  <span className="text-[0.6rem] text-default-400">Spread: </span>
                  <span className="text-[0.6rem] font-mono font-semibold ml-1">
                    {formatCurrency(Math.abs(asks[0]?.price - bids[0]?.price))}
                  </span>
                </div>

                {/* Bids (buys) */}
                <p className="text-[0.6rem] text-success font-medium uppercase tracking-wider mb-1">Bids</p>
                <div className="space-y-0.5">
                  {bids.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-[0.65rem] py-0.5 relative">
                      <div className="absolute left-0 top-0 bottom-0 bg-success/5 rounded-sm" style={{ width: `${Math.min((b.total / 20) * 100, 100)}%` }} />
                      <span className="font-mono text-success relative">{formatCurrency(b.price)}</span>
                      <span className="font-mono text-default-400 relative">{b.qty}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              {user ? (
                <>
                  <Button fullWidth onPress={toggleWatchlist} isLoading={watchLoading}
                    variant="flat" color={watched ? "success" : "primary"} size="sm"
                    startContent={<Icon icon={watched ? "solar:check-circle-bold" : "solar:eye-linear"} width={14} />}>
                    {watched ? "Watching" : "Watch"}
                  </Button>
                  <Button as={Link} href="/portfolio" fullWidth variant="flat" color="default" size="sm"
                    startContent={<Icon icon="solar:add-circle-linear" width={14} />}>
                    Add to Portfolio
                  </Button>
                </>
              ) : (
                <Button as={Link} href="/login" fullWidth color="primary" size="sm">Sign in to Trade</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
