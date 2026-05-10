/**
 * Lightweight in-memory rate limiter for AI-heavy API routes.
 * Uses a token-bucket approach keyed by user token.
 *
 * For single-instance deployments (dev / single-server prod).
 * In production with multiple Next.js instances, replace with
 * a Redis-backed limiter (e.g. Upstash Redis).
 */

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

const DEFAULT_RATE = 10;   // requests per window
const DEFAULT_WINDOW = 60; // seconds

function refillBucket(bucket: Bucket, rate: number, windowSecs: number): void {
  const now = Date.now();
  const elapsed = (now - bucket.lastRefill) / 1000;
  const refill = (elapsed / windowSecs) * rate;
  bucket.tokens = Math.min(rate, bucket.tokens + refill);
  bucket.lastRefill = now;
}

/**
 * Check if a request under `token` is within rate limits.
 * Returns { allowed: true } or { allowed: false, retryAfter: seconds }.
 */
export function checkRateLimit(
  token: string,
  rate: number = DEFAULT_RATE,
  windowSecs: number = DEFAULT_WINDOW
): { allowed: boolean; retryAfter?: number } {
  let bucket = buckets.get(token);
  if (!bucket) {
    bucket = { tokens: rate, lastRefill: Date.now() };
    buckets.set(token, bucket);
  }

  refillBucket(bucket, rate, windowSecs);

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true };
  }

  // Seconds until one token refills
  const retryAfter = Math.ceil((1 - bucket.tokens) * (windowSecs / rate));
  return { allowed: false, retryAfter };
}

/**
 * For simulation endpoints — stricter limits since they call AI twice per request.
 * 5 simulation sessions per minute per user.
 */
export const SIMULATION_RATE_LIMIT = 5;
export const SIMULATION_RATE_WINDOW = 60;

// Rate limits for AI refinement endpoints
export const EVALUATION_RATE_LIMIT = 10;
export const EVALUATION_RATE_WINDOW = 60;
