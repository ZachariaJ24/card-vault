'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { User } from '@supabase/supabase-js';

const SPORTS = ['Hockey', 'Baseball', 'Basketball', 'Football', 'Soccer', 'Pokemon'];

const MOCK_TRENDING = [
  { name: 'Connor McDavid', set: '2015-16 Upper Deck Young Guns', sport: 'Hockey', price: 1250.00, change: +5.2, grade: 'PSA 10' },
  { name: 'Shohei Ohtani', set: '2018 Topps Chrome', sport: 'Baseball', price: 890.00, change: -2.1, grade: 'PSA 10' },
  { name: 'Victor Wembanyama', set: '2023-24 Prizm Silver', sport: 'Basketball', price: 2100.00, change: +12.4, grade: 'BGS 9.5' },
  { name: 'Patrick Mahomes', set: '2017 Panini Prizm', sport: 'Football', price: 3400.00, change: +1.8, grade: 'PSA 10' },
  { name: 'Wayne Gretzky', set: '1979-80 O-Pee-Chee', sport: 'Hockey', price: 45000.00, change: +0.5, grade: 'PSA 8' },
  { name: 'Lamine Yamal', set: '2023-24 Topps Chrome UCL', sport: 'Soccer', price: 675.00, change: +18.7, grade: 'PSA 10' },
  { name: 'Charizard', set: '1999 Base Set Holo', sport: 'Pokemon', price: 28000.00, change: -1.3, grade: 'PSA 10' },
  { name: 'Auston Matthews', set: '2016-17 Upper Deck Young Guns', sport: 'Hockey', price: 380.00, change: +3.6, grade: 'PSA 10' },
];

