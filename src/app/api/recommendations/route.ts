import { NextRequest, NextResponse } from "next/server";
import { RecommendationsRequestSchema } from "@/types/airQuality";
import { generateRecommendations } from "@/services/aiService";
import { recommendationsRateLimiter, getClientIp } from "@/utils/rateLimiter";

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request.headers);
  const rateLimit = recommendationsRateLimiter.check(clientIp);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many recommendation requests. Please slow down.", retryAfter: Math.ceil(rateLimit.resetInMs / 1000) },
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
    const body = await request.json();

    const validation = RecommendationsRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { profile, currentAQ, hourly, locationName } = validation.data;
    const recommendations = await generateRecommendations(
      profile,
      currentAQ,
      hourly,
      locationName
    );

    return NextResponse.json(recommendations, {
      headers: {
        "X-RateLimit-Limit": rateLimit.limit.toString(),
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      },
    });
  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
