"use client";

import React from "react";
import { useAirQuality } from "@/hooks/useAirQuality";
import { AirQualityHeader } from "@/components/AirQualityHeader";
import { AQIOverviewCard } from "@/components/AQIOverviewCard";
import { InversionAlertBanner } from "@/components/InversionAlertBanner";
import { HourlyTimeline } from "@/components/HourlyTimeline";
import { HouseholdProfileDrawer } from "@/components/HouseholdProfileDrawer";
import { ActionCardsSection } from "@/components/ActionCardsSection";
import { CommunityImpactSummary } from "@/components/CommunityImpactSummary";
import { AlertCircle, RefreshCw, Sparkles, Shield } from "lucide-react";

export default function Home() {
  const {
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
  } = useAirQuality();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Screen reader live region for background updates */}
      <div className="sr-only" role="status" aria-live="polite">
        {isLoadingAQ
          ? `Loading real-time air quality data for ${location.name}...`
          : currentAQ
          ? `Air quality updated for ${location.name}: AQI ${currentAQ.aqi}, ${currentAQ.aqiCategory}. ${
              currentAQ.inversionDetected ? "Thermal inversion detected." : ""
            }`
          : ""}
      </div>

      {/* Top Navigation & City Search */}
      <AirQualityHeader
        currentLocationName={location.name}
        onSelectLocation={updateLocation}
        onRefresh={refresh}
        isRefreshing={isLoadingAQ}
        lastUpdated={currentAQ?.updatedAt}
        inversionDetected={currentAQ?.inversionDetected}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notification */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={refresh}
              className="px-3 py-1 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors focus:ring-2 focus:ring-rose-500"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state for initial fetch */}
        {isLoadingAQ && !currentAQ ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4" role="status">
            <RefreshCw className="h-8 w-8 text-teal-600 animate-spin" aria-hidden="true" />
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
              onChange={updateProfile}
            />

            {/* 5. GenAI + Deterministic Action Engine (3 Pillars) */}
            <section className="pt-2" aria-labelledby="action-engine-title">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                  <h2 id="action-engine-title" className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
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
            </section>

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
              <Shield className="h-4 w-4 text-teal-600" aria-hidden="true" />
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
