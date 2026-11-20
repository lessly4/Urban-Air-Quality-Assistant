"use client";

import { Trees, Heart, ShieldCheck } from "lucide-react";
import { CommunityAggregatedImpact } from "@/types/airQuality";

interface CommunityImpactSummaryProps {
  aggregated: CommunityAggregatedImpact;
  locationName: string;
}

export const CommunityImpactSummary: React.FC<CommunityImpactSummaryProps> = ({
  aggregated,
  locationName,
}) => {
  return (
    <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-cyan-950 rounded-2xl p-6 text-white shadow-xl border border-teal-800/40">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-teal-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Collective Action Potential
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-800/60 text-teal-200 border border-teal-700">
              1,000 Households Model
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            Community-Scale Impact in {locationName}
          </h3>
          <p className="text-xs text-teal-200/80 mt-1 max-w-xl">
            When neighborhoods synchronize morning routines, seal homes, and transition from solid fuel combustion, the benefits scale exponentially into clean urban air.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="p-3 rounded-xl bg-teal-800/40 border border-teal-700/60 text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300 block">
              Your Household Dose Saved
            </span>
            <span className="text-2xl font-black text-white">
              {aggregated.totalDoseSavedUgPerDay.toLocaleString()}
            </span>
            <span className="text-[10px] text-teal-200/70 block">µg PM2.5 / day</span>
          </div>
        </div>
      </div>

      {/* Grid of Community Scaling Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {/* Metric 1: CO2 Avoided */}
        <div className="p-4 rounded-xl bg-teal-950/60 border border-teal-800/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-300">
              Annual CO2 Cut (1,000 Homes)
            </span>
            <Trees className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white">
              {aggregated.communityScaling1000Households.co2SavedTonsPerYear.toLocaleString()}
            </span>
            <span className="text-xs text-teal-300 font-medium">Metric Tons / yr</span>
          </div>
          <p className="text-[11px] text-teal-200/70 mt-1">
            Equivalent to removing ~{Math.round(aggregated.communityScaling1000Households.co2SavedTonsPerYear / 4.6)} gasoline passenger vehicles from city roads all year.
          </p>
        </div>

        {/* Metric 2: Direct Particulates Removed */}
        <div className="p-4 rounded-xl bg-teal-950/60 border border-teal-800/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-300">
              Toxic PM2.5 Aerosol Prevented
            </span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white">
              {aggregated.communityScaling1000Households.pm25AvoidedKgPerYear.toLocaleString()}
            </span>
            <span className="text-xs text-teal-300 font-medium">kg soot / yr</span>
          </div>
          <p className="text-[11px] text-teal-200/70 mt-1">
            Fine combustion soot permanently eliminated from the immediate neighborhood breathing layer.
          </p>
        </div>

        {/* Metric 3: Weekly Household CO2 */}
        <div className="p-4 rounded-xl bg-teal-950/60 border border-teal-800/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-300">
              Your Weekly Footprint Saved
            </span>
            <Heart className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white">
              {aggregated.totalCo2SavedKgPerWeek}
            </span>
            <span className="text-xs text-teal-300 font-medium">kg CO2 / week</span>
          </div>
          <p className="text-[11px] text-teal-200/70 mt-1">
            Achieved via targeted electric cooking swaps, transit optimization, and carpooling.
          </p>
        </div>
      </div>
    </div>
  );
};
