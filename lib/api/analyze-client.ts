import type { PerformanceReport, Strategy } from "@/lib/performance/types";

export type AnalyzeErrorCode =
  | "INVALID_URL"
  | "UNSAFE_URL"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "ANALYSIS_FAILED"
  | "NETWORK_ERROR";

export class AnalyzeClientError extends Error {
  code: AnalyzeErrorCode;
  constructor(code: AnalyzeErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "AnalyzeClientError";
  }
}

/** User-facing copy per error state — mirrors the product spec's error states. */
export function analyzeErrorMessage(code: AnalyzeErrorCode): string {
  switch (code) {
    case "INVALID_URL":
      return "Please enter a valid website URL.";
    case "UNSAFE_URL":
      // Deliberately reuses the "unreachable" copy rather than surfacing SSRF
      // internals to the client.
      return "We couldn't reach this website. Please verify the URL and try again.";
    case "RATE_LIMITED":
      return "You've reached the analysis limit. Please try again later.";
    case "TIMEOUT":
    case "ANALYSIS_FAILED":
    case "NETWORK_ERROR":
    default:
      return "Something went wrong while analyzing this website.";
  }
}

export async function fetchAnalysis(url: string, strategy: Strategy): Promise<PerformanceReport> {
  let response: Response;
  try {
    response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, strategy }),
    });
  } catch {
    throw new AnalyzeClientError("NETWORK_ERROR", analyzeErrorMessage("NETWORK_ERROR"));
  }

  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    const code: AnalyzeErrorCode = json?.error?.code ?? "ANALYSIS_FAILED";
    throw new AnalyzeClientError(code, analyzeErrorMessage(code));
  }

  return json.report as PerformanceReport;
}
