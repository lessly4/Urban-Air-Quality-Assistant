/**
 * In-memory sliding-window rate limiter for API route protection.
 * Protects serverless and Node.js route handlers from traffic bursts and abuse.
 */

export interface RateLimitConfig {
  windowMs: number; // Duration of window in ms (e.g., 60,000 for 1 minute)
  maxRequests: number; // Max allowed requests per window
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInMs: number;
}

interface ClientRecord {
  timestamps: number[];
}

export class SlidingWindowRateLimiter {
  private clients = new Map<string, ClientRecord>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: RateLimitConfig) {
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;

    // Periodic cleanup of expired clients every 2 minutes
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 2 * 60 * 1000);
      if (this.cleanupInterval && typeof this.cleanupInterval.unref === "function") {
        this.cleanupInterval.unref();
      }
    }
  }

  public check(clientId: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let record = this.clients.get(clientId);
    if (!record) {
      record = { timestamps: [] };
      this.clients.set(clientId, record);
    }

    // Filter out timestamps outside current sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const resetInMs = Math.max(0, oldestInWindow + this.windowMs - now);
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        resetInMs,
      };
    }

    record.timestamps.push(now);
    const resetInMs = this.windowMs;

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - record.timestamps.length,
      resetInMs,
    };
  }

  public reset(clientId?: string): void {
    if (clientId) {
      this.clients.delete(clientId);
    } else {
      this.clients.clear();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [id, record] of this.clients.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);
      if (record.timestamps.length === 0) {
        this.clients.delete(id);
      }
    }
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clients.clear();
  }
}

// Pre-configured rate limiters for the API endpoints
export const geocodeRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60, // 60 requests per minute per IP
});

export const airQualityRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 40, // 40 requests per minute per IP
});

export const recommendationsRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 25, // 25 requests per minute per IP
});

export const newsRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20, // 20 requests per minute per IP
});

/**
 * Extracts client IP from standard Next.js request headers
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
