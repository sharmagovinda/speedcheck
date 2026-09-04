"use client";

import * as React from "react";
import { Scale } from "lucide-react";

import { CompareForm } from "@/components/compare-form";
import { CompareTable } from "@/components/compare-table";
import { DeviceToggle } from "@/components/device-toggle";
import { ErrorState } from "@/components/error-state";
import { ResultsSkeleton } from "@/components/results-skeleton";
import { ScoreRing } from "@/components/score-ring";
import { Card, CardContent } from "@/components/ui/card";
import { AnalyzeClientError, fetchAnalysis } from "@/lib/api/analyze-client";
import type { PerformanceReport, Strategy } from "@/lib/performance/types";

type Phase = "idle" | "loading" | "ready" | "error";

export default function ComparePage() {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [strategy, setStrategy] = React.useState<Strategy>("desktop");
  const [urls, setUrls] = React.useState<{ urlA: string; urlB: string } | null>(null);
  const [reportA, setReportA] = React.useState<PerformanceReport | null>(null);
  const [reportB, setReportB] = React.useState<PerformanceReport | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const runCompare = React.useCallback(async (a: string, b: string, s: Strategy) => {
    setPhase("loading");
    setErrorMessage(null);
    try {
      const [resultA, resultB] = await Promise.all([fetchAnalysis(a, s), fetchAnalysis(b, s)]);
      setReportA(resultA);
      setReportB(resultB);
      setPhase("ready");
    } catch (error) {
      const message =
        error instanceof AnalyzeClientError ? error.message : "Something went wrong comparing these websites.";
      setErrorMessage(message);
      setPhase("error");
    }
  }, []);

  const handleSubmit = (values: { urlA: string; urlB: string }) => {
    setUrls(values);
    runCompare(values.urlA, values.urlB, strategy);
  };

  const handleStrategyChange = (next: Strategy) => {
    setStrategy(next);
    if (urls) runCompare(urls.urlA, urls.urlB, next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-teal-400 text-white">
          <Scale className="size-5" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Compare Websites</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Analyze two websites side by side to see who comes out ahead.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-xl">
            <CompareForm onSubmit={handleSubmit} isLoading={phase === "loading"} />
          </div>
          <DeviceToggle value={strategy} onChange={handleStrategyChange} disabled={phase === "loading"} />
        </CardContent>
      </Card>

      <div className="mt-8">
        {phase === "loading" && <ResultsSkeleton />}

        {phase === "error" && (
          <ErrorState
            title="Comparison failed"
            description={errorMessage ?? "Something went wrong while comparing these websites."}
            onRetry={() => urls && runCompare(urls.urlA, urls.urlB, strategy)}
          />
        )}

        {phase === "ready" && reportA && reportB && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[reportA, reportB].map((report) => (
                <Card key={report.id}>
                  <CardContent className="flex flex-col items-center gap-4 px-6 py-6">
                    <p className="font-semibold">{report.hostname}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <ScoreRing score={report.performance} label="Performance" size={110} />
                      <ScoreRing score={report.seo} label="SEO" size={110} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <CompareTable reportA={reportA} reportB={reportB} />
          </div>
        )}
      </div>
    </div>
  );
}
