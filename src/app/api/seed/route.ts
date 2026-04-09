import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SEED_CARDS } from "@/lib/seed-data";
import { resolveCardImage } from "@/lib/card-sources";

/**
 * POST /api/seed
 *
 * Seeds the cards table with real card data. Each card + grade = separate row.
 * Query params:
 *   ?images=true  — also fetch images (Pokemon/MTG work instantly, eBay needs key)
 *   ?clear=true   — delete existing cards first
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY env var.
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

  const supabase = createClient(supabaseUrl, serviceKey);
  const fetchImages = req.nextUrl.searchParams.get("images") === "true";
  const clear = req.nextUrl.searchParams.get("clear") === "true";

  try {
    if (clear) {
      await supabase.from("daily_prices").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("price_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("portfolio").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("watchlist").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("cards").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    const results: { name: string; grade: string; status: string; image_url?: string | null }[] = [];
    // Track images we already fetched for a base card (share across grades)
    const imageCache: Record<string, string | null> = {};

    for (const card of SEED_CARDS) {
      // Check if this card+grade combo exists
      const { data: existing } = await supabase
        .from("cards")
        .select("id")
        .eq("name", card.name)
        .eq("grade", card.grade)
        .single();

      if (existing) {
        results.push({ name: card.name, grade: card.grade, status: "skipped (exists)" });
        continue;
      }

      // Fetch image once per base card (not per grade — same card image)
      let image_url: string | null = null;
      if (fetchImages) {
        const cacheKey = card.name;
        if (cacheKey in imageCache) {
          image_url = imageCache[cacheKey];
        } else {
          const { imageUrl } = await resolveCardImage(
            card.sport,
            card.player_name,
            card.card_set,
            card.grade,
          );
          image_url = imageUrl;
          imageCache[cacheKey] = imageUrl;
          // Rate limit
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      const { error } = await supabase.from("cards").insert({
        name: card.name,
        player_name: card.player_name,
        year: card.year,
        card_set: card.card_set,
        sport: card.sport,
        team: card.team,
        grade: card.grade,
        image_url,
      });

      if (error) {
        results.push({ name: card.name, grade: card.grade, status: `error: ${error.message}` });
      } else {
        results.push({ name: card.name, grade: card.grade, status: "inserted", image_url });
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
