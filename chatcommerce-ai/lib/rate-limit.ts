type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const limits = new Map<string, RateLimitEntry>();

/**
 * Simple in-memory rate limiter
 * @param key - Unique identifier (IP, user ID, etc.)
 * @param limit - Max requests allowed (default: 10)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns true if request allowed, false if rate limit exceeded
 */
export function rateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const entry = limits.get(key);

  // No entry or window expired: create new entry
  if (!entry || now > entry.resetAt) {
    limits.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  // Rate limit exceeded
  if (entry.count >= limit) {
    return false;
  }

  // Increment count
  entry.count++;
  return true;
}

/**
 * Clear all rate limit entries (useful for testing)
 */
export function clearRateLimits(): void {
  limits.clear();
  console.log("[RateLimit] Cleared");
}
