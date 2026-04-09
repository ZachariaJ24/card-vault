'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createSupabaseBrowserClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email to confirm your account.')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#060d18] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(0,180,255,0.06) 0%, transparent 60%)' }} />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
              style={{ background: 'linear-gradient(135deg, #00b4ff, #0088cc)' }}>
              CV
            </div>
            <span className="text-2xl font-bold text-white">CardVault</span>
          </a>
          <p className="text-[#64748b] mt-2 text-sm">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Form card */}
        <div className="card-glass rounded-2xl p-8 glow-blue">
          <h1 className="text-xl font-bold mb-6 text-white">
            {mode === 'login' ? 'Welcome back' : 'Get started free'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-lg bg-[#060d18] border border-[#00b4ff]/20 text-white placeholder-[#64748b] focus:outline-none focus:border-[#00b4ff]/60 focus:ring-1 focus:ring-[#00b4ff]/20 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg bg-[#060d18] border border-[#00b4ff]/20 text-white placeholder-[#64748b] focus:outline-none focus:border-[#00b4ff]/60 focus:ring-1 focus:ring-[#00b4ff]/20 text-sm transition-colors"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="px-4 py-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed glow-gold mt-2"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#060d18' }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#64748b]">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={() => { setMode('signup'); setError(''); setMessage('') }}
                  className="text-[#00b4ff] hover:text-white transition-colors font-medium">
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); setMessage('') }}
                  className="text-[#00b4ff] hover:text-white transition-colors font-medium">
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[#64748b] mt-6">
          A <span className="text-[#00b4ff]">Midnight Studios</span> product
        </p>
      </div>
    </div>
  )
}
