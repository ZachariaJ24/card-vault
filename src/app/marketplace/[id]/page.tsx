"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Chip, Divider, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { SportBadge } from "@/components/heroui-pro";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { playerInitials } from "@/lib/utils";
import { PLATFORM_FEE_PERCENT } from "@/lib/stripe";
import type { Listing } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

function formatPrice(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const res = await fetch(`/api/listings?limit=1`);
      const data = await res.json();
      const found = (data.listings ?? []).find((l: Listing) => l.id === id);
      setListing(found ?? null);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleBuy() {
    if (!user || !listing) return;
    setBuying(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listing.id, buyer_id: user.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Checkout failed");
      }
    } catch {
      alert("Checkout failed");
    }
    setBuying(false);
  }

  const card = listing?.cards as { name?: string; player_name?: string; sport?: string; grade?: string; image_url?: string; card_set?: string; year?: number; id?: string } | null;
  const seller = listing?.profiles as { display_name?: string; email?: string } | null;
  const isOwnListing = user?.id === listing?.seller_id;
  const fee = listing ? Math.round(listing.price * PLATFORM_FEE_PERCENT / 100) : 0;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-default-400 mb-4">
          <Link href="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
          <Icon icon="solar:alt-arrow-right-linear" width={12} />
          <span className="text-foreground">{card?.player_name ?? "Listing"}</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : !listing ? (
          <Card className="border border-default-200 bg-content1">
            <CardBody className="py-16 text-center">
              <p className="text-default-400">Listing not found or no longer active.</p>
              <Button as={Link} href="/marketplace" size="sm" variant="flat" color="primary" className="mt-3">Back to Marketplace</Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card image + info */}
            <Card className="border border-default-200 bg-content1">
              <CardBody className="p-5">
                <div className="w-full aspect-[2.5/3.5] rounded-lg bg-default-100 border border-default-200 flex items-center justify-center mb-4 overflow-hidden">
                  {card?.image_url ? (
                    <img src={card.image_url} alt={card.player_name ?? ""} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-3xl font-bold font-mono text-default-300">{playerInitials(card?.player_name ?? null)}</span>
                  )}
                </div>
                <h2 className="text-base font-semibold">{card?.player_name ?? card?.name}</h2>
                <p className="text-xs text-default-400 mt-1">{card?.card_set} &middot; {card?.year}</p>
                <div className="flex gap-1.5 mt-2">
                  <SportBadge sport={card?.sport ?? null} size="sm" />
                  {card?.grade && <Chip size="sm" variant="flat" color="primary" classNames={{ content: "text-[0.6rem] font-mono font-bold" }}>{card.grade}</Chip>}
                </div>
                {listing.condition_notes && (
                  <div className="mt-3 p-3 rounded-lg bg-default-50 border border-default-100">
                    <p className="text-[0.65rem] text-default-400 uppercase tracking-wider mb-1">Seller Notes</p>
                    <p className="text-xs text-default-600">{listing.condition_notes}</p>
                  </div>
                )}
                {card?.id && (
                  <Button as={Link} href={`/card/${card.id}`} size="sm" variant="light" className="text-xs text-default-400 mt-2 -ml-2">
                    View card details &rarr;
                  </Button>
                )}
              </CardBody>
            </Card>

            {/* Purchase panel */}
            <div className="space-y-4">
              <Card className="border border-default-200 bg-content1">
                <CardBody className="p-5">
                  <p className="text-[0.65rem] text-default-400 uppercase tracking-wider mb-1">Listing Price</p>
                  <p className="text-3xl font-bold font-mono text-success mb-4">{formatPrice(listing.price)}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-default-400">Card price</span>
                      <span className="font-mono">{formatPrice(listing.price)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-default-400">Platform fee ({PLATFORM_FEE_PERCENT}%)</span>
                      <span className="font-mono">{formatPrice(fee)}</span>
                    </div>
                    <Divider />
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Total</span>
                      <span className="font-mono">{formatPrice(listing.price)}</span>
                    </div>
                  </div>

                  <p className="text-[0.6rem] text-default-300 mb-4">
                    Shipping address collected at checkout. Card will be shipped by the seller.
                  </p>

                  {!user ? (
                    <Button as={Link} href="/login" fullWidth color="primary" size="lg" className="font-semibold">
                      Sign In to Buy
                    </Button>
                  ) : isOwnListing ? (
                    <Button fullWidth isDisabled color="default" size="lg">
                      This is your listing
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      color="success"
                      size="lg"
                      className="font-semibold"
                      isLoading={buying}
                      onPress={handleBuy}
                      startContent={<Icon icon="solar:cart-large-2-linear" width={20} />}
                    >
                      Buy Now &mdash; {formatPrice(listing.price)}
                    </Button>
                  )}
                </CardBody>
              </Card>

              <Card className="border border-default-200 bg-content1">
                <CardBody className="p-4">
                  <p className="text-[0.65rem] text-default-400 uppercase tracking-wider mb-2">Seller</p>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-default-200 text-[0.6rem] font-bold text-default-500">
                      {(seller?.display_name ?? seller?.email ?? "S").slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{seller?.display_name ?? seller?.email?.split("@")[0] ?? "Seller"}</p>
                      <p className="text-[0.6rem] text-default-400">Listed {new Date(listing.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
