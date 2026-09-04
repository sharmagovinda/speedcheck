import { assertSafeAnalysisUrl } from "@/lib/security/url-guard";
import { mockAnalyzer } from "./mock-analyzer";
import type { AnalyzeOptions, PerformanceAnalyzer, PerformanceReport } from "./types";

/**
 * Single swap point for the analysis backend. Everything above this
 * module (API routes, server components) calls `analyzeUrl` and only
 * depends on the `PerformanceReport` interface.
 *
 * To connect a real backend, implement `PerformanceAnalyzer` (see
 * `types.ts`) against the Google PageSpeed Insights API, a
 * self-hosted Lighthouse runner, WebPageTest, or a custom crawler,
 * and change the single line below:
 *
 *   const analyzer: PerformanceAnalyzer = mockAnalyzer;
 *   →
 *   const analyzer: PerformanceAnalyzer = pageSpeedInsightsAnalyzer;
 *
 * No component, page, or API route needs to change.
 */
const analyzer: PerformanceAnalyzer = mockAnalyzer;

const ANALYSIS_TIMEOUT_MS = 15_000;

class AnalysisTimeoutError extends Error {
  constructor() {
    super("The analysis took too long to complete.");
    this.name = "AnalysisTimeoutError";
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new AnalysisTimeoutError()), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function analyzeUrl({ url, strategy }: AnalyzeOptions): Promise<PerformanceReport> {
  // SSRF guard runs before any (future) outbound request is made.
  // See lib/security/url-guard.ts for what this checks today and the
  // additional protections to add once a real fetcher is connected.
  assertSafeAnalysisUrl(url);

  return withTimeout(analyzer.analyze({ url, strategy }), ANALYSIS_TIMEOUT_MS);
}

export { AnalysisTimeoutError };
