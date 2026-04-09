"use client";

import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PriceChart from "@/components/PriceChart";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Card as CardType, MockPricePoint } from "@/lib/types";
import type { User } from "@supabase/supabase-js";
import { formatCurrency, formatChange, sportEmoji } from "@/lib/utils";
import { GRADE_OPTIONS } from "@/lib/mock-data";

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
    <div className="min-h-screen bg-[#060d18]">
      <PublicNav />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#64748b] mb-6">
          <Link href="/market" className="hover:text-[#00b4ff] transition-colors">Market</Link>
          <Icon icon="solar:alt-arrow-right-bold" width={14} />
          <span className="text-white">{card.player_name ?? card.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Card info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Card image placeholder */}
            <Card className="card-glass glow-blue" radius="lg">
              <CardBody className="p-6 flex flex-col items-center gap-4">
                <div className="w-full aspect-[2.5/3.5] rounded-xl bg-gradient-to-br from-[#0f1d32] to-[#0a1628] border border-[#00b4ff]/20 flex items-center justify-center">
                  <span className="text-6xl">{sportEmoji(card.sport)}</span>
                </div>
                <div className="w-full text-center">
                  <h1 className="text-xl font-black text-white">{card.player_name ?? card.name}</h1>
                  <p className="text-[#64748b] text-sm mt-1">{card.card_set}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {card.sport && (
                    <Chip size="sm" className="bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20">
                      {sportEmoji(card.sport)} {card.sport}
                    </Chip>
                  )}
                  {card.year && (
                    <Chip size="sm" className="bg-[#0f1d32] text-[#64748b] border border-[#64748b]/20">
                      {card.year}
                    </Chip>
                  )}
                  {card.team && (
                    <Chip size="sm" className="bg-[#0f1d32] text-[#64748b] border border-[#64748b]/20">
                      {card.team}
                    </Chip>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              {user ? (
                <>
                  <Button
                    fullWidth
                    onPress={toggleWatchlist}
                    isLoading={watchLoading}
                    variant="flat"
                    className={watched
                      ? "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20"
                      : "bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20"}
                    startContent={<Icon icon={watched ? "solar:check-circle-bold" : "solar:eye-bold"} width={18} />}
                  >
                    {watched ? "In Watchlist" : "Add to Watchlist"}
                  </Button>
                  <Button as={Link} href="/portfolio" fullWidth
                    className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold glow-gold"
                    startContent={<Icon icon="solar:add-circle-bold" width={18} />}>
                    Add to Portfolio
                  </Button>
                </>
              ) : (
                <Button as={Link} href="/login" fullWidth
                  className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold glow-gold">
                  Sign in to Track
                </Button>
              )}
            </div>
          </div>

          {/* Right: Price + Charts */}
          <div className="lg:col-span-2 space-y-5">
            {/* Price header */}
            <Card className="card-glass glow-blue" radius="lg">
              <CardBody className="p-6">
                <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
                  <div>
                    <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">Current Price (PSA 10)</p>
                    <div className="text-4xl font-black text-white">{formatCurrency(basePrice)}</div>
                    <div className={`flex items-center gap-1.5 mt-1 ${dayChange >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      <Icon icon={dayChange >= 0 ? "solar:graph-up-bold" : "solar:graph-down-bold"} width={16} />
                      <span className="text-sm font-semibold">{formatChange(dayChange)} today</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#64748b]">90-day return</p>
                    <p className={`text-2xl font-bold ${totalChange >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      {formatChange(totalChange)}
                    </p>
                  </div>
                </div>

                {/* Period selector */}
                <div className="flex gap-1 mb-4">
                  {(["7d", "30d", "90d"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        period === p
                          ? "bg-[#00b4ff]/20 text-[#00b4ff] border border-[#00b4ff]/30"
                          : "text-[#64748b] hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <PriceChart data={displayData} color="auto" height={140} />
              </CardBody>
            </Card>

            {/* Grade comparison */}
            <Card className="card-glass" radius="lg">
              <CardHeader className="px-5 pt-5 pb-0">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:medal-ribbons-star-bold" className="text-[#f59e0b]" width={20} />
                  <h2 className="font-bold text-white">Grade Comparison</h2>
                </div>
              </CardHeader>
              <CardBody className="px-5 pt-3">
                <div className="space-y-2">
                  {GRADE_PRICES.map((g) => {
                    const price = Math.round(basePrice * g.multiplier);
                    return (
                      <div key={g.grade} className="flex items-center justify-between p-3 rounded-lg bg-[#060d18]/50 border border-[#00b4ff]/5">
                        <Chip size="sm" variant="flat" className="bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20">
                          {g.grade}
                        </Chip>
                        <div className="text-right">
                          <span className="font-bold font-mono text-white">{formatCurrency(price)}</span>
                          <span className="text-xs text-[#64748b] ml-2">
                            {g.multiplier === 1 ? "(base)" : `(${Math.round(g.multiplier * 100)}% of PSA 10)`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            {/* Recent sales */}
            <Card className="card-glass" radius="lg">
              <CardHeader className="px-5 pt-5 pb-0">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:history-bold" className="text-[#22c55e]" width={20} />
                  <h2 className="font-bold text-white">Recent Sales</h2>
                </div>
              </CardHeader>
              <CardBody className="px-5 pt-3">
                <div className="space-y-2">
                  {RECENT_SALES.map((sale, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#060d18]/50 border border-[#00b4ff]/5">
                      <div className="flex items-center gap-3">
                        <Chip size="sm" variant="flat" className="bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20">
                          {sale.grade}
                        </Chip>
                        <span className="text-xs text-[#64748b]">{sale.source} · {sale.days_ago}d ago</span>
                      </div>
                      <span className="font-bold font-mono text-white">
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

      <footer className="border-t border-[#00b4ff]/10 py-8 mt-6">
        <p className="text-center text-xs text-[#64748b]">
          © {new Date().getFullYear()} CardVault · A <span className="text-[#00b4ff]">Midnight Studios</span> product
        </p>
      </footer>
    </div>
  );
}
