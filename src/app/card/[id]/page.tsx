import { createSupabaseServerClient } from "@/lib/supabase-server";
import CardDetailClient from "./CardDetailClient";
import { MOCK_CARDS, generatePriceHistory } from "@/lib/mock-data";
import type { Card, PriceHistory } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CardDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Try to fetch real card
  const { data: card } = await supabase.from("cards").select("*").eq("id", id).single();

  // Fetch price history
  const { data: priceHistory } = await supabase
    .from("price_history")
    .select("*")
    .eq("card_id", id)
    .order("sale_date", { ascending: true })
    .limit(90);

  // Fall back to mock data if card not in DB
  const mockCard = MOCK_CARDS.find((c) => c.id === id);
  const resolvedCard: Card = card ?? (mockCard
    ? {
        id: mockCard.id,
        name: mockCard.name,
        player_name: mockCard.player_name,
        year: mockCard.year,
        card_set: mockCard.card_set,
        sport: mockCard.sport,
        team: mockCard.team,
        description: null,
        image_url: null,
        created_at: new Date().toISOString(),
      }
    : {
        id,
        name: "Unknown Card",
        player_name: null,
        year: null,
        card_set: null,
        sport: null,
        team: null,
        description: null,
        image_url: null,
        created_at: new Date().toISOString(),
      }
  );

  const basePrice = mockCard?.base_price ?? 500;

  // Use mock price history if DB is empty
  const chartData = priceHistory && priceHistory.length > 0
    ? priceHistory.map((p: PriceHistory) => ({
        date: p.sale_date,
        price: p.price,
        change_pct: 0,
      }))
    : generatePriceHistory(basePrice);

  // Check watchlist
  let inWatchlist = false;
  if (user) {
    const { data } = await supabase.from("watchlist").select("id").eq("user_id", user.id).eq("card_id", id).single();
    inWatchlist = !!data;
  }

  return (
    <CardDetailClient
      card={resolvedCard}
      chartData={chartData}
      user={user}
      inWatchlist={inWatchlist}
    />
  );
}
