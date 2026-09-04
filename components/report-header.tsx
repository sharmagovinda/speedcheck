"use client";

import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeviceToggle } from "@/components/device-toggle";
import { ShareReportDialog } from "@/components/share-report-dialog";
import { formatRelativeTime } from "@/lib/format";
import type { PerformanceReport, Strategy } from "@/lib/performance/types";

interface ReportHeaderProps {
  report: PerformanceReport;
  strategy: Strategy;
  onStrategyChange: (strategy: Strategy) => void;
  onRetest: () => void;
  isRetesting?: boolean;
}

export function ReportHeader({
  report,
  strategy,
  onStrategyChange,
  onRetest,
  isRetesting,
}: ReportHeaderProps) {
  return (
    <div className="flex flex-col gap-6 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Performance Report</h1>
        <p className="mt-1 text-lg font-medium">{report.hostname}</p>
        <p className="text-sm text-muted-foreground">{formatRelativeTime(report.fetchedAt)}</p>
      </div>

      <div className="flex flex-col items-start gap-3 sm:items-end">
        <DeviceToggle value={strategy} onChange={onStrategyChange} disabled={isRetesting} />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onRetest} disabled={isRetesting}>
            <RotateCw className={isRetesting ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
            Retest
          </Button>
          <ShareReportDialog report={report} />
        </div>
      </div>
    </div>
  );
}
