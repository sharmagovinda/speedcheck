"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AccessibilityReport } from "@/components/accessibility-report";
import { BestPracticesReport } from "@/components/best-practices-report";
import { CoreWebVitals } from "@/components/core-web-vitals";
import { Diagnostics } from "@/components/diagnostics";
import { ErrorState } from "@/components/error-state";
import { FieldLabData } from "@/components/field-lab-data";
import { LoadingAnalysis } from "@/components/loading-analysis";
import { Opportunities } from "@/components/opportunities";
import { PerformanceOverview } from "@/components/performance-overview";
import { PerformanceTimeline } from "@/components/performance-timeline";
import { ReportHeader } from "@/components/report-header";
import { ResourceBreakdown } from "@/components/resource-breakdown";
import { SeoReport } from "@/components/seo-report";
import { AnalyzeClientError, fetchAnalysis } from "@/lib/api/analyze-client";
import type { PerformanceReport, Strategy } from "@/lib/performance/types";
import { localReportHistoryStore, toSummary } from "@/lib/storage/report-history";
import { withProtocol } from "@/lib/validations/url";

function safeHostname(rawUrl: string): string {
  try {
    return new URL(withProtocol(rawUrl)).hostname;
  } catch {
    return rawUrl;
  }
}

function errorTitle(code: AnalyzeClientError["code"]): string {
  switch (code) {
    case "INVALID_URL":
      return "Invalid URL";
    case "UNSAFE_URL":
      return "Website unavailable";
    case "RATE_LIMITED":
      return "Rate limit reached";
    default:
      return "Analysis failed";
  }
}

function coerceError(error: unknown): AnalyzeClientError {
  if (error instanceof AnalyzeClientError) return error;
  return new AnalyzeClientError("ANALYSIS_FAILED", "Something went wrong while analyzing this website.");
}

function ResultsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawUrl = searchParams.get("url") ?? "";
  // Strategy is derived from the URL, not duplicated into local state — both
  // retest and the device toggle update the URL, which flows back in here.
  const strategy: Strategy = searchParams.get("strategy") === "desktop" ? "desktop" : "mobile";

  const [report, setReport] = React.useState<PerformanceReport | null>(null);
  const [error, setError] = React.useState<AnalyzeClientError | null>(null);
  const [animationDone, setAnimationDone] = React.useState(false);
  const [switching, setSwitching] = React.useState(false);
  const [loadingId, setLoadingId] = React.useState(0);

  React.useEffect(() => {
    if (!rawUrl) return;
    let cancelled = false;
    // Resetting to a fresh loading state for a new url/loadingId is the
    // intended effect of this data fetch, not incidental render work.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReport(null);
    setError(null);
    setAnimationDone(false);
    setSwitching(false);

    fetchAnalysis(rawUrl, strategy)
      .then((r) => {
        if (!cancelled) setReport(r);
      })
      .catch((e) => {
        if (!cancelled) setError(coerceError(e));
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawUrl, loadingId]);

  React.useEffect(() => {
    if (report) {
      localReportHistoryStore.save(toSummary(report));
    }
  }, [report]);

  const handleRetest = React.useCallback(() => {
    setReport(null);
    setLoadingId((id) => id + 1);
  }, []);

  const handleStrategyChange = React.useCallback(
    (next: Strategy) => {
      if (next === strategy || !rawUrl) return;
      router.replace(`/results?url=${encodeURIComponent(rawUrl)}&strategy=${next}`, {
        scroll: false,
      });
      setSwitching(true);
      fetchAnalysis(rawUrl, next)
        .then((r) => {
          setReport(r);
          setSwitching(false);
        })
        .catch((e) => {
          setError(coerceError(e));
          setSwitching(false);
        });
    },
    [rawUrl, router, strategy],
  );

  if (!rawUrl) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ErrorState
          title="No website to analyze"
          description="Head back to the website checker and enter a URL to get started."
          onRetry={() => router.push("/check")}
          retryLabel="Go to Website Checker"
        />
      </div>
    );
  }

  const phase: "loading" | "error" | "ready" | "switching" = error
    ? "error"
    : !report || !animationDone
      ? "loading"
      : switching
        ? "switching"
        : "ready";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {phase === "loading" && (
        <LoadingAnalysis
          key={`${rawUrl}-${loadingId}`}
          hostname={safeHostname(rawUrl)}
          onDone={() => setAnimationDone(true)}
        />
      )}

      {phase === "error" && error && (
        <ErrorState title={errorTitle(error.code)} description={error.message} onRetry={handleRetest} />
      )}

      {report && (phase === "ready" || phase === "switching") && (
        <div className="relative">
          {phase === "switching" && (
            <div className="absolute inset-0 z-10 flex justify-center rounded-2xl bg-background/70 pt-32 backdrop-blur-sm">
              <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
            </div>
          )}
          <ReportHeader
            report={report}
            strategy={strategy}
            onStrategyChange={handleStrategyChange}
            onRetest={handleRetest}
            isRetesting={phase === "switching"}
          />
          <div className="space-y-8 py-8">
            <PerformanceOverview report={report} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <CoreWebVitals report={report} />
              </div>
              <FieldLabData report={report} />
            </div>

            <Opportunities opportunities={report.opportunities} />
            <Diagnostics diagnostics={report.diagnostics} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <SeoReport report={report} />
              <AccessibilityReport report={report} />
              <BestPracticesReport report={report} />
            </div>

            <ResourceBreakdown report={report} />
            <PerformanceTimeline timeline={report.timeline} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <LoadingAnalysis hostname="" />
        </div>
      }
    >
      <ResultsPageInner />
    </React.Suspense>
  );
}
