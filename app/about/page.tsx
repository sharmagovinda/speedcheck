import type { Metadata } from "next";
import { Accessibility, Gauge, Search, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Why we built SpeedCheck and what it measures.",
};

const PILLARS = [
  {
    icon: Gauge,
    title: "Performance",
    description: "Core Web Vitals and load-time metrics that reflect real user experience.",
  },
  {
    icon: Search,
    title: "SEO",
    description: "The technical fundamentals search engines look for on every page.",
  },
  {
    icon: Accessibility,
    title: "Accessibility",
    description: "Making sure your site works for everyone, not just some of your users.",
  },
  {
    icon: ShieldCheck,
    title: "Best Practices",
    description: "Modern, secure standards that keep your site trustworthy and fast.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About SpeedCheck</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        SpeedCheck is a free website performance and SEO checker built for developers who care
        about how fast, accessible, and discoverable their sites really are.
      </p>
      <p className="mt-4 text-muted-foreground">
        We believe every team should be able to see exactly how their website performs for real
        users — without buying enterprise tooling or reading raw Lighthouse JSON. Enter a URL,
        and SpeedCheck breaks down performance, SEO, accessibility, and best practices into one
        clear report, with prioritized recommendations you can act on immediately.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {PILLARS.map((pillar) => (
          <div key={pillar.title} className="rounded-2xl border border-border p-5">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-teal-400 text-white">
              <pillar.icon className="size-4.5" aria-hidden="true" />
            </div>
            <h2 className="font-semibold">{pillar.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{pillar.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
