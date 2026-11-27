"use client";

import React, { useState } from "react";
import { Trees, Heart, ShieldCheck, Calculator } from "lucide-react";
import {
  CommunityAggregatedImpact,
  RecommendationItem,
  ImpactMetrics,
} from "@/types/airQuality";
import { ImpactMathModal } from "./ImpactMathModal";

interface CommunityImpactSummaryProps {
  aggregated: CommunityAggregatedImpact;
  locationName: string;
  recommendations?: RecommendationItem[];
}

export const CommunityImpactSummary: React.FC<CommunityImpactSummaryProps> = ({
  aggregated,
  locationName,
  recommendations = [],
}) => {
  const [activeModalMetric, setActiveModalMetric] = useState<{
    metrics: ImpactMetrics;
    title: string;
  } | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-[#1C2E27]/60 backdrop-blur-md rounded-2xl p-6 text-[#DCE7DF] shadow-xl border border-[#2F4A3F]/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#2F4A3F]/70">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#94AE9F]">
                Collective Action Potential
              </span>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#2F4A3F]/70 text-[#DCE7DF] border border-[#94AE9F]/40">
                1,000 Households Model
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#DCE7DF] mt-1">
              Community-Scale Impact in {locationName}
            </h3>
            <p className="text-xs text-[#94AE9F] mt-1 max-w-xl leading-relaxed">
              When neighborhoods synchronize morning routines, seal homes, and transition from solid fuel combustion, the benefits scale exponentially into clean urban air.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="p-3.5 rounded-xl bg-[#0F1A16]/70 border border-[#94AE9F]/40 text-center shadow-[0_0_20px_rgba(148,174,159,0.12)]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#557566] block">
                Your Household Dose Saved
              </span>
              <span className="text-2xl font-black text-[#DCE7DF]">
                {aggregated.totalDoseSavedUgPerDay.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#94AE9F] block">µg PM2.5 / day</span>
            </div>
          </div>
        </div>

        {/* Grid of Community Scaling Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Metric 1: CO2 Avoided */}
          <div className="p-4 rounded-xl bg-[#0F1A16]/65 border border-[#2F4A3F]/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#94AE9F]">
                Annual CO2 Cut (1,000 Homes)
              </span>
              <Trees className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#DCE7DF]">
                {aggregated.communityScaling1000Households.co2SavedTonsPerYear.toLocaleString()}
              </span>
              <span className="text-xs text-[#94AE9F] font-medium">Metric Tons / yr</span>
            </div>
            <p className="text-[11px] text-[#557566] mt-1.5 leading-relaxed">
              Equivalent to removing ~{Math.round(aggregated.communityScaling1000Households.co2SavedTonsPerYear / 4.6)} gasoline passenger vehicles from city roads all year.
            </p>
          </div>

          {/* Metric 2: Direct Particulates Removed */}
          <div className="p-4 rounded-xl bg-[#0F1A16]/65 border border-[#2F4A3F]/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#94AE9F]">
                Toxic PM2.5 Aerosol Prevented
              </span>
              <ShieldCheck className="h-4 w-4 text-[#94AE9F]" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#DCE7DF]">
                {aggregated.communityScaling1000Households.pm25AvoidedKgPerYear.toLocaleString()}
              </span>
              <span className="text-xs text-[#94AE9F] font-medium">kg soot / yr</span>
            </div>
            <p className="text-[11px] text-[#557566] mt-1.5 leading-relaxed">
              Fine combustion soot permanently eliminated from the immediate neighborhood breathing layer.
            </p>
          </div>

          {/* Metric 3: Weekly Household CO2 */}
          <div className="p-4 rounded-xl bg-[#0F1A16]/65 border border-[#2F4A3F]/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#94AE9F]">
                Your Weekly Footprint Saved
              </span>
              <Heart className="h-4 w-4 text-rose-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#DCE7DF]">
                {aggregated.totalCo2SavedKgPerWeek}
              </span>
              <span className="text-xs text-[#94AE9F] font-medium">kg CO2 / week</span>
            </div>
            <p className="text-[11px] text-[#557566] mt-1.5 leading-relaxed">
              Achieved via targeted electric cooking swaps, transit optimization, and carpooling.
            </p>
          </div>
        </div>
      </div>

      {/* Deterministic Impact Math Ledger (Direct Triggers for ImpactMathModal) */}
      {recommendations.length > 0 && (
        <div className="bg-[#1C2E27]/60 backdrop-blur-md rounded-2xl p-6 border border-[#2F4A3F]/80 shadow-xl">
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#2F4A3F]/60">
            <div>
              <h4 className="text-base font-bold text-[#DCE7DF] flex items-center gap-2">
                <Calculator className="h-4 w-4 text-[#94AE9F]" />
                Deterministic Impact Math Ledger
              </h4>
              <p className="text-xs text-[#94AE9F]/80 mt-0.5">
                Inspect exact EPA inhalation equations and IPCC emission variables for each active measure
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl bg-[#0F1A16]/65 border border-[#2F4A3F]/80 flex flex-col justify-between gap-3 hover:border-[#94AE9F]/60 transition-all"
              >
                <div>
                  <span className="text-sm font-bold text-[#DCE7DF] block">
                    {rec.title}
                  </span>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#2F4A3F]/60 text-[#DCE7DF] border border-[#94AE9F]/40">
                      -{rec.impact.exposureReductionPercent}% exposure
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#1C2E27] text-emerald-300 border border-[#2F4A3F]">
                      {rec.impact.doseSavedUgPerDay} µg/day saved
                    </span>
                    {rec.impact.co2SavedKgPerWeek > 0 && (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#1C2E27] text-[#94AE9F] border border-[#2F4A3F]">
                        {rec.impact.co2SavedKgPerWeek} kg/week CO2
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveModalMetric({ metrics: rec.impact, title: rec.title })
                    }
                    className="text-xs font-semibold text-[#DCE7DF] px-3 py-1.5 rounded-lg bg-[#2F4A3F]/60 border border-[#94AE9F]/40 hover:border-[#94AE9F] hover:bg-[#2F4A3F] flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-[#94AE9F]/40"
                  >
                    <Calculator className="h-3.5 w-3.5 text-[#94AE9F]" />
                    <span>Inspect Math Proof</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeModalMetric && (
        <ImpactMathModal
          isOpen={!!activeModalMetric}
          onClose={() => setActiveModalMetric(null)}
          impactMetrics={activeModalMetric.metrics}
          actionTitle={activeModalMetric.title}
        />
      )}
    </div>
  );
};
