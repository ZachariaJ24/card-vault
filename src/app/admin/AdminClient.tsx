'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

interface Stats { cardCount: number; userCount: number; priceCount: number }
interface Card { id: string; name: string; player_name?: string; year?: number; card_set?: string; sport?: string; team?: string; created_at?: string }
interface Profile { id: string; email?: string; is_admin?: boolean; created_at?: string }

interface Props {
  user: User
  stats: Stats
  cards: Card[]
  profiles: Profile[]
}

const emptyForm = { name: '', player_name: '', year: '', card_set: '', sport: 'Hockey', team: '' }

export default function AdminClient({ user, stats, cards, profiles }: Props) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveErr, setSaveErr] = useState('')
  const [activeTab, setActiveTab] = useState<'cards' | 'users'>('cards')

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    setSaveErr('')

    const { error } = await supabase.from('cards').insert([{
      name: form.name,
      player_name: form.player_name || null,
      year: form.year ? parseInt(form.year) : null,
      card_set: form.card_set || null,
      sport: form.sport,
      team: form.team || null,
    }])

    if (error) {
      setSaveErr(error.message)
    } else {
      setSaveMsg('Card added successfully!')
      setForm(emptyForm)
      router.refresh()
    }
    setSaving(false)
  }

  const sports = ['Hockey', 'Baseball', 'Basketball', 'Football', 'Soccer', 'Pokemon']

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
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 font-medium">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-[#64748b] hover:text-white transition-colors">Dashboard</a>
            <div className="text-sm text-[#64748b] hidden md:block">{user.email}</div>
            <button onClick={handleSignOut}
              className="text-sm px-4 py-2 rounded-lg border border-[#00b4ff]/20 text-[#64748b] hover:text-white hover:border-[#00b4ff]/40 transition-all">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white mb-1">Admin Dashboard</h1>
          <p className="text-[#64748b]">Manage cards, users, and platform data.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            { label: 'Total Cards', value: stats.cardCount, icon: '🃏', color: '#00b4ff' },
            { label: 'Total Users', value: stats.userCount, icon: '👥', color: '#f59e0b' },
            { label: 'Price Records', value: stats.priceCount, icon: '📊', color: '#22c55e' },
          ].map((s) => (
            <div key={s.label} className="card-glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs text-[#64748b] uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="text-3xl font-black" style={{ color: s.color }}>
                {s.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Add Card Form */}
        <div className="card-glass rounded-xl p-6 mb-8">
          <h2 className="font-bold text-lg text-white mb-5">Add New Card</h2>
          <form onSubmit={handleAddCard} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'name', label: 'Card Name *', placeholder: 'e.g. 2015-16 Young Guns RC', required: true },
              { key: 'player_name', label: 'Player Name', placeholder: 'e.g. Connor McDavid', required: false },
              { key: 'year', label: 'Year', placeholder: 'e.g. 2015', required: false },
              { key: 'card_set', label: 'Set', placeholder: 'e.g. Upper Deck Series 1', required: false },
              { key: 'team', label: 'Team', placeholder: 'e.g. Edmonton Oilers', required: false },
            ].map(({ key, label, placeholder, required }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-[#64748b] mb-1.5 uppercase tracking-wider">{label}</label>
                <input
                  type={key === 'year' ? 'number' : 'text'}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required={required}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#060d18] border border-[#00b4ff]/20 text-white placeholder-[#64748b] focus:outline-none focus:border-[#00b4ff]/50 text-sm transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1.5 uppercase tracking-wider">Sport *</label>
              <select
                value={form.sport}
                onChange={e => setForm(f => ({ ...f, sport: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg bg-[#060d18] border border-[#00b4ff]/20 text-white focus:outline-none focus:border-[#00b4ff]/50 text-sm transition-colors">
                {sports.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {saveErr && (
              <div className="md:col-span-2 lg:col-span-3 px-4 py-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm">
                {saveErr}
              </div>
            )}
            {saveMsg && (
              <div className="md:col-span-2 lg:col-span-3 px-4 py-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-sm">
                {saveMsg}
              </div>
            )}

            <div className="md:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-105 disabled:opacity-60 glow-gold"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#060d18' }}>
                {saving ? 'Saving…' : '+ Add Card'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#0a1628] rounded-lg p-1 w-fit">
          {(['cards', 'users'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-[#0f1d32] text-white border border-[#00b4ff]/20'
                  : 'text-[#64748b] hover:text-white'
              }`}>
              {tab} ({tab === 'cards' ? cards.length : profiles.length})
            </button>
          ))}
        </div>

        {/* Cards Table */}
        {activeTab === 'cards' && (
          <div className="card-glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#00b4ff]/10 text-[#64748b] text-xs uppercase tracking-wider">
                    <th className="px-5 py-4 text-left">Name</th>
                    <th className="px-5 py-4 text-left">Player</th>
                    <th className="px-5 py-4 text-left">Year</th>
                    <th className="px-5 py-4 text-left">Set</th>
                    <th className="px-5 py-4 text-left">Sport</th>
                    <th className="px-5 py-4 text-left">Team</th>
                  </tr>
                </thead>
                <tbody>
                  {cards.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-[#64748b]">No cards found.</td></tr>
                  ) : cards.map((card) => (
                    <tr key={card.id} className="border-b border-[#00b4ff]/5 hover:bg-[#00b4ff]/5 transition-colors">
                      <td className="px-5 py-3 text-white font-medium">{card.name}</td>
                      <td className="px-5 py-3 text-[#64748b]">{card.player_name ?? '—'}</td>
                      <td className="px-5 py-3 text-[#64748b]">{card.year ?? '—'}</td>
                      <td className="px-5 py-3 text-[#64748b]">{card.card_set ?? '—'}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20">
                          {card.sport ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#64748b]">{card.team ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Table */}
        {activeTab === 'users' && (
          <div className="card-glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#00b4ff]/10 text-[#64748b] text-xs uppercase tracking-wider">
                    <th className="px-5 py-4 text-left">Email</th>
                    <th className="px-5 py-4 text-left">Role</th>
                    <th className="px-5 py-4 text-left">Joined</th>
                    <th className="px-5 py-4 text-left">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-10 text-center text-[#64748b]">No users found.</td></tr>
                  ) : profiles.map((p) => (
                    <tr key={p.id} className="border-b border-[#00b4ff]/5 hover:bg-[#00b4ff]/5 transition-colors">
                      <td className="px-5 py-3 text-white">{p.email ?? '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                          p.is_admin
                            ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20'
                            : 'bg-[#64748b]/10 text-[#64748b] border-[#64748b]/20'
                        }`}>
                          {p.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#64748b] text-xs">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3 text-[#64748b] text-xs font-mono">{p.id.slice(0, 8)}…</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
