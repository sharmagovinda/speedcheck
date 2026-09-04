"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { scoreCategory, type ScoreCategory } from "@/lib/performance/types";
import { scoreLabel } from "@/lib/format";

const CATEGORY_STYLES: Record<
  ScoreCategory,
  { ring: string; text: string; icon: React.ComponentType<{ className?: string }> }
> = {
  excellent: {
    ring: "stroke-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  "needs-improvement": {
    ring: "stroke-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    icon: AlertTriangle,
  },
  poor: {
    ring: "stroke-red-500",
    text: "text-red-600 dark:text-red-400",
    icon: XCircle,
  },
};

interface ScoreRingProps {
  score: number;
  label: string;
  size?: number;
  className?: string;
}

export function ScoreRing({ score, label, size = 176, className }: ScoreRingProps) {
  const [displayScore, setDisplayScore] = React.useState(0);
  const category = scoreCategory(score);
  const style = CATEGORY_STYLES[category];
  const Icon = style.icon;

  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;

  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // Intentional: skip the count-up animation and jump straight to the
      // final value when the user prefers reduced motion.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayScore(score);
      return;
    }

    let frame: number;
    const duration = 1100;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const offset = circumference * (1 - displayScore / 100);

  return (
    <div
      className={cn("relative inline-flex flex-col items-center gap-3", className)}
      role="img"
      aria-label={`${label} score: ${score} out of 100, ${scoreLabel(category)}`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={10}
            fill="none"
            className="stroke-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn("transition-[stroke-dashoffset] duration-300 ease-out", style.ring)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums">{displayScore}</span>
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
      </div>
      <div className={cn("flex items-center gap-1.5 text-sm font-medium", style.text)}>
        <Icon className="size-4" aria-hidden="true" />
        <span>{scoreLabel(category)}</span>
      </div>
    </div>
  );
}
