import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { findCardImage } from "@/lib/ebay";

/**
 * POST /api/ebay/backfill
 *
 * Finds eBay images for cards that have no image_url.
 * Query params:
 *   ?limit=10  — max cards to process (default 10)
 *
 * Requires EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, SUPABASE_SERVICE_ROLE_KEY
 */
export async function POST(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }
  if (!process.env.EBAY_CLIENT_ID) {
    return NextResponse.json({ error: "Missing EBAY_CLIENT_ID" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "10");

  // Get cards without images
  const { data: cards, error } = await supabase
    .from("cards")
    .select("id, player_name, card_set, sport")
    .is("image_url", null)
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!cards || cards.length === 0) {
    return NextResponse.json({ message: "All cards already have images", updated: 0 });
  }

  const results: { id: string; player_name: string; image_url: string | null; status: string }[] = [];

  for (const card of cards) {
    const imageUrl = await findCardImage(
      card.player_name ?? "sports card",
      card.card_set ?? "",
      "PSA 10",
    );

    if (imageUrl) {
      await supabase.from("cards").update({ image_url: imageUrl }).eq("id", card.id);
      results.push({ id: card.id, player_name: card.player_name, image_url: imageUrl, status: "updated" });
    } else {
      results.push({ id: card.id, player_name: card.player_name, image_url: null, status: "no image found" });
    }

    // Rate limit: 500ms between requests
    await new Promise((r) => setTimeout(r, 500));
  }

  const updated = results.filter((r) => r.status === "updated").length;
  return NextResponse.json({ updated, total: cards.length, results });
}
