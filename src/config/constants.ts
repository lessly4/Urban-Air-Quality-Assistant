import { GeoLocation, HouseholdProfile } from "@/types/airQuality";

export const DEFAULT_LOCATION: GeoLocation = {
  name: "Delhi",
  country: "India",
  latitude: 28.65195,
  longitude: 77.23149,
  admin1: "Delhi",
  timezone: "Asia/Kolkata",
  countryCode: "IN",
};

export const DEFAULT_PROFILE: HouseholdProfile = {
  vulnerabilities: ["children", "asthma_respiratory"],
  commuteMode: "two_wheeler_open",
  heatingFuel: "biomass_wood_coal",
  cookingFuel: "lpg_piped_gas",
  homePurifierSetup: "none",
  ventilationHabit: "morning_airing",
  commuteDistanceKm: 12,
  roomSizeM2: 30,
};

export const PRESET_CITIES: GeoLocation[] = [
  {
    name: "Delhi",
    country: "India",
    latitude: 28.65195,
    longitude: 77.23149,
    timezone: "Asia/Kolkata",
    countryCode: "IN",
  },
  {
    name: "Lahore",
    country: "Pakistan",
    latitude: 31.558,
    longitude: 74.3507,
    timezone: "Asia/Karachi",
    countryCode: "PK",
  },
  {
    name: "Beijing",
    country: "China",
    latitude: 39.9075,
    longitude: 116.3972,
    timezone: "Asia/Shanghai",
    countryCode: "CN",
  },
  {
    name: "Salt Lake City",
    country: "United States",
    latitude: 40.7608,
    longitude: -111.891,
    timezone: "America/Denver",
    countryCode: "US",
  },
  {
    name: "London",
    country: "United Kingdom",
    latitude: 51.5085,
    longitude: -0.1257,
    timezone: "Europe/London",
    countryCode: "GB",
  },
];

export const CACHE_CONFIG = {
  clientMemoryTtlMs: 2 * 60 * 1000, // 2 minutes client-side memory cache
  serverGeocodeRevalidateSec: 3600, // 1 hour server cache
  serverAirQualityRevalidateSec: 300, // 5 minutes server cache
};
