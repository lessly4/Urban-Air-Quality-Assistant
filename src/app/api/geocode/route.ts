import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchCities } from "@/services/openMeteo";

const GeocodeQuerySchema = z.object({
  q: z.string().min(2, "Search query must be at least 2 characters"),
});

export async function GET(request: NextRequest) {
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
    return NextResponse.json({ results });
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
