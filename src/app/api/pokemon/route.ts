import { NextRequest, NextResponse } from "next/server";
import { searchPokemonCards, getPokemonPriceBreakdown } from "@/lib/pokemon-tcg";

/**
 * GET /api/pokemon?q=charizard
 * GET /api/pokemon?q=charizard&prices=true
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ error: "Missing ?q= parameter" }, { status: 400 });

  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
    const result = await searchPokemonCards(q, { page, pageSize: 20 });

    const withPrices = req.nextUrl.searchParams.get("prices") === "true";
    let prices: Record<string, unknown>[] = [];
    if (withPrices && result.data.length > 0) {
      prices = await getPokemonPriceBreakdown(q);
    }

    return NextResponse.json({
      total: result.totalCount,
      cards: result.data.map((c) => ({
        id: c.id,
        name: c.name,
        set: c.set.name,
        number: c.number,
        rarity: c.rarity,
        image: c.images.large ?? c.images.small,
        prices: c.tcgplayer?.prices ?? null,
      })),
      priceBreakdown: prices,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
