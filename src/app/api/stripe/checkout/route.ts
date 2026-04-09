import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe, calculateFees } from "@/lib/stripe";

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session for buying a listing.
 * Body: { listing_id, buyer_id }
 */
export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const { listing_id, buyer_id } = await req.json();
  if (!listing_id || !buyer_id) {
    return NextResponse.json({ error: "Missing listing_id or buyer_id" }, { status: 400 });
  }

  // Fetch listing with card and seller info
  const { data: listing, error: listingErr } = await supabase
    .from("listings")
    .select("*, cards(name, player_name, grade, image_url), profiles!listings_seller_id_fkey(stripe_account_id, stripe_onboarded, email)")
    .eq("id", listing_id)
    .eq("status", "active")
    .single();

  if (listingErr || !listing) {
    return NextResponse.json({ error: "Listing not found or not active" }, { status: 404 });
  }

  // Can't buy your own listing
  if (listing.seller_id === buyer_id) {
    return NextResponse.json({ error: "Cannot buy your own listing" }, { status: 400 });
  }

  const seller = listing.profiles as { stripe_account_id?: string; stripe_onboarded?: boolean } | null;
  if (!seller?.stripe_account_id || !seller?.stripe_onboarded) {
    return NextResponse.json({ error: "Seller has not completed Stripe setup" }, { status: 400 });
  }

  const card = listing.cards as { name?: string; player_name?: string; grade?: string; image_url?: string } | null;
  const { platformFee, sellerPayout } = calculateFees(listing.price);

  // Create Stripe Checkout Session with Connect
  const origin = req.headers.get("origin") ?? "http://localhost:3000";
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${card?.player_name ?? "Card"} ${card?.grade ?? ""}`.trim(),
            description: card?.name ?? "Sports Card",
            ...(card?.image_url ? { images: [card.image_url] } : {}),
          },
          unit_amount: listing.price,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFee,
      transfer_data: {
        destination: seller.stripe_account_id,
      },
      metadata: {
        listing_id,
        buyer_id,
        seller_id: listing.seller_id,
      },
    },
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU"],
    },
    success_url: `${origin}/orders?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/marketplace/${listing_id}?checkout=cancelled`,
    metadata: {
      listing_id,
      buyer_id,
      seller_id: listing.seller_id,
    },
  });

  // Create order record in pending_payment state
  await supabase.from("orders").insert({
    listing_id,
    buyer_id,
    seller_id: listing.seller_id,
    price: listing.price,
    platform_fee: platformFee,
    seller_payout: sellerPayout,
    stripe_checkout_session_id: session.id,
    status: "pending_payment",
  });

  return NextResponse.json({ url: session.url });
}
