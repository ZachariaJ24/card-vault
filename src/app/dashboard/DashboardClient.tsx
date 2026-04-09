"use client";

import { Card, CardBody, CardHeader, Chip, Button } from "@heroui/react";
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

const MOCK_ACTIVITY = MOCK_CARDS.slice(0, 5).map((c, i) => ({
  name: c.player_name ?? c.name,
  sport: c.sport,
  price: c.base_price,
  change: i % 3 === 1 ? -(1.2 + i * 0.4) : (2.1 + i * 0.8),
}));

export default function DashboardClient({ user, profile, portfolio, watchlist, recentPrices }: Props) {
  const isAdmin = profile?.is_admin === true;
  const displayName = user.email?.split("@")[0] ?? "Collector";

  const totalValue = portfolio.reduce((s, p) => s + (p.purchase_price ?? 0) * (p.quantity ?? 1), 0);
  const totalCards = portfolio.reduce((s, p) => s + (p.quantity ?? 1), 0);

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
    { title: "Portfolio Value", value: totalValue > 0 ? formatCurrency(totalValue) : "$0.00", sub: "Based on purchase price", icon: "solar:wallet-money-linear", color: "text-primary" },
    { title: "Cards Owned", value: String(totalCards), sub: "In your collection", icon: "solar:layers-linear", color: "text-warning" },
    { title: "Watchlist", value: String(watchlist.length), sub: "Cards tracked", icon: "solar:eye-linear", color: "text-success" },
    { title: "Market Today", value: "+3.2%", sub: "Hockey index", icon: "solar:chart-2-linear", color: "text-success" },
  ];

  return (
    <AppLayout user={user} isAdmin={isAdmin}>
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-success font-medium uppercase tracking-wider">Live</span>
          </div>
          <h1 className="text-2xl font-bold">
            Welcome back, {displayName}
          </h1>
          <p className="text-default-500 mt-1 text-sm">Here&apos;s your collection overview.</p>
        </div>
        <div className="flex gap-2">
          <Button as={Link} href="/market" size="sm" variant="flat" color="primary"
            startContent={<Icon icon="solar:chart-2-linear" width={16} />}>
            Browse Market
          </Button>
          <Button as={Link} href="/portfolio" size="sm" color="primary"
            startContent={<Icon icon="solar:add-circle-linear" width={16} />}>
            Add Card
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {SUMMARY_CARDS.map((s) => (
          <Card key={s.title} className="border border-default-200 bg-content1" shadow="none">
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-default-500 uppercase tracking-wider font-medium">{s.title}</span>
                <Icon icon={s.icon} width={18} className={s.color} />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-default-400 mt-1">{s.sub}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Watchlist */}
        <Card className="border border-default-200 bg-content1" shadow="none">
          <CardHeader className="px-5 pt-5 pb-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="solar:eye-linear" className="text-primary" width={18} />
              <h2 className="font-semibold text-sm">Watchlist</h2>
            </div>
            <Button as={Link} href="/market" size="sm" variant="light" className="text-default-400 text-xs">
              Browse
            </Button>
          </CardHeader>
          <CardBody className="px-5 pt-3">
            {watchlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Icon icon="solar:eye-linear" className="text-default-300" width={28} />
                <p className="text-default-400 text-sm text-center">No cards on your watchlist yet.</p>
                <Button as={Link} href="/market" size="sm" variant="flat" color="primary" className="mt-1">
                  Browse Market
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {watchlist.map((item) => {
                  const card = item.cards as { name?: string; sport?: string } | null;
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-default-50 border border-default-100">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{sportEmoji(card?.sport ?? null)}</span>
                        <div>
                          <p className="text-sm font-medium">{card?.name ?? "Unknown"}</p>
                          <p className="text-xs text-default-400">{card?.sport}</p>
                        </div>
                      </div>
                      {item.alert_price && (
                        <Chip size="sm" variant="flat" color="warning" className="text-xs">
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
        <Card className="border border-default-200 bg-content1" shadow="none">
          <CardHeader className="px-5 pt-5 pb-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="solar:chart-2-linear" className="text-success" width={18} />
              <h2 className="font-semibold text-sm">Market Activity</h2>
              <Chip size="sm" color="success" variant="flat" className="text-xs">Live</Chip>
            </div>
          </CardHeader>
          <CardBody className="px-5 pt-3">
            <div className="space-y-2">
              {activity.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-default-50 border border-default-100">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{sportEmoji(item.sport)}</span>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-default-400">{item.sport}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold font-mono">{formatCurrency(item.price)}</p>
                    <p className={`text-xs font-medium ${item.change >= 0 ? "text-success" : "text-danger"}`}>
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
      <Card className="border border-default-200 bg-content1" shadow="none">
        <CardHeader className="px-5 pt-5 pb-0 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Icon icon="solar:wallet-money-linear" className="text-warning" width={18} />
            <h2 className="font-semibold text-sm">My Collection</h2>
            {portfolio.length > 0 && (
              <Chip size="sm" variant="flat" color="warning" className="text-xs">{totalCards} cards</Chip>
            )}
          </div>
          <Button as={Link} href="/portfolio" size="sm" variant="flat" color="warning">
            Manage Portfolio
          </Button>
        </CardHeader>
        <CardBody className="p-5">
          {portfolio.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Icon icon="solar:wallet-money-linear" className="text-default-300" width={36} />
              <p className="text-default-400 text-sm text-center">Your portfolio is empty.<br />Start adding cards to track your collection value.</p>
              <Button as={Link} href="/portfolio" size="sm" color="primary" className="mt-1">
                Add First Card
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default-200 text-default-500 text-xs uppercase tracking-wider">
                    <th className="pb-3 text-left font-medium">Card</th>
                    <th className="pb-3 text-left hidden md:table-cell font-medium">Sport</th>
                    <th className="pb-3 text-left hidden sm:table-cell font-medium">Grade</th>
                    <th className="pb-3 text-right font-medium">Cost Basis</th>
                    <th className="pb-3 text-right hidden sm:table-cell font-medium">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.slice(0, 8).map((item) => {
                    const card = item.cards as { name?: string; sport?: string } | null;
                    return (
                      <tr key={item.id} className="border-b border-default-100 hover:bg-default-50 transition-colors">
                        <td className="py-3 font-medium">{card?.name ?? "-"}</td>
                        <td className="py-3 text-default-500 hidden md:table-cell">{sportEmoji(card?.sport ?? null)} {card?.sport}</td>
                        <td className="py-3 hidden sm:table-cell">
                          <Chip size="sm" variant="flat" className="text-xs">{item.grade ?? "-"}</Chip>
                        </td>
                        <td className="py-3 text-right font-mono">{formatCurrency(item.purchase_price)}</td>
                        <td className="py-3 text-right text-default-400 hidden sm:table-cell">{item.quantity ?? 1}</td>
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
