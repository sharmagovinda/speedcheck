"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBytes } from "@/lib/format";
import type { PerformanceReport, ResourceCategory } from "@/lib/performance/types";

const CATEGORY_COLOR_VAR: Record<ResourceCategory, string> = {
  HTML: "var(--series-html)",
  CSS: "var(--series-css)",
  JavaScript: "var(--series-js)",
  Images: "var(--series-images)",
  Fonts: "var(--series-fonts)",
  Other: "var(--series-other)",
};

const CATEGORY_SWATCH_CLASS: Record<ResourceCategory, string> = {
  HTML: "bg-series-html",
  CSS: "bg-series-css",
  JavaScript: "bg-series-js",
  Images: "bg-series-images",
  Fonts: "bg-series-fonts",
  Other: "bg-series-other",
};

interface ResourceBreakdownProps {
  report: PerformanceReport;
}

function ChartTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: Array<{ payload: { category: ResourceCategory; bytes: number } }>;
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const { category, bytes } = payload[0].payload;
  const percent = ((bytes / total) * 100).toFixed(1);
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-popover-foreground">{category}</p>
      <p className="text-muted-foreground">
        {formatBytes(bytes)} · {percent}%
      </p>
    </div>
  );
}

export function ResourceBreakdown({ report }: ResourceBreakdownProps) {
  const { resourceBreakdown, totalPageWeightBytes, resources } = report;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Resources</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total page weight: <span className="font-semibold text-foreground">{formatBytes(totalPageWeightBytes)}</span>
        </p>
      </CardHeader>
      <CardContent className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="h-56 w-56 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resourceBreakdown}
                  dataKey="bytes"
                  nameKey="category"
                  innerRadius={62}
                  outerRadius={100}
                  paddingAngle={2}
                  stroke="var(--card)"
                  strokeWidth={2}
                >
                  {resourceBreakdown.map((entry) => (
                    <Cell key={entry.category} fill={CATEGORY_COLOR_VAR[entry.category]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip total={totalPageWeightBytes} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="w-full space-y-2.5">
            {resourceBreakdown.map((entry) => (
              <li key={entry.category} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className={`size-2.5 shrink-0 rounded-full ${CATEGORY_SWATCH_CLASS[entry.category]}`}
                    aria-hidden="true"
                  />
                  <span className="font-medium">{entry.category}</span>
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatBytes(entry.bytes)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.name}>
                  <TableCell className="font-medium">{resource.name}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatBytes(resource.bytes)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {resource.type}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
