import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchCities } from "@/services/openMeteo";
import { geocodeRateLimiter, getClientIp } from "@/utils/rateLimiter";

const GeocodeQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, "Search query must be at least 2 characters")
    .max(100, "Search query is too long"),
});

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request.headers);
  const rateLimit = geocodeRateLimiter.check(clientIp);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down.", retryAfter: Math.ceil(rateLimit.resetInMs / 1000) },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(rateLimit.resetInMs / 1000).toString(),
          "X-RateLimit-Limit": rateLimit.limit.toString(),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const q = request.nextUrl.searchParams.get("q");

    const validation = GeocodeQuerySchema.safeParse({ q });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameter", details: validation.error.format() },
        { status: 400 }
      );
    }

    const results = await searchCities(validation.data.q);
    return NextResponse.json(
      { results },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
          "X-RateLimit-Limit": rateLimit.limit.toString(),
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error: unknown) {
    const err = error as { digest?: string; name?: string };
    if (err?.digest === "NEXT_PRERENDER_INTERRUPTED" || err?.name === "DynamicServerError") {
      throw error;
    }
    console.error("Geocode API error:", error);
    return NextResponse.json(
      { error: "Failed to resolve city coordinates" },
      { status: 500 }
    );
  }
}
