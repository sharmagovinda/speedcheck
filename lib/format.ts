export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export function formatSeconds(seconds: number): string {
  return `${seconds.toFixed(1)} s`;
}

export function formatMetricValue(value: number, unit: "s" | "ms" | ""): string {
  if (unit === "s") return `${value.toFixed(1)} s`;
  if (unit === "ms") return `${Math.round(value)} ms`;
  return value.toFixed(2);
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (diffMinutes < 1) return "Tested just now";
  if (diffMinutes < 60) return `Tested ${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Tested ${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "Tested yesterday";
  if (diffDays < 7) return `Tested ${diffDays} days ago`;

  return `Tested on ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export function statusLabel(status: "pass" | "warn" | "fail"): string {
  if (status === "pass") return "Good";
  if (status === "warn") return "Needs Improvement";
  return "Poor";
}

export function scoreLabel(category: "excellent" | "needs-improvement" | "poor"): string {
  if (category === "excellent") return "Excellent";
  if (category === "needs-improvement") return "Needs Improvement";
  return "Poor";
}
