/**
 * Minimal in-memory sliding-window rate limiter for the `/api/analyze`
 * route. This resets whenever the server process restarts and does
 * not share state across multiple instances.
 *
 * TODO in production: back this with a shared store (Redis / Upstash)
 * keyed by IP or API key so limits hold across serverless instances
 * and deployments, and consider a token-bucket algorithm for burst
 * tolerance.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, retryAfterSeconds: 0 };
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - bucket.windowStart)) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - bucket.count,
    retryAfterSeconds: 0,
  };
}
