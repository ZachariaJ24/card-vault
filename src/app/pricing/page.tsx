"use client";

import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    desc: "Perfect for getting started",
    highlight: false,
    color: "#64748b",
    features: [
      { text: "Track up to 25 cards", included: true },
      { text: "Daily price updates", included: true },
      { text: "Basic portfolio (25 cards)", included: true },
      { text: "Top 50 cards per sport", included: true },
      { text: "7-day price history", included: true },
      { text: "Community access", included: true },
      { text: "Price alerts", included: false },
      { text: "Real-time updates", included: false },
      { text: "Population reports", included: false },
      { text: "API access", included: false },
    ],
    cta: "Get Started Free",
    ctaHref: "/login",
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    desc: "For the active collector",
    highlight: true,
    color: "#f59e0b",
    features: [
      { text: "Track up to 500 cards", included: true },
      { text: "Real-time price updates", included: true },
      { text: "Unlimited portfolio", included: true },
      { text: "All cards, all sports", included: true },
      { text: "Full price history", included: true },
      { text: "Price alerts (50/month)", included: true },
      { text: "Market movers dashboard", included: true },
      { text: "Population reports", included: true },
      { text: "Comp search (50/day)", included: true },
      { text: "API access", included: false },
    ],
    cta: "Start Free Trial",
    ctaHref: "/login",
  },
  {
    name: "Premium",
    price: "$24.99",
    period: "/month",
    desc: "For serious investors",
    highlight: false,
    color: "#00b4ff",
    features: [
      { text: "Unlimited card tracking", included: true },
      { text: "Real-time updates + API", included: true },
      { text: "Unlimited portfolio", included: true },
      { text: "All cards, all sports", included: true },
      { text: "Full price history", included: true },
      { text: "Unlimited price alerts", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Population reports", included: true },
      { text: "Unlimited comp search", included: true },
      { text: "API access + exports", included: true },
    ],
    cta: "Go Premium",
    ctaHref: "/login",
  },
];

const COMPARISON = [
  { feature: "Cards tracked", free: "25", pro: "500", premium: "Unlimited" },
  { feature: "Price updates", free: "Daily", pro: "Real-time", premium: "Real-time" },
  { feature: "Price history", free: "7 days", pro: "Full", premium: "Full" },
  { feature: "Price alerts", free: "—", pro: "50/mo", premium: "Unlimited" },
  { feature: "Market movers", free: "—", pro: "✓", premium: "✓" },
  { feature: "Population reports", free: "—", pro: "✓", premium: "✓" },
  { feature: "Comp search", free: "—", pro: "50/day", premium: "Unlimited" },
  { feature: "Portfolio analytics", free: "Basic", pro: "Advanced", premium: "Advanced" },
  { feature: "API access", free: "—", pro: "—", premium: "✓" },
  { feature: "Data export", free: "—", pro: "—", premium: "✓" },
  { feature: "Priority support", free: "—", pro: "—", premium: "✓" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#060d18]">
      <PublicNav />

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <Chip className="mb-5 bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20">Pricing</Chip>
          <h1 className="text-5xl font-black text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-[#64748b] text-lg max-w-xl mx-auto">
            Start free. Upgrade when you&apos;re ready. No hidden fees, no surprises.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`card-glass flex flex-col ${plan.highlight ? "border-[#f59e0b]/30 glow-gold relative" : ""}`}
              radius="lg"
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Chip className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold text-xs">
                    MOST POPULAR
                  </Chip>
                </div>
              )}
              <CardBody className="p-8 flex flex-col gap-5">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: plan.color }}>{plan.name}</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-[#64748b] text-sm mb-1">{plan.period}</span>
                  </div>
                  <p className="text-sm text-[#64748b]">{plan.desc}</p>
                </div>

                <ul className="flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f.text} className={`flex items-center gap-2 text-sm ${f.included ? "text-[#94a3b8]" : "text-[#64748b]/40 line-through"}`}>
                      <Icon
                        icon={f.included ? "solar:check-circle-bold" : "solar:close-circle-bold"}
                        width={16}
                        className={f.included ? "text-[#22c55e] shrink-0" : "text-[#64748b]/40 shrink-0"}
                      />
                      {f.text}
                    </li>
                  ))}
                </ul>

                <Button
                  as={Link} href={plan.ctaHref}
                  fullWidth
                  className={plan.highlight
                    ? "bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold glow-gold"
                    : plan.color === "#00b4ff"
                      ? "bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20"
                      : "border border-[#64748b]/20 text-[#64748b] hover:text-white hover:border-[#64748b]/40"}
                >
                  {plan.cta}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-white text-center mb-8">Full Feature Comparison</h2>
          <Card className="card-glass" radius="lg">
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#00b4ff]/10">
                      <th className="px-6 py-4 text-left text-[#64748b] font-medium">Feature</th>
                      <th className="px-6 py-4 text-center text-[#64748b] font-medium">Free</th>
                      <th className="px-6 py-4 text-center text-[#f59e0b] font-bold">Pro</th>
                      <th className="px-6 py-4 text-center text-[#00b4ff] font-medium">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row, i) => (
                      <tr key={row.feature} className={`border-b border-[#00b4ff]/5 ${i % 2 === 0 ? "" : "bg-[#00b4ff]/[0.02]"}`}>
                        <td className="px-6 py-3 text-white font-medium">{row.feature}</td>
                        <td className="px-6 py-3 text-center text-[#64748b]">{row.free}</td>
                        <td className="px-6 py-3 text-center text-[#f59e0b] font-medium">{row.pro}</td>
                        <td className="px-6 py-3 text-center text-[#00b4ff] font-medium">{row.premium}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-white text-center mb-8">FAQs</h2>
          {[
            { q: "Can I cancel anytime?", a: "Yes. Cancel anytime from your settings. You keep access until the end of your billing period." },
            { q: "Is there a free trial?", a: "Pro and Premium both include a 14-day free trial. No credit card required to start." },
            { q: "How is pricing data sourced?", a: "We aggregate sold listings from eBay, PWCC, Goldin, Fanatics, and more. Updated every 15 minutes for paid tiers." },
            { q: "What sports are currently supported?", a: "Hockey is live. Baseball, Basketball, Football, Soccer, and Pokemon are coming soon." },
          ].map((faq) => (
            <Card key={faq.q} className="card-glass mb-3" radius="lg">
              <CardBody className="p-5">
                <h3 className="font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-[#64748b]">{faq.a}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#00b4ff]/10 py-8">
        <p className="text-center text-xs text-[#64748b]">
          © {new Date().getFullYear()} CardVault · A <span className="text-[#00b4ff]">Midnight Studios</span> product
        </p>
      </footer>
    </div>
  );
}
