import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import DashboardClient from "./DashboardClient";
import type { Portfolio, Watchlist, DailyPrice } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: portfolio },
    { data: watchlist },
    { data: recentPrices },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("portfolio").select("*, cards(*)").eq("user_id", user.id).limit(20),
    supabase.from("watchlist").select("*, cards(*)").eq("user_id", user.id).limit(10),
    supabase.from("daily_prices").select("*, cards(name, player_name, sport)").order("price_date", { ascending: false }).limit(8),
  ]);

  return (
    <DashboardClient
      user={user}
      profile={profile}
      portfolio={(portfolio ?? []) as Portfolio[]}
      watchlist={(watchlist ?? []) as Watchlist[]}
      recentPrices={(recentPrices ?? []) as DailyPrice[]}
    />
  );
}
