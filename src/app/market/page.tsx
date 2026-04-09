"use client";

import { useState, useMemo, useEffect } from "react";
import { Button, Input, Card, CardBody, Chip, Pagination, Select, SelectItem, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { MOCK_CARDS, SPORTS_LIST } from "@/lib/mock-data";
import { formatCurrency, formatChange, sportEmoji } from "@/lib/utils";
import type { Card as CardType } from "@/lib/types";

const PAGE_SIZE = 12;

type SortKey = "name" | "price_asc" | "price_desc" | "newest";

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
    <div className="min-h-screen bg-background">
      <PublicNav />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Card Market</h1>
          <p className="text-default-500 text-sm">Browse and track {cards.length}+ cards across all sports</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Input
            placeholder="Search cards or players..."
            value={search}
            onValueChange={(v) => { setSearch(v); setPage(1); }}
            variant="bordered"
            startContent={<Icon icon="solar:magnifer-linear" className="text-default-400" width={16} />}
            className="max-w-xs"
            classNames={{ inputWrapper: "border-default-300" }}
          />

          <Select
            selectedKeys={new Set([sport])}
            onSelectionChange={(k) => { setSport(String([...k][0])); setPage(1); }}
            variant="bordered"
            className="w-40"
            classNames={{
              trigger: "border-default-300",
              popoverContent: "bg-content1 border border-default-200",
            }}
          >
            {[{ key: "all", label: "All Sports" }, ...SPORTS_LIST.map((s) => ({ key: s, label: s }))].map((o) => (
              <SelectItem key={o.key}>{o.label}</SelectItem>
            ))}
          </Select>

          <Select
            selectedKeys={new Set([sort])}
            onSelectionChange={(k) => setSort(String([...k][0]) as SortKey)}
            variant="bordered"
            className="w-44"
            classNames={{
              trigger: "border-default-300",
              popoverContent: "bg-content1 border border-default-200",
            }}
          >
            {[
              { key: "newest", label: "Newest First" },
              { key: "price_desc", label: "Price: High to Low" },
              { key: "price_asc", label: "Price: Low to High" },
              { key: "name", label: "Name A-Z" },
            ].map((o) => (
              <SelectItem key={o.key}>{o.label}</SelectItem>
            ))}
          </Select>

          <div className="flex gap-1 ml-auto">
            <Button isIconOnly size="sm" variant={view === "grid" ? "flat" : "light"}
              color={view === "grid" ? "primary" : "default"}
              onPress={() => setView("grid")}>
              <Icon icon="solar:widget-5-linear" width={18} />
            </Button>
            <Button isIconOnly size="sm" variant={view === "list" ? "flat" : "light"}
              color={view === "list" ? "primary" : "default"}
              onPress={() => setView("list")}>
              <Icon icon="solar:list-linear" width={18} />
            </Button>
          </div>
        </div>

        <p className="text-xs text-default-400 mb-4">{filtered.length} cards found</p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border border-default-200 bg-content1" shadow="none">
                <CardBody className="p-5 gap-3">
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                  <Skeleton className="h-3 w-1/2 rounded-lg" />
                  <Skeleton className="h-6 w-2/3 rounded-lg" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginated.map((card) => (
              <Link href={`/card/${card.id}`} key={card.id}>
                <Card className="border border-default-200 bg-content1 hover:border-default-300 transition-colors cursor-pointer" shadow="none">
                  <CardBody className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Chip size="sm" variant="flat" className="text-xs">
                        {sportEmoji(card.sport)} {card.sport}
                      </Chip>
                      <span className={`text-xs font-medium ${card.change_pct >= 0 ? "text-success" : "text-danger"}`}>
                        {formatChange(card.change_pct)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                      {card.player_name ?? card.name}
                    </h3>
                    <p className="text-xs text-default-400 mb-3 line-clamp-1">{card.card_set ?? card.name}</p>
                    <div className="text-lg font-bold font-mono">
                      {formatCurrency(card.current_price)}
                    </div>
                    <div className="text-xs text-default-400 mt-0.5">{card.year ?? ""}</div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border border-default-200 bg-content1" shadow="none">
            <CardBody className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default-200 text-default-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-medium">Card</th>
                    <th className="px-5 py-3 text-left hidden md:table-cell font-medium">Sport</th>
                    <th className="px-5 py-3 text-left hidden sm:table-cell font-medium">Year</th>
                    <th className="px-5 py-3 text-right font-medium">Price</th>
                    <th className="px-5 py-3 text-right font-medium">24h</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((card) => (
                    <tr key={card.id} className="border-b border-default-100 hover:bg-default-50 transition-colors cursor-pointer">
                      <td className="px-5 py-3">
                        <Link href={`/card/${card.id}`} className="hover:text-primary transition-colors">
                          <div className="font-medium">{card.player_name ?? card.name}</div>
                          <div className="text-xs text-default-400">{card.card_set}</div>
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-default-500 hidden md:table-cell">
                        {sportEmoji(card.sport)} {card.sport}
                      </td>
                      <td className="px-5 py-3 text-default-500 hidden sm:table-cell">{card.year ?? "-"}</td>
                      <td className="px-5 py-3 text-right font-semibold font-mono">
                        {formatCurrency(card.current_price)}
                      </td>
                      <td className={`px-5 py-3 text-right font-medium ${card.change_pct >= 0 ? "text-success" : "text-danger"}`}>
                        {formatChange(card.change_pct)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination total={totalPages} page={page} onChange={setPage} variant="flat" />
          </div>
        )}
      </div>

      <footer className="border-t border-default-200 py-8 mt-10">
        <p className="text-center text-xs text-default-400">
          &copy; {new Date().getFullYear()} CardVault &middot; Midnight Studios
        </p>
      </footer>
    </div>
  );
}
