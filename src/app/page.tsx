"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GeoLocation,
  CurrentAirQuality,
  HourlyAirQuality,
  HouseholdProfile,
  RecommendationsResponse,
} from "@/types/airQuality";
import { AirQualityHeader } from "@/components/AirQualityHeader";
import { AQIOverviewCard } from "@/components/AQIOverviewCard";
import { InversionAlertBanner } from "@/components/InversionAlertBanner";
import { HourlyTimeline } from "@/components/HourlyTimeline";
import { HouseholdProfileDrawer } from "@/components/HouseholdProfileDrawer";
import { ActionCardsSection } from "@/components/ActionCardsSection";
import { CommunityImpactSummary } from "@/components/CommunityImpactSummary";
import { AlertCircle, RefreshCw, Sparkles, Shield } from "lucide-react";

const DEFAULT_LOCATION: GeoLocation = {
  name: "Delhi",
  country: "India",
  latitude: 28.65195,
  longitude: 77.23149,
  admin1: "Delhi",
  timezone: "Asia/Kolkata",
  countryCode: "IN",
};

const DEFAULT_PROFILE: HouseholdProfile = {
  vulnerabilities: ["children", "asthma_respiratory"],
  commuteMode: "two_wheeler_open",
  heatingFuel: "biomass_wood_coal",
  cookingFuel: "lpg_piped_gas",
  homePurifierSetup: "none",
  ventilationHabit: "morning_airing",
  commuteDistanceKm: 12,
  roomSizeM2: 30,
};

export default function Home() {
  const [location, setLocation] = useState<GeoLocation>(DEFAULT_LOCATION);
  const [currentAQ, setCurrentAQ] = useState<CurrentAirQuality | null>(null);
  const [hourly, setHourly] = useState<HourlyAirQuality[]>([]);
  const [profile, setProfile] = useState<HouseholdProfile>(DEFAULT_PROFILE);
  const [recommendationsData, setRecommendationsData] =
    useState<RecommendationsResponse | null>(null);

  const [isLoadingAQ, setIsLoadingAQ] = useState<boolean>(true);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch GenAI + Deterministic Recommendations
  const fetchRecommendations = useCallback(
    async (
      locName: string,
      aq: CurrentAirQuality,
      hourlyList: HourlyAirQuality[],
      currentProf: HouseholdProfile
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
            profile: currentProf,
          }),
        });

        if (!res.ok) {
          throw new Error(`Recommendations failed with status: ${res.status}`);
        }

        const data: RecommendationsResponse = await res.json();
        setRecommendationsData(data);
      } catch (err) {
        console.error("Recommendations error:", err);
      } finally {
        setIsLoadingRecs(false);
      }
    },
    []
  );

  // 2. Fetch Air Quality & Weather
  const loadAirQuality = useCallback(
    async (loc: GeoLocation, currentProf: HouseholdProfile) => {
      setIsLoadingAQ(true);
      setErrorMessage(null);

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

        await fetchRecommendations(loc.name, data.current, data.hourly || [], currentProf);
      } catch (err: unknown) {
        console.error("Failed to load air quality:", err);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Failed to connect to Open-Meteo meteorological API."
        );
      } finally {
        setIsLoadingAQ(false);
      }
    },
    [fetchRecommendations]
  );

  // Synchronize on location or profile mount/change
  useEffect(() => {
    let isCancelled = false;

    async function initialLoad() {
      try {
        const res = await fetch(
          `/api/air-quality?lat=${location.latitude}&lon=${location.longitude}&timezone=${encodeURIComponent(
            location.timezone || "auto"
          )}`
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch air quality data (status ${res.status})`);
        }

        const data = await res.json();
        if (isCancelled) return;

        setCurrentAQ(data.current);
        setHourly(data.hourly || []);

        const recRes = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locationName: location.name,
            currentAQ: data.current,
            hourly: data.hourly || [],
            profile,
          }),
        });

        if (recRes.ok && !isCancelled) {
          const recData = await recRes.json();
          setRecommendationsData(recData);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setErrorMessage(
            err instanceof Error
              ? err.message
              : "Failed to connect to Open-Meteo meteorological API."
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingAQ(false);
        }
      }
    }

    initialLoad();

    return () => {
      isCancelled = true;
    };
  }, [location, profile]);

  // Handle location selection
  const handleSelectLocation = (newLoc: GeoLocation) => {
    setLocation(newLoc);
  };

  // Handle profile change
  const handleProfileChange = (updated: HouseholdProfile) => {
    setProfile(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Top Navigation & City Search */}
      <AirQualityHeader
        currentLocationName={location.name}
        onSelectLocation={handleSelectLocation}
        onRefresh={() => loadAirQuality(location, profile)}
        isRefreshing={isLoadingAQ}
        lastUpdated={currentAQ?.updatedAt}
        inversionDetected={currentAQ?.inversionDetected}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => loadAirQuality(location, profile)}
              className="px-3 py-1 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state for initial fetch */}
        {isLoadingAQ && !currentAQ ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="h-8 w-8 text-teal-600 animate-spin" />
            <p className="text-sm font-medium text-slate-500">
              Retrieving live atmospheric boundary layer & AQI data from Open-Meteo...
            </p>
          </div>
        ) : (
          <>
            {/* 1. Thermal Inversion Alert (if present) */}
            {currentAQ && <InversionAlertBanner currentAQ={currentAQ} />}

            {/* 2. AQI & Meteorology Overview */}
            {currentAQ && (
              <AQIOverviewCard
                currentAQ={currentAQ}
                locationName={`${location.name}, ${location.country}`}
              />
            )}

            {/* 3. 24-Hour Smog & Safe Window Timeline */}
            <HourlyTimeline
              hourly={hourly}
              safeWindowDescription={recommendationsData?.safeOutdoorWindowDescription}
            />

            {/* 4. Interactive Household Profile Selector */}
            <HouseholdProfileDrawer
              profile={profile}
              onChange={handleProfileChange}
            />

            {/* 5. GenAI + Deterministic Action Engine (3 Pillars) */}
            <div className="pt-2">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                    Tailored Action Engine
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Prioritized guidance across daily routines, indoor air quality, and clean community alternatives
                </p>
              </div>

              {recommendationsData?.summary && (
                <div className="mb-5 p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold text-teal-900 dark:text-teal-200 block mb-1">
                    Scenario Synthesis:
                  </span>
                  {recommendationsData.summary}
                </div>
              )}

              <ActionCardsSection
                recommendations={recommendationsData?.recommendations || []}
                isLoading={isLoadingRecs}
                source={recommendationsData?.source}
              />
            </div>

            {/* 6. Community Impact Scaling Card */}
            {recommendationsData?.aggregatedImpact && (
              <CommunityImpactSummary
                aggregated={recommendationsData.aggregatedImpact}
                locationName={location.name}
              />
            )}
          </>
        )}
      </main>

      {/* Footer with Scientific Attribution & Medical Disclaimer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-teal-600" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Urban Air Quality Assistant
              </span>
              <span>• Production-Ready MVP</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Weather & AQ Data: <strong>Open-Meteo Public API</strong> (Keyless)</span>
              <span>Guideline Reference: <strong>WHO 2021 Global Air Quality</strong></span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
            <strong>Disclaimer:</strong> This application provides decision support heuristics based on EPA and IPCC exposure factors. It does not replace individualized clinical advice. High-risk patients with severe COPD or asthma should consult their primary physician during hazardous smog events.
          </p>
        </div>
      </footer>
    </div>
  );
}