const STATS = [
  { label: 'Cards Tracked', value: '2.4M+', icon: '\u{1F4C7}' },
  { label: 'Daily Price Updates', value: '150K+', icon: '\u{1F4CA}' },
  { label: 'Active Users', value: '12K+', icon: '\u{1F465}' },
  { label: 'Sports Covered', value: '6', icon: '\u{1F3C6}' },
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        setIsAdmin(data?.is_admin === true);
      }
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Ticker Bar */}
      <div className="bg-navy-800 border-b border-electric/10 overflow-hidden h-10 flex items-center">
        <div className="animate-ticker flex whitespace-nowrap gap-8 px-4">
          {[...MOCK_TRENDING, ...MOCK_TRENDING].map((card, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-sm">
              <span className="text-muted">{card.sport}</span>
              <span className="text-ice font-medium">{card.name}</span>
              <span className="text-electric">${card.price.toLocaleString()}</span>
              <span className={card.change >= 0 ? 'text-green' : 'text-red'}>
                {card.change >= 0 ? '+' : ''}{card.change}%
              </span>
              <span className="text-navy-600">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="border-b border-electric/10 bg-navy-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric to-gold flex items-center justify-center text-navy-900 font-bold text-sm">CV</div>
            <span className="text-xl font-bold">Card<span className="text-electric">Vault</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted">
            <a href="#features" className="hover:text-electric transition-colors">Features</a>
            <a href="#pricing" className="hover:text-electric transition-colors">Pricing</a>
            <a href="#sports" className="hover:text-electric transition-colors">Sports</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <a href="/dashboard" className="text-sm text-electric font-medium hover:text-white transition-colors">Dashboard</a>
                {isAdmin && (
                  <a href="/admin" className="text-sm text-gold font-medium hover:text-gold-bright transition-colors">Admin</a>
                )}
              </>
            ) : (
              <>
                <a href="/login" className="text-sm text-muted hover:text-ice transition-colors">Log in</a>
                <a href="/login" className="text-sm bg-gold hover:bg-gold-bright text-navy-900 font-semibold px-4 py-2 rounded-lg transition-colors">
                  Get Started
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-electric/5 via-navy-900 to-navy-900" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(0,180,255,0.08) 0%, transparent 50%)',
        }} />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 bg-electric/10 border border-electric/20 rounded-full px-4 py-1.5 mb-6 text-sm text-electric">
            <span className="w-2 h-2 bg-electric rounded-full animate-pulse" />
            Live market data updated every hour
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Track Sports Cards<br />
            <span className="bg-gradient-to-r from-electric via-blue-400 to-gold bg-clip-text text-transparent">
              Like the Stock Market
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10">
            Real-time pricing, portfolio tracking, and market analytics for every sport.
            See what your collection is really worth.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-navy-700 border border-electric/20 rounded-lg px-4 py-3 text-ice placeholder:text-muted focus:outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/30"
            />
            <button className="bg-gold hover:bg-gold-bright text-navy-900 font-bold px-6 py-3 rounded-lg transition-colors whitespace-nowrap glow-gold">
              Join Waitlist
            </button>
          </div>
          <p className="text-xs text-muted mt-3">Free tier available. No credit card required.</p>
        </div>
      </section>

      {/* Market Preview */}
      <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="card-glass rounded-2xl p-6 glow-blue">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
            <h2 className="text-lg font-semibold">Trending Cards</h2>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map(sport => (
                <button key={sport} className="text-xs px-3 py-1 rounded-full border border-electric/20 text-muted hover:text-electric hover:border-electric/40 transition-colors">
                  {sport}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-left border-b border-electric/10">
                  <th className="py-3 pr-4 font-medium">Card</th>
                  <th className="py-3 pr-4 font-medium">Sport</th>
                  <th className="py-3 pr-4 font-medium">Grade</th>
                  <th className="py-3 pr-4 font-medium text-right">Price</th>
                  <th className="py-3 font-medium text-right">24h Change</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TRENDING.map((card, i) => (
                  <tr key={i} className="border-b border-electric/5 hover:bg-electric/5 transition-colors cursor-pointer">
                    <td className="py-3 pr-4">
                      <div>
                        <span className="text-ice font-medium">{card.name}</span>
                        <div className="text-xs text-muted">{card.set}</div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted">{card.sport}</td>
                    <td className="py-3 pr-4">
                      <span className="text-xs bg-electric/10 text-electric px-2 py-0.5 rounded-full">{card.grade}</span>
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-ice">${card.price.toLocaleString()}</td>
                    <td className={`py-3 text-right font-mono font-medium ${card.change >= 0 ? 'text-green' : 'text-red'}`}>
                      {card.change >= 0 ? '+' : ''}{card.change}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="card-glass rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-bold text-electric">{stat.value}</div>
              <div className="text-sm text-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to <span className="text-electric">Dominate</span> the Market</h2>
          <p className="text-muted max-w-xl mx-auto">Professional-grade tools for serious collectors and investors.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Real-Time Pricing', desc: 'Aggregated from eBay sold listings, updated hourly. See fair market value, not asking prices.', icon: '\u{1F4C8}' },
            { title: 'Portfolio Tracker', desc: 'Track your entire collection. See total value, gains/losses, and performance over time.', icon: '\u{1F4BC}' },
            { title: 'Price Alerts', desc: 'Get notified when cards hit your target price. Never miss a deal or a sell window.', icon: '\u{1F514}' },
            { title: 'Market Movers', desc: 'See which cards are trending up or crashing. Spot opportunities before everyone else.', icon: '\u{1F525}' },
            { title: 'Population Reports', desc: 'PSA, BGS, SGC population data integrated. Know exactly how rare your card is.', icon: '\u{1F3C5}' },
            { title: 'Comp Search', desc: 'Find comparable sales instantly. Filter by grade, year, parallel, and more.', icon: '\u{1F50D}' },
          ].map((feature) => (
            <div key={feature.title} className="card-glass rounded-xl p-6 hover:border-electric/30 transition-colors">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, <span className="text-gold">Transparent</span> Pricing</h2>
          <p className="text-muted max-w-xl mx-auto">Start free. Upgrade when you need the full picture.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="card-glass rounded-2xl p-8">
            <div className="text-sm text-muted mb-2">Free</div>
            <div className="text-4xl font-bold mb-1">$0</div>
            <div className="text-sm text-muted mb-6">forever</div>
            <ul className="space-y-3 text-sm mb-8">
              {['Top 50 cards per sport', '7-day price history', 'Basic portfolio (25 cards)', 'Daily market summary'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-green">&#10003;</span> {f}</li>
              ))}
            </ul>
            <button className="w-full py-2.5 border border-electric/30 rounded-lg text-electric hover:bg-electric/10 transition-colors font-medium">
              Get Started
            </button>
          </div>
          <div className="card-glass rounded-2xl p-8 border-gold/30 glow-gold relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-navy-900 text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
            <div className="text-sm text-gold mb-2">Pro</div>
            <div className="text-4xl font-bold mb-1">$9.99</div>
            <div className="text-sm text-muted mb-6">/month</div>
            <ul className="space-y-3 text-sm mb-8">
              {['All cards, all sports', 'Full price history', 'Unlimited portfolio', 'Price alerts (50/mo)', 'Market movers dashboard', 'Population reports'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-gold">&#10003;</span> {f}</li>
              ))}
            </ul>
            <button className="w-full py-2.5 bg-gold hover:bg-gold-bright text-navy-900 rounded-lg font-bold transition-colors">
              Start Free Trial
            </button>
          </div>
          <div className="card-glass rounded-2xl p-8">
            <div className="text-sm text-muted mb-2">Premium</div>
            <div className="text-4xl font-bold mb-1">$24.99</div>
            <div className="text-sm text-muted mb-6">/month</div>
            <ul className="space-y-3 text-sm mb-8">
              {['Everything in Pro', 'Unlimited price alerts', 'API access', 'Export data (CSV)', 'Priority support', 'Early access features'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-electric">&#10003;</span> {f}</li>
              ))}
            </ul>
            <button className="w-full py-2.5 border border-electric/30 rounded-lg text-electric hover:bg-electric/10 transition-colors font-medium">
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Sports */}
      <section id="sports" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Every Sport. <span className="text-electric">Every Card.</span></h2>
          <p className="text-muted">Starting with hockey, expanding to cover every major sport and collectible.</p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { sport: 'Hockey', emoji: '\u{1F3D2}', status: 'Live' },
            { sport: 'Baseball', emoji: '\u{26BE}', status: 'Coming Soon' },
            { sport: 'Basketball', emoji: '\u{1F3C0}', status: 'Coming Soon' },
            { sport: 'Football', emoji: '\u{1F3C8}', status: 'Coming Soon' },
            { sport: 'Soccer', emoji: '\u{26BD}', status: 'Coming Soon' },
            { sport: 'Pokemon', emoji: '\u{26A1}', status: 'Coming Soon' },
          ].map(s => (
            <div key={s.sport} className="card-glass rounded-xl p-6 text-center hover:border-electric/30 transition-colors">
              <div className="text-4xl mb-3">{s.emoji}</div>
              <div className="font-semibold mb-1">{s.sport}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'Live' ? 'bg-green/10 text-green' : 'bg-electric/10 text-electric'}`}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="card-glass rounded-2xl p-12 text-center glow-blue">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Know What Your Cards Are <span className="text-gold">Really Worth?</span></h2>
          <p className="text-muted max-w-xl mx-auto mb-8">Join thousands of collectors making smarter decisions with real market data.</p>
          <button className="bg-gold hover:bg-gold-bright text-navy-900 font-bold px-8 py-3 rounded-lg transition-colors text-lg glow-gold">
            Get Early Access
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-electric/10 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric to-gold flex items-center justify-center text-navy-900 font-bold text-sm">CV</div>
              <span className="font-bold">Card<span className="text-electric">Vault</span></span>
            </div>
            <p className="text-sm text-muted">Track sports card values like the stock market.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gold mb-3 text-sm">Product</h4>
            <div className="space-y-2 text-sm text-muted">
              <div><a href="#" className="hover:text-electric transition-colors">Features</a></div>
              <div><a href="#" className="hover:text-electric transition-colors">Pricing</a></div>
              <div><a href="#" className="hover:text-electric transition-colors">API</a></div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gold mb-3 text-sm">Sports</h4>
            <div className="space-y-2 text-sm text-muted">
              <div><a href="#" className="hover:text-electric transition-colors">Hockey</a></div>
              <div><a href="#" className="hover:text-electric transition-colors">Baseball</a></div>
              <div><a href="#" className="hover:text-electric transition-colors">Basketball</a></div>
              <div><a href="#" className="hover:text-electric transition-colors">Football</a></div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gold mb-3 text-sm">Legal</h4>
            <div className="space-y-2 text-sm text-muted">
              <div><a href="#" className="hover:text-electric transition-colors">Privacy Policy</a></div>
              <div><a href="#" className="hover:text-electric transition-colors">Terms of Service</a></div>
              <div><a href="#" className="hover:text-electric transition-colors">Contact</a></div>
            </div>
          </div>
        </div>
        <div className="border-t border-electric/10 py-6">
          <p className="text-center text-xs text-muted">&copy; 2026 CardVault. A Midnight Studios product. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
