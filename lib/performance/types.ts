/**
 * Core domain types for the SpeedCheck performance/SEO analyzer.
 *
 * The UI depends only on these interfaces, never on the mock data
 * generator directly. Swapping `mock-analyzer.ts` for a real
 * PageSpeed Insights / Lighthouse / WebPageTest integration only
 * requires implementing `PerformanceAnalyzer` in `analyzer.ts` —
 * no component or page needs to change.
 */

export type Strategy = "mobile" | "desktop";

export type ScoreCategory = "excellent" | "needs-improvement" | "poor";

export type CheckStatus = "pass" | "warn" | "fail";

export type Severity = "high" | "medium" | "low";

export type MetricKey = "lcp" | "inp" | "cls" | "fcp" | "ttfb" | "speedIndex";

export interface CoreWebVitals {
  lcp: number; // seconds
  inp: number; // milliseconds
  cls: number; // unitless layout shift score
  fcp: number; // seconds
  ttfb: number; // milliseconds
  speedIndex: number; // seconds
}

export interface MetricRating {
  key: MetricKey;
  label: string;
  fullName: string;
  value: number;
  unit: "s" | "ms" | "";
  status: CheckStatus;
  description: string;
}

export interface FieldDataMetrics {
  available: boolean;
  lcp: number;
  inp: number;
  cls: number;
}

export interface LabDataMetrics {
  lcp: number;
  fcp: number;
  speedIndex: number;
  ttfb: number;
  tbt: number;
}

export interface OpportunityResourceImpact {
  name: string;
  type: ResourceEntry["type"];
  bytes: number;
  /** Estimated bytes saved by fixing this specific resource, if applicable. */
  savingsBytes?: number;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  savingsMs: number;
  severity: Severity;
  /** Root cause explanation — why this issue is happening on this page. */
  whyItHappens: string;
  /** Concrete, ordered steps to resolve the issue. */
  howToFix: string[];
  /** The specific resources on this page contributing to the issue. */
  affectedResources: OpportunityResourceImpact[];
}

export interface Diagnostic {
  id: string;
  title: string;
  status: CheckStatus;
  description: string;
  details: string;
}

export interface AuditCheck {
  id: string;
  title: string;
  status: CheckStatus;
  description: string;
  recommendation?: string;
}

export type ResourceCategory =
  | "HTML"
  | "CSS"
  | "JavaScript"
  | "Images"
  | "Fonts"
  | "Other";

export interface ResourceCategoryBreakdown {
  category: ResourceCategory;
  bytes: number;
}

export interface ResourceEntry {
  name: string;
  type: "JS" | "CSS" | "Image" | "Font" | "HTML" | "Other";
  bytes: number;
}

export interface TimelineEvent {
  label: string;
  startMs: number;
  durationMs: number;
}

export interface PerformanceReport {
  id: string;
  url: string;
  hostname: string;
  strategy: Strategy;
  fetchedAt: string;

  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;

  coreWebVitals: CoreWebVitals;
  metrics: Record<MetricKey, MetricRating>;

  fieldData: FieldDataMetrics;
  labData: LabDataMetrics;

  opportunities: Opportunity[];
  diagnostics: Diagnostic[];

  seoChecks: AuditCheck[];
  accessibilityChecks: AuditCheck[];
  bestPracticesChecks: AuditCheck[];

  resources: ResourceEntry[];
  resourceBreakdown: ResourceCategoryBreakdown[];
  totalPageWeightBytes: number;

  timeline: TimelineEvent[];
}

export interface AnalyzeOptions {
  url: string;
  strategy: Strategy;
}

/**
 * Implemented today by `mock-analyzer.ts`. A real integration
 * (PageSpeed Insights API, self-hosted Lighthouse, WebPageTest, or a
 * custom crawler) implements the same interface and is swapped in
 * inside `analyzer.ts` — the rest of the app is unaffected.
 */
export interface PerformanceAnalyzer {
  analyze(options: AnalyzeOptions): Promise<PerformanceReport>;
}

export function scoreCategory(score: number): ScoreCategory {
  if (score >= 90) return "excellent";
  if (score >= 50) return "needs-improvement";
  return "poor";
}
