import Stripe from "stripe";

/** Platform fee: 1% */
export const PLATFORM_FEE_PERCENT = 1;

let _stripe: Stripe | null = null;

/** Get or create Stripe instance. Only called at runtime, never at build time. */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
  }
  return _stripe;
}

/** Convenience alias — use getStripe() in API routes */
export { getStripe as stripe };

export function calculateFees(priceInCents: number) {
  const platformFee = Math.round(priceInCents * PLATFORM_FEE_PERCENT / 100);
  const sellerPayout = priceInCents - platformFee;
  return { platformFee, sellerPayout };
}
