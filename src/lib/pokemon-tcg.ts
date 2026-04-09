/**
 * Pokemon TCG API client.
 * https://pokemontcg.io — Free, no API key required.
 * Rate limit: 20,000 requests/day, no per-second limit (be reasonable).
 */

const BASE = "https://api.pokemontcg.io/v2";

export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  set: {
    id: string;
    name: string;
    series: string;
    releaseDate: string;
    images: { symbol: string; logo: string };
  };
  number: string;
  rarity?: string;
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices?: Record<string, {
      low?: number;
      mid?: number;
      high?: number;
      market?: number;
      directLow?: number;
    }>;
  };
  cardmarket?: {
    url: string;
    updatedAt: string;
    prices?: {
      averageSellPrice?: number;
      trendPrice?: number;
    };
  };
}

export interface PokemonSearchResult {
  data: PokemonCard[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Search Pokemon cards by name */
export async function searchPokemonCards(
  query: string,
  options?: { page?: number; pageSize?: number },
): Promise<PokemonSearchResult> {
  const params = new URLSearchParams({
    q: `name:"${query}"`,
    page: String(options?.page ?? 1),
    pageSize: String(options?.pageSize ?? 20),
    orderBy: "-set.releaseDate",
  });

  const res = await fetch(`${BASE}/cards?${params}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Pokemon TCG API error (${res.status}): ${await res.text()}`);
  }

  return res.json();
}

/** Search by set name and card name for a specific card */
export async function findPokemonCard(
  cardName: string,
  setName?: string,
): Promise<PokemonCard | null> {
  let q = `name:"${cardName}"`;
  if (setName) q += ` set.name:"${setName}"`;

  const params = new URLSearchParams({
    q,
    pageSize: "5",
    orderBy: "-set.releaseDate",
  });

  const res = await fetch(`${BASE}/cards?${params}`);
  if (!res.ok) return null;

  const data = await res.json();
  return data.data?.[0] ?? null;
}

/** Get the best image URL for a Pokemon card */
export async function findPokemonImage(
  cardName: string,
  setName?: string,
): Promise<string | null> {
  const card = await findPokemonCard(cardName, setName);
  return card?.images?.large ?? card?.images?.small ?? null;
}

/** Get TCGPlayer market price for a Pokemon card */
export async function getPokemonPrice(
  cardName: string,
  setName?: string,
): Promise<{ price: number; source: string; url: string } | null> {
  const card = await findPokemonCard(cardName, setName);
  if (!card?.tcgplayer?.prices) return null;

  // Find the best price - prefer holofoil, then normal, then 1stEditionHolofoil
  const priceTypes = ["holofoil", "1stEditionHolofoil", "reverseHolofoil", "normal", "1stEditionNormal"];
  for (const type of priceTypes) {
    const p = card.tcgplayer.prices[type];
    if (p?.market) {
      return {
        price: p.market,
        source: "TCGPlayer",
        url: card.tcgplayer.url,
      };
    }
  }

  // Fallback to cardmarket
  if (card.cardmarket?.prices?.trendPrice) {
    return {
      price: card.cardmarket.prices.trendPrice,
      source: "Cardmarket",
      url: card.cardmarket.url,
    };
  }

  return null;
}

/** Get all price variants for a Pokemon card */
export async function getPokemonPriceBreakdown(
  cardName: string,
  setName?: string,
): Promise<{ variant: string; low?: number; mid?: number; high?: number; market?: number }[]> {
  const card = await findPokemonCard(cardName, setName);
  if (!card?.tcgplayer?.prices) return [];

  return Object.entries(card.tcgplayer.prices).map(([variant, prices]) => ({
    variant,
    low: prices.low,
    mid: prices.mid,
    high: prices.high,
    market: prices.market,
  }));
}
