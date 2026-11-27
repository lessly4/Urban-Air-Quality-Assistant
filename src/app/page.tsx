"use client";

import React, { useState } from "react";
import { useAirQuality } from "@/hooks/useAirQuality";
import { AirQualityHeader } from "@/components/AirQualityHeader";
import { AQIOverviewCard } from "@/components/AQIOverviewCard";
import { InversionAlertBanner } from "@/components/InversionAlertBanner";
import { HourlyTimeline } from "@/components/HourlyTimeline";
import { HouseholdProfileDrawer } from "@/components/HouseholdProfileDrawer";
import { ActionCardsSection } from "@/components/ActionCardsSection";
import { CommunityImpactSummary } from "@/components/CommunityImpactSummary";
import { AirQualityNewsSection } from "@/components/AirQualityNewsSection";
import {
  AlertCircle,
  RefreshCw,
  Sparkles,
  Shield,
  Activity,
  Calculator,
  Newspaper,
} from "lucide-react";

type DashboardView = "live_forecast" | "action_plan" | "community_math" | "global_news";

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

  const [activeView, setActiveView] = useState<DashboardView>("live_forecast");

  const views: { id: DashboardView; label: string; icon: React.ReactNode }[] = [
    {
      id: "live_forecast",
      label: "Live Air & Forecast",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      id: "action_plan",
      label: "Personalized Action Plan",
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      id: "community_math",
      label: "Community & Impact Math",
      icon: <Calculator className="h-4 w-4" />,
    },
    {
      id: "global_news",
      label: "Global Air News",
      icon: <Newspaper className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F1A16] bg-[radial-gradient(ellipse_at_top_left,rgba(47,74,63,0.32),transparent_55%)] text-[#DCE7DF] font-sans transition-colors flex flex-col">
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

      {/* Top Navigation & City Search (Pinned) */}
      <AirQualityHeader
        currentLocationName={location.name}
        onSelectLocation={updateLocation}
        onRefresh={refresh}
        isRefreshing={isLoadingAQ}
        lastUpdated={currentAQ?.updatedAt}
        inversionDetected={currentAQ?.inversionDetected}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notification */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-center justify-between gap-3 text-xs backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={refresh}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-500 transition-colors focus:ring-2 focus:ring-rose-400"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state for initial fetch */}
        {isLoadingAQ && !currentAQ ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-4" role="status">
            <RefreshCw className="h-8 w-8 text-[#94AE9F] animate-spin" aria-hidden="true" />
            <p className="text-sm font-medium text-[#94AE9F]">
              Retrieving live atmospheric boundary layer &amp; AQI data from Open-Meteo...
            </p>
          </div>
        ) : (
          <>
            {/* Pinned Thermal Inversion Alert (when active) */}
            {currentAQ && <InversionAlertBanner currentAQ={currentAQ} />}

            {/* Prominent Flat Segmentation Bar (Multi-View Switcher) */}
            <nav aria-label="Dashboard view switcher">
              <div
                role="tablist"
                aria-label="Dashboard views"
                className="flex flex-wrap items-center border-b border-[#2F4A3F]/80 bg-[#1C2E27]/40 backdrop-blur-md rounded-t-2xl px-2 sm:px-4"
              >
                {views.map((view) => {
                  const isActive = activeView === view.id;
                  return (
                    <button
                      key={view.id}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`tabpanel-${view.id}`}
                      onClick={() => setActiveView(view.id)}
                      className={`relative flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#94AE9F]/40 ${
                        isActive
                          ? "text-[#DCE7DF]"
                          : "text-[#557566] hover:text-[#94AE9F]"
                      }`}
                    >
                      {view.icon}
                      <span>{view.label}</span>
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#94AE9F] rounded-full shadow-[0_0_12px_rgba(148,174,159,0.85)]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* VIEW 1: Live Air & Forecast */}
            {activeView === "live_forecast" && (
              <section
                id="tabpanel-live_forecast"
                role="tabpanel"
                aria-label="Live Air and Forecast"
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn"
              >
                <div className="lg:col-span-5">
                  {currentAQ && (
                    <AQIOverviewCard
                      currentAQ={currentAQ}
                      locationName={`${location.name}, ${location.country}`}
                    />
                  )}
                </div>
                <div className="lg:col-span-7">
                  <HourlyTimeline
                    hourly={hourly}
                    safeWindowDescription={recommendationsData?.safeOutdoorWindowDescription}
                  />
                </div>
              </section>
            )}

            {/* VIEW 2: Personalized Action Plan */}
            {activeView === "action_plan" && (
              <section
                id="tabpanel-action_plan"
                role="tabpanel"
                aria-label="Personalized Action Plan"
                className="space-y-6 animate-fadeIn"
              >
                <HouseholdProfileDrawer
                  profile={profile}
                  onChange={updateProfile}
                />

                <div aria-labelledby="action-engine-title" className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#94AE9F]" aria-hidden="true" />
                      <h2 id="action-engine-title" className="text-xl font-bold text-[#DCE7DF] tracking-tight">
                        Tailored Action Engine
                      </h2>
                    </div>
                    <p className="text-xs text-[#94AE9F]/80 mt-0.5">
                      Prioritized guidance across daily routines, indoor air quality, and clean community alternatives
                    </p>
                  </div>

                  {recommendationsData?.summary && (
                    <div className="p-4 rounded-2xl bg-[#1C2E27]/60 backdrop-blur-md border border-[#2F4A3F]/80 text-xs text-[#94AE9F] leading-relaxed">
                      <span className="font-bold text-[#DCE7DF] block mb-1">
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
              </section>
            )}

            {/* VIEW 3: Community & Impact Math */}
            {activeView === "community_math" && (
              <section
                id="tabpanel-community_math"
                role="tabpanel"
                aria-label="Community and Impact Math"
                className="animate-fadeIn"
              >
                {recommendationsData?.aggregatedImpact ? (
                  <CommunityImpactSummary
                    aggregated={recommendationsData.aggregatedImpact}
                    locationName={location.name}
                    recommendations={recommendationsData.recommendations}
                  />
                ) : (
                  <div className="p-12 text-center rounded-2xl bg-[#1C2E27]/40 border border-[#2F4A3F]/60 text-xs text-[#94AE9F]">
                    Calculating community impact metrics...
                  </div>
                )}
              </section>
            )}

            {/* VIEW 4: Global & Local Air News */}
            {activeView === "global_news" && (
              <section
                id="tabpanel-global_news"
                role="tabpanel"
                aria-label="Local and Global Air Quality News"
                className="animate-fadeIn"
              >
                <AirQualityNewsSection
                  locationName={location.name}
                  countryName={location.country}
                />
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer with Scientific Attribution & Medical Disclaimer */}
      <footer className="mt-12 border-t border-[#2F4A3F]/60 bg-[#0F1A16]/80 backdrop-blur-md py-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-[#557566] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#94AE9F]" aria-hidden="true" />
              <span className="font-semibold text-[#DCE7DF]">
                Urban Air Quality Assistant
              </span>
              <span>• Deep Forest Edition</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#94AE9F]/80">
              <span>Weather &amp; AQ Data: <strong className="text-[#DCE7DF]">Open-Meteo Public API</strong></span>
              <span>Guideline Reference: <strong className="text-[#DCE7DF]">WHO 2021 Global Air Quality</strong></span>
            </div>
          </div>
          <p className="text-[11px] text-[#557566] leading-relaxed">
            <strong className="text-[#94AE9F]">Disclaimer:</strong> This application provides decision support heuristics based on EPA and IPCC exposure factors. It does not replace individualized clinical advice. High-risk patients with severe COPD or asthma should consult their primary physician during hazardous smog events.
          </p>
        </div>
      </footer>
    </div>
  );
}
