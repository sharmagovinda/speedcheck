import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  FileSearch,
  Gauge,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";

import { AnalyzeForm } from "@/components/analyze-form";
import { AnimatedGridBackground } from "@/components/animated-grid-background";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Gauge,
    title: "Performance scoring",
    description: "Get a 0-100 performance score modeled on real-world load conditions.",
  },
  {
    icon: Timer,
    title: "Core Web Vitals",
    description: "Track LCP, INP, and CLS — the metrics that matter most to Google.",
  },
  {
    icon: FileSearch,
    title: "SEO audit",
    description: "Catch missing meta tags, broken canonicals, and indexability issues.",
  },
  {
    icon: Accessibility,
    title: "Accessibility checks",
    description: "Find contrast, labeling, and semantic issues before your users do.",
  },
  {
    icon: ImageIcon,
    title: "Resource breakdown",
    description: "See exactly where your page weight is going, byte by byte.",
  },
  {
    icon: ShieldCheck,
    title: "Best practices",
    description: "Verify HTTPS, modern image formats, and secure response headers.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Enter your URL",
    description: "Paste any website address — we'll automatically add https:// for you.",
  },
  {
    number: "02",
    title: "We run the analysis",
    description: "SpeedCheck simulates a real page load and audits every layer of your site.",
  },
  {
    number: "03",
    title: "Get your report",
    description: "Review scores, Core Web Vitals, and prioritized fixes in one dashboard.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <AnimatedGridBackground />
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-blue-500" aria-hidden="true" />
            Free instant website analysis
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Check Your Website Speed &amp; Performance
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground text-balance">
            Analyze your website&apos;s performance, SEO, accessibility, and best practices in
            seconds.
          </p>

          <div className="mt-10 w-full max-w-2xl">
            <AnalyzeForm />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No signup required • Free website analysis
          </p>
        </div>
      </section>

      <section id="features" className="border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to ship a fast site
            </h2>
            <p className="mt-3 text-muted-foreground">
              One dashboard covering performance, SEO, accessibility, and best practices.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="px-6 py-6">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-teal-400 text-white">
                    <feature.icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-border bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">
              From URL to actionable report in three simple steps.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center sm:text-left">
                <span className="text-4xl font-bold text-primary/20">{step.number}</span>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to see how your site performs?
          </h2>
          <p className="max-w-lg text-muted-foreground">
            Run your first analysis in under a minute — no account required.
          </p>
          <Button
            size="lg"
            render={<Link href="/check" />}
            nativeButton={false}
            className="h-12 px-8 text-base"
          >
            Analyze Website
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </section>
    </div>
  );
}
