import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SEED_CARDS } from "@/lib/seed-data";
import { findCardImage } from "@/lib/ebay";

/**
 * POST /api/seed
 *
 * Seeds the cards table with real card data.
 * Query params:
 *   ?images=true  — also fetch eBay images (slower, requires EBAY_CLIENT_ID)
 *   ?clear=true   — delete existing cards first
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY env var (not the anon key).
 */
export async function POST(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json(
      { error: "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL" },
      { status: 500 },
    );
  }

  // Use service role to bypass RLS
  const supabase = createClient(supabaseUrl, serviceKey);

  const fetchImages = req.nextUrl.searchParams.get("images") === "true";
  const clear = req.nextUrl.searchParams.get("clear") === "true";

  try {
    // Optionally clear existing cards
    if (clear) {
      await supabase.from("daily_prices").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("price_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("portfolio").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("watchlist").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("cards").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    const results: { name: string; status: string; image_url?: string | null }[] = [];

    for (const card of SEED_CARDS) {
      // Check if card already exists
      const { data: existing } = await supabase
        .from("cards")
        .select("id")
        .eq("name", card.name)
        .single();

      if (existing) {
        results.push({ name: card.name, status: "skipped (exists)" });
        continue;
      }

      // Optionally fetch image from eBay
      let image_url: string | null = null;
      if (fetchImages && process.env.EBAY_CLIENT_ID) {
        image_url = await findCardImage(
          card.player_name,
          card.card_set,
          "PSA 10",
        );
      }

      const { error } = await supabase.from("cards").insert({
        name: card.name,
        player_name: card.player_name,
        year: card.year,
        card_set: card.card_set,
        sport: card.sport,
        team: card.team,
        image_url,
      });

      if (error) {
        results.push({ name: card.name, status: `error: ${error.message}` });
      } else {
        results.push({ name: card.name, status: "inserted", image_url });
      }
    }

    const inserted = results.filter((r) => r.status === "inserted").length;
    const skipped = results.filter((r) => r.status.startsWith("skipped")).length;
    const errors = results.filter((r) => r.status.startsWith("error")).length;

    return NextResponse.json({
      summary: { total: SEED_CARDS.length, inserted, skipped, errors },
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Seed failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
