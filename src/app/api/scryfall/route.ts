import { NextRequest, NextResponse } from "next/server";
import { searchMTGCards, getMTGPriceBreakdown } from "@/lib/scryfall";

/**
 * GET /api/scryfall?q=black+lotus
 * GET /api/scryfall?q=lightning+bolt&prices=true
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ error: "Missing ?q= parameter" }, { status: 400 });

  try {
    const result = await searchMTGCards(q);

    const withPrices = req.nextUrl.searchParams.get("prices") === "true";
    let prices: Record<string, unknown>[] = [];
    if (withPrices && result.data.length > 0) {
      prices = await getMTGPriceBreakdown(q);
    }

    return NextResponse.json({
      total: result.total_cards,
      cards: result.data.slice(0, 20).map((c) => ({
        id: c.id,
        name: c.name,
        set: c.set_name,
        setCode: c.set,
        number: c.collector_number,
        rarity: c.rarity,
        image: c.image_uris?.large ?? c.image_uris?.normal ?? c.card_faces?.[0]?.image_uris?.large ?? null,
        prices: c.prices,
        type: c.type_line,
      })),
      priceBreakdown: prices,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
