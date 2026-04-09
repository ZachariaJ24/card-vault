import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * GET /api/listings
 * List active marketplace listings. Optional filters: ?card_id=, ?seller_id=, ?sport=, ?limit=
 */
export async function GET(req: NextRequest) {
  const db = supabase();
  const cardId = req.nextUrl.searchParams.get("card_id");
  const sellerId = req.nextUrl.searchParams.get("seller_id");
  const sport = req.nextUrl.searchParams.get("sport");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "50");

  let query = db
    .from("listings")
    .select("*, cards(id, name, player_name, card_set, year, sport, team, grade, image_url), profiles!listings_seller_id_fkey(id, email, display_name)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cardId) query = query.eq("card_id", cardId);
  if (sellerId) query = query.eq("seller_id", sellerId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter by sport if requested (through the joined card)
  let listings = data ?? [];
  if (sport) {
    listings = listings.filter((l) => {
      const card = l.cards as { sport?: string } | null;
      return card?.sport === sport;
    });
  }

  return NextResponse.json({ listings });
}

/**
 * POST /api/listings
 * Create a new listing.
 * Body: { seller_id, card_id, price (in cents), condition_notes? }
 */
export async function POST(req: NextRequest) {
  const db = supabase();
  const body = await req.json();
  const { seller_id, card_id, price, condition_notes } = body;

  if (!seller_id || !card_id || !price) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (price < 100) {
    return NextResponse.json({ error: "Minimum listing price is $1.00" }, { status: 400 });
  }

  // Verify seller has Stripe connected
  const { data: profile } = await db
    .from("profiles")
    .select("stripe_onboarded")
    .eq("id", seller_id)
    .single();

  if (!profile?.stripe_onboarded) {
    return NextResponse.json({ error: "Complete Stripe setup in Settings before listing" }, { status: 400 });
  }

  const { data, error } = await db.from("listings").insert({
    seller_id,
    card_id,
    price,
    condition_notes: condition_notes || null,
    status: "active",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listing: data });
}

/**
 * PATCH /api/listings
 * Cancel a listing. Body: { listing_id, seller_id }
 */
export async function PATCH(req: NextRequest) {
  const db = supabase();
  const { listing_id, seller_id } = await req.json();

  const { error } = await db
    .from("listings")
    .update({ status: "cancelled" })
    .eq("id", listing_id)
    .eq("seller_id", seller_id)
    .eq("status", "active");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
