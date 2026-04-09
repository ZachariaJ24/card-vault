"use client";

import { Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { KpiCard, SportBadge } from "@/components/heroui-pro";
import { MOCK_CARDS, TRENDING_CHANGES } from "@/lib/mock-data";
import { formatCurrency, formatChange } from "@/lib/utils";

const ALL = MOCK_CARDS.map((c, i) => ({ ...c, change_pct: TRENDING_CHANGES[i % TRENDING_CHANGES.length] }));
const GAINERS = [...ALL].sort((a, b) => b.change_pct - a.change_pct);
const LOSERS = [...ALL].sort((a, b) => a.change_pct - b.change_pct);

function MoverTable({ cards, type }: { cards: typeof ALL; type: "gainer" | "loser" }) {
  return (
    <Card className="border border-default-200 bg-content1">
      <CardBody className="p-0">
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Icon icon={type === "gainer" ? "solar:arrow-right-up-linear" : "solar:arrow-right-down-linear"} className={type === "gainer" ? "text-success" : "text-danger"} width={16} />
            Top {type === "gainer" ? "Gainers" : "Losers"}
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-default-200 text-default-500 text-[0.65rem] uppercase tracking-wider">
            <th className="px-4 py-2 text-left font-medium">Card</th>
            <th className="px-4 py-2 text-right font-medium">Price</th>
            <th className="px-4 py-2 text-right font-medium">24h</th>
          </tr></thead>
          <tbody>{cards.map((c) => (
            <tr key={c.id} className="border-b border-default-100 hover:bg-default-50 transition-colors">
              <td className="px-4 py-2.5"><Link href={`/card/${c.id}`} className="flex items-center gap-2 hover:text-primary transition-colors"><SportBadge sport={c.sport} size="xs" /><span className="text-xs font-medium">{c.player_name}</span></Link></td>
              <td className="px-4 py-2.5 text-right font-mono font-semibold text-xs">{formatCurrency(c.base_price)}</td>
              <td className={`px-4 py-2.5 text-right font-mono font-medium text-xs ${c.change_pct >= 0 ? "text-success" : "text-danger"}`}>{formatChange(c.change_pct)}</td>
            </tr>
          ))}</tbody>
        </table>
      </CardBody>
    </Card>
  );
}

export default function MoversPage() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Market Movers</h1>
          <p className="text-default-400 text-sm mt-0.5">Biggest price changes in the last 24 hours</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MoverTable cards={GAINERS} type="gainer" />
          <MoverTable cards={LOSERS} type="loser" />
        </div>
      </div>
    </DashboardLayout>
  );
}
