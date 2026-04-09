/**
 * Generate "Buy" and "Sell" links for cards.
 * Routes to the best marketplace based on card type,
 * pre-filtered to the exact card + grade + cheapest first.
 */

type CardInfo = {
  playerName: string;
  cardName: string;
  year?: number | null;
  cardSet?: string | null;
  sport?: string | null;
  grade?: string | null;
};

export interface BuyLink {
  label: string;
  url: string;
  icon: string;
}

/** Build a search query string for a specific card */
function buildQuery(card: CardInfo): string {
  const parts = [card.playerName];
  if (card.cardSet) parts.push(card.cardSet);
  if (card.year) parts.push(String(card.year));
  if (card.grade) parts.push(card.grade);
  return parts.join(" ");
}

/** eBay: search for the card sorted by lowest price + Buy It Now */
function ebayBuyLink(card: CardInfo): BuyLink {
  const query = buildQuery(card);
  const params = new URLSearchParams({
    _nkw: query,
    _sacat: "212", // Sports Trading Cards
    _sop: "15", // Sort: Price + Shipping: lowest first
    LH_BIN: "1", // Buy It Now only
  });
  return {
    label: "eBay",
    url: `https://www.ebay.com/sch/i.html?${params}`,
    icon: "simple-icons:ebay",
  };
}

/** eBay: sell link (create listing page) */
function ebaySellLink(card: CardInfo): BuyLink {
  const query = buildQuery(card);
  return {
    label: "Sell on eBay",
    url: `https://www.ebay.com/sl/sell?query=${encodeURIComponent(query)}`,
    icon: "simple-icons:ebay",
  };
}

/** TCGPlayer: search for Pokemon/MTG cards sorted by price */
function tcgplayerBuyLink(card: CardInfo): BuyLink {
  const query = `${card.playerName} ${card.cardSet ?? ""}`.trim();
  return {
    label: "TCGPlayer",
    url: `https://www.tcgplayer.com/search/all/product?q=${encodeURIComponent(query)}&view=grid&ProductLineName=${card.sport === "Pokemon" ? "pokemon" : "magic-the-gathering"}`,
    icon: "mdi:cards",
  };
}

/** Cardmarket: search for MTG/Pokemon cards (EU marketplace) */
function cardmarketBuyLink(card: CardInfo): BuyLink {
  const query = card.playerName;
  const game = card.sport === "Pokemon" ? "Pokemon" : "MagicTheGathering";
  return {
    label: "Cardmarket",
    url: `https://www.cardmarket.com/en/${game}/Products/Search?searchString=${encodeURIComponent(query)}`,
    icon: "mdi:shopping",
  };
}

/** COMC: sports cards marketplace */
function comcBuyLink(card: CardInfo): BuyLink {
  const query = buildQuery(card);
  return {
    label: "COMC",
    url: `https://www.comc.com/Cards?search=${encodeURIComponent(query)}&sort=low_price`,
    icon: "mdi:card-account-details",
  };
}

/**
 * Get all buy links for a card, sorted by most relevant marketplace.
 * The first link is the "primary" cheapest option.
 */
export function getBuyLinks(card: CardInfo): BuyLink[] {
  const sport = (card.sport ?? "").toLowerCase();

  if (sport === "pokemon") {
    return [
      tcgplayerBuyLink(card),
      ebayBuyLink(card),
      cardmarketBuyLink(card),
    ];
  }

  if (sport === "magic" || sport === "mtg" || sport === "magic: the gathering") {
    return [
      tcgplayerBuyLink(card),
      cardmarketBuyLink(card),
      ebayBuyLink(card),
    ];
  }

  // Sports cards
  return [
    ebayBuyLink(card),
    comcBuyLink(card),
  ];
}

/**
 * Get sell links for a card.
 */
export function getSellLinks(card: CardInfo): BuyLink[] {
  const sport = (card.sport ?? "").toLowerCase();

  if (sport === "pokemon" || sport === "magic" || sport === "mtg") {
    return [
      tcgplayerBuyLink({ ...card, grade: undefined }), // TCGPlayer seller portal
      ebaySellLink(card),
      cardmarketBuyLink(card),
    ];
  }

  return [
    ebaySellLink(card),
    comcBuyLink(card),
  ];
}

/** Get the single best "Buy Now" link (cheapest marketplace) */
export function getPrimaryBuyLink(card: CardInfo): BuyLink {
  return getBuyLinks(card)[0];
}
