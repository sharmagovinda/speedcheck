"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Connecting to website", durationMs: 500 },
  { label: "Checking HTTPS", durationMs: 400 },
  { label: "Running performance test", durationMs: 900 },
  { label: "Checking Core Web Vitals", durationMs: 800 },
  { label: "Checking SEO", durationMs: 600 },
  { label: "Checking accessibility", durationMs: 600 },
  { label: "Generating report", durationMs: 500 },
] as const;

interface LoadingAnalysisProps {
  hostname: string;
  onDone?: () => void;
}

export function LoadingAnalysis({ hostname, onDone }: LoadingAnalysisProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const onDoneRef = React.useRef(onDone);
  React.useEffect(() => {
    onDoneRef.current = onDone;
  });

  React.useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;

    STEPS.forEach((step, index) => {
      elapsed += step.durationMs;
      timers.push(
        setTimeout(() => {
          setActiveIndex(index + 1);
          if (index === STEPS.length - 1) {
            setTimeout(() => onDoneRef.current?.(), 250);
          }
        }, elapsed),
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const progressPercent = (activeIndex / STEPS.length) * 100;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center" role="status">
      <div className="relative mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
        <Loader2 className="size-7 animate-spin text-primary" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">
        Analyzing <span className="text-primary">{hostname}</span>
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This usually takes just a few seconds.
      </p>

      <Progress value={progressPercent} className="mt-6 h-1.5 w-full" />

      <ul className="mt-8 w-full space-y-3 text-left" aria-live="polite">
        {STEPS.map((step, index) => {
          const isDone = index < activeIndex;
          const isActive = index === activeIndex;
          return (
            <li
              key={step.label}
              className={cn(
                "flex items-center gap-3 text-sm transition-colors duration-300",
                isDone && "text-foreground",
                isActive && "font-medium text-foreground",
                !isDone && !isActive && "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  isDone && "border-emerald-500 bg-emerald-500 text-white",
                  isActive && "border-primary",
                  !isDone && !isActive && "border-border",
                )}
              >
                {isDone && <Check className="size-3" aria-hidden="true" />}
                {isActive && (
                  <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden="true" />
                )}
              </span>
              {step.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
