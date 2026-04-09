"use client";

import { Card, CardBody, Button, Chip, Accordion, AccordionItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

const PLANS = [
  { name: "Free", price: "$0", period: "/mo", desc: "Get started", highlight: false, features: [
    { t: "25 cards tracked", ok: true }, { t: "Daily updates", ok: true }, { t: "Basic portfolio", ok: true },
    { t: "Price alerts", ok: false }, { t: "Real-time", ok: false }, { t: "API access", ok: false },
  ], cta: "Current Plan", ctaHref: "/login" },
  { name: "Pro", price: "$9.99", period: "/mo", desc: "Active collector", highlight: true, features: [
    { t: "500 cards tracked", ok: true }, { t: "Real-time updates", ok: true }, { t: "Unlimited portfolio", ok: true },
    { t: "50 alerts/mo", ok: true }, { t: "Market movers", ok: true }, { t: "API access", ok: false },
  ], cta: "Start Trial", ctaHref: "/login" },
  { name: "Premium", price: "$24.99", period: "/mo", desc: "Serious investor", highlight: false, features: [
    { t: "Unlimited tracking", ok: true }, { t: "Real-time + API", ok: true }, { t: "Unlimited everything", ok: true },
    { t: "Unlimited alerts", ok: true }, { t: "Advanced analytics", ok: true }, { t: "Full API access", ok: true },
  ], cta: "Go Premium", ctaHref: "/login" },
];

const FAQS = [
  { q: "Can I cancel anytime?", a: "Yes. Cancel from settings. Keep access until billing period ends." },
  { q: "Is there a free trial?", a: "Pro and Premium include a 14-day free trial. No credit card required." },
  { q: "How is pricing data sourced?", a: "Aggregated from eBay, PWCC, Goldin, Fanatics. Updated every 15min for paid tiers." },
  { q: "What sports are supported?", a: "Hockey is live. Baseball, Basketball, Football, Soccer, Pokemon coming soon." },
];

export default function PricingPage() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Chip className="mb-3" variant="flat" color="primary" size="sm">Pricing</Chip>
          <h1 className="text-2xl font-bold mb-2">Simple Pricing</h1>
          <p className="text-default-400 text-sm">Start free. Upgrade when ready.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-14">
          {PLANS.map((plan) => (
            <Card key={plan.name} className={`border ${plan.highlight ? "border-primary" : "border-default-200"} bg-content1 flex flex-col ${plan.highlight ? "relative" : ""}`}>
              {plan.highlight && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2"><Chip color="primary" size="sm" classNames={{ content: "text-[0.6rem] font-semibold" }}>Popular</Chip></div>}
              <CardBody className="p-6 flex flex-col gap-4">
                <div>
                  <p className="text-xs font-medium text-default-500 mb-1">{plan.name}</p>
                  <div className="flex items-end gap-1 mb-0.5"><span className="text-2xl font-bold font-mono">{plan.price}</span><span className="text-default-400 text-xs mb-0.5">{plan.period}</span></div>
                  <p className="text-xs text-default-400">{plan.desc}</p>
                </div>
                <ul className="flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f.t} className={`flex items-center gap-2 text-xs ${f.ok ? "text-default-600" : "text-default-300 line-through"}`}>
                      <Icon icon={f.ok ? "solar:check-circle-bold" : "solar:close-circle-linear"} width={14} className={f.ok ? "text-success shrink-0" : "text-default-300 shrink-0"} />
                      {f.t}
                    </li>
                  ))}
                </ul>
                <Button as={Link} href={plan.ctaHref} fullWidth color={plan.highlight ? "primary" : "default"} variant={plan.highlight ? "solid" : "bordered"} size="sm">{plan.cta}</Button>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="max-w-xl mx-auto">
          <h2 className="text-lg font-semibold text-center mb-4">FAQs</h2>
          <Accordion variant="bordered" className="border-default-200">
            {FAQS.map((f) => <AccordionItem key={f.q} title={f.q} classNames={{ title: "text-xs font-medium" }}><p className="text-xs text-default-500 pb-2">{f.a}</p></AccordionItem>)}
          </Accordion>
        </div>
      </div>
    </DashboardLayout>
  );
}
