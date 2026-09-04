import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for teams of every size.",
};

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For personal projects and quick checks.",
    features: [
      "Unlimited manual analyses",
      "Performance, SEO & accessibility scores",
      "Core Web Vitals breakdown",
      "7-day report history",
    ],
    cta: "Get Started",
    href: "/check",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For freelancers and small teams shipping regularly.",
    features: [
      "Everything in Free",
      "Unlimited report history",
      "Website comparison tool",
      "Shareable report links",
      "Priority analysis queue",
    ],
    cta: "Start Free Trial",
    href: "/check",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$79",
    period: "/month",
    description: "For agencies monitoring many client sites.",
    features: [
      "Everything in Pro",
      "Scheduled recurring checks",
      "Team collaboration",
      "PDF report exports",
      "Priority support",
    ],
    cta: "Contact Sales",
    href: "/about",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h1>
        <p className="mt-3 text-muted-foreground">
          Start for free. Upgrade when you need deeper history and team features.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={cn(plan.highlighted && "border-primary shadow-md ring-1 ring-primary/20")}
          >
            <CardContent className="flex h-full flex-col px-6 py-8">
              {plan.highlighted && (
                <span className="mb-3 inline-flex w-fit rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                render={<Link href={plan.href} />}
                nativeButton={false}
                className="mt-8 w-full"
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
