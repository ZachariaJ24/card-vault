import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch watchlist with card details
  const { data: watchlist } = await supabase
    .from('watchlist')
    .select('*, cards(*)')
    .eq('user_id', user.id)
    .limit(10)

  // Fetch portfolio
  const { data: portfolio } = await supabase
    .from('portfolio')
    .select('*, cards(*)')
    .eq('user_id', user.id)
    .limit(20)

  // Fetch recent price movements
  const { data: recentPrices } = await supabase
    .from('daily_prices')
    .select('*, cards(name, player_name, sport)')
    .order('price_date', { ascending: false })
    .limit(8)

  return (
    <DashboardClient
      user={user}
      profile={profile}
      watchlist={watchlist ?? []}
      portfolio={portfolio ?? []}
      recentPrices={recentPrices ?? []}
    />
  )
}
