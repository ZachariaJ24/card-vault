"use client";

import { Card, CardBody, CardHeader, Chip, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { KpiCard, AreaChartCard, type ChartDataPoint } from "@/components/heroui-pro";
import type { User } from "@supabase/supabase-js";
import type { Portfolio, Watchlist, DailyPrice, Profile } from "@/lib/types";
import { formatCurrency, formatChange, sportEmoji } from "@/lib/utils";
import { MOCK_CARDS, generatePriceHistory } from "@/lib/mock-data";

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

  // Portfolio chart data
  const chartData: ChartDataPoint[] = generatePriceHistory(totalValue > 0 ? totalValue : 5000)
    .slice(-30)
    .map((p) => ({
      label: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.round(p.price),
    }));

  return (
    <DashboardLayout user={user} isAdmin={isAdmin}>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-live" />
              <span className="text-[0.65rem] text-success font-semibold uppercase tracking-wider">Live</span>
            </div>
            <h1 className="text-xl font-semibold">Welcome back, {displayName}</h1>
            <p className="text-default-400 text-sm mt-0.5">Here&apos;s your collection overview.</p>
          </div>
          <div className="flex gap-2">
            <Button as={Link} href="/" size="sm" variant="flat" color="primary"
              startContent={<Icon icon="solar:chart-2-linear" width={16} />}>
              Browse Market
            </Button>
            <Button as={Link} href="/portfolio" size="sm" color="primary"
              startContent={<Icon icon="solar:add-circle-linear" width={16} />}>
              Add Card
            </Button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            title="Portfolio Value"
            value={totalValue > 0 ? formatCurrency(totalValue) : "$0.00"}
            change="+3.2%"
            changeType="positive"
            icon="solar:wallet-money-linear"
          />
          <KpiCard
            title="Cards Owned"
            value={String(totalCards)}
            change={totalCards > 0 ? "+2" : "0"}
            changeType={totalCards > 0 ? "positive" : "neutral"}
            icon="solar:layers-linear"
          />
          <KpiCard
            title="Watchlist"
            value={String(watchlist.length)}
            change={String(watchlist.length)}
            changeType="neutral"
            icon="solar:eye-linear"
          />
          <KpiCard
            title="Market Today"
            value="+3.2%"
            change="+3.2%"
            changeType="positive"
            icon="solar:chart-2-linear"
          />
        </div>

        {/* Chart */}
        <div className="mb-6">
          <AreaChartCard
            title="Portfolio Value (30d)"
            value={formatCurrency(totalValue > 0 ? totalValue : 5000)}
            change="+3.2%"
            changeType="positive"
            data={chartData}
            height={180}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Watchlist */}
          <Card className="border border-default-200 bg-content1">
            <CardHeader className="px-4 pt-4 pb-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon icon="solar:eye-linear" className="text-primary" width={18} />
                <h2 className="font-semibold text-sm">Watchlist</h2>
              </div>
              <Button as={Link} href="/" size="sm" variant="light" className="text-default-400 text-xs h-7">
                Browse
              </Button>
            </CardHeader>
            <CardBody className="px-4 pt-2">
              {watchlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Icon icon="solar:eye-linear" className="text-default-300" width={28} />
                  <p className="text-default-400 text-xs text-center">No cards on your watchlist yet.</p>
                  <Button as={Link} href="/" size="sm" variant="flat" color="primary" className="mt-1">
                    Browse Market
                  </Button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {watchlist.map((item) => {
                    const card = item.cards as { name?: string; sport?: string } | null;
                    return (
                      <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-default-50 border border-default-100">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{sportEmoji(card?.sport ?? null)}</span>
                          <div>
                            <p className="text-xs font-medium">{card?.name ?? "Unknown"}</p>
                            <p className="text-[0.65rem] text-default-400">{card?.sport}</p>
                          </div>
                        </div>
                        {item.alert_price && (
                          <Chip size="sm" variant="flat" color="warning" classNames={{ content: "text-[0.6rem] font-mono" }}>
                            {formatCurrency(item.alert_price)}
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
          <Card className="border border-default-200 bg-content1">
            <CardHeader className="px-4 pt-4 pb-0 flex items-center gap-2">
              <Icon icon="solar:chart-2-linear" className="text-success" width={18} />
              <h2 className="font-semibold text-sm">Market Activity</h2>
              <Chip size="sm" color="success" variant="flat" classNames={{ content: "text-[0.6rem] font-semibold" }}>Live</Chip>
            </CardHeader>
            <CardBody className="px-4 pt-2">
              <div className="space-y-1.5">
                {activity.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-default-50 border border-default-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{sportEmoji(item.sport)}</span>
                      <div>
                        <p className="text-xs font-medium">{item.name}</p>
                        <p className="text-[0.65rem] text-default-400">{item.sport}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-semibold">{formatCurrency(item.price)}</p>
                      <p className={`text-[0.65rem] font-mono font-medium ${item.change >= 0 ? "text-success" : "text-danger"}`}>
                        {formatChange(item.change)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
