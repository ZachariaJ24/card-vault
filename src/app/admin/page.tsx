import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import AdminClient from "./AdminClient";
import type { Card, Profile } from "@/lib/types";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");

  const [
    { count: cardCount },
    { count: userCount },
    { count: priceCount },
    { data: cards },
    { data: profiles },
  ] = await Promise.all([
    supabase.from("cards").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("price_history").select("*", { count: "exact", head: true }),
    supabase.from("cards").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, email, is_admin, subscription_tier, created_at").order("created_at", { ascending: false }),
  ]);

  return (
    <AdminClient
      user={user}
      stats={{ cardCount: cardCount ?? 0, userCount: userCount ?? 0, priceCount: priceCount ?? 0 }}
      cards={(cards ?? []) as Card[]}
      profiles={(profiles ?? []) as Profile[]}
    />
  );
}
