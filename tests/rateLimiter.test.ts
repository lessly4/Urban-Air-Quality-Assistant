import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { SlidingWindowRateLimiter, getClientIp } from "../src/utils/rateLimiter";

describe("SlidingWindowRateLimiter", () => {
  let limiter: SlidingWindowRateLimiter;

  beforeEach(() => {
    limiter = new SlidingWindowRateLimiter({
      windowMs: 1000, // 1 second window for fast tests
      maxRequests: 3,
    });
  });

  it("allows requests under the quota", () => {
    const res1 = limiter.check("ip-1");
    assert.equal(res1.success, true);
    assert.equal(res1.remaining, 2);

    const res2 = limiter.check("ip-1");
    assert.equal(res2.success, true);
    assert.equal(res2.remaining, 1);

    const res3 = limiter.check("ip-1");
    assert.equal(res3.success, true);
    assert.equal(res3.remaining, 0);
  });

  it("blocks requests that exceed the quota", () => {
    limiter.check("ip-2");
    limiter.check("ip-2");
    limiter.check("ip-2");

    const blocked = limiter.check("ip-2");
    assert.equal(blocked.success, false);
    assert.equal(blocked.remaining, 0);
    assert.ok(blocked.resetInMs > 0);
  });

  it("isolates quotas across different client IPs", () => {
    limiter.check("ip-a");
    limiter.check("ip-a");
    limiter.check("ip-a");
    assert.equal(limiter.check("ip-a").success, false);

    // ip-b should still have its full quota
    const resB = limiter.check("ip-b");
    assert.equal(resB.success, true);
    assert.equal(resB.remaining, 2);
  });

  it("resets client quota properly", () => {
    limiter.check("ip-reset");
    limiter.check("ip-reset");
    limiter.check("ip-reset");
    assert.equal(limiter.check("ip-reset").success, false);

    limiter.reset("ip-reset");
    const fresh = limiter.check("ip-reset");
    assert.equal(fresh.success, true);
    assert.equal(fresh.remaining, 2);
  });
});

describe("getClientIp", () => {
  it("extracts from x-forwarded-for header", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.195, 70.41.3.18",
    });
    assert.equal(getClientIp(headers), "203.0.113.195");
  });

  it("extracts from x-real-ip header", () => {
    const headers = new Headers({
      "x-real-ip": "198.51.100.22",
    });
    assert.equal(getClientIp(headers), "198.51.100.22");
  });

  it("defaults to localhost when no proxy headers exist", () => {
    const headers = new Headers();
    assert.equal(getClientIp(headers), "127.0.0.1");
  });
});
