import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * GET /api/orders?user_id=xxx
 * Get all orders for a user (as buyer or seller).
 */
export async function GET(req: NextRequest) {
  const db = supabase();
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

  const { data, error } = await db
    .from("orders")
    .select("*, listings(*, cards(id, name, player_name, card_set, grade, image_url, sport))")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}

/**
 * PATCH /api/orders
 * Update order status (ship, confirm delivery).
 * Body: { order_id, user_id, action: "ship" | "confirm_delivery", tracking_number? }
 */
export async function PATCH(req: NextRequest) {
  const db = supabase();
  const { order_id, user_id, action, tracking_number } = await req.json();

  if (!order_id || !user_id || !action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Fetch the order
  const { data: order } = await db
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  switch (action) {
    case "ship": {
      // Only seller can mark as shipped
      if (order.seller_id !== user_id) {
        return NextResponse.json({ error: "Only seller can ship" }, { status: 403 });
      }
      if (order.status !== "paid") {
        return NextResponse.json({ error: "Order must be in 'paid' status to ship" }, { status: 400 });
      }
      const { error } = await db
        .from("orders")
        .update({
          status: "shipped",
          tracking_number: tracking_number || null,
          shipped_at: new Date().toISOString(),
        })
        .eq("id", order_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, status: "shipped" });
    }

    case "confirm_delivery": {
      // Only buyer can confirm delivery
      if (order.buyer_id !== user_id) {
        return NextResponse.json({ error: "Only buyer can confirm delivery" }, { status: 403 });
      }
      if (order.status !== "shipped") {
        return NextResponse.json({ error: "Order must be shipped to confirm delivery" }, { status: 400 });
      }
      const { error } = await db
        .from("orders")
        .update({
          status: "completed",
          delivered_at: new Date().toISOString(),
        })
        .eq("id", order_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, status: "completed" });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
