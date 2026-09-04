import { AuditCheckList } from "@/components/audit-check-list";
import type { PerformanceReport } from "@/lib/performance/types";

export function SeoReport({ report }: { report: PerformanceReport }) {
  return (
    <AuditCheckList
      id="seo"
      title="SEO"
      description="How well your page is optimized for search engine ranking."
      score={report.seo}
      checks={report.seoChecks}
    />
  );
}
