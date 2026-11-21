"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  GeoLocation,
  CurrentAirQuality,
  HourlyAirQuality,
  HouseholdProfile,
  RecommendationsResponse,
} from "@/types/airQuality";
import { DEFAULT_LOCATION, DEFAULT_PROFILE, CACHE_CONFIG } from "@/config/constants";

interface CachedAirData {
  current: CurrentAirQuality;
  hourly: HourlyAirQuality[];
  recommendations: RecommendationsResponse | null;
  timestamp: number;
}

export function useAirQuality(
  initialLocation: GeoLocation = DEFAULT_LOCATION,
  initialProfile: HouseholdProfile = DEFAULT_PROFILE
) {
  const [location, setLocation] = useState<GeoLocation>(initialLocation);
  const [profile, setProfile] = useState<HouseholdProfile>(initialProfile);
  const [currentAQ, setCurrentAQ] = useState<CurrentAirQuality | null>(null);
  const [hourly, setHourly] = useState<HourlyAirQuality[]>([]);
  const [recommendationsData, setRecommendationsData] =
    useState<RecommendationsResponse | null>(null);

  const [isLoadingAQ, setIsLoadingAQ] = useState<boolean>(true);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // In-memory client-side cache and in-flight request deduplication
  const cacheRef = useRef<Map<string, CachedAirData>>(new Map());
  const inFlightRef = useRef<Map<string, Promise<unknown>>>(new Map());

  const getCacheKey = (loc: GeoLocation, prof: HouseholdProfile) => {
    return `${loc.latitude.toFixed(4)}_${loc.longitude.toFixed(4)}_${prof.commuteMode}_${prof.cookingFuel}_${prof.heatingFuel}_${prof.homePurifierSetup}_${prof.vulnerabilities.sort().join(",")}`;
  };

  const fetchRecommendationsInternal = useCallback(
    async (
      locName: string,
      aq: CurrentAirQuality,
      hourlyList: HourlyAirQuality[],
      prof: HouseholdProfile
    ) => {
      setIsLoadingRecs(true);
      try {
        const res = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locationName: locName,
            currentAQ: aq,
            hourly: hourlyList,
            profile: prof,
          }),
        });

        if (!res.ok) {
          throw new Error(`Recommendations failed with status: ${res.status}`);
        }

        const data: RecommendationsResponse = await res.json();
        setRecommendationsData(data);
        return data;
      } catch (err) {
        console.error("Recommendations error:", err);
        return null;
      } finally {
        setIsLoadingRecs(false);
      }
    },
    []
  );

  const loadData = useCallback(
    async (loc: GeoLocation, prof: HouseholdProfile, bypassCache: boolean = false) => {
      const cacheKey = getCacheKey(loc, prof);
      const now = Date.now();

      if (!bypassCache) {
        const cached = cacheRef.current.get(cacheKey);
        if (cached && now - cached.timestamp < CACHE_CONFIG.clientMemoryTtlMs) {
          setCurrentAQ(cached.current);
          setHourly(cached.hourly);
          setRecommendationsData(cached.recommendations);
          setIsLoadingAQ(false);
          setIsLoadingRecs(false);
          setErrorMessage(null);
          return;
        }
      }

      // In-flight deduplication
      if (inFlightRef.current.has(cacheKey)) {
        return inFlightRef.current.get(cacheKey);
      }

      setIsLoadingAQ(true);
      setErrorMessage(null);

      const requestPromise = (async () => {
        try {
          const res = await fetch(
            `/api/air-quality?lat=${loc.latitude}&lon=${loc.longitude}&timezone=${encodeURIComponent(
              loc.timezone || "auto"
            )}`
          );

          if (!res.ok) {
            throw new Error(`Failed to fetch air quality data (status ${res.status})`);
          }

          const data = await res.json();
          setCurrentAQ(data.current);
          setHourly(data.hourly || []);

          const recData = await fetchRecommendationsInternal(
            loc.name,
            data.current,
            data.hourly || [],
            prof
          );

          // Store in memory cache
          cacheRef.current.set(cacheKey, {
            current: data.current,
            hourly: data.hourly || [],
            recommendations: recData,
            timestamp: Date.now(),
          });
        } catch (err: unknown) {
          console.error("Failed to load air quality:", err);
          setErrorMessage(
            err instanceof Error
              ? err.message
              : "Failed to connect to Open-Meteo meteorological API."
          );
        } finally {
          setIsLoadingAQ(false);
          inFlightRef.current.delete(cacheKey);
        }
      })();

      inFlightRef.current.set(cacheKey, requestPromise);
      return requestPromise;
    },
    [fetchRecommendationsInternal]
  );

  useEffect(() => {
    let isCancelled = false;

    loadData(location, profile).catch((err) => {
      if (!isCancelled) {
        console.error("Initial load error:", err);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [location, profile, loadData]);

  const refresh = useCallback(() => {
    return loadData(location, profile, true);
  }, [location, profile, loadData]);

  const updateLocation = useCallback((newLoc: GeoLocation) => {
    setLocation(newLoc);
  }, []);

  const updateProfile = useCallback((newProfile: HouseholdProfile) => {
    setProfile(newProfile);
  }, []);

  return {
    location,
    profile,
    currentAQ,
    hourly,
    recommendationsData,
    isLoadingAQ,
    isLoadingRecs,
    errorMessage,
    refresh,
    updateLocation,
    updateProfile,
  };
}
