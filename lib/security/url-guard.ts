/**
 * SSRF protections for URLs submitted by end users.
 *
 * The current analyzer never actually issues an outbound HTTP request
 * (see `lib/performance/mock-analyzer.ts`), so these checks are the
 * hostname/protocol-level guards that are safe to run without a
 * network round trip. They run today, on every request, so the
 * validation path is already exercised before a real fetcher is
 * plugged in.
 *
 * When a real analyzer (PageSpeed Insights, self-hosted Lighthouse,
 * WebPageTest, or a custom crawler) starts making outbound requests,
 * layer these additional protections on top — see the TODOs below.
 */

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeUrlError";
  }
}

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "0.0.0.0",
  "[::1]",
  "::1",
]);

// Cloud provider metadata endpoints — a classic SSRF target that
// would otherwise leak credentials/tokens if fetched server-side.
const METADATA_HOSTNAMES = new Set([
  "169.254.169.254", // AWS / GCP / Azure IMDS
  "metadata.google.internal",
  "metadata.azure.com",
]);

function isIpV4(hostname: string) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
}

function isPrivateOrReservedIpV4(hostname: string) {
  if (!isIpV4(hostname)) return false;
  const parts = hostname.split(".").map(Number);
  if (parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return true; // malformed -> reject
  const [a, b] = parts;

  if (a === 127) return true; // loopback
  if (a === 10) return true; // private
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 169 && b === 254) return true; // link-local (includes cloud metadata)
  if (a === 0) return true; // "this network"
  if (a >= 224) return true; // multicast / reserved
  return false;
}

function isLikelyPrivateIpV6(hostname: string) {
  const h = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return (
    h === "::1" || // loopback
    h.startsWith("fc") || // unique local fc00::/7
    h.startsWith("fd") ||
    h.startsWith("fe80") // link-local
  );
}

/**
 * Throws `UnsafeUrlError` if the URL should never be fetched by the
 * server. Safe to call on every analyze request — it is pure string
 * matching and never itself performs network I/O.
 */
export function assertSafeAnalysisUrl(rawUrl: string): void {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError("The provided value is not a valid URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new UnsafeUrlError("Only http and https URLs can be analyzed.");
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new UnsafeUrlError("Requests to localhost are not allowed.");
  }
  if (METADATA_HOSTNAMES.has(hostname)) {
    throw new UnsafeUrlError("Requests to cloud metadata endpoints are not allowed.");
  }
  if (hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new UnsafeUrlError("Requests to internal network hostnames are not allowed.");
  }
  if (isPrivateOrReservedIpV4(hostname)) {
    throw new UnsafeUrlError("Requests to private or reserved IP ranges are not allowed.");
  }
  if (isLikelyPrivateIpV6(hostname)) {
    throw new UnsafeUrlError("Requests to private or reserved IP ranges are not allowed.");
  }

  // --- TODO when connecting a real fetch-based analyzer -----------------
  // 1. Resolve `hostname` via DNS here and re-run the private-IP checks
  //    against the *resolved* address, not just the literal hostname,
  //    to prevent DNS-rebinding attacks (a public hostname that
  //    resolves to a private IP at fetch time).
  // 2. Disable automatic redirect following (`redirect: "manual"`) and
  //    re-validate every redirect target against this same guard
  //    before following it — otherwise a safe URL can 302 to an
  //    internal address.
  // 3. Set a hard request timeout (e.g. `AbortSignal.timeout(10_000)`).
  // 4. Cap the response size you read into memory (stream + abort once
  //    a byte budget, e.g. 10MB, is exceeded) so a malicious/huge
  //    response can't exhaust server memory.
  // 5. Rate limit by requester (see `lib/security/rate-limit.ts`) to
  //    stop the analyzer being used as an open network scanning proxy.
  // -----------------------------------------------------------------------
}
