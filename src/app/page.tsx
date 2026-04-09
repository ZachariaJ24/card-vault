"use client";

import { useState } from "react";
import { Button, Card, CardBody, Chip, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import { MOCK_CARDS, TICKER_ITEMS, SPORTS_LIST } from "@/lib/mock-data";
import { formatCurrency, formatChange, sportEmoji } from "@/lib/utils";

const FEATURES = [
  { icon: "solar:chart-square-bold", title: "Real-Time Pricing", desc: "Aggregated from eBay, PWCC, Goldin, and more. Updated every 15 minutes." },
  { icon: "solar:wallet-bold", title: "Portfolio Tracker", desc: "Log your collection and watch your net worth update in real time." },
  { icon: "solar:bell-bold", title: "Price Alerts", desc: "Get notified the moment a card hits your buy or sell target price." },
  { icon: "solar:fire-bold", title: "Market Movers", desc: "See what's surging and what's cooling — ranked by daily percentage change." },
  { icon: "solar:medal-ribbons-star-bold", title: "Population Reports", desc: "PSA, BGS, SGC pop data integrated. Know how rare your card is before buying." },
  { icon: "solar:magnifer-zoom-in-bold", title: "Comp Search", desc: "Pull recent sales comps instantly. Filter by grade, year, parallel, and variation." },
];

const STATS = [
  { value: "2.4M+", label: "Cards Tracked" },
  { value: "150K+", label: "Daily Updates" },
  { value: "12K+", label: "Active Users" },
  { value: "6", label: "Sports" },
];

const SPORT_STATUS: Record<string, "live" | "soon"> = {
  Hockey: "live", Baseball: "soon", Basketball: "soon",
  Football: "soon", Soccer: "soon", Pokemon: "soon",
};

// Stable ticker data (no random on render)
const TICKER = [
  { name: "Connor McDavid RC PSA 10", price: "$1,250", change: "+5.2%", up: true },
  { name: "Wayne Gretzky OPC PSA 9", price: "$45,000", change: "+0.5%", up: true },
  { name: "Victor Wembanyama RC BGS 9.5", price: "$2,100", change: "+12.4%", up: true },
  { name: "Patrick Mahomes RC PSA 10", price: "$3,400", change: "+1.8%", up: true },
  { name: "Shohei Ohtani RC PSA 10", price: "$890", change: "-2.1%", up: false },
  { name: "Charizard Holo PSA 10", price: "$28,000", change: "-1.3%", up: false },
  { name: "Auston Matthews RC PSA 10", price: "$380", change: "+3.6%", up: true },
  { name: "Lamine Yamal RC PSA 10", price: "$675", change: "+18.7%", up: true },
];
const DOUBLED_TICKER = [...TICKER, ...TICKER];

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#060d18]">
      {/* Ticker */}
      <div className="bg-[#0a1628] border-b border-[#00b4ff]/10 h-9 overflow-hidden flex items-center">
        <div className="animate-ticker flex whitespace-nowrap">
          {DOUBLED_TICKER.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-5 text-xs">
              <span className="text-[#f0f8ff] font-medium">{item.name}</span>
              <span className="text-[#00b4ff] font-bold">{item.price}</span>
              <span className={item.up ? "text-[#22c55e]" : "text-[#ef4444]"}>{item.change}</span>
              <span className="text-[#162540]">·</span>
            </span>
          ))}
        </div>
      </div>

      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,180,255,0.08) 0%, transparent 55%)" }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <Chip
            startContent={<span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />}
            variant="flat"
            className="mb-6 bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20"
          >
            Live market data · Updated every 15 min
          </Chip>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            Track Sports Cards{" "}
            <span style={{ background: "linear-gradient(135deg, #00b4ff, #0088cc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Like the Stock Market
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#64748b] max-w-2xl mx-auto mb-10">
            Real-time pricing, portfolio analytics, and market intelligence — all in one platform built for serious collectors.
          </p>

          {!submitted ? (
            <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                value={email}
                onValueChange={setEmail}
                placeholder="Enter your email"
                required
                variant="bordered"
                classNames={{
                  inputWrapper: "bg-[#0a1628] border-[#00b4ff]/20 hover:border-[#00b4ff]/50 data-[focus=true]:border-[#00b4ff]",
                  input: "text-white placeholder:text-[#64748b]",
                }}
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold glow-gold whitespace-nowrap"
              >
                Join Waitlist
              </Button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 text-[#22c55e] font-medium">
              <Icon icon="solar:check-circle-bold" width={20} />
              You&apos;re on the list! We&apos;ll be in touch.
            </div>
          )}
          <p className="text-xs text-[#64748b] mt-3">No spam. Unsubscribe anytime.</p>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button as={Link} href="/market" size="lg" variant="flat"
              className="bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20"
              startContent={<Icon icon="solar:graph-up-bold" width={18} />}>
              Browse Market
            </Button>
            <Button as={Link} href="/pricing" size="lg" variant="flat"
              className="bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Table */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-2xl font-bold text-white">Trending Now</h2>
          <Chip size="sm" className="bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">Live</Chip>
        </div>
        <Card className="card-glass glow-blue" radius="lg">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#00b4ff]/10 text-[#64748b] text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Card</th>
                    <th className="px-5 py-3 text-left hidden md:table-cell">Sport</th>
                    <th className="px-5 py-3 text-left hidden sm:table-cell">Grade</th>
                    <th className="px-5 py-3 text-right">Price</th>
                    <th className="px-5 py-3 text-right">24h</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CARDS.slice(0, 8).map((card, i) => {
                    const up = i % 3 !== 1;
                    const change = up ? +(Math.random() * 6 + 0.3).toFixed(1) : -(Math.random() * 3 + 0.2).toFixed(1) as unknown as number;
                    return (
                      <tr key={card.id}
                        className="border-b border-[#00b4ff]/5 hover:bg-[#00b4ff]/5 cursor-pointer transition-colors">
                        <td className="px-5 py-3">
                          <Link href={`/card/${card.id}`} className="hover:text-[#00b4ff] transition-colors">
                            <div className="font-medium text-white">{card.player_name}</div>
                            <div className="text-xs text-[#64748b]">{card.card_set}</div>
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-[#64748b] hidden md:table-cell">
                          {sportEmoji(card.sport)} {card.sport}
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell">
                          <Chip size="sm" variant="flat" className="bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20 text-xs">
                            {card.grade}
                          </Chip>
                        </td>
                        <td className="px-5 py-3 text-right font-bold font-mono text-white">
                          {formatCurrency(card.base_price)}
                        </td>
                        <td className={`px-5 py-3 text-right font-semibold ${up ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                          {formatChange(change)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
        <div className="text-center mt-4">
          <Button as={Link} href="/market" variant="flat"
            className="bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20"
            endContent={<Icon icon="solar:alt-arrow-right-bold" width={16} />}>
            View Full Market
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#00b4ff]/10 bg-[#0a1628]/50 py-14">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-black text-[#00b4ff]">{s.value}</div>
              <div className="text-sm text-[#64748b] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-3">Everything a Serious Collector Needs</h2>
          <p className="text-[#64748b] text-lg">Professional-grade tools that used to cost thousands — now in one platform.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <Card key={f.title} className="card-glass hover:border-[#00b4ff]/30 transition-all group" radius="lg">
              <CardBody className="p-6">
                <div className="w-10 h-10 rounded-lg bg-[#00b4ff]/10 border border-[#00b4ff]/20 flex items-center justify-center mb-4">
                  <Icon icon={f.icon} width={22} className="text-[#00b4ff]" />
                </div>
                <h3 className="font-bold text-white mb-2 group-hover:text-[#00b4ff] transition-colors">{f.title}</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">{f.desc}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Sports */}
      <section id="sports" className="bg-[#0a1628]/40 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white text-center mb-10">Every Sport, Every Card</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {SPORTS_LIST.map((sport) => {
              const status = SPORT_STATUS[sport] ?? "soon";
              return (
                <Card key={sport} className={`card-glass text-center ${status === "live" ? "border-[#22c55e]/20" : ""}`} radius="lg">
                  <CardBody className="px-2 py-5 flex flex-col items-center gap-2">
                    <span className="text-3xl">{sportEmoji(sport)}</span>
                    <span className="text-xs font-semibold text-white">{sport}</span>
                    <Chip
                      size="sm"
                      className={status === "live"
                        ? "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20"
                        : "bg-[#64748b]/10 text-[#64748b] border border-[#64748b]/20"}
                    >
                      {status === "live" ? "Live" : "Soon"}
                    </Chip>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-3">Simple, Transparent Pricing</h2>
          <p className="text-[#64748b]">Start free. Upgrade when you need the full picture.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {[
            { name: "Free", price: "$0", period: "/mo", features: ["25 cards tracked", "Daily updates", "Basic portfolio"], highlight: false },
            { name: "Pro", price: "$9.99", period: "/mo", features: ["500 cards tracked", "Real-time updates", "Price alerts (10)", "Market movers"], highlight: true },
            { name: "Premium", price: "$24.99", period: "/mo", features: ["Unlimited cards", "API access", "Unlimited alerts", "Pop reports"], highlight: false },
          ].map((plan) => (
            <Card key={plan.name} className={`card-glass ${plan.highlight ? "border-[#f59e0b]/30 glow-gold" : ""}`} radius="lg">
              <CardBody className="p-6 flex flex-col gap-4">
                {plan.highlight && (
                  <Chip size="sm" className="self-start bg-[#f59e0b] text-[#060d18] font-bold">MOST POPULAR</Chip>
                )}
                <div>
                  <p className="text-sm text-[#64748b]">{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-white">{plan.price}</span>
                    <span className="text-[#64748b] text-sm mb-0.5">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#64748b]">
                      <Icon icon="solar:check-circle-bold" className="text-[#22c55e] shrink-0" width={16} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  as={Link} href="/pricing"
                  className={plan.highlight
                    ? "bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold glow-gold"
                    : "bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20"}
                  fullWidth
                >
                  {plan.highlight ? "Start Free Trial" : "Get Started"}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/pricing" className="text-sm text-[#00b4ff] hover:text-white transition-colors">
            Compare all features →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0a1628]/60 border-y border-[#00b4ff]/10 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">
            Your Collection Is an{" "}
            <span style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Investment
            </span>
          </h2>
          <p className="text-[#64748b] mb-8">Join thousands of collectors who track their cards like a portfolio.</p>
          <Button
            as={Link} href="/login" size="lg"
            className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold glow-gold px-8"
          >
            Start Tracking Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#64748b]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-black text-[#060d18]"
              style={{ background: "linear-gradient(135deg, #00b4ff, #0088cc)" }}>CV</div>
            <span className="text-white font-semibold">CardVault</span>
          </div>
          <div className="flex gap-5">
            {[{ l: "Market", h: "/market" }, { l: "Pricing", h: "/pricing" }, { l: "Login", h: "/login" }].map(({ l, h }) => (
              <Link key={h} href={h} className="hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
          <div>
            <span>A </span>
            <span className="text-[#00b4ff] font-medium">Midnight Studios</span>
            <span> product · © {new Date().getFullYear()} CardVault</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
