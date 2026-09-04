import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreRing } from "@/components/score-ring";
import type { PerformanceReport } from "@/lib/performance/types";

interface PerformanceOverviewProps {
  report: PerformanceReport;
}

export function PerformanceOverview({ report }: PerformanceOverviewProps) {
  const scores = [
    { label: "Performance", score: report.performance },
    { label: "Accessibility", score: report.accessibility },
    { label: "Best Practices", score: report.bestPractices },
    { label: "SEO", score: report.seo },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {scores.map(({ label, score }) => (
            <div key={label} className="flex justify-center">
              <ScoreRing score={score} label={label} size={140} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
