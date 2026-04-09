import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events for payment confirmation.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const listingId = session.metadata?.listing_id;
      const buyerId = session.metadata?.buyer_id;

      if (!listingId) break;

      // Update order status to paid
      const shipping = (session as unknown as Record<string, unknown>).shipping_details as { name?: string; address?: Record<string, string> } | undefined;
      await supabase
        .from("orders")
        .update({
          status: "paid",
          stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
          shipping_address: shipping?.address
            ? {
                name: shipping.name ?? "",
                line1: shipping.address.line1 ?? "",
                line2: shipping.address.line2 ?? "",
                city: shipping.address.city ?? "",
                state: shipping.address.state ?? "",
                postal_code: shipping.address.postal_code ?? "",
                country: shipping.address.country ?? "",
              }
            : null,
        })
        .eq("stripe_checkout_session_id", session.id);

      // Mark listing as sold
      await supabase
        .from("listings")
        .update({ status: "sold" })
        .eq("id", listingId);

      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
      if (paymentIntentId) {
        await supabase
          .from("orders")
          .update({ status: "refunded" })
          .eq("stripe_payment_intent_id", paymentIntentId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
