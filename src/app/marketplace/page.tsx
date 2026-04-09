"use client";

import { useState, useEffect } from "react";
import {
  Card, CardBody, Chip, Button, Input, Select, SelectItem, Skeleton,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  User as HeroUser,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { SportBadge } from "@/components/heroui-pro";
import { playerInitials } from "@/lib/utils";
import { SPORTS_LIST } from "@/lib/mock-data";
import type { Listing } from "@/lib/types";

function formatPrice(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams({ limit: "100" });
      if (sport !== "all") params.set("sport", sport);
      const res = await fetch(`/api/listings?${params}`);
      const data = await res.json();
      setListings(data.listings ?? []);
      setLoading(false);
    }
    load();
  }, [sport]);

  const filtered = search
    ? listings.filter((l) => {
        const card = l.cards as { player_name?: string; name?: string } | null;
        const text = `${card?.player_name ?? ""} ${card?.name ?? ""}`.toLowerCase();
        return text.includes(search.toLowerCase());
      })
    : listings;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold">Marketplace</h1>
            <p className="text-default-400 text-sm mt-0.5">Buy cards from other collectors &middot; 1% platform fee</p>
          </div>
          <Button as={Link} href="/sell" size="sm" color="primary"
            startContent={<Icon icon="solar:tag-price-linear" width={16} />}>
            Sell a Card
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <Input
            placeholder="Search listings..."
            value={search}
            onValueChange={setSearch}
            variant="bordered"
            size="sm"
            startContent={<Icon icon="solar:magnifer-linear" className="text-default-400" width={16} />}
            className="max-w-xs"
            classNames={{ inputWrapper: "border-default-300 h-9" }}
          />
          <Select
            selectedKeys={new Set([sport])}
            onSelectionChange={(k) => setSport(String([...k][0]))}
            variant="bordered"
            size="sm"
            className="w-36"
            classNames={{ trigger: "border-default-300 h-9", popoverContent: "bg-content1 border border-default-200" }}
          >
            {[{ key: "all", label: "All Sports" }, ...SPORTS_LIST.map((s) => ({ key: s, label: s }))].map((o) => (
              <SelectItem key={o.key}>{o.label}</SelectItem>
            ))}
          </Select>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border border-default-200 bg-content1">
            <CardBody className="flex flex-col items-center justify-center py-16 gap-3">
              <Icon icon="solar:shop-linear" className="text-default-300" width={40} />
              <p className="text-default-400 text-sm text-center">No listings yet.</p>
              <Button as={Link} href="/sell" size="sm" variant="flat" color="primary">List a Card for Sale</Button>
            </CardBody>
          </Card>
        ) : (
          <Card className="border border-default-200 bg-content1">
            <CardBody className="p-0">
              <Table
                aria-label="Marketplace listings"
                removeWrapper
                classNames={{
                  th: "bg-transparent text-default-500 text-[0.65rem] uppercase tracking-wider font-medium border-b border-default-200 py-2.5",
                  td: "py-3",
                  tr: "hover:bg-default-50 transition-colors cursor-pointer border-b border-default-100 last:border-0",
                }}
              >
                <TableHeader>
                  <TableColumn>Card</TableColumn>
                  <TableColumn>Grade</TableColumn>
                  <TableColumn>Seller</TableColumn>
                  <TableColumn align="end">Price</TableColumn>
                  <TableColumn align="end">Listed</TableColumn>
                  <TableColumn align="center" className="w-20">{""}</TableColumn>
                </TableHeader>
                <TableBody>
                  {filtered.map((listing) => {
                    const card = listing.cards as { name?: string; player_name?: string; sport?: string; grade?: string; image_url?: string; card_set?: string; year?: number } | null;
                    const seller = listing.profiles as { display_name?: string; email?: string } | null;
                    return (
                      <TableRow key={listing.id} href={`/marketplace/${listing.id}`}>
                        <TableCell>
                          <HeroUser
                            name={card?.player_name ?? card?.name ?? "Card"}
                            description={<span className="flex items-center gap-1.5"><SportBadge sport={card?.sport ?? null} size="xs" /><span>{card?.card_set} &middot; {card?.year}</span></span>}
                            avatarProps={{
                              radius: "sm", size: "sm",
                              src: card?.image_url ?? undefined,
                              name: playerInitials(card?.player_name ?? null),
                              classNames: { base: "bg-default-200 text-[0.6rem] font-bold text-default-500" },
                            }}
                            classNames={{ name: "text-xs font-medium", description: "text-[0.65rem] text-default-400" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat" classNames={{ content: "text-[0.65rem] font-mono" }}>{card?.grade ?? "RAW"}</Chip>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-default-400">{seller?.display_name ?? seller?.email?.split("@")[0] ?? "Seller"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-semibold text-sm text-success">{formatPrice(listing.price)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-default-400">{new Date(listing.created_at).toLocaleDateString()}</span>
                        </TableCell>
                        <TableCell>
                          <Button as={Link} href={`/marketplace/${listing.id}`} size="sm" color="success" variant="flat" className="text-xs">
                            Buy
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
