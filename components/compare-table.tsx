import { Trophy } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBytes } from "@/lib/format";
import type { PerformanceReport } from "@/lib/performance/types";
import { cn } from "@/lib/utils";

interface CompareRow {
  label: string;
  getValue: (report: PerformanceReport) => number;
  format: (value: number) => string;
  higherIsBetter: boolean;
}

const ROWS: CompareRow[] = [
  { label: "Performance", getValue: (r) => r.performance, format: (v) => `${v}`, higherIsBetter: true },
  { label: "Accessibility", getValue: (r) => r.accessibility, format: (v) => `${v}`, higherIsBetter: true },
  { label: "Best Practices", getValue: (r) => r.bestPractices, format: (v) => `${v}`, higherIsBetter: true },
  { label: "SEO", getValue: (r) => r.seo, format: (v) => `${v}`, higherIsBetter: true },
  {
    label: "LCP",
    getValue: (r) => r.coreWebVitals.lcp,
    format: (v) => `${v.toFixed(1)}s`,
    higherIsBetter: false,
  },
  {
    label: "INP",
    getValue: (r) => r.coreWebVitals.inp,
    format: (v) => `${Math.round(v)}ms`,
    higherIsBetter: false,
  },
  {
    label: "CLS",
    getValue: (r) => r.coreWebVitals.cls,
    format: (v) => v.toFixed(2),
    higherIsBetter: false,
  },
  {
    label: "Page Weight",
    getValue: (r) => r.totalPageWeightBytes,
    format: formatBytes,
    higherIsBetter: false,
  },
];

function Winner({ isWinner }: { isWinner: boolean }) {
  if (!isWinner) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
      <Trophy className="size-3.5" aria-hidden="true" />
      Better
    </span>
  );
}

interface CompareTableProps {
  reportA: PerformanceReport;
  reportB: PerformanceReport;
}

export function CompareTable({ reportA, reportB }: CompareTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">Metric</TableHead>
            <TableHead>{reportA.hostname}</TableHead>
            <TableHead>{reportB.hostname}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map((row) => {
            const valueA = row.getValue(reportA);
            const valueB = row.getValue(reportB);
            const aWins = row.higherIsBetter ? valueA > valueB : valueA < valueB;
            const bWins = row.higherIsBetter ? valueB > valueA : valueB < valueA;
            return (
              <TableRow key={row.label}>
                <TableCell className="font-medium text-muted-foreground">{row.label}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={cn("tabular-nums font-semibold", aWins && "text-emerald-600 dark:text-emerald-400")}>
                      {row.format(valueA)}
                    </span>
                    <Winner isWinner={aWins} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={cn("tabular-nums font-semibold", bWins && "text-emerald-600 dark:text-emerald-400")}>
                      {row.format(valueB)}
                    </span>
                    <Winner isWinner={bWins} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
