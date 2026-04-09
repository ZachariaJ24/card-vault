"use client";

import { Card, CardBody, CardHeader, Chip, Button, Skeleton, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import type { User } from "@supabase/supabase-js";
import type { Portfolio, Watchlist, DailyPrice, Profile } from "@/lib/types";
import { formatCurrency, formatChange, sportEmoji } from "@/lib/utils";
import { MOCK_CARDS } from "@/lib/mock-data";

interface Props {
  user: User;
  profile: Profile | null;
  portfolio: Portfolio[];
  watchlist: Watchlist[];
  recentPrices: DailyPrice[];
}

// Use mock data for activity feed if DB is empty
const MOCK_ACTIVITY = MOCK_CARDS.slice(0, 5).map((c, i) => ({
  name: c.player_name ?? c.name,
  sport: c.sport,
  price: c.base_price,
  change: i % 3 === 1 ? -(1.2 + i * 0.4) : (2.1 + i * 0.8),
}));

export default function DashboardClient({ user, profile, portfolio, watchlist, recentPrices }: Props) {
  const isAdmin = profile?.is_admin === true;
  const displayName = user.email?.split("@")[0] ?? "Collector";

  // Portfolio stats
  const totalValue = portfolio.reduce((s, p) => s + (p.purchase_price ?? 0) * (p.quantity ?? 1), 0);
  const totalCards = portfolio.reduce((s, p) => s + (p.quantity ?? 1), 0);

  // Build activity feed (real data or mock fallback)
  const activity = recentPrices.length > 0
    ? recentPrices.map((p) => ({
        name: (p.cards as { player_name?: string; name?: string; sport?: string } | null)?.player_name
          ?? (p.cards as { name?: string } | null)?.name ?? "Card",
        sport: (p.cards as { sport?: string } | null)?.sport ?? null,
        price: p.price,
        change: p.change_pct ?? 0,
      }))
    : MOCK_ACTIVITY;

  const SUMMARY_CARDS = [
    {
      title: "Portfolio Value",
      value: totalValue > 0 ? formatCurrency(totalValue) : "$0.00",
      sub: "Based on purchase price",
      icon: "solar:wallet-money-bold",
      color: "#00b4ff",
      glow: "glow-blue",
    },
    {
      title: "Cards Owned",
      value: String(totalCards),
      sub: "In your collection",
      icon: "solar:layers-bold",
      color: "#f59e0b",
      glow: "",
    },
    {
      title: "Watchlist",
      value: String(watchlist.length),
      sub: "Cards tracked",
      icon: "solar:eye-bold",
      color: "#22c55e",
      glow: "",
    },
    {
      title: "Market Today",
      value: "+3.2%",
      sub: "Hockey index",
      icon: "solar:graph-up-bold",
      color: "#22c55e",
      glow: "",
    },
  ];

  return (
    <AppLayout user={user} isAdmin={isAdmin}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-xs text-[#22c55e] font-medium uppercase tracking-wider">Live</span>
          </div>
          <h1 className="text-3xl font-black text-white">
            Welcome back,{" "}
            <span style={{ background: "linear-gradient(135deg, #00b4ff, #0088cc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {displayName}
            </span>
          </h1>
          <p className="text-[#64748b] mt-1 text-sm">Here&apos;s your collection overview.</p>
        </div>
        <div className="flex gap-2">
          <Button as={Link} href="/market" size="sm" variant="flat"
            className="bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20"
            startContent={<Icon icon="solar:graph-up-bold" width={16} />}>
            Browse Market
          </Button>
          <Button as={Link} href="/portfolio" size="sm"
            className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold"
            startContent={<Icon icon="solar:add-circle-bold" width={16} />}>
            Add Card
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {SUMMARY_CARDS.map((s) => (
          <Card key={s.title} className={`card-glass ${s.glow}`} radius="lg">
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#64748b] uppercase tracking-wider font-medium">{s.title}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                  <Icon icon={s.icon} width={18} style={{ color: s.color }} />
                </div>
              </div>
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-xs text-[#64748b] mt-1">{s.sub}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Watchlist */}
        <Card className="card-glass" radius="lg">
          <CardHeader className="px-5 pt-5 pb-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="solar:eye-bold" className="text-[#00b4ff]" width={20} />
              <h2 className="font-bold text-white">Watchlist</h2>
            </div>
            <Button as={Link} href="/market" size="sm" variant="light" className="text-[#64748b] text-xs">
              Browse →
            </Button>
          </CardHeader>
          <CardBody className="px-5 pt-3">
            {watchlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Icon icon="solar:eye-bold" className="text-[#64748b]" width={32} />
                <p className="text-[#64748b] text-sm text-center">No cards on your watchlist yet.<br />Add cards from the Market page.</p>
                <Button as={Link} href="/market" size="sm" variant="flat"
                  className="bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20 mt-2">
                  Browse Market
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {watchlist.map((item) => {
                  const card = item.cards as { name?: string; sport?: string } | null;
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-[#060d18]/50 border border-[#00b4ff]/5 hover:border-[#00b4ff]/20 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{sportEmoji(card?.sport ?? null)}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{card?.name ?? "Unknown"}</p>
                          <p className="text-xs text-[#64748b]">{card?.sport}</p>
                        </div>
                      </div>
                      {item.alert_price && (
                        <Chip size="sm" className="bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 text-xs">
                          Alert: {formatCurrency(item.alert_price)}
                        </Chip>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Market Activity */}
        <Card className="card-glass" radius="lg">
          <CardHeader className="px-5 pt-5 pb-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="solar:graph-up-bold" className="text-[#22c55e]" width={20} />
              <h2 className="font-bold text-white">Market Activity</h2>
              <Chip size="sm" className="bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 text-xs">Live</Chip>
            </div>
          </CardHeader>
          <CardBody className="px-5 pt-3">
            <div className="space-y-2">
              {activity.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#060d18]/50 border border-[#00b4ff]/5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sportEmoji(item.sport)}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{item.name}</p>
                      <p className="text-xs text-[#64748b]">{item.sport}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white font-mono">{formatCurrency(item.price)}</p>
                    <p className={`text-xs font-medium ${item.change >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      {formatChange(item.change)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Portfolio Holdings */}
      <Card className="card-glass" radius="lg">
        <CardHeader className="px-5 pt-5 pb-0 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Icon icon="solar:wallet-bold" className="text-[#f59e0b]" width={20} />
            <h2 className="font-bold text-white">My Collection</h2>
            {portfolio.length > 0 && (
              <Chip size="sm" className="bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 text-xs">
                {totalCards} cards
              </Chip>
            )}
          </div>
          <Button as={Link} href="/portfolio" size="sm" variant="flat"
            className="bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
            Manage Portfolio
          </Button>
        </CardHeader>
        <CardBody className="p-5">
          {portfolio.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Icon icon="solar:wallet-bold" className="text-[#64748b]" width={40} />
              <p className="text-[#64748b] text-sm text-center">Your portfolio is empty.<br />Start adding cards to track your collection value.</p>
              <Button as={Link} href="/portfolio" size="sm"
                className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold mt-1">
                Add First Card
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#00b4ff]/10 text-[#64748b] text-xs uppercase tracking-wider">
                    <th className="pb-3 text-left">Card</th>
                    <th className="pb-3 text-left hidden md:table-cell">Sport</th>
                    <th className="pb-3 text-left hidden sm:table-cell">Grade</th>
                    <th className="pb-3 text-right">Cost Basis</th>
                    <th className="pb-3 text-right hidden sm:table-cell">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.slice(0, 8).map((item) => {
                    const card = item.cards as { name?: string; sport?: string } | null;
                    return (
                      <tr key={item.id} className="border-b border-[#00b4ff]/5 hover:bg-[#00b4ff]/5 transition-colors">
                        <td className="py-3 text-white font-medium">{card?.name ?? "—"}</td>
                        <td className="py-3 text-[#64748b] hidden md:table-cell">{sportEmoji(card?.sport ?? null)} {card?.sport}</td>
                        <td className="py-3 hidden sm:table-cell">
                          <Chip size="sm" variant="flat" className="bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20 text-xs">
                            {item.grade ?? "—"}
                          </Chip>
                        </td>
                        <td className="py-3 text-right font-mono text-white">{formatCurrency(item.purchase_price)}</td>
                        <td className="py-3 text-right text-[#64748b] hidden sm:table-cell">{item.quantity ?? 1}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </AppLayout>
  );
}
