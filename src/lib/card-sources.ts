/**
 * Unified card data resolver.
 * Routes to the correct API based on card sport/type:
 *   - Pokemon  → Pokemon TCG API (pokemontcg.io)
 *   - Magic    → Scryfall API
 *   - Sports   → eBay Browse API
 */

import { findPokemonImage, getPokemonPrice } from "./pokemon-tcg";
import { findMTGCardImage, getMTGPrice } from "./scryfall";
import { findCardImage, fetchSoldPrices } from "./ebay";

export type CardSource = "pokemon-tcg" | "scryfall" | "ebay";

/** Determine which API to use based on sport */
export function getCardSource(sport: string | null): CardSource {
  const s = (sport ?? "").toLowerCase();
  if (s === "pokemon") return "pokemon-tcg";
  if (s === "magic" || s === "mtg" || s === "magic: the gathering") return "scryfall";
  return "ebay";
}

/** Fetch the best image URL for a card from the appropriate source */
export async function resolveCardImage(
  sport: string | null,
  playerName: string,
  cardSet?: string,
  grade?: string,
): Promise<{ imageUrl: string | null; source: CardSource }> {
  const source = getCardSource(sport);

  try {
    switch (source) {
      case "pokemon-tcg": {
        const url = await findPokemonImage(playerName, cardSet);
        return { imageUrl: url, source };
      }
      case "scryfall": {
        const url = await findMTGCardImage(playerName, cardSet);
        return { imageUrl: url, source };
      }
      case "ebay": {
        const url = await findCardImage(playerName, cardSet ?? "", grade ?? "PSA 10");
        return { imageUrl: url, source };
      }
    }
  } catch {
    return { imageUrl: null, source };
  }
}

/** Fetch the market price for a card from the appropriate source */
export async function resolveCardPrice(
  sport: string | null,
  playerName: string,
  cardSet?: string,
  grade?: string,
): Promise<{ price: number; source: string; url?: string } | null> {
  const apiSource = getCardSource(sport);

  try {
    switch (apiSource) {
      case "pokemon-tcg": {
        return await getPokemonPrice(playerName, cardSet);
      }
      case "scryfall": {
        return await getMTGPrice(playerName);
      }
      case "ebay": {
        const sold = await fetchSoldPrices(playerName, cardSet ?? "", grade ?? "PSA 10", 5);
        if (sold.length === 0) return null;
        const avg = sold.reduce((s, p) => s + p.price, 0) / sold.length;
        return { price: Math.round(avg * 100) / 100, source: "eBay" };
      }
    }
  } catch {
    return null;
  }
}
