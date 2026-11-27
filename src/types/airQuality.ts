import { z } from "zod";

// --- Geolocation ---
export interface GeoLocation {
  id?: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  countryCode?: string;
  timezone?: string;
}

export const GeoLocationSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  admin1: z.string().optional(),
  countryCode: z.string().optional(),
  timezone: z.string().optional(),
});

// --- Hourly & Real-Time Air Quality ---
export type SafetyLevel = "safe" | "moderate" | "hazardous";

export interface HourlyAirQuality {
  time: string;
  pm25: number;
  pm10: number;
  aqi: number;
  temperature: number;
  windSpeed: number; // m/s
  boundaryLayerHeight: number; // meters
  isTrappingWindow: boolean;
  safetyLevel: SafetyLevel;
}

export const HourlyAirQualitySchema = z.object({
  time: z.string(),
  pm25: z.number(),
  pm10: z.number(),
  aqi: z.number(),
  temperature: z.number(),
  windSpeed: z.number(),
  boundaryLayerHeight: z.number(),
  isTrappingWindow: z.boolean(),
  safetyLevel: z.enum(["safe", "moderate", "hazardous"]),
});

export type AQICategory =
  | "Good"
  | "Moderate"
  | "Unhealthy for Sensitive Groups"
  | "Unhealthy"
  | "Very Unhealthy"
  | "Hazardous";

export interface CurrentAirQuality {
  aqi: number;
  pm25: number;
  pm10: number;
  co: number;
  no2: number;
  so2: number;
  ozone: number;
  temperature: number;
  relativeHumidity: number;
  windSpeed: number; // m/s
  windDirection: number; // degrees
  surfacePressure: number; // hPa
  boundaryLayerHeight: number; // meters
  inversionDetected: boolean;
  inversionSeverity: "none" | "moderate" | "severe";
  inversionReason?: string;
  dominantPollutant: string;
  aqiCategory: AQICategory;
  aqiColor: string;
  updatedAt: string;
}

export const CurrentAirQualitySchema = z.object({
  aqi: z.number(),
  pm25: z.number(),
  pm10: z.number(),
  co: z.number(),
  no2: z.number(),
  so2: z.number(),
  ozone: z.number(),
  temperature: z.number(),
  relativeHumidity: z.number(),
  windSpeed: z.number(),
  windDirection: z.number(),
  surfacePressure: z.number(),
  boundaryLayerHeight: z.number(),
  inversionDetected: z.boolean(),
  inversionSeverity: z.enum(["none", "moderate", "severe"]),
  inversionReason: z.string().optional(),
  dominantPollutant: z.string(),
  aqiCategory: z.enum([
    "Good",
    "Moderate",
    "Unhealthy for Sensitive Groups",
    "Unhealthy",
    "Very Unhealthy",
    "Hazardous",
  ]),
  aqiColor: z.string(),
  updatedAt: z.string(),
});

// --- Household Profiling ---
export type VulnerabilityType =
  | "children"
  | "elderly"
  | "asthma_respiratory"
  | "cardiovascular"
  | "pregnant";

export type CommuteMode =
  | "walk_cycle"
  | "two_wheeler_open"
  | "public_transit"
  | "car_windows_shut"
  | "work_from_home";

export type HeatingFuel =
  | "electric_heatpump"
  | "lpg_piped_gas"
  | "biomass_wood_coal"
  | "kerosene"
  | "district_central";

export type CookingFuel =
  | "electric_induction"
  | "lpg_piped_gas"
  | "biomass_wood_coal"
  | "kerosene";

export type HomePurifierSetup =
  | "none"
  | "diy_corsirosenthal"
  | "single_hepa"
  | "whole_home_hepa";

export type VentilationHabit =
  | "windows_open_always"
  | "morning_airing"
  | "timed_windows"
  | "sealed_ac_purifier";

export interface HouseholdProfile {
  vulnerabilities: VulnerabilityType[];
  commuteMode: CommuteMode;
  heatingFuel: HeatingFuel;
  cookingFuel: CookingFuel;
  homePurifierSetup: HomePurifierSetup;
  ventilationHabit: VentilationHabit;
  roomSizeM2?: number;
  commuteDistanceKm?: number;
}

