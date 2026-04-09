"use client";

import { Card, CardBody, Button, Chip, Accordion, AccordionItem } from "@heroui/react";
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
  { feature: "Price alerts", free: "-", pro: "50/mo", premium: "Unlimited" },
  { feature: "Market movers", free: "-", pro: "Yes", premium: "Yes" },
  { feature: "Population reports", free: "-", pro: "Yes", premium: "Yes" },
  { feature: "Comp search", free: "-", pro: "50/day", premium: "Unlimited" },
  { feature: "Portfolio analytics", free: "Basic", pro: "Advanced", premium: "Advanced" },
  { feature: "API access", free: "-", pro: "-", premium: "Yes" },
  { feature: "Data export", free: "-", pro: "-", premium: "Yes" },
  { feature: "Priority support", free: "-", pro: "-", premium: "Yes" },
];

const FAQS = [
  { q: "Can I cancel anytime?", a: "Yes. Cancel anytime from your settings. You keep access until the end of your billing period." },
  { q: "Is there a free trial?", a: "Pro and Premium both include a 14-day free trial. No credit card required to start." },
  { q: "How is pricing data sourced?", a: "We aggregate sold listings from eBay, PWCC, Goldin, Fanatics, and more. Updated every 15 minutes for paid tiers." },
  { q: "What sports are currently supported?", a: "Hockey is live. Baseball, Basketball, Football, Soccer, and Pokemon are coming soon." },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-14">
          <Chip className="mb-4" variant="flat" color="primary" size="sm">Pricing</Chip>
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-default-500 max-w-md mx-auto">
            Start free. Upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-20">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`border ${plan.highlight ? "border-primary" : "border-default-200"} bg-content1 flex flex-col ${plan.highlight ? "relative" : ""}`}
              shadow="none"
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Chip color="primary" size="sm" className="font-medium">Most Popular</Chip>
                </div>
              )}
              <CardBody className="p-7 flex flex-col gap-5">
                <div>
                  <p className="text-sm font-medium text-default-500 mb-1">{plan.name}</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-default-400 text-sm mb-0.5">{plan.period}</span>
                  </div>
                  <p className="text-sm text-default-400">{plan.desc}</p>
                </div>

                <ul className="flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f.text} className={`flex items-center gap-2 text-sm ${f.included ? "text-default-600" : "text-default-300 line-through"}`}>
                      <Icon
                        icon={f.included ? "solar:check-circle-bold" : "solar:close-circle-linear"}
                        width={16}
                        className={f.included ? "text-success shrink-0" : "text-default-300 shrink-0"}
                      />
                      {f.text}
                    </li>
                  ))}
                </ul>

                <Button
                  as={Link} href={plan.ctaHref}
                  fullWidth
                  color={plan.highlight ? "primary" : "default"}
                  variant={plan.highlight ? "solid" : "bordered"}
                  className={plan.highlight ? "font-medium" : ""}
                >
                  {plan.cta}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Full Feature Comparison</h2>
          <Card className="border border-default-200 bg-content1" shadow="none">
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-default-200">
                      <th className="px-6 py-4 text-left text-default-500 font-medium">Feature</th>
                      <th className="px-6 py-4 text-center text-default-500 font-medium">Free</th>
                      <th className="px-6 py-4 text-center text-primary font-semibold">Pro</th>
                      <th className="px-6 py-4 text-center text-default-500 font-medium">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row, i) => (
                      <tr key={row.feature} className={`border-b border-default-100 ${i % 2 === 1 ? "bg-default-50/50" : ""}`}>
                        <td className="px-6 py-3 font-medium">{row.feature}</td>
                        <td className="px-6 py-3 text-center text-default-400">{row.free}</td>
                        <td className="px-6 py-3 text-center text-primary font-medium">{row.pro}</td>
                        <td className="px-6 py-3 text-center text-default-500">{row.premium}</td>
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
          <h2 className="text-2xl font-bold text-center mb-8">FAQs</h2>
          <Accordion variant="bordered" className="border-default-200">
            {FAQS.map((faq) => (
              <AccordionItem key={faq.q} title={faq.q} classNames={{ title: "text-sm font-medium" }}>
                <p className="text-sm text-default-500 pb-2">{faq.a}</p>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <footer className="border-t border-default-200 py-8">
        <p className="text-center text-xs text-default-400">
          &copy; {new Date().getFullYear()} CardVault &middot; Midnight Studios
        </p>
      </footer>
    </div>
  );
}
