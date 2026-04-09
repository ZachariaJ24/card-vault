import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

/** Platform fee: 1% */
export const PLATFORM_FEE_PERCENT = 1;

export function calculateFees(priceInCents: number) {
  const platformFee = Math.round(priceInCents * PLATFORM_FEE_PERCENT / 100);
  const sellerPayout = priceInCents - platformFee;
  return { platformFee, sellerPayout };
}
