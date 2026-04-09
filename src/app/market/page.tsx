"use client";

import { useState, useMemo, useEffect } from "react";
import { Button, Input, Card, CardBody, Chip, Pagination, Select, SelectItem, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { MOCK_CARDS, SPORTS_LIST, GRADE_OPTIONS } from "@/lib/mock-data";
import { formatCurrency, formatChange, sportEmoji } from "@/lib/utils";
import type { Card as CardType } from "@/lib/types";

const PAGE_SIZE = 12;

type SortKey = "name" | "price_asc" | "price_desc" | "newest";

// Enrich mock cards with stable prices/changes
const ENRICHED = MOCK_CARDS.map((c, i) => ({
  ...c,
  id: c.id,
  description: null as string | null,
  image_url: null as string | null,
  created_at: new Date().toISOString(),
  current_price: c.base_price,
  change_pct: [5.2, -2.1, 12.4, 1.8, 0.5, 18.7, -1.3, 3.6, -0.5, 4.1][i % 10],
}));

export default function MarketPage() {
  const [cards, setCards] = useState<(CardType & { current_price: number; change_pct: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.from("cards").select("*").order("created_at", { ascending: false });
      if (data && data.length > 0) {
        const enriched = data.map((c) => ({
          ...c,
          current_price: Math.floor(Math.random() * 5000 + 100),
          change_pct: parseFloat(((Math.random() - 0.45) * 15).toFixed(1)),
        }));
        setCards(enriched);
      } else {
        setCards(ENRICHED);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = [...cards];
    if (search) result = result.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.player_name ?? "").toLowerCase().includes(search.toLowerCase())
    );
    if (sport !== "all") result = result.filter((c) => c.sport === sport);
    switch (sort) {
      case "price_asc": result.sort((a, b) => a.current_price - b.current_price); break;
      case "price_desc": result.sort((a, b) => b.current_price - a.current_price); break;
      case "name": result.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return result;
  }, [cards, search, sport, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#060d18]">
      <PublicNav />

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Card Market</h1>
          <p className="text-[#64748b]">Browse and track {cards.length}+ cards across all sports</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Input
            placeholder="Search cards or players…"
            value={search}
            onValueChange={(v) => { setSearch(v); setPage(1); }}
            variant="bordered"
            startContent={<Icon icon="solar:magnifer-bold" className="text-[#64748b]" width={16} />}
            className="max-w-xs"
            classNames={{
              inputWrapper: "bg-[#0a1628] border-[#00b4ff]/20 hover:border-[#00b4ff]/40",
              input: "text-white",
            }}
          />

          <Select
            selectedKeys={new Set([sport])}
            onSelectionChange={(k) => { setSport(String([...k][0])); setPage(1); }}
            variant="bordered"
            className="w-40"
            classNames={{
              trigger: "bg-[#0a1628] border-[#00b4ff]/20",
              value: "text-white",
              listbox: "bg-[#0a1628]",
              popoverContent: "bg-[#0a1628] border border-[#00b4ff]/20",
            }}
          >
            {[{ key: "all", label: "All Sports" }, ...SPORTS_LIST.map((s) => ({ key: s, label: s }))].map((o) => (
              <SelectItem key={o.key} className="text-white">{o.label}</SelectItem>
            ))}
          </Select>

          <Select
            selectedKeys={new Set([sort])}
            onSelectionChange={(k) => setSport(String([...k][0]))}
            variant="bordered"
            className="w-44"
            classNames={{
              trigger: "bg-[#0a1628] border-[#00b4ff]/20",
              value: "text-white",
              listbox: "bg-[#0a1628]",
              popoverContent: "bg-[#0a1628] border border-[#00b4ff]/20",
            }}
          >
            {[
              { key: "newest", label: "Newest First" },
              { key: "price_desc", label: "Price: High → Low" },
              { key: "price_asc", label: "Price: Low → High" },
              { key: "name", label: "Name A–Z" },
            ].map((o) => (
              <SelectItem key={o.key} className="text-white">{o.label}</SelectItem>
            ))}
          </Select>

          <div className="flex gap-1 ml-auto">
            <Button isIconOnly size="sm" variant="flat"
              className={view === "grid" ? "bg-[#00b4ff]/20 text-[#00b4ff] border border-[#00b4ff]/30" : "bg-[#0a1628] text-[#64748b] border border-[#00b4ff]/10"}
              onPress={() => setView("grid")}>
              <Icon icon="solar:widget-5-bold" width={18} />
            </Button>
            <Button isIconOnly size="sm" variant="flat"
              className={view === "list" ? "bg-[#00b4ff]/20 text-[#00b4ff] border border-[#00b4ff]/30" : "bg-[#0a1628] text-[#64748b] border border-[#00b4ff]/10"}
              onPress={() => setView("list")}>
              <Icon icon="solar:list-bold" width={18} />
            </Button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-[#64748b] mb-4">{filtered.length} cards found</p>

        {/* Grid View */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="card-glass" radius="lg">
                <CardBody className="p-5 gap-3">
                  <Skeleton className="h-4 w-3/4 rounded-lg bg-[#0f1d32]" />
                  <Skeleton className="h-3 w-1/2 rounded-lg bg-[#0f1d32]" />
                  <Skeleton className="h-6 w-2/3 rounded-lg bg-[#0f1d32]" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginated.map((card) => (
              <Link href={`/card/${card.id}`} key={card.id}>
                <Card className="card-glass hover:border-[#00b4ff]/30 hover:glow-blue transition-all cursor-pointer group" radius="lg">
                  <CardBody className="p-5">
                    {/* Sport badge */}
                    <div className="flex items-center justify-between mb-3">
                      <Chip size="sm" variant="flat" className="bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20 text-xs">
                        {sportEmoji(card.sport)} {card.sport}
                      </Chip>
                      <span className={`text-xs font-semibold ${card.change_pct >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                        {formatChange(card.change_pct)}
                      </span>
                    </div>

                    {/* Card info */}
                    <h3 className="font-bold text-white text-sm mb-1 group-hover:text-[#00b4ff] transition-colors line-clamp-1">
                      {card.player_name ?? card.name}
                    </h3>
                    <p className="text-xs text-[#64748b] mb-3 line-clamp-1">{card.card_set ?? card.name}</p>

                    {/* Price */}
                    <div className="text-lg font-black text-white font-mono">
                      {formatCurrency(card.current_price)}
                    </div>
                    <div className="text-xs text-[#64748b] mt-0.5">{card.year ?? ""}</div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          /* List View */
          <Card className="card-glass" radius="lg">
            <CardBody className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#00b4ff]/10 text-[#64748b] text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Card</th>
                    <th className="px-5 py-3 text-left hidden md:table-cell">Sport</th>
                    <th className="px-5 py-3 text-left hidden sm:table-cell">Year</th>
                    <th className="px-5 py-3 text-right">Price</th>
                    <th className="px-5 py-3 text-right">24h</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((card) => (
                    <tr key={card.id} className="border-b border-[#00b4ff]/5 hover:bg-[#00b4ff]/5 transition-colors cursor-pointer">
                      <td className="px-5 py-3">
                        <Link href={`/card/${card.id}`} className="hover:text-[#00b4ff] transition-colors">
                          <div className="font-medium text-white">{card.player_name ?? card.name}</div>
                          <div className="text-xs text-[#64748b]">{card.card_set}</div>
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-[#64748b] hidden md:table-cell">
                        {sportEmoji(card.sport)} {card.sport}
                      </td>
                      <td className="px-5 py-3 text-[#64748b] hidden sm:table-cell">{card.year ?? "—"}</td>
                      <td className="px-5 py-3 text-right font-bold font-mono text-white">
                        {formatCurrency(card.current_price)}
                      </td>
                      <td className={`px-5 py-3 text-right font-semibold ${card.change_pct >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                        {formatChange(card.change_pct)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              total={totalPages}
              page={page}
              onChange={setPage}
              classNames={{
                item: "bg-[#0a1628] text-[#64748b] border border-[#00b4ff]/10",
                cursor: "bg-[#00b4ff] text-[#060d18] font-bold",
              }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#00b4ff]/10 py-8 mt-10">
        <p className="text-center text-xs text-[#64748b]">
          © {new Date().getFullYear()} CardVault · A <span className="text-[#00b4ff]">Midnight Studios</span> product
        </p>
      </footer>
    </div>
  );
}
