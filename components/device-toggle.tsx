"use client";

import { Monitor, Smartphone } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Strategy } from "@/lib/performance/types";

interface DeviceToggleProps {
  value: Strategy;
  onChange: (strategy: Strategy) => void;
  disabled?: boolean;
}

export function DeviceToggle({ value, onChange, disabled }: DeviceToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Device"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1"
    >
      {(
        [
          { value: "mobile" as const, label: "Mobile", icon: Smartphone },
          { value: "desktop" as const, label: "Desktop", icon: Monitor },
        ]
      ).map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          disabled={disabled}
          onClick={() => onChange(v)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
            value === v
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-3.5" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}
