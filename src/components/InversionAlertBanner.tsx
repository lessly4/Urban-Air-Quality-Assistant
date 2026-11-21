"use client";

import React, { useState } from "react";
import { AlertTriangle, Info, ChevronDown, ChevronUp, Sun, Wind, ArrowDownCircle } from "lucide-react";
import { CurrentAirQuality } from "@/types/airQuality";

interface InversionAlertBannerProps {
  currentAQ: CurrentAirQuality;
}

export const InversionAlertBanner: React.FC<InversionAlertBannerProps> = ({
  currentAQ,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentAQ.inversionDetected) {
    return null;
  }

  const isSevere = currentAQ.inversionSeverity === "severe";

  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        isSevere
          ? "bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 border-amber-300 dark:border-amber-800/80"
          : "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Atmospheric Trapping Alert
              </span>
              <span className="text-[11px] px-2 py-0.2 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-semibold">
                {isSevere ? "Severe Thermal Inversion" : "Surface Smog Trap"}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              Winter Inversion Layer is Trapping Ground-Level Pollution
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {currentAQ.inversionReason ||
                "Calm winds and a compressed boundary layer ceiling are creating an atmospheric lid, preventing smoke and vehicle emissions from dissipating."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="inversion-breakdown"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-white/80 dark:bg-slate-800/80 text-amber-800 dark:text-amber-300 hover:bg-white dark:hover:bg-slate-800 flex items-center gap-1.5 shadow-2xs transition-all focus:ring-2 focus:ring-amber-500"
          >
            <Info className="h-3.5 w-3.5" />
            <span>{isExpanded ? "Hide Science Breakdown" : "Why Is This Happening?"}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Scientific Explainer */}
      {isExpanded && (
        <div id="inversion-breakdown" className="mt-4 pt-4 border-t border-amber-200/80 dark:border-amber-800/60 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 dark:text-slate-300 animate-fadeIn">
          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-amber-100 dark:border-amber-900/40">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 mb-1">
              <ArrowDownCircle className="h-4 w-4 text-amber-600" />
              1. The Cold Air Pool
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              During clear winter nights, the ground rapidly radiates heat into space. Dense, cold surface air sinks into urban basins and valleys beneath a warmer layer of air aloft.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-amber-100 dark:border-amber-900/40">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 mb-1">
              <Wind className="h-4 w-4 text-amber-600" />
              2. Stagnant Mixing Ceiling
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              The mixing boundary layer is currently compressed down to ~{currentAQ.boundaryLayerHeight}m with surface winds at {currentAQ.windSpeed} m/s. Traffic exhaust and solid fuel smoke cannot rise and pool horizontally.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-amber-100 dark:border-amber-900/40">
            <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 mb-1">
              <Sun className="h-4 w-4 text-emerald-600" />
              3. The Afternoon Break
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Solar radiation heats the ground during early afternoon (typically 12:30 PM - 3:30 PM), triggering vertical thermal convection that temporarily punches through the lid and dilutes smog.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
