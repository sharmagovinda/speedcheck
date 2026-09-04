"use client";

import Link from "next/link";
import { Monitor, RotateCw, Smartphone, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import { scoreCategory } from "@/lib/performance/types";
import type { ReportSummary } from "@/lib/storage/report-history";
import { cn } from "@/lib/utils";

const CATEGORY_TEXT = {
  excellent: "text-emerald-600 dark:text-emerald-400",
  "needs-improvement": "text-amber-600 dark:text-amber-400",
  poor: "text-red-600 dark:text-red-400",
} as const;

function ScorePill({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold tabular-nums", CATEGORY_TEXT[scoreCategory(score)])}>
        {score}
      </span>
    </div>
  );
}

interface ReportHistoryProps {
  reports: ReportSummary[];
  onDelete: (id: string) => void;
  onRerun: (summary: ReportSummary) => void;
}

export function ReportHistory({ reports, onDelete, onRerun }: ReportHistoryProps) {
  return (
    <div className="space-y-3">
      {reports.map((report) => {
        const DeviceIcon = report.strategy === "mobile" ? Smartphone : Monitor;
        return (
          <Card key={report.id}>
            <CardContent className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/results?url=${encodeURIComponent(report.url)}&strategy=${report.strategy}`}
                    className="truncate font-semibold hover:underline"
                  >
                    {report.hostname}
                  </Link>
                  <Badge variant="outline" className="gap-1 text-xs font-normal">
                    <DeviceIcon className="size-3" aria-hidden="true" />
                    {report.strategy === "mobile" ? "Mobile" : "Desktop"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(report.fetchedAt)}</p>
                <div className="mt-2 flex flex-wrap gap-4">
                  <ScorePill label="Performance" score={report.performance} />
                  <ScorePill label="Accessibility" score={report.accessibility} />
                  <ScorePill label="Best Practices" score={report.bestPractices} />
                  <ScorePill label="SEO" score={report.seo} />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/results?url=${encodeURIComponent(report.url)}&strategy=${report.strategy}`} />}
                  nativeButton={false}
                >
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={() => onRerun(report)}>
                  <RotateCw className="size-3.5" aria-hidden="true" />
                  Retest
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete report for ${report.hostname}`}
                  onClick={() => onDelete(report.id)}
                >
                  <Trash2 className="size-4 text-muted-foreground" aria-hidden="true" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
