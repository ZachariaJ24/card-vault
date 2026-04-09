/**
 * Scryfall API client for Magic: The Gathering.
 * https://scryfall.com/docs/api — Free, no API key required.
 * Rate limit: 10 requests/second. Add 100ms delay between calls.
 */

const BASE = "https://api.scryfall.com";

export interface ScryfallCard {
  id: string;
  name: string;
  set: string;
  set_name: string;
  collector_number: string;
  rarity: string;
  released_at: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  card_faces?: {
    name: string;
    image_uris?: {
      small: string;
      normal: string;
      large: string;
      png: string;
    };
  }[];
  prices: {
    usd?: string;
    usd_foil?: string;
    eur?: string;
    eur_foil?: string;
    tix?: string;
  };
  purchase_uris?: {
    tcgplayer?: string;
    cardmarket?: string;
    cardhoarder?: string;
  };
  scryfall_uri: string;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
}

export interface ScryfallSearchResult {
  data: ScryfallCard[];
  total_cards: number;
  has_more: boolean;
}

/** Delay between requests to stay under rate limit */
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Search for Magic cards */
export async function searchMTGCards(
  query: string,
  options?: { page?: number; order?: string },
): Promise<ScryfallSearchResult> {
  await delay(100);

  const params = new URLSearchParams({
    q: query,
    order: options?.order ?? "released",
    dir: "desc",
  });
  if (options?.page) params.set("page", String(options.page));

  const res = await fetch(`${BASE}/cards/search?${params}`);

  if (!res.ok) {
    if (res.status === 404) return { data: [], total_cards: 0, has_more: false };
    throw new Error(`Scryfall error (${res.status}): ${await res.text()}`);
  }

  return res.json();
}

/** Find a specific card by fuzzy name match */
export async function findMTGCard(
  cardName: string,
  setCode?: string,
): Promise<ScryfallCard | null> {
  await delay(100);

  const params = new URLSearchParams({ fuzzy: cardName });
  if (setCode) params.set("set", setCode);

  const res = await fetch(`${BASE}/cards/named?${params}`);
  if (!res.ok) return null;

  return res.json();
}

/** Search for a card and find the best version with an image */
export async function findMTGCardImage(
  cardName: string,
  setName?: string,
): Promise<string | null> {
  try {
    // Try fuzzy match first
    const card = await findMTGCard(cardName);
    if (card) {
      return getCardImage(card);
    }

    // Fall back to search
    let query = `!"${cardName}"`;
    if (setName) query += ` s:"${setName}"`;

    const result = await searchMTGCards(query);
    if (result.data.length > 0) {
      return getCardImage(result.data[0]);
    }

    return null;
  } catch {
    return null;
  }
}

/** Extract the best image URL from a Scryfall card */
function getCardImage(card: ScryfallCard): string | null {
  // Single-faced card
  if (card.image_uris) {
    return card.image_uris.large ?? card.image_uris.normal ?? card.image_uris.small;
  }
  // Double-faced card — use front face
  if (card.card_faces?.[0]?.image_uris) {
    const face = card.card_faces[0].image_uris;
    return face.large ?? face.normal ?? face.small;
  }
  return null;
}

/** Get prices for an MTG card */
export async function getMTGPrice(
  cardName: string,
  setCode?: string,
): Promise<{ price: number; foilPrice?: number; source: string; url: string } | null> {
  const card = await findMTGCard(cardName, setCode);
  if (!card) return null;

  const usd = card.prices.usd ? parseFloat(card.prices.usd) : null;
  const usdFoil = card.prices.usd_foil ? parseFloat(card.prices.usd_foil) : null;

  if (!usd && !usdFoil) return null;

  return {
    price: usd ?? usdFoil ?? 0,
    foilPrice: usdFoil ?? undefined,
    source: "Scryfall/TCGPlayer",
    url: card.purchase_uris?.tcgplayer ?? card.scryfall_uri,
  };
}

/** Get detailed price breakdown for an MTG card */
export async function getMTGPriceBreakdown(
  cardName: string,
): Promise<{ variant: string; price: number; currency: string }[]> {
  const card = await findMTGCard(cardName);
  if (!card) return [];

  const breakdown: { variant: string; price: number; currency: string }[] = [];

  if (card.prices.usd) breakdown.push({ variant: "Normal", price: parseFloat(card.prices.usd), currency: "USD" });
  if (card.prices.usd_foil) breakdown.push({ variant: "Foil", price: parseFloat(card.prices.usd_foil), currency: "USD" });
  if (card.prices.eur) breakdown.push({ variant: "Normal (EU)", price: parseFloat(card.prices.eur), currency: "EUR" });
  if (card.prices.eur_foil) breakdown.push({ variant: "Foil (EU)", price: parseFloat(card.prices.eur_foil), currency: "EUR" });

  return breakdown;
}
