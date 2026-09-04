import { AuditCheckList } from "@/components/audit-check-list";
import type { PerformanceReport } from "@/lib/performance/types";

export function AccessibilityReport({ report }: { report: PerformanceReport }) {
  return (
    <AuditCheckList
      id="accessibility"
      title="Accessibility"
      description="How usable your page is for people with disabilities."
      score={report.accessibility}
      checks={report.accessibilityChecks}
    />
  );
}
