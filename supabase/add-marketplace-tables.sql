-- Marketplace tables for CardVault
-- Run in Supabase SQL Editor

-- Seller Stripe Connect info on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_onboarded BOOLEAN DEFAULT FALSE;

-- Listings: cards for sale
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  price BIGINT NOT NULL CHECK (price > 0),            -- in cents
  condition_notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listings_card_id_idx ON listings(card_id);
CREATE INDEX IF NOT EXISTS listings_seller_id_idx ON listings(seller_id);
CREATE INDEX IF NOT EXISTS listings_status_idx ON listings(status);

-- Orders: completed purchases
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  price BIGINT NOT NULL,                              -- sale price in cents
  platform_fee BIGINT NOT NULL,                       -- 1% fee in cents
  seller_payout BIGINT NOT NULL,                      -- price - fee in cents
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  shipping_address JSONB,
  tracking_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment','paid','shipped','delivered','completed','cancelled','refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS orders_buyer_id_idx ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS orders_seller_id_idx ON orders(seller_id);

-- RLS policies (enable RLS first)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Listings: anyone can read active, sellers manage their own
CREATE POLICY listings_read ON listings FOR SELECT USING (status = 'active' OR seller_id = auth.uid());
CREATE POLICY listings_insert ON listings FOR INSERT WITH CHECK (seller_id = auth.uid());
CREATE POLICY listings_update ON listings FOR UPDATE USING (seller_id = auth.uid());

-- Orders: buyers and sellers can see their own orders
CREATE POLICY orders_read ON orders FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY orders_insert ON orders FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY orders_update ON orders FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid());
