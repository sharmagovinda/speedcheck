"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMs } from "@/lib/format";
import type { TimelineEvent } from "@/lib/performance/types";
import { cn } from "@/lib/utils";

interface PerformanceTimelineProps {
  timeline: TimelineEvent[];
}

export function PerformanceTimeline({ timeline }: PerformanceTimelineProps) {
  const [hovered, setHovered] = React.useState<string | null>(null);

  const totalMs = Math.max(...timeline.map((e) => e.startMs + e.durationMs)) * 1.08;
  const tickCount = 4;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((totalMs / tickCount) * i));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Performance Timeline</CardTitle>
        <p className="text-sm text-muted-foreground">
          How the page loads over time, from first request to largest paint.
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative pl-28">
          <div className="relative mb-2 flex h-5 border-b border-border pl-0 text-xs text-muted-foreground">
            {ticks.map((tick) => (
              <span
                key={tick}
                className="absolute -translate-x-1/2"
                style={{ left: `${(tick / totalMs) * 100}%` }}
              >
                {formatMs(tick)}
              </span>
            ))}
          </div>

          <div className="space-y-3">
            {timeline.map((event) => {
              const leftPct = (event.startMs / totalMs) * 100;
              const widthPct = Math.max((event.durationMs / totalMs) * 100, 1.2);
              const isHovered = hovered === event.label;
              return (
                <div key={event.label} className="relative flex h-6 items-center">
                  <span className="absolute -left-28 w-24 shrink-0 truncate text-sm font-medium text-muted-foreground">
                    {event.label}
                  </span>
                  <div className="relative h-full w-full">
                    {ticks.map((tick) => (
                      <span
                        key={tick}
                        className="absolute top-0 h-full w-px bg-border"
                        style={{ left: `${(tick / totalMs) * 100}%` }}
                        aria-hidden="true"
                      />
                    ))}
                    <div
                      role="img"
                      aria-label={`${event.label}: ${formatMs(event.durationMs)}`}
                      tabIndex={0}
                      onMouseEnter={() => setHovered(event.label)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(event.label)}
                      onBlur={() => setHovered(null)}
                      className={cn(
                        "absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-blue-500 outline-none transition-[filter] dark:bg-blue-400",
                        isHovered && "brightness-110 ring-2 ring-blue-500/40",
                      )}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    />
                    {isHovered && (
                      <div
                        className="absolute -top-9 z-10 rounded-md border border-border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-md"
                        style={{ left: `${leftPct}%` }}
                      >
                        {formatMs(event.durationMs)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
