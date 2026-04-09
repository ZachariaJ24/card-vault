'use client'

import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
  profile: Record<string, unknown> | null
  watchlist: Record<string, unknown>[]
  portfolio: Record<string, unknown>[]
  recentPrices: Record<string, unknown>[]
}

export default function DashboardClient({ user, profile, watchlist, portfolio, recentPrices }: Props) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isAdmin = profile && (profile as Record<string, unknown>).is_admin === true

  // Mock portfolio stats since portfolio data may be empty
  const totalCards = portfolio.length
  const totalValue = portfolio.reduce((sum, p) => {
    const card = p.cards as Record<string, unknown> | null
    return sum + (typeof p.purchase_price === 'number' ? p.purchase_price : 0) + (card ? 0 : 0)
  }, 0)

  return (
    <div className="min-h-screen bg-[#060d18]">
      {/* Nav */}
      <nav className="border-b border-[#00b4ff]/10 bg-[#060d18]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm"
                style={{ background: 'linear-gradient(135deg, #00b4ff, #0088cc)' }}>
                CV
              </div>
              <span className="text-xl font-bold text-white">CardVault</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-[#00b4ff] font-medium">Dashboard</a>
            {isAdmin && (
              <a href="/admin" className="text-sm text-[#f59e0b] font-medium hover:text-[#fbbf24] transition-colors">
                Admin
              </a>
            )}
            <div className="text-sm text-[#64748b] hidden md:block">{user.email}</div>
            <button
              onClick={handleSignOut}
              className="text-sm px-4 py-2 rounded-lg border border-[#00b4ff]/20 text-[#64748b] hover:text-white hover:border-[#00b4ff]/40 transition-all">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-xs text-[#22c55e] font-medium uppercase tracking-wider">Live</span>
          </div>
          <h1 className="text-3xl font-black text-white">
            Welcome back, <span style={{ background: 'linear-gradient(135deg, #00b4ff, #0088cc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {user.email?.split('@')[0]}
            </span>
          </h1>
          <p className="text-[#64748b] mt-1">Here&apos;s what&apos;s happening with your collection.</p>
        </div>

        {/* Portfolio summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <div className="card-glass rounded-xl p-6 glow-blue">
            <div className="text-xs text-[#64748b] uppercase tracking-wider mb-2">Portfolio Value</div>
            <div className="text-3xl font-black text-white">
              ${totalValue > 0 ? totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
            </div>
            <div className="text-xs text-[#64748b] mt-1">Based on purchase price</div>
          </div>
          <div className="card-glass rounded-xl p-6">
            <div className="text-xs text-[#64748b] uppercase tracking-wider mb-2">Cards Owned</div>
            <div className="text-3xl font-black text-white">{totalCards}</div>
            <div className="text-xs text-[#64748b] mt-1">In your collection</div>
          </div>
          <div className="card-glass rounded-xl p-6">
            <div className="text-xs text-[#64748b] uppercase tracking-wider mb-2">Watchlist</div>
            <div className="text-3xl font-black text-[#00b4ff]">{watchlist.length}</div>
            <div className="text-xs text-[#64748b] mt-1">Cards tracked</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Watchlist */}
          <div className="card-glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-white">Watchlist</h2>
              <span className="text-xs text-[#64748b]">{watchlist.length} cards</span>
            </div>
            {watchlist.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">👀</div>
                <div className="text-[#64748b] text-sm">No cards on your watchlist yet.</div>
                <div className="text-[#64748b] text-xs mt-1">Browse cards to start tracking.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {watchlist.map((item, i) => {
                  const card = item.cards as Record<string, unknown> | null
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#060d18]/60 border border-[#00b4ff]/5">
                      <div>
                        <div className="text-sm font-medium text-white">{card ? String(card.name ?? '') : 'Unknown Card'}</div>
                        <div className="text-xs text-[#64748b]">{card ? String(card.sport ?? '') : ''}</div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20">
                        Watching
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent price movements */}
          <div className="card-glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-white">Recent Price Movements</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">Live</span>
            </div>
            {recentPrices.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">📈</div>
                <div className="text-[#64748b] text-sm">No price data yet.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPrices.map((price, i) => {
                  const card = price.cards as Record<string, unknown> | null
                  const change = typeof price.change_pct === 'number' ? price.change_pct : null
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#060d18]/60 border border-[#00b4ff]/5">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {card ? String(card.player_name ?? card.name ?? '') : 'Unknown'}
                        </div>
                        <div className="text-xs text-[#64748b]">
                          {card ? String(card.sport ?? '') : ''} · {String(price.price_date ?? '').slice(0, 10)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">
                          ${typeof price.price === 'number' ? price.price.toLocaleString() : '—'}
                        </div>
                        {change !== null && (
                          <div className={`text-xs font-medium ${change >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Portfolio */}
        {portfolio.length > 0 && (
          <div className="card-glass rounded-xl p-6 mt-6">
            <h2 className="font-bold text-lg text-white mb-5">My Collection</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#64748b] text-xs uppercase tracking-wider border-b border-[#00b4ff]/10">
                    <th className="pb-3 text-left">Card</th>
                    <th className="pb-3 text-left">Sport</th>
                    <th className="pb-3 text-left">Grade</th>
                    <th className="pb-3 text-right">Purchase Price</th>
                    <th className="pb-3 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((item, i) => {
                    const card = item.cards as Record<string, unknown> | null
                    return (
                      <tr key={i} className="border-b border-[#00b4ff]/5 hover:bg-[#00b4ff]/5 transition-colors">
                        <td className="py-3 text-white font-medium">{card ? String(card.name ?? '') : '—'}</td>
                        <td className="py-3 text-[#64748b]">{card ? String(card.sport ?? '') : '—'}</td>
                        <td className="py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20">
                            {String(item.grade ?? '—')}
                          </span>
                        </td>
                        <td className="py-3 text-right text-white font-mono">
                          ${typeof item.purchase_price === 'number' ? item.purchase_price.toLocaleString() : '—'}
                        </td>
                        <td className="py-3 text-right text-[#64748b]">{String(item.quantity ?? 1)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
