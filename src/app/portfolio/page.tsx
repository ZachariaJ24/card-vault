import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import PortfolioClient from "./PortfolioClient";
import type { Portfolio, Card } from "@/lib/types";

export default async function PortfolioPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();

  const [{ data: portfolio }, { data: cards }] = await Promise.all([
    supabase.from("portfolio").select("*, cards(*)").eq("user_id", user.id).order("purchase_date", { ascending: false }),
    supabase.from("cards").select("id, name, player_name, sport, card_set, year").order("name"),
  ]);

  return (
    <PortfolioClient
      user={user}
      isAdmin={profile?.is_admin === true}
      portfolio={(portfolio ?? []) as Portfolio[]}
      availableCards={(cards ?? []) as Pick<Card, "id" | "name" | "player_name" | "sport" | "card_set" | "year">[]}
    />
  );
}
