import { MetricCard } from "@/components/metric-card";
import type { PerformanceReport } from "@/lib/performance/types";

interface CoreWebVitalsProps {
  report: PerformanceReport;
}

const ORDER = ["lcp", "inp", "cls", "fcp", "ttfb", "speedIndex"] as const;

export function CoreWebVitals({ report }: CoreWebVitalsProps) {
  return (
    <section aria-labelledby="core-web-vitals-heading">
      <div className="mb-4">
        <h2 id="core-web-vitals-heading" className="text-xl font-semibold tracking-tight">
          Core Web Vitals
        </h2>
        <p className="text-sm text-muted-foreground">
          The metrics Google uses to measure real-world user experience.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ORDER.map((key) => (
          <MetricCard key={key} metric={report.metrics[key]} />
        ))}
      </div>
    </section>
  );
}
