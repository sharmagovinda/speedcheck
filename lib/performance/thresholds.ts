import type { CheckStatus, MetricKey } from "./types";

/**
 * Shared Core Web Vitals thresholds. Lives outside the mock analyzer
 * so UI components can classify field/lab data values (`pass` /
 * `warn` / `fail`) without importing mock-data internals — this stays
 * valid once a real analyzer is plugged in.
 */
export const METRIC_THRESHOLDS: Record<MetricKey, { good: number; warn: number }> = {
  lcp: { good: 2.5, warn: 4 },
  inp: { good: 200, warn: 500 },
  cls: { good: 0.1, warn: 0.25 },
  fcp: { good: 1.8, warn: 3 },
  ttfb: { good: 800, warn: 1800 },
  speedIndex: { good: 3.4, warn: 5.8 },
};

export function metricStatus(key: MetricKey, value: number): CheckStatus {
  const t = METRIC_THRESHOLDS[key];
  if (value <= t.good) return "pass";
  if (value <= t.warn) return "warn";
  return "fail";
}
