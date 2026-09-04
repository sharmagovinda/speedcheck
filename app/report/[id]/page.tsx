"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Monitor, Smartphone } from "lucide-react";

import { AccessibilityReport } from "@/components/accessibility-report";
import { BestPracticesReport } from "@/components/best-practices-report";
import { CoreWebVitals } from "@/components/core-web-vitals";
import { Diagnostics } from "@/components/diagnostics";
import { EmptyState } from "@/components/empty-state";
import { FieldLabData } from "@/components/field-lab-data";
import { Opportunities } from "@/components/opportunities";
import { PerformanceOverview } from "@/components/performance-overview";
import { PerformanceTimeline } from "@/components/performance-timeline";
import { ResourceBreakdown } from "@/components/resource-breakdown";
import { ResultsSkeleton } from "@/components/results-skeleton";
import { SeoReport } from "@/components/seo-report";
import { ShareReportDialog } from "@/components/share-report-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchAnalysis } from "@/lib/api/analyze-client";
import { formatRelativeTime } from "@/lib/format";
import type { PerformanceReport } from "@/lib/performance/types";
import { getShareTarget } from "@/lib/storage/share-store";

type Phase = "loading" | "not-found" | "error" | "ready";

export default function SharedReportPage() {
  const params = useParams<{ id: string }>();
  const [phase, setPhase] = React.useState<Phase>("loading");
  const [report, setReport] = React.useState<PerformanceReport | null>(null);

  React.useEffect(() => {
    const target = getShareTarget(params.id);
    if (!target) {
      // Intentional: look up the shared-report target on mount/id change.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("not-found");
      return;
    }
    fetchAnalysis(target.url, target.strategy)
      .then((r) => {
        setReport(r);
        setPhase("ready");
      })
      .catch(() => setPhase("error"));
  }, [params.id]);

  if (phase === "loading") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ResultsSkeleton />
      </div>
    );
  }

  if (phase === "not-found" || phase === "error") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <EmptyState
          title="Report not found"
          description="This shared report link isn't available in this browser. Shared links are currently only accessible on the device that created them."
          action={
            <Button render={<Link href="/check" />} nativeButton={false}>
              Analyze a website
            </Button>
          }
        />
      </div>
    );
  }

  if (!report) return null;

  const DeviceIcon = report.strategy === "mobile" ? Smartphone : Monitor;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Shared report</Badge>
            <Badge variant="outline" className="gap-1">
              <DeviceIcon className="size-3" aria-hidden="true" />
              {report.strategy === "mobile" ? "Mobile" : "Desktop"}
            </Badge>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{report.hostname}</h1>
          <p className="text-sm text-muted-foreground">{formatRelativeTime(report.fetchedAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            render={<Link href={`/results?url=${encodeURIComponent(report.url)}&strategy=${report.strategy}`} />}
            nativeButton={false}
          >
            Run New Analysis
          </Button>
          <ShareReportDialog report={report} />
        </div>
      </div>

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
  );
}
