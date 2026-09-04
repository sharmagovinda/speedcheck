import { AlertTriangle, CheckCircle2, FlaskConical, Users, XCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMetricValue, statusLabel } from "@/lib/format";
import type { PerformanceReport } from "@/lib/performance/types";
import { metricStatus } from "@/lib/performance/thresholds";
import { cn } from "@/lib/utils";

const STATUS_ICON = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
} as const;

const STATUS_TEXT = {
  pass: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  fail: "text-red-600 dark:text-red-400",
} as const;

function DataRow({
  label,
  value,
  unit,
  statusKey,
}: {
  label: string;
  value: number;
  unit: "s" | "ms" | "";
  statusKey: "lcp" | "inp" | "cls" | "fcp" | "ttfb" | "speedIndex";
}) {
  const status = metricStatus(statusKey, value);
  const Icon = STATUS_ICON[status];
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-4">
        <span className="tabular-nums font-semibold">{formatMetricValue(value, unit)}</span>
        <span className={cn("flex items-center gap-1 text-xs font-medium", STATUS_TEXT[status])}>
          <Icon className="size-3.5" aria-hidden="true" />
          {statusLabel(status)}
        </span>
      </div>
    </div>
  );
}

interface FieldLabDataProps {
  report: PerformanceReport;
}

export function FieldLabData({ report }: FieldLabDataProps) {
  return (
    <Card>
      <CardContent className="px-5 pt-1">
        <Tabs defaultValue="field">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="field" className="gap-1.5">
              <Users className="size-3.5" aria-hidden="true" />
              Field Data
            </TabsTrigger>
            <TabsTrigger value="lab" className="gap-1.5">
              <FlaskConical className="size-3.5" aria-hidden="true" />
              Lab Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="field" className="pt-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Field data reflects real visitors&apos; experience on this page over the last 28
              days, collected from the Chrome User Experience Report.
            </p>
            {report.fieldData.available ? (
              <div>
                <DataRow label="LCP" value={report.fieldData.lcp} unit="s" statusKey="lcp" />
                <DataRow label="INP" value={report.fieldData.inp} unit="ms" statusKey="inp" />
                <DataRow label="CLS" value={report.fieldData.cls} unit="" statusKey="cls" />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border py-8 text-center">
                <p className="text-sm font-medium">Insufficient field data</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This site doesn&apos;t have enough real-user traffic yet to populate field
                  data. Lab data is still available below.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="lab" className="pt-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Lab data is collected in a controlled, simulated Lighthouse-style environment and
              is useful for debugging performance issues.
            </p>
            <div>
              <DataRow label="LCP" value={report.labData.lcp} unit="s" statusKey="lcp" />
              <DataRow label="FCP" value={report.labData.fcp} unit="s" statusKey="fcp" />
              <DataRow
                label="Speed Index"
                value={report.labData.speedIndex}
                unit="s"
                statusKey="speedIndex"
              />
              <DataRow label="TTFB" value={report.labData.ttfb} unit="ms" statusKey="ttfb" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
