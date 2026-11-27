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
      className={`rounded-2xl border backdrop-blur-md p-5 transition-all ${
        isSevere
          ? "bg-gradient-to-r from-amber-950/50 via-[#1C2E27]/75 to-orange-950/40 border-amber-500/45 shadow-[0_0_28px_rgba(245,158,11,0.12)]"
          : "bg-[#1C2E27]/70 border-amber-500/35 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Atmospheric Trapping Alert
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-950/70 text-amber-200 border border-amber-500/35 font-semibold">
                {isSevere ? "Severe Thermal Inversion" : "Surface Smog Trap"}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#DCE7DF] mt-1">
              Winter Inversion Layer is Trapping Ground-Level Pollution
            </h3>
            <p className="text-xs text-[#94AE9F] mt-1 max-w-2xl leading-relaxed">
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
            className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#2F4A3F] bg-[#0F1A16]/70 text-[#DCE7DF] hover:border-[#94AE9F] hover:bg-[#2F4A3F]/50 flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-[#94AE9F]/40"
          >
            <Info className="h-3.5 w-3.5 text-amber-400" />
            <span>{isExpanded ? "Hide Science Breakdown" : "Why Is This Happening?"}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-[#94AE9F]" /> : <ChevronDown className="h-3.5 w-3.5 text-[#94AE9F]" />}
          </button>
        </div>
      </div>

      {/* Expandable Scientific Explainer */}
      {isExpanded && (
        <div
          id="inversion-breakdown"
          className="mt-4 pt-4 border-t border-[#2F4A3F]/70 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#94AE9F] animate-fadeIn"
        >
          <div className="p-3.5 rounded-xl bg-[#0F1A16]/65 border border-[#2F4A3F]/80">
            <div className="flex items-center gap-1.5 font-bold text-[#DCE7DF] mb-1.5">
              <ArrowDownCircle className="h-4 w-4 text-amber-400" />
              1. The Cold Air Pool
            </div>
            <p className="leading-relaxed">
              During clear winter nights, the ground rapidly radiates heat into space. Dense, cold surface air sinks into urban basins and valleys beneath a warmer layer of air aloft.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0F1A16]/65 border border-[#2F4A3F]/80">
            <div className="flex items-center gap-1.5 font-bold text-[#DCE7DF] mb-1.5">
              <Wind className="h-4 w-4 text-amber-400" />
              2. Stagnant Mixing Ceiling
            </div>
            <p className="leading-relaxed">
              The mixing boundary layer is currently compressed down to ~{currentAQ.boundaryLayerHeight}m with surface winds at {currentAQ.windSpeed} m/s. Traffic exhaust and solid fuel smoke cannot rise and pool horizontally.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0F1A16]/65 border border-[#2F4A3F]/80">
            <div className="flex items-center gap-1.5 font-bold text-[#DCE7DF] mb-1.5">
              <Sun className="h-4 w-4 text-emerald-400" />
              3. The Afternoon Break
            </div>
            <p className="leading-relaxed">
              Solar radiation heats the ground during early afternoon (typically 12:30 PM - 3:30 PM), triggering vertical thermal convection that temporarily punches through the lid and dilutes smog.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
