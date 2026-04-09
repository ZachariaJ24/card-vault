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

/** Generate 7-day sparkline data from a base price */
export function generateSparkline(basePrice: number, positive: boolean): number[] {
  const points: number[] = [];
  let p = basePrice * (positive ? 0.92 : 1.08);
  for (let i = 0; i < 7; i++) {
    const drift = positive ? 0.015 : -0.015;
    p = p * (1 + drift + (Math.random() - 0.5) * 0.04);
    points.push(Math.round(p));
  }
  return points;
}

export const MOCK_CARDS = [
  { id: "mock-1", name: "2015-16 Young Guns RC", player_name: "Connor McDavid", year: 2015, card_set: "Upper Deck Series 1", sport: "Hockey", team: "Edmonton Oilers", base_price: 1250, grade: "PSA 10", image: "/cards/mcdavid.jpg" },
  { id: "mock-2", name: "1979-80 O-Pee-Chee RC", player_name: "Wayne Gretzky", year: 1979, card_set: "O-Pee-Chee", sport: "Hockey", team: "Edmonton Oilers", base_price: 45000, grade: "PSA 9", image: "/cards/gretzky.jpg" },
  { id: "mock-3", name: "2023-24 Prizm Silver RC", player_name: "Victor Wembanyama", year: 2023, card_set: "Panini Prizm", sport: "Basketball", team: "San Antonio Spurs", base_price: 2100, grade: "BGS 9.5", image: "/cards/wemby.jpg" },
  { id: "mock-4", name: "2017 Prizm RC", player_name: "Patrick Mahomes", year: 2017, card_set: "Panini Prizm", sport: "Football", team: "Kansas City Chiefs", base_price: 3400, grade: "PSA 10", image: "/cards/mahomes.jpg" },
  { id: "mock-5", name: "2018 Topps Chrome RC", player_name: "Shohei Ohtani", year: 2018, card_set: "Topps Chrome", sport: "Baseball", team: "LA Angels", base_price: 890, grade: "PSA 10", image: "/cards/ohtani.jpg" },
  { id: "mock-6", name: "1999 Base Set Holo", player_name: "Charizard", year: 1999, card_set: "Pokemon Base Set", sport: "Pokemon", team: null, base_price: 28000, grade: "PSA 10", image: "/cards/charizard.jpg" },
  { id: "mock-7", name: "2016-17 Young Guns RC", player_name: "Auston Matthews", year: 2016, card_set: "Upper Deck Series 1", sport: "Hockey", team: "Toronto Maple Leafs", base_price: 380, grade: "PSA 10", image: "/cards/matthews.jpg" },
  { id: "mock-8", name: "2023-24 Topps Chrome UCL RC", player_name: "Lamine Yamal", year: 2023, card_set: "Topps Chrome UCL", sport: "Soccer", team: "FC Barcelona", base_price: 675, grade: "PSA 10", image: "/cards/yamal.jpg" },
  { id: "mock-9", name: "2003-04 Exquisite Collection RC", player_name: "LeBron James", year: 2003, card_set: "Upper Deck Exquisite", sport: "Basketball", team: "Cleveland Cavaliers", base_price: 1800000, grade: "BGS 9", image: "/cards/lebron.jpg" },
  { id: "mock-10", name: "2021 Topps Chrome RC", player_name: "Shohei Ohtani", year: 2021, card_set: "Topps Chrome", sport: "Baseball", team: "LA Angels", base_price: 420, grade: "PSA 10", image: "/cards/ohtani2.jpg" },
];

/** Stable ticker data (no randomness on render) */
export const TICKER_DATA = [
  { name: "McDavid RC PSA 10", price: "$1,250", change: "+5.2%", up: true },
  { name: "Gretzky OPC PSA 9", price: "$45,000", change: "+0.5%", up: true },
  { name: "Wembanyama RC BGS 9.5", price: "$2,100", change: "+12.4%", up: true },
  { name: "Mahomes RC PSA 10", price: "$3,400", change: "+1.8%", up: true },
  { name: "Ohtani RC PSA 10", price: "$890", change: "-2.1%", up: false },
  { name: "Charizard Holo PSA 10", price: "$28,000", change: "-1.3%", up: false },
  { name: "Matthews RC PSA 10", price: "$380", change: "+3.6%", up: true },
  { name: "Yamal RC PSA 10", price: "$675", change: "+18.7%", up: true },
  { name: "LeBron RC BGS 9", price: "$1.8M", change: "+0.2%", up: true },
  { name: "Ohtani Chrome PSA 10", price: "$420", change: "-0.8%", up: false },
];

/** Stable enriched data for trending table (deterministic changes) */
export const TRENDING_CHANGES = [5.2, -2.1, 12.4, 1.8, -0.5, -1.3, 3.6, 18.7, 0.2, -0.8];

/** Volume data per card (mock) */
export const MOCK_VOLUMES = [342, 128, 567, 234, 189, 91, 276, 412, 3, 198];

export const SPORTS_LIST = ["Hockey", "Baseball", "Basketball", "Football", "Soccer", "Pokemon", "Magic"];

export const GRADE_OPTIONS = [
  "PSA 10", "PSA 9", "PSA 8", "PSA 7",
  "BGS 9.5", "BGS 9", "BGS 8.5",
  "SGC 10", "SGC 9.5",
  "RAW",
];
