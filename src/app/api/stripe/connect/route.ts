import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";

/**
 * POST /api/stripe/connect
 * Creates a Stripe Connect Express account for the seller and returns the onboarding URL.
 * Body: { user_id: string, email: string }
 */
export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const { user_id, email } = await req.json();
  if (!user_id || !email) {
    return NextResponse.json({ error: "Missing user_id or email" }, { status: 400 });
  }

  // Check if already has a Stripe account
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_onboarded")
    .eq("id", user_id)
    .single();

  let accountId = profile?.stripe_account_id;

  if (!accountId) {
    // Create a new Connect Express account
    const account = await getStripe().accounts.create({
      type: "express",
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { cardvault_user_id: user_id },
    });
    accountId = account.id;

    await supabase
      .from("profiles")
      .update({ stripe_account_id: accountId })
      .eq("id", user_id);
  }

  // Create an account link for onboarding
  const origin = req.headers.get("origin") ?? "http://localhost:3000";
  const accountLink = await getStripe().accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/settings?stripe=refresh`,
    return_url: `${origin}/settings?stripe=success`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}

/**
 * GET /api/stripe/connect?user_id=xxx
 * Check if seller's Stripe account is fully onboarded.
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_onboarded")
    .eq("id", userId)
    .single();

  if (!profile?.stripe_account_id) {
    return NextResponse.json({ onboarded: false, hasAccount: false });
  }

  // Check with Stripe if onboarding is complete
  const account = await getStripe().accounts.retrieve(profile.stripe_account_id);
  const onboarded = account.charges_enabled && account.payouts_enabled;

  // Update our DB if status changed
  if (onboarded && !profile.stripe_onboarded) {
    await supabase
      .from("profiles")
      .update({ stripe_onboarded: true })
      .eq("id", userId);
  }

  return NextResponse.json({
    onboarded,
    hasAccount: true,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
  });
}
