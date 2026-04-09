"use client";

import { useState } from "react";
import { Button, Card, CardBody, Chip, Input, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import { MOCK_CARDS, SPORTS_LIST } from "@/lib/mock-data";
import { formatCurrency, formatChange, sportEmoji } from "@/lib/utils";

const FEATURES = [
  { icon: "solar:chart-2-linear", title: "Real-Time Pricing", desc: "Aggregated from eBay, PWCC, Goldin, and more. Updated every 15 minutes." },
  { icon: "solar:wallet-money-linear", title: "Portfolio Tracker", desc: "Log your collection and watch your net worth update in real time." },
  { icon: "solar:bell-linear", title: "Price Alerts", desc: "Get notified the moment a card hits your buy or sell target price." },
  { icon: "solar:fire-linear", title: "Market Movers", desc: "See what's surging and cooling — ranked by daily percentage change." },
  { icon: "solar:medal-ribbons-star-linear", title: "Population Reports", desc: "PSA, BGS, SGC pop data integrated. Know rarity before buying." },
  { icon: "solar:magnifer-zoom-in-linear", title: "Comp Search", desc: "Pull recent sales comps instantly. Filter by grade, year, and variation." },
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
    <div className="min-h-screen bg-background">
      {/* Ticker */}
      <div className="border-b border-default-200 h-9 overflow-hidden flex items-center bg-content1">
        <div className="animate-ticker flex whitespace-nowrap">
          {DOUBLED_TICKER.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-5 text-xs">
              <span className="text-default-500 font-medium">{item.name}</span>
              <span className="text-foreground font-semibold">{item.price}</span>
              <span className={item.up ? "text-success" : "text-danger"}>{item.change}</span>
              <span className="text-default-300">|</span>
            </span>
          ))}
        </div>
      </div>

      <PublicNav />

      {/* Hero */}
      <section className="pt-20 pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Chip
            startContent={<span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />}
            variant="flat"
            color="success"
            size="sm"
            className="mb-6"
          >
            Live market data
          </Chip>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6 text-foreground">
            Track Sports Cards
            <br />
            <span className="text-primary">Like the Stock Market</span>
          </h1>

          <p className="text-lg text-default-500 max-w-xl mx-auto mb-10">
            Real-time pricing, portfolio analytics, and market intelligence — built for serious collectors.
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
                size="lg"
                classNames={{
                  inputWrapper: "border-default-300",
                }}
              />
              <Button type="submit" color="primary" size="lg" className="font-medium whitespace-nowrap">
                Join Waitlist
              </Button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 text-success font-medium">
              <Icon icon="solar:check-circle-bold" width={20} />
              You&apos;re on the list! We&apos;ll be in touch.
            </div>
          )}
          <p className="text-xs text-default-400 mt-3">No spam. Unsubscribe anytime.</p>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button as={Link} href="/market" size="lg" variant="flat" color="primary"
              startContent={<Icon icon="solar:chart-2-linear" width={18} />}>
              Browse Market
            </Button>
            <Button as={Link} href="/pricing" size="lg" variant="bordered"
              className="border-default-300 text-default-600">
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Table */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-semibold">Trending Now</h2>
          <Chip size="sm" color="success" variant="flat">Live</Chip>
        </div>
        <Card className="border border-default-200 bg-content1" shadow="none">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default-200 text-default-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-medium">Card</th>
                    <th className="px-5 py-3 text-left hidden md:table-cell font-medium">Sport</th>
                    <th className="px-5 py-3 text-left hidden sm:table-cell font-medium">Grade</th>
                    <th className="px-5 py-3 text-right font-medium">Price</th>
                    <th className="px-5 py-3 text-right font-medium">24h</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CARDS.slice(0, 8).map((card, i) => {
                    const up = i % 3 !== 1;
                    const change = up ? +(Math.random() * 6 + 0.3).toFixed(1) : -(Math.random() * 3 + 0.2).toFixed(1) as unknown as number;
                    return (
                      <tr key={card.id}
                        className="border-b border-default-100 hover:bg-default-50 cursor-pointer transition-colors">
                        <td className="px-5 py-3">
                          <Link href={`/card/${card.id}`} className="hover:text-primary transition-colors">
                            <div className="font-medium text-foreground">{card.player_name}</div>
                            <div className="text-xs text-default-400">{card.card_set}</div>
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-default-500 hidden md:table-cell">
                          {sportEmoji(card.sport)} {card.sport}
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell">
                          <Chip size="sm" variant="flat" className="text-xs">{card.grade}</Chip>
                        </td>
                        <td className="px-5 py-3 text-right font-semibold font-mono text-foreground">
                          {formatCurrency(card.base_price)}
                        </td>
                        <td className={`px-5 py-3 text-right font-medium ${up ? "text-success" : "text-danger"}`}>
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
          <Button as={Link} href="/market" variant="flat" color="primary"
            endContent={<Icon icon="solar:alt-arrow-right-linear" width={16} />}>
            View Full Market
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-default-200 bg-content1 py-14">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-foreground">{s.value}</div>
              <div className="text-sm text-default-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Everything a Serious Collector Needs</h2>
          <p className="text-default-500">Professional-grade tools in one platform.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="border border-default-200 bg-content1" shadow="none">
              <CardBody className="p-5">
                <Icon icon={f.icon} width={24} className="text-primary mb-3" />
                <h3 className="font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-default-500 leading-relaxed">{f.desc}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Sports */}
      <section id="sports" className="bg-content1 border-y border-default-200 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Every Sport, Every Card</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {SPORTS_LIST.map((sport) => {
              const status = SPORT_STATUS[sport] ?? "soon";
              return (
                <Card key={sport} className="border border-default-200 bg-background text-center" shadow="none">
                  <CardBody className="px-2 py-5 flex flex-col items-center gap-2">
                    <span className="text-2xl">{sportEmoji(sport)}</span>
                    <span className="text-xs font-semibold">{sport}</span>
                    <Chip size="sm" variant="flat" color={status === "live" ? "success" : "default"}>
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
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Simple, Transparent Pricing</h2>
          <p className="text-default-500">Start free. Upgrade when you need the full picture.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "Free", price: "$0", period: "/mo", features: ["25 cards tracked", "Daily updates", "Basic portfolio"], highlight: false },
            { name: "Pro", price: "$9.99", period: "/mo", features: ["500 cards tracked", "Real-time updates", "Price alerts (10)", "Market movers"], highlight: true },
            { name: "Premium", price: "$24.99", period: "/mo", features: ["Unlimited cards", "API access", "Unlimited alerts", "Pop reports"], highlight: false },
          ].map((plan) => (
            <Card key={plan.name}
              className={`border ${plan.highlight ? "border-primary" : "border-default-200"} bg-content1`}
              shadow="none"
            >
              <CardBody className="p-6 flex flex-col gap-4">
                {plan.highlight && (
                  <Chip size="sm" color="primary" variant="flat" className="self-start">Most Popular</Chip>
                )}
                <div>
                  <p className="text-sm text-default-500">{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-default-400 text-sm mb-0.5">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-default-500">
                      <Icon icon="solar:check-circle-bold" className="text-success shrink-0" width={16} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  as={Link} href="/pricing"
                  color={plan.highlight ? "primary" : "default"}
                  variant={plan.highlight ? "solid" : "bordered"}
                  fullWidth
                  className={plan.highlight ? "font-medium" : ""}
                >
                  {plan.highlight ? "Start Free Trial" : "Get Started"}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/pricing" className="text-sm text-primary hover:underline">
            Compare all features &rarr;
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-content1 border-y border-default-200 py-20 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Your Collection Is an Investment
          </h2>
          <p className="text-default-500 mb-8">Join thousands of collectors who track their cards like a portfolio.</p>
          <Button as={Link} href="/login" size="lg" color="primary" className="font-medium px-8">
            Start Tracking Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-default-400">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-xs font-bold text-white">CV</div>
            <span className="text-foreground font-semibold">CardVault</span>
          </div>
          <div className="flex gap-5">
            {[{ l: "Market", h: "/market" }, { l: "Pricing", h: "/pricing" }, { l: "Login", h: "/login" }].map(({ l, h }) => (
              <Link key={h} href={h} className="hover:text-foreground transition-colors">{l}</Link>
            ))}
          </div>
          <div>
            Midnight Studios &middot; &copy; {new Date().getFullYear()} CardVault
          </div>
        </div>
      </footer>
    </div>
  );
}
