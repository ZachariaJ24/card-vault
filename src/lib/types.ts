export interface Card {
  id: string;
  name: string;
  player_name: string | null;
  year: number | null;
  card_set: string | null;
  sport: string | null;
  team: string | null;
  grade: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface PriceHistory {
  id: string;
  card_id: string;
  price: number;
  grade: string | null;
  grading_company: string | null;
  sale_date: string;
  source: string | null;
}

export interface DailyPrice {
  id: string;
  card_id: string;
  price_date: string;
  price: number;
  open_price: number | null;
  high_price: number | null;
  low_price: number | null;
  volume: number | null;
  change_pct: number | null;
  grade: string | null;
  cards?: Partial<Card>;
}

export interface Portfolio {
  id: string;
  user_id: string;
  card_id: string;
  purchase_price: number;
  purchase_date: string | null;
  grade: string | null;
  quantity: number;
  notes: string | null;
  cards?: Partial<Card>;
}

export interface Watchlist {
  id: string;
  user_id: string;
  card_id: string;
  alert_price: number | null;
  created_at: string;
  cards?: Partial<Card>;
}

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  is_admin: boolean;
  subscription_tier: string | null;
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  card_id: string;
  price: number; // cents
  condition_notes: string | null;
  status: "active" | "sold" | "cancelled";
  created_at: string;
  cards?: Partial<Card>;
  profiles?: Partial<Profile>;
}

export interface Order {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  price: number; // cents
  platform_fee: number; // cents
  seller_payout: number; // cents
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  shipping_address: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  } | null;
  tracking_number: string | null;
  status: "pending_payment" | "paid" | "shipped" | "delivered" | "completed" | "cancelled" | "refunded";
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  listings?: Partial<Listing> & { cards?: Partial<Card> };
  buyer?: Partial<Profile>;
  seller?: Partial<Profile>;
}

export interface MockPricePoint {
  date: string;
  price: number;
  change_pct: number;
}
