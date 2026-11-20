import {
  GeoLocation,
  CurrentAirQuality,
  HourlyAirQuality,
  AQICategory,
  SafetyLevel,
} from "../types/airQuality";

export async function searchCities(query: string): Promise<GeoLocation[]> {
  if (!query || query.trim().length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query.trim()
  )}&count=6&language=en&format=json`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache geocode lookups for 1 hr
    });

    if (!res.ok) {
      throw new Error(`Geocoding failed with status: ${res.status}`);
    }

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    interface OpenMeteoGeoResult {
      id?: number;
      name: string;
      country?: string;
      latitude: number;
      longitude: number;
      admin1?: string;
      country_code?: string;
      timezone?: string;
    }

    return (data.results as OpenMeteoGeoResult[]).map((item) => ({
      id: item.id,
      name: item.name,
      country: item.country || "",
      latitude: item.latitude,
      longitude: item.longitude,
      admin1: item.admin1 || "",
      countryCode: item.country_code || "",
      timezone: item.timezone || "auto",
    }));
  } catch (error) {
    console.error("Open-Meteo geocoding error:", error);
    return [];
  }
}

export function classifyAQI(aqiValue: number): { category: AQICategory; color: string } {
  if (aqiValue <= 50) return { category: "Good", color: "#10b981" };
  if (aqiValue <= 100) return { category: "Moderate", color: "#eab308" };
  if (aqiValue <= 150)
    return { category: "Unhealthy for Sensitive Groups", color: "#f97316" };
  if (aqiValue <= 200) return { category: "Unhealthy", color: "#ef4444" };
  if (aqiValue <= 300) return { category: "Very Unhealthy", color: "#a855f7" };
  return { category: "Hazardous", color: "#7f1d1d" };
}

export function detectInversion(
  pm25: number,
  windSpeed: number, // m/s
  boundaryLayerHeight: number // meters
): {
  inversionDetected: boolean;
  severity: "none" | "moderate" | "severe";
  reason?: string;
} {
  // Classic winter thermal inversion: stagnant wind (< 2.2 m/s), compressed boundary layer ceiling (< 450m), high PM2.5 (> 55 ug/m3)
  const isStagnant = windSpeed < 2.5;
  const isCompressedCeiling = boundaryLayerHeight > 0 && boundaryLayerHeight < 450;
  const isHighPM = pm25 > 55;

  if (isHighPM && isStagnant && isCompressedCeiling) {
    return {
      inversionDetected: true,
      severity: pm25 > 150 ? "severe" : "moderate",
      reason: `Thermal inversion trapping: Low boundary layer (${Math.round(
        boundaryLayerHeight
      )}m ceiling) and near-zero surface wind (${windSpeed.toFixed(
        1
      )} m/s) are preventing vertical dispersion of particulate matter.`,
    };
  }

  if (isHighPM && isStagnant) {
    return {
      inversionDetected: true,
      severity: "moderate",
      reason: `Stagnant air blanket: Light wind speed (${windSpeed.toFixed(
        1
      )} m/s) with calm surface conditions is trapping local emissions at ground level.`,
    };
  }

  return {
    inversionDetected: false,
    severity: "none",
  };
}

export async function fetchAirQualityAndWeather(
  latitude: number,
  longitude: number,
  timezone: string = "auto"
): Promise<{
  current: CurrentAirQuality;
  hourly: HourlyAirQuality[];
}> {
  const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=pm2_5,pm10,us_aqi&forecast_days=2&timezone=${encodeURIComponent(
    timezone
  )}`;

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,boundary_layer_height&forecast_days=2&timezone=${encodeURIComponent(
    timezone
  )}`;

  try {
    const [aqRes, weatherRes] = await Promise.all([
      fetch(aqUrl, { next: { revalidate: 300 } }),
      fetch(weatherUrl, { next: { revalidate: 300 } }),
    ]);

    if (!aqRes.ok || !weatherRes.ok) {
      throw new Error(
        `Open-Meteo fetch error: AQ=${aqRes.status}, Weather=${weatherRes.status}`
      );
    }

    const aqData = await aqRes.json();
    const weatherData = await weatherRes.json();

    const aqCurrent = aqData.current || {};
    const weatherCurrent = weatherData.current || {};

    const rawAqi = aqCurrent.us_aqi ?? 50;
    const pm25 = aqCurrent.pm2_5 ?? 25;
    const pm10 = aqCurrent.pm10 ?? 45;
    const co = aqCurrent.carbon_monoxide ?? 200;
    const no2 = aqCurrent.nitrogen_dioxide ?? 15;
    const so2 = aqCurrent.sulphur_dioxide ?? 5;
    const ozone = aqCurrent.ozone ?? 30;

    const temperature = weatherCurrent.temperature_2m ?? 18;
    const relativeHumidity = weatherCurrent.relative_humidity_2m ?? 55;
    // Open-Meteo returns km/h by default unless wind_speed_unit=ms; let's convert km/h to m/s
    const windSpeedRaw = weatherCurrent.wind_speed_10m ?? 8;
    const windSpeed = Math.round((windSpeedRaw / 3.6) * 10) / 10; // km/h -> m/s
    const windDirection = weatherCurrent.wind_direction_10m ?? 0;
    const surfacePressure = weatherCurrent.surface_pressure ?? 1013;

    // Hourly boundary layer height current estimation
    const weatherHourly = weatherData.hourly || {};
    const blhList = weatherHourly.boundary_layer_height || [];
    const currentBLH = blhList.length > 0 ? blhList[0] || 600 : 600;

    const { inversionDetected, severity: inversionSeverity, reason: inversionReason } =
      detectInversion(pm25, windSpeed, currentBLH);

    const { category: aqiCategory, color: aqiColor } = classifyAQI(rawAqi);

    const current: CurrentAirQuality = {
      aqi: rawAqi,
      pm25,
      pm10,
      co,
      no2,
      so2,
      ozone,
      temperature,
      relativeHumidity,
      windSpeed,
      windDirection,
      surfacePressure,
      boundaryLayerHeight: Math.round(currentBLH),
      inversionDetected,
      inversionSeverity,
      inversionReason,
      dominantPollutant: pm25 > pm10 ? "PM2.5" : "PM10",
      aqiCategory,
      aqiColor,
      updatedAt: aqCurrent.time || new Date().toISOString(),
    };

    // Combine hourly data for next 24-36 hours
    const aqHourly = aqData.hourly || {};
    const times = aqHourly.time || [];
    const pm25List = aqHourly.pm2_5 || [];
    const pm10List = aqHourly.pm10 || [];
    const aqiList = aqHourly.us_aqi || [];

    const tempHourlyList = weatherHourly.temperature_2m || [];
    const windHourlyList = weatherHourly.wind_speed_10m || [];

    const hourly: HourlyAirQuality[] = [];
    const limit = Math.min(times.length, 36);

    for (let i = 0; i < limit; i++) {
      const hPM25 = pm25List[i] ?? 25;
      const hPM10 = pm10List[i] ?? 40;
      const hAQI = aqiList[i] ?? 50;
      const hTemp = tempHourlyList[i] ?? 18;
      const hWindRaw = windHourlyList[i] ?? 8;
      const hWind = Math.round((hWindRaw / 3.6) * 10) / 10;
      const hBLH = blhList[i] ?? 600;

      const { inversionDetected: isTrap } = detectInversion(hPM25, hWind, hBLH);

      let safetyLevel: SafetyLevel = "moderate";
      if (hPM25 < 35 && hWind >= 2.0 && !isTrap) {
        safetyLevel = "safe";
      } else if (hPM25 > 75 || isTrap) {
        safetyLevel = "hazardous";
      }

      hourly.push({
        time: times[i],
        pm25: hPM25,
        pm10: hPM10,
        aqi: hAQI,
        temperature: hTemp,
        windSpeed: hWind,
        boundaryLayerHeight: Math.round(hBLH),
        isTrappingWindow: isTrap,
        safetyLevel,
      });
    }

    return { current, hourly };
  } catch (err) {
    console.error("Open-Meteo fetch failed:", err);
    throw err;
  }
}
