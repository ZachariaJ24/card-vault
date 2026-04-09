"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Button, Input, Card, CardBody, Chip, Pagination, Select, SelectItem, Skeleton,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  User as HeroUser,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { SparklineCell, SportBadge } from "@/components/heroui-pro";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { MOCK_CARDS, SPORTS_LIST, TRENDING_CHANGES, MOCK_VOLUMES, generateSparkline } from "@/lib/mock-data";
import { formatCurrency, formatChange, playerInitials } from "@/lib/utils";
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
  change_pct: TRENDING_CHANGES[i % TRENDING_CHANGES.length],
  volume: MOCK_VOLUMES[i % MOCK_VOLUMES.length],
  sparkline: generateSparkline(c.base_price, TRENDING_CHANGES[i % TRENDING_CHANGES.length] >= 0),
}));

export default function MarketPage() {
  const [cards, setCards] = useState<typeof ENRICHED>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.from("cards").select("*").order("created_at", { ascending: false });
      if (data && data.length > 0) {
        const enriched = data.map((c, i) => ({
          ...c,
          current_price: Math.floor(Math.random() * 5000 + 100),
          change_pct: TRENDING_CHANGES[i % TRENDING_CHANGES.length],
          volume: MOCK_VOLUMES[i % MOCK_VOLUMES.length],
          sparkline: generateSparkline(500, TRENDING_CHANGES[i % TRENDING_CHANGES.length] >= 0),
          base_price: 500,
          grade: "PSA 10",
          image: "",
        }));
        setCards(enriched as typeof ENRICHED);
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
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold mb-1">Card Market</h1>
          <p className="text-default-400 text-sm">Browse {cards.length}+ cards across all sports</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <Input
            placeholder="Search cards or players..."
            value={search}
            onValueChange={(v) => { setSearch(v); setPage(1); }}
            variant="bordered"
            size="sm"
            startContent={<Icon icon="solar:magnifer-linear" className="text-default-400" width={16} />}
            className="max-w-xs"
            classNames={{ inputWrapper: "border-default-300 h-9" }}
          />
          <Select
            selectedKeys={new Set([sport])}
            onSelectionChange={(k) => { setSport(String([...k][0])); setPage(1); }}
            variant="bordered"
            size="sm"
            className="w-36"
            classNames={{ trigger: "border-default-300 h-9", popoverContent: "bg-content1 border border-default-200" }}
          >
            {[{ key: "all", label: "All Sports" }, ...SPORTS_LIST.map((s) => ({ key: s, label: s }))].map((o) => (
              <SelectItem key={o.key}>{o.label}</SelectItem>
            ))}
          </Select>
          <Select
            selectedKeys={new Set([sort])}
            onSelectionChange={(k) => setSort(String([...k][0]) as SortKey)}
            variant="bordered"
            size="sm"
            className="w-40"
            classNames={{ trigger: "border-default-300 h-9", popoverContent: "bg-content1 border border-default-200" }}
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
        </div>

        <p className="text-[0.65rem] text-default-400 mb-3">{filtered.length} cards found</p>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <Card className="border border-default-200 bg-content1">
            <CardBody className="p-0">
              <Table
                aria-label="Market cards"
                removeWrapper
                classNames={{
                  th: "bg-transparent text-default-500 text-[0.65rem] uppercase tracking-wider font-medium border-b border-default-200 py-2.5",
                  td: "py-3 text-sm",
                  tr: "hover:bg-default-50 transition-colors cursor-pointer border-b border-default-100 last:border-0",
                }}
              >
                <TableHeader>
                  <TableColumn>Card</TableColumn>
                  <TableColumn>Grade</TableColumn>
                  <TableColumn align="end">Price</TableColumn>
                  <TableColumn align="end">24h</TableColumn>
                  <TableColumn align="end" className="hidden lg:table-cell">Volume</TableColumn>
                  <TableColumn align="end" className="hidden sm:table-cell">7d</TableColumn>
                </TableHeader>
                <TableBody>
                  {paginated.map((card) => (
                    <TableRow key={card.id} href={`/card/${card.id}`}>
                      <TableCell>
                        <HeroUser
                          name={card.player_name ?? card.name}
                          description={<span className="flex items-center gap-1.5"><SportBadge sport={card.sport} size="xs" /><span>{card.card_set ?? card.sport} &middot; {card.year ?? ""}</span></span>}
                          avatarProps={{
                            radius: "sm",
                            size: "sm",
                            name: playerInitials(card.player_name),
                            classNames: { base: "bg-default-200 text-[0.6rem] font-bold text-default-500" },
                          }}
                          classNames={{
                            name: "text-xs font-medium",
                            description: "text-[0.65rem] text-default-400",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" classNames={{ content: "text-[0.65rem]" }}>{card.grade}</Chip>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-semibold text-sm">{formatCurrency(card.current_price)}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono font-medium text-xs ${card.change_pct >= 0 ? "text-success" : "text-danger"}`}>
                          {formatChange(card.change_pct)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="font-mono text-xs text-default-400">{card.volume}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex justify-end">
                          <SparklineCell data={card.sparkline} positive={card.change_pct >= 0} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination total={totalPages} page={page} onChange={setPage} variant="flat" size="sm" />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
