import type { Metadata } from "next";
import { Gauge } from "lucide-react";

import { AnalyzeForm } from "@/components/analyze-form";

export const metadata: Metadata = {
  title: "Website Checker",
  description: "Enter any website URL to analyze its performance, SEO, and accessibility.",
};

export default function CheckPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-teal-400 text-white">
        <Gauge className="size-7" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Website Checker</h1>
      <p className="mt-3 text-muted-foreground">
        Enter a website URL below to get a full performance, SEO, and accessibility report.
      </p>
      <div className="mt-8 w-full">
        <AnalyzeForm />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        No signup required • Free website analysis
      </p>
    </div>
  );
}
