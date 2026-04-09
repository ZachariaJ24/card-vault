import type { MockPricePoint } from "./types";

/** Generate a plausible 90-day price series starting from a base price */
export function generatePriceHistory(basePriceCents: number, volatility = 0.03): MockPricePoint[] {
  const points: MockPricePoint[] = [];
  let price = basePriceCents;
  const now = new Date();

  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.48) * volatility;
    price = Math.max(price * (1 + change), basePriceCents * 0.5);
    const prevPrice = points.length > 0 ? points[points.length - 1].price : basePriceCents;
    points.push({
      date: date.toISOString().slice(0, 10),
      price: Math.round(price * 100) / 100,
      change_pct: Math.round(((price - prevPrice) / prevPrice) * 10000) / 100,
    });
  }
  return points;
}

export const MOCK_CARDS = [
  { id: "mock-1", name: "2015-16 Young Guns RC", player_name: "Connor McDavid", year: 2015, card_set: "Upper Deck Series 1", sport: "Hockey", team: "Edmonton Oilers", base_price: 1250, grade: "PSA 10" },
  { id: "mock-2", name: "1979-80 O-Pee-Chee RC", player_name: "Wayne Gretzky", year: 1979, card_set: "O-Pee-Chee", sport: "Hockey", team: "Edmonton Oilers", base_price: 45000, grade: "PSA 9" },
  { id: "mock-3", name: "2023-24 Prizm Silver RC", player_name: "Victor Wembanyama", year: 2023, card_set: "Panini Prizm", sport: "Basketball", team: "San Antonio Spurs", base_price: 2100, grade: "BGS 9.5" },
  { id: "mock-4", name: "2017 Prizm RC", player_name: "Patrick Mahomes", year: 2017, card_set: "Panini Prizm", sport: "Football", team: "Kansas City Chiefs", base_price: 3400, grade: "PSA 10" },
  { id: "mock-5", name: "2018 Topps Chrome RC", player_name: "Shohei Ohtani", year: 2018, card_set: "Topps Chrome", sport: "Baseball", team: "LA Angels", base_price: 890, grade: "PSA 10" },
  { id: "mock-6", name: "1999 Base Set Holo", player_name: "Charizard", year: 1999, card_set: "Pokemon Base Set", sport: "Pokemon", team: null, base_price: 28000, grade: "PSA 10" },
  { id: "mock-7", name: "2016-17 Young Guns RC", player_name: "Auston Matthews", year: 2016, card_set: "Upper Deck Series 1", sport: "Hockey", team: "Toronto Maple Leafs", base_price: 380, grade: "PSA 10" },
  { id: "mock-8", name: "2023-24 Topps Chrome UCL RC", player_name: "Lamine Yamal", year: 2023, card_set: "Topps Chrome UCL", sport: "Soccer", team: "FC Barcelona", base_price: 675, grade: "PSA 10" },
  { id: "mock-9", name: "2003-04 Exquisite Collection RC", player_name: "LeBron James", year: 2003, card_set: "Upper Deck Exquisite", sport: "Basketball", team: "Cleveland Cavaliers", base_price: 1800000, grade: "BGS 9" },
  { id: "mock-10", name: "2021 Topps Chrome RC", player_name: "Shohei Ohtani", year: 2021, card_set: "Topps Chrome", sport: "Baseball", team: "LA Angels", base_price: 420, grade: "PSA 10" },
];

export const TICKER_ITEMS = MOCK_CARDS.map((c) => ({
  name: `${c.player_name} ${c.grade}`,
  price: `$${c.base_price.toLocaleString()}`,
  change: `${(Math.random() > 0.5 ? "+" : "-")}${(Math.random() * 5 + 0.2).toFixed(1)}%`,
  up: Math.random() > 0.4,
}));

export const SPORTS_LIST = ["Hockey", "Baseball", "Basketball", "Football", "Soccer", "Pokemon"];

export const GRADE_OPTIONS = [
  "PSA 10", "PSA 9", "PSA 8", "PSA 7",
  "BGS 9.5", "BGS 9", "BGS 8.5",
  "SGC 10", "SGC 9.5",
  "RAW",
];
