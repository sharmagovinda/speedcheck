import { AuditCheckList } from "@/components/audit-check-list";
import type { PerformanceReport } from "@/lib/performance/types";

export function BestPracticesReport({ report }: { report: PerformanceReport }) {
  return (
    <AuditCheckList
      id="best-practices"
      title="Best Practices"
      description="Modern web development standards and security practices."
      score={report.bestPractices}
      checks={report.bestPracticesChecks}
    />
  );
}
