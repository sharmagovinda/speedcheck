import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatMetricValue, statusLabel } from "@/lib/format";
import type { MetricRating } from "@/lib/performance/types";

const STATUS_STYLES = {
  pass: { text: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle2 },
  warn: { text: "text-amber-600 dark:text-amber-400", icon: AlertTriangle },
  fail: { text: "text-red-600 dark:text-red-400", icon: XCircle },
} as const;

interface MetricCardProps {
  metric: MetricRating;
  className?: string;
}

export function MetricCard({ metric, className }: MetricCardProps) {
  const style = STATUS_STYLES[metric.status];
  const Icon = style.icon;

  return (
    <Card className={cn("gap-3 py-5", className)}>
      <CardContent className="space-y-2 px-5">
        <p className="text-sm font-semibold text-muted-foreground" title={metric.fullName}>
          {metric.label}
        </p>
        <p className="text-3xl font-bold tabular-nums">
          {formatMetricValue(metric.value, metric.unit)}
        </p>
        <div className={cn("flex items-center gap-1.5 text-sm font-medium", style.text)}>
          <Icon className="size-4" aria-hidden="true" />
          <span>{statusLabel(metric.status)}</span>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">{metric.fullName}: {metric.description}</p>
      </CardContent>
    </Card>
  );
}
