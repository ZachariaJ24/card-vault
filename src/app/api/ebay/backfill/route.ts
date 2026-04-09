import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resolveCardImage, getCardSource } from "@/lib/card-sources";

/**
 * POST /api/ebay/backfill
 *
 * Finds images for cards that have no image_url.
 * Routes to the correct API per card type:
 *   - Pokemon → Pokemon TCG API (free, no key)
 *   - Magic   → Scryfall API (free, no key)
 *   - Sports  → eBay Browse API (requires EBAY_CLIENT_ID)
 *
 * Query params:
 *   ?limit=10  — max cards to process (default 10)
 *   ?sport=Pokemon — only process cards of this sport
 */
export async function POST(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "10");
  const sportFilter = req.nextUrl.searchParams.get("sport");

  // Get cards without images
  let query = supabase
    .from("cards")
    .select("id, player_name, card_set, sport")
    .is("image_url", null)
    .limit(limit);

  if (sportFilter) {
    query = query.eq("sport", sportFilter);
  }

  const { data: cards, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!cards || cards.length === 0) {
    return NextResponse.json({ message: "All cards already have images", updated: 0 });
  }

  const results: { id: string; player_name: string; sport: string | null; source: string; image_url: string | null; status: string }[] = [];

  for (const card of cards) {
    const source = getCardSource(card.sport);

    // Skip eBay cards if no eBay key configured
    if (source === "ebay" && !process.env.EBAY_CLIENT_ID) {
      results.push({ id: card.id, player_name: card.player_name, sport: card.sport, source, image_url: null, status: "skipped (no eBay key)" });
      continue;
    }

    const { imageUrl } = await resolveCardImage(
      card.sport,
      card.player_name ?? "card",
      card.card_set ?? undefined,
    );

    if (imageUrl) {
      await supabase.from("cards").update({ image_url: imageUrl }).eq("id", card.id);
      results.push({ id: card.id, player_name: card.player_name, sport: card.sport, source, image_url: imageUrl, status: "updated" });
    } else {
      results.push({ id: card.id, player_name: card.player_name, sport: card.sport, source, image_url: null, status: "no image found" });
    }

    // Rate limit between requests
    await new Promise((r) => setTimeout(r, source === "scryfall" ? 150 : 300));
  }

  const updated = results.filter((r) => r.status === "updated").length;
  return NextResponse.json({ updated, total: cards.length, results });
}
