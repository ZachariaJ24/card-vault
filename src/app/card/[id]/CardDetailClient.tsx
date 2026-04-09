"use client";

import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Chip, Tab, Tabs } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { AreaChartCard, type ChartDataPoint } from "@/components/heroui-pro";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Card as CardType, MockPricePoint } from "@/lib/types";
import type { User } from "@supabase/supabase-js";
import { formatCurrency, formatChange, sportEmoji } from "@/lib/utils";

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Card info */}
          <div className="space-y-4">
            <Card className="border border-default-200 bg-content1">
              <CardBody className="p-5 flex flex-col items-center gap-4">
                <div className="w-full aspect-[2.5/3.5] rounded-xl bg-default-100 border border-default-200 flex items-center justify-center">
                  <span className="text-5xl">{sportEmoji(card.sport)}</span>
                </div>
                <div className="w-full text-center">
                  <h1 className="text-lg font-semibold">{card.player_name ?? card.name}</h1>
                  <p className="text-default-400 text-sm mt-1">{card.card_set}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {card.sport && <Chip size="sm" variant="flat">{sportEmoji(card.sport)} {card.sport}</Chip>}
                  {card.year && <Chip size="sm" variant="flat" color="default">{card.year}</Chip>}
                  {card.team && <Chip size="sm" variant="flat" color="default">{card.team}</Chip>}
                </div>
              </CardBody>
            </Card>

            {/* Quick stats */}
            <Card className="border border-default-200 bg-content1">
              <CardHeader className="px-4 pt-4 pb-0">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-default-500">Quick Stats</h3>
              </CardHeader>
              <CardBody className="px-4 pt-2 pb-4">
                <div className="space-y-2.5">
                  {[
                    { label: "PSA Pop", value: "1,245" },
                    { label: "BGS Pop", value: "312" },
                    { label: "Last Sale", value: formatCurrency(basePrice) },
                    { label: "Avg Sale (30d)", value: formatCurrency(Math.round(basePrice * 0.97)) },
                    { label: "All-Time High", value: formatCurrency(Math.round(basePrice * 1.3)) },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <span className="text-xs text-default-400">{stat.label}</span>
                      <span className="text-xs font-mono font-semibold">{stat.value}</span>
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
                    startContent={<Icon icon={watched ? "solar:check-circle-bold" : "solar:eye-linear"} width={16} />}>
                    {watched ? "In Watchlist" : "Add to Watchlist"}
                  </Button>
                  <Button as={Link} href="/portfolio" fullWidth color="primary" size="sm"
                    startContent={<Icon icon="solar:add-circle-linear" width={16} />}>
                    Add to Portfolio
                  </Button>
                </>
              ) : (
                <Button as={Link} href="/login" fullWidth color="primary" size="sm">Sign in to Track</Button>
              )}
            </div>
          </div>

          {/* Right: Price + data */}
          <div className="lg:col-span-2 space-y-4">
            {/* Price header */}
            <Card className="border border-default-200 bg-content1">
              <CardBody className="p-5">
                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <p className="text-[0.65rem] text-default-400 uppercase tracking-wider mb-1">Current Price (PSA 10)</p>
                    <div className="text-3xl font-bold font-mono">{formatCurrency(basePrice)}</div>
                    <div className={`flex items-center gap-1 mt-1 ${dayChange >= 0 ? "text-success" : "text-danger"}`}>
                      <Icon icon={dayChange >= 0 ? "solar:arrow-right-up-linear" : "solar:arrow-right-down-linear"} width={14} />
                      <span className="text-xs font-mono font-semibold">{formatChange(dayChange)} today</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[0.65rem] text-default-400">{period} return</p>
                    <p className={`text-xl font-bold font-mono ${totalChange >= 0 ? "text-success" : "text-danger"}`}>
                      {formatChange(totalChange)}
                    </p>
                  </div>
                </div>

                {/* Period selector */}
                <div className="flex gap-1 mb-3">
                  {(["7d", "30d", "90d"] as const).map((p) => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        period === p ? "bg-primary/10 text-primary" : "text-default-400 hover:text-foreground"
                      }`}>
                      {p}
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Chart */}
            <AreaChartCard
              title={`Price History (${period})`}
              value={formatCurrency(basePrice)}
              change={formatChange(totalChange)}
              changeType={totalChange >= 0 ? "positive" : "negative"}
              data={displayData}
              height={200}
            />

            {/* Tabbed content */}
            <Card className="border border-default-200 bg-content1">
              <CardBody className="p-0">
                <Tabs variant="underlined" classNames={{
                  tabList: "border-b border-default-200 px-4 gap-4",
                  cursor: "bg-primary",
                  tab: "text-xs",
                }}>
                  <Tab key="sales" title="Recent Sales">
                    <div className="px-4 pb-4 space-y-2">
                      {RECENT_SALES.map((sale, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-default-50 border border-default-100">
                          <div className="flex items-center gap-3">
                            <Chip size="sm" variant="flat" classNames={{ content: "text-[0.65rem]" }}>{sale.grade}</Chip>
                            <span className="text-xs text-default-400">{sale.source} &middot; {sale.days_ago}d ago</span>
                          </div>
                          <span className="font-mono font-semibold text-sm">{formatCurrency(Math.round(basePrice * sale.price_mult))}</span>
                        </div>
                      ))}
                    </div>
                  </Tab>
                  <Tab key="grades" title="Grade Comparison">
                    <div className="px-4 pb-4 space-y-2">
                      {GRADE_PRICES.map((g) => {
                        const price = Math.round(basePrice * g.multiplier);
                        return (
                          <div key={g.grade} className="flex items-center justify-between p-2.5 rounded-lg bg-default-50 border border-default-100">
                            <Chip size="sm" variant="flat" classNames={{ content: "text-[0.65rem]" }}>{g.grade}</Chip>
                            <div>
                              <span className="font-mono font-semibold text-sm">{formatCurrency(price)}</span>
                              <span className="text-xs text-default-400 ml-2">
                                {g.multiplier === 1 ? "(base)" : `(${Math.round(g.multiplier * 100)}%)`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Tab>
                  <Tab key="pop" title="Population">
                    <div className="px-4 pb-4">
                      <div className="space-y-2">
                        {[
                          { grade: "PSA 10", pop: 1245, total: 3200 },
                          { grade: "PSA 9", pop: 892, total: 3200 },
                          { grade: "BGS 9.5", pop: 312, total: 800 },
                          { grade: "BGS 9", pop: 445, total: 800 },
                          { grade: "SGC 10", pop: 89, total: 200 },
                        ].map((row) => (
                          <div key={row.grade} className="flex items-center justify-between p-2.5 rounded-lg bg-default-50 border border-default-100">
                            <Chip size="sm" variant="flat" classNames={{ content: "text-[0.65rem]" }}>{row.grade}</Chip>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm font-semibold">{row.pop.toLocaleString()}</span>
                              <span className="text-xs text-default-400">/ {row.total.toLocaleString()} total</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Tab>
                </Tabs>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
