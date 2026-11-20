import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchAirQualityAndWeather } from "@/services/openMeteo";

const AirQualityQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  timezone: z.string().optional().default("auto"),
});

export async function GET(request: NextRequest) {
  try {
    const rawLat = request.nextUrl.searchParams.get("lat");
    const rawLon = request.nextUrl.searchParams.get("lon");
    const timezone = request.nextUrl.searchParams.get("timezone") || "auto";

    const validation = AirQualityQuerySchema.safeParse({
      lat: rawLat,
      lon: rawLon,
      timezone,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid coordinates", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { lat, lon, timezone: tz } = validation.data;
    const data = await fetchAirQualityAndWeather(lat, lon, tz);

    return NextResponse.json(data);
  } catch (error: unknown) {
    const err = error as { digest?: string; name?: string };
    if (err?.digest === "NEXT_PRERENDER_INTERRUPTED" || err?.name === "DynamicServerError") {
      throw error;
    }
    console.error("Air Quality API route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch air quality data from Open-Meteo" },
      { status: 500 }
    );
  }
}
