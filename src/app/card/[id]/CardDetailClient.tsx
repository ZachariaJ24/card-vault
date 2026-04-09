"use client";

import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PriceChart from "@/components/PriceChart";
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

const GRADE_PRICES: { grade: string; multiplier: number }[] = [
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
  const displayData = chartData.slice(-periodSlice);

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
    <div className="min-h-screen bg-background">
      <PublicNav />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-default-400 mb-6">
          <Link href="/market" className="hover:text-primary transition-colors">Market</Link>
          <Icon icon="solar:alt-arrow-right-linear" width={14} />
          <span className="text-foreground">{card.player_name ?? card.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Card info */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border border-default-200 bg-content1" shadow="none">
              <CardBody className="p-6 flex flex-col items-center gap-4">
                <div className="w-full aspect-[2.5/3.5] rounded-xl bg-default-100 border border-default-200 flex items-center justify-center">
                  <span className="text-5xl">{sportEmoji(card.sport)}</span>
                </div>
                <div className="w-full text-center">
                  <h1 className="text-lg font-bold">{card.player_name ?? card.name}</h1>
                  <p className="text-default-400 text-sm mt-1">{card.card_set}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {card.sport && (
                    <Chip size="sm" variant="flat">{sportEmoji(card.sport)} {card.sport}</Chip>
                  )}
                  {card.year && (
                    <Chip size="sm" variant="flat" color="default">{card.year}</Chip>
                  )}
                  {card.team && (
                    <Chip size="sm" variant="flat" color="default">{card.team}</Chip>
                  )}
                </div>
              </CardBody>
            </Card>

            <div className="space-y-2">
              {user ? (
                <>
                  <Button fullWidth onPress={toggleWatchlist} isLoading={watchLoading}
                    variant="flat" color={watched ? "success" : "primary"}
                    startContent={<Icon icon={watched ? "solar:check-circle-bold" : "solar:eye-linear"} width={18} />}>
                    {watched ? "In Watchlist" : "Add to Watchlist"}
                  </Button>
                  <Button as={Link} href="/portfolio" fullWidth color="primary"
                    startContent={<Icon icon="solar:add-circle-linear" width={18} />}>
                    Add to Portfolio
                  </Button>
                </>
              ) : (
                <Button as={Link} href="/login" fullWidth color="primary">
                  Sign in to Track
                </Button>
              )}
            </div>
          </div>

          {/* Right: Price + Charts */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border border-default-200 bg-content1" shadow="none">
              <CardBody className="p-6">
                <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
                  <div>
                    <p className="text-xs text-default-400 uppercase tracking-wider mb-1">Current Price (PSA 10)</p>
                    <div className="text-3xl font-bold">{formatCurrency(basePrice)}</div>
                    <div className={`flex items-center gap-1.5 mt-1 ${dayChange >= 0 ? "text-success" : "text-danger"}`}>
                      <Icon icon={dayChange >= 0 ? "solar:graph-up-linear" : "solar:graph-down-linear"} width={16} />
                      <span className="text-sm font-medium">{formatChange(dayChange)} today</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-default-400">90-day return</p>
                    <p className={`text-xl font-bold ${totalChange >= 0 ? "text-success" : "text-danger"}`}>
                      {formatChange(totalChange)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {(["7d", "30d", "90d"] as const).map((p) => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        period === p ? "bg-primary/10 text-primary" : "text-default-400 hover:text-foreground"
                      }`}>
                      {p}
                    </button>
                  ))}
                </div>

                <PriceChart data={displayData} color="auto" height={140} />
              </CardBody>
            </Card>

            <Card className="border border-default-200 bg-content1" shadow="none">
              <CardHeader className="px-5 pt-5 pb-0">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:medal-ribbons-star-linear" className="text-warning" width={18} />
                  <h2 className="font-semibold text-sm">Grade Comparison</h2>
                </div>
              </CardHeader>
              <CardBody className="px-5 pt-3">
                <div className="space-y-2">
                  {GRADE_PRICES.map((g) => {
                    const price = Math.round(basePrice * g.multiplier);
                    return (
                      <div key={g.grade} className="flex items-center justify-between p-3 rounded-lg bg-default-50 border border-default-100">
                        <Chip size="sm" variant="flat">{g.grade}</Chip>
                        <div className="text-right">
                          <span className="font-semibold font-mono">{formatCurrency(price)}</span>
                          <span className="text-xs text-default-400 ml-2">
                            {g.multiplier === 1 ? "(base)" : `(${Math.round(g.multiplier * 100)}%)`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            <Card className="border border-default-200 bg-content1" shadow="none">
              <CardHeader className="px-5 pt-5 pb-0">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:history-linear" className="text-success" width={18} />
                  <h2 className="font-semibold text-sm">Recent Sales</h2>
                </div>
              </CardHeader>
              <CardBody className="px-5 pt-3">
                <div className="space-y-2">
                  {RECENT_SALES.map((sale, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-default-50 border border-default-100">
                      <div className="flex items-center gap-3">
                        <Chip size="sm" variant="flat">{sale.grade}</Chip>
                        <span className="text-xs text-default-400">{sale.source} &middot; {sale.days_ago}d ago</span>
                      </div>
                      <span className="font-semibold font-mono">
                        {formatCurrency(Math.round(basePrice * sale.price_mult))}
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      <footer className="border-t border-default-200 py-8 mt-6">
        <p className="text-center text-xs text-default-400">
          &copy; {new Date().getFullYear()} CardVault &middot; Midnight Studios
        </p>
      </footer>
    </div>
  );
}
