"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { UrlChecker } from "@/components/url-checker";
import { cn } from "@/lib/utils";

interface AnalyzeFormProps {
  size?: "default" | "lg";
  className?: string;
}

export function AnalyzeForm({ size = "lg", className }: AnalyzeFormProps) {
  const router = useRouter();
  const [navigating, setNavigating] = React.useState(false);

  const handleSubmit = (url: string) => {
    setNavigating(true);
    router.push(`/results?url=${encodeURIComponent(url)}&strategy=mobile`);
  };

  return (
    <UrlChecker
      size={size}
      isLoading={navigating}
      onSubmit={handleSubmit}
      className={cn(className)}
    />
  );
}
