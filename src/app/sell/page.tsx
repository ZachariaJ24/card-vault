"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Button, Input, Select, SelectItem, Chip, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { SportBadge } from "@/components/heroui-pro";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { playerInitials } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import type { Card as CardType } from "@/lib/types";

export default function SellPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stripeOnboarded, setStripeOnboarded] = useState(false);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCard, setSelectedCard] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Check Stripe status
        const { data: profile } = await supabase
          .from("profiles")
          .select("stripe_onboarded")
          .eq("id", user.id)
          .single();
        setStripeOnboarded(profile?.stripe_onboarded === true);

        // Get cards for dropdown
        const { data: cardData } = await supabase
          .from("cards")
          .select("id, name, player_name, card_set, year, sport, grade, image_url")
          .order("player_name");
        setCards((cardData ?? []) as CardType[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit() {
    if (!user || !selectedCard || !price) return;
    setSubmitting(true);
    setError("");

    const priceInCents = Math.round(parseFloat(price) * 100);
    if (isNaN(priceInCents) || priceInCents < 100) {
      setError("Minimum price is $1.00");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_id: user.id,
          card_id: selectedCard,
          price: priceInCents,
          condition_notes: notes || null,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/marketplace"), 1500);
      }
    } catch {
      setError("Failed to create listing");
    }
    setSubmitting(false);
  }

  const selectedCardData = cards.find((c) => c.id === selectedCard);

  if (!loading && !user) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-lg mx-auto">
          <Card className="border border-default-200 bg-content1">
            <CardBody className="py-16 text-center">
              <Icon icon="solar:lock-password-linear" className="text-default-300 mx-auto mb-3" width={36} />
              <p className="text-default-400 text-sm mb-3">Sign in to sell cards</p>
              <Button as={Link} href="/login" color="primary" size="sm">Sign In</Button>
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!loading && !stripeOnboarded) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-lg mx-auto">
          <Card className="border border-default-200 bg-content1">
            <CardBody className="py-12 text-center">
              <Icon icon="simple-icons:stripe" className="text-[#635BFF] mx-auto mb-3" width={36} />
              <h2 className="text-base font-semibold mb-2">Connect Stripe to Start Selling</h2>
              <p className="text-default-400 text-xs mb-4 max-w-sm mx-auto">
                You need to set up a Stripe account to receive payments. This takes about 2 minutes. Go to Settings to get started.
              </p>
              <Button as={Link} href="/settings" color="primary" size="sm"
                startContent={<Icon icon="solar:settings-linear" width={16} />}>
                Go to Settings
              </Button>
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Sell a Card</h1>
          <p className="text-default-400 text-sm mt-0.5">List a card for sale on the marketplace &middot; 1% fee</p>
        </div>

        {success ? (
          <Card className="border border-success/30 bg-content1">
            <CardBody className="py-12 text-center">
              <Icon icon="solar:check-circle-bold" className="text-success mx-auto mb-3" width={40} />
              <h2 className="text-base font-semibold mb-1">Listed!</h2>
              <p className="text-default-400 text-xs">Redirecting to marketplace...</p>
            </CardBody>
          </Card>
        ) : (
          <Card className="border border-default-200 bg-content1">
            <CardBody className="p-5 space-y-4">
              {/* Card select */}
              <Select
                label="Select Card"
                selectedKeys={selectedCard ? new Set([selectedCard]) : new Set()}
                onSelectionChange={(k) => setSelectedCard(String([...k][0] ?? ""))}
                variant="bordered"
                isRequired
                classNames={{
                  trigger: "border-default-300",
                  popoverContent: "bg-content1 border border-default-200",
                }}
              >
                {cards.map((c) => (
                  <SelectItem key={c.id} textValue={`${c.player_name ?? c.name} ${c.grade ?? ""}`}>
                    <div className="flex items-center gap-2">
                      <SportBadge sport={c.sport} size="xs" />
                      <span className="text-xs">{c.player_name ?? c.name}</span>
                      {c.grade && <Chip size="sm" variant="flat" classNames={{ content: "text-[0.5rem] font-mono" }}>{c.grade}</Chip>}
                    </div>
                  </SelectItem>
                ))}
              </Select>

              {/* Preview selected card */}
              {selectedCardData && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-default-50 border border-default-100">
                  <div className="w-10 h-12 rounded border border-default-200 bg-default-100 flex items-center justify-center overflow-hidden shrink-0">
                    {selectedCardData.image_url ? (
                      <img src={selectedCardData.image_url} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[0.5rem] font-mono text-default-400">{playerInitials(selectedCardData.player_name)}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{selectedCardData.player_name ?? selectedCardData.name}</p>
                    <p className="text-[0.65rem] text-default-400">{selectedCardData.card_set} &middot; {selectedCardData.grade ?? "RAW"}</p>
                  </div>
                </div>
              )}

              {/* Price */}
              <Input
                label="Asking Price ($)"
                type="number"
                step="0.01"
                min="1"
                value={price}
                onValueChange={setPrice}
                isRequired
                variant="bordered"
                startContent={<span className="text-default-400 text-sm">$</span>}
                classNames={{ inputWrapper: "border-default-300" }}
                description={price && parseFloat(price) >= 1 ? `You receive: $${(parseFloat(price) * 0.99).toFixed(2)} after 1% fee` : undefined}
              />

              {/* Condition notes */}
              <Textarea
                label="Condition Notes (optional)"
                value={notes}
                onValueChange={setNotes}
                variant="bordered"
                placeholder="Describe the card's condition, centering, any flaws..."
                classNames={{ inputWrapper: "border-default-300" }}
                minRows={2}
              />

              {error && (
                <div className="px-3 py-2 rounded-lg bg-danger/10 text-danger text-xs flex items-center gap-2">
                  <Icon icon="solar:danger-circle-linear" width={14} />
                  {error}
                </div>
              )}

              <Button
                fullWidth
                color="primary"
                isLoading={submitting}
                isDisabled={!selectedCard || !price || parseFloat(price) < 1}
                onPress={handleSubmit}
                startContent={<Icon icon="solar:tag-price-linear" width={18} />}
              >
                List for Sale
              </Button>
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