export const HouseholdProfileSchema = z.object({
  vulnerabilities: z.array(
    z.enum([
      "children",
      "elderly",
      "asthma_respiratory",
      "cardiovascular",
      "pregnant",
    ])
  ),
  commuteMode: z.enum([
    "walk_cycle",
    "two_wheeler_open",
    "public_transit",
    "car_windows_shut",
    "work_from_home",
  ]),
  heatingFuel: z.enum([
    "electric_heatpump",
    "lpg_piped_gas",
    "biomass_wood_coal",
    "kerosene",
    "district_central",
  ]),
  cookingFuel: z.enum([
    "electric_induction",
    "lpg_piped_gas",
    "biomass_wood_coal",
    "kerosene",
  ]),
  homePurifierSetup: z.enum([
    "none",
    "diy_corsirosenthal",
    "single_hepa",
    "whole_home_hepa",
  ]),
  ventilationHabit: z.enum([
    "windows_open_always",
    "morning_airing",
    "timed_windows",
    "sealed_ac_purifier",
  ]),
  roomSizeM2: z.number().optional().default(30),
  commuteDistanceKm: z.number().optional().default(12),
});

// --- Action Engine & Direct Impact Metrics ---
export type PillarType =
  | "daily_routines"
  | "indoor_air_quality"
  | "community_alternatives";

export interface ImpactMetrics {
  exposureReductionPercent: number; // 0-100%
  doseSavedUgPerDay: number; // ug PM2.5 prevented from entering respiratory tract
  co2SavedKgPerWeek: number; // kg CO2 avoided
  pm25EmissionsAvoidedKgPerWeek: number; // kg direct PM2.5 aerosol avoided
  baselineExposureDescription: string;
  mitigatedExposureDescription: string;
  calculationFormula: string;
  breakdownVariables: Record<string, string | number>;
}

export const ImpactMetricsSchema = z.object({
  exposureReductionPercent: z.number(),
  doseSavedUgPerDay: z.number(),
  co2SavedKgPerWeek: z.number(),
  pm25EmissionsAvoidedKgPerWeek: z.number(),
  baselineExposureDescription: z.string(),
  mitigatedExposureDescription: z.string(),
  calculationFormula: z.string(),
  breakdownVariables: z.record(z.string(), z.union([z.string(), z.number()])),
});

export interface RecommendationItem {
  id: string;
  pillar: PillarType;
  title: string;
  summary: string;
  actionSteps: string[];
  priority: "critical" | "high" | "medium";
  timingWindow: string;
  impact: ImpactMetrics;
  evidenceWhy: string;
}

export const RecommendationItemSchema = z.object({
  id: z.string(),
  pillar: z.enum(["daily_routines", "indoor_air_quality", "community_alternatives"]),
  title: z.string(),
  summary: z.string(),
  actionSteps: z.array(z.string()),
  priority: z.enum(["critical", "high", "medium"]),
  timingWindow: z.string(),
  impact: ImpactMetricsSchema,
  evidenceWhy: z.string(),
});

export interface CommunityAggregatedImpact {
  totalDoseSavedUgPerDay: number;
  totalCo2SavedKgPerWeek: number;
  totalPm25EmissionsAvoidedKgPerWeek: number;
  communityScaling1000Households: {
    co2SavedTonsPerYear: number;
    pm25AvoidedKgPerYear: number;
  };
}

export interface RecommendationsResponse {
  generatedAt: string;
  source: "genai" | "deterministic_rules";
  summary: string;
  safeOutdoorWindowDescription: string;
  inversionGuidance: string;
  recommendations: RecommendationItem[];
  aggregatedImpact: CommunityAggregatedImpact;
}

export const RecommendationsRequestSchema = z.object({
  profile: HouseholdProfileSchema,
  currentAQ: CurrentAirQualitySchema,
  hourly: z.array(HourlyAirQualitySchema),
  locationName: z.string().optional().default("Current Location"),
});

// --- Global Air Quality News ---
export type NewsCategory = "AQI" | "Pollution" | "Health" | "Policy";

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: string;
  category: NewsCategory;
}

export const NewsArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string().url(),
  imageUrl: z.string().nullable(),
  source: z.string(),
  publishedAt: z.string(),
  category: z.enum(["AQI", "Pollution", "Health", "Policy"]),
});

export interface NewsResponse {
  articles: NewsArticle[];
  source: "gnews" | "newsapi" | "rss_fallback";
  fetchedAt: string;
}

export const NewsResponseSchema = z.object({
  articles: z.array(NewsArticleSchema),
  source: z.enum(["gnews", "newsapi", "rss_fallback"]),
  fetchedAt: z.string(),
});
