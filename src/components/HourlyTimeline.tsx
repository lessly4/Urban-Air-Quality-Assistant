"use client";

import React, { useState } from "react";
import {
  Clock,
  Sun,
  Wind,
  Layers,
  Thermometer,
} from "lucide-react";
import { HourlyAirQuality } from "@/types/airQuality";

interface HourlyTimelineProps {
  hourly: HourlyAirQuality[];
  safeWindowDescription?: string;
}

export const HourlyTimeline: React.FC<HourlyTimelineProps> = ({
  hourly,
  safeWindowDescription,
}) => {
  const [selectedHourIndex, setSelectedHourIndex] = useState<number | null>(null);

  if (!hourly || hourly.length === 0) {
    return null;
  }

  const displayHours = hourly.slice(0, 24);

  let safestHour = displayHours[0];
  let worstHour = displayHours[0];
  for (const h of displayHours) {
    if (h.pm25 < safestHour.pm25) safestHour = h;
    if (h.pm25 > worstHour.pm25) worstHour = h;
  }

  const selectedHour =
    selectedHourIndex !== null ? displayHours[selectedHourIndex] : null;

  const formatHourLabel = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: "numeric", hour12: true });
    } catch {
      return timeStr.slice(11, 16);
    }
  };

  const getSafetyColor = (level: string, isTrap: boolean) => {
    if (level === "safe") {
      return {
        bar: "bg-gradient-to-t from-[#557566] to-[#94AE9F] shadow-[0_0_10px_rgba(148,174,159,0.28)]",
        pill: "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40",
        label: "Safe Window",
      };
    }
    if (level === "moderate" && !isTrap) {
      return {
        bar: "bg-gradient-to-t from-amber-600/80 to-amber-400/90",
        pill: "bg-amber-950/60 text-amber-300 border border-amber-500/40",
        label: "Moderate",
      };
    }
    return {
      bar: isTrap
        ? "bg-gradient-to-t from-[#2F4A3F] to-amber-500/80"
        : "bg-gradient-to-t from-rose-700/80 to-rose-400/90",
      pill: isTrap
        ? "bg-amber-950/60 text-amber-300 border border-amber-500/40"
        : "bg-rose-950/60 text-rose-300 border border-rose-500/40",
      label: isTrap ? "Inversion Trap" : "Hazardous",
    };
  };

  const maxPM25 = Math.max(...displayHours.map((h) => h.pm25), 100);

  return (
    <div className="bg-[#1C2E27]/60 backdrop-blur-md rounded-2xl border border-[#2F4A3F]/80 p-6 shadow-xl flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2F4A3F]/60">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#94AE9F]" />
            <h3 className="text-base font-bold text-[#DCE7DF]">
              24-Hour PM2.5 &amp; Dispersion Timeline
            </h3>
          </div>
          <p className="text-xs text-[#94AE9F]/80 mt-0.5">
            Identify Safe Solar Mixing Windows vs. winter thermal inversion traps
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-[#94AE9F]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#94AE9F]" />
            Safe (&lt;35 µg/m³)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Moderate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            Hazardous
          </span>
        </div>
      </div>

      {/* Safe Solar Mixing Window Inset Container */}
      <div className="my-4 p-3.5 rounded-xl bg-[#0F1A16]/70 border border-[#94AE9F]/40 flex items-start sm:items-center gap-3 shadow-[inset_0_0_20px_rgba(148,174,159,0.06)]">
        <div className="h-8 w-8 rounded-lg bg-[#2F4A3F]/70 border border-[#94AE9F]/30 text-[#DCE7DF] flex items-center justify-center shrink-0">
          <Sun className="h-4 w-4 text-[#94AE9F]" />
        </div>
        <div className="text-xs">
          <span className="font-bold text-[#DCE7DF] mr-1.5">
            Safe Solar Mixing Window:
          </span>
          <span className="text-[#94AE9F] leading-relaxed">
            {safeWindowDescription ||
              `Cleanest dispersion expected around ${formatHourLabel(safestHour.time)} (${Math.round(safestHour.pm25)} µg/m³ PM2.5).`}
          </span>
        </div>
      </div>

      {/* Scrollable Rounded Hourly Bar Chart */}
      <div className="mt-2 overflow-x-auto pb-2">
        <div className="flex items-end gap-1.5 min-w-[680px] h-52 pt-7 px-1">
          {displayHours.map((hour, idx) => {
            const heightPercent = Math.max(12, Math.round((hour.pm25 / maxPM25) * 100));
            const color = getSafetyColor(hour.safetyLevel, hour.isTrappingWindow);
            const isSelected = selectedHourIndex === idx;
            const isSafest = hour.time === safestHour.time;
            const isWorst = hour.time === worstHour.time;

            return (
              <button
                key={hour.time}
                onClick={() => setSelectedHourIndex(isSelected ? null : idx)}
                aria-label={`${formatHourLabel(hour.time)}: PM2.5 ${Math.round(hour.pm25)} micrograms per cubic meter, safety rating ${hour.safetyLevel}${hour.isTrappingWindow ? ", winter inversion trap" : ""}`}
                aria-pressed={isSelected}
                className={`flex-1 flex flex-col items-center justify-end h-full group focus:outline-none transition-all rounded-xl p-1 ${
                  isSelected
                    ? "bg-[#2F4A3F]/50 ring-2 ring-[#94AE9F]"
                    : isSafest
                    ? "bg-[#2F4A3F]/25 border border-[#94AE9F]/30"
                    : "hover:bg-[#2F4A3F]/30"
                }`}
                title={`Click to inspect ${formatHourLabel(hour.time)}: ${Math.round(hour.pm25)} µg/m³`}
              >
                {/* Safe / Worst badges above bar */}
                <div className="h-6 flex items-center justify-center mb-1">
                  {isSafest && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#2F4A3F] text-[#DCE7DF] border border-[#94AE9F]">
                      Best
                    </span>
                  )}
                  {isWorst && !isSafest && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40">
                      Peak
                    </span>
                  )}
                </div>

                {/* Rounded Bar */}
                <div
                  className={`w-full max-w-[18px] rounded-t-full rounded-b-sm transition-all ${color.bar} group-hover:brightness-110 ${
                    isSelected ? "ring-2 ring-offset-2 ring-offset-[#1C2E27] ring-[#DCE7DF]" : ""
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />

                {/* Concentration label */}
                <span className="text-[10px] font-bold text-[#DCE7DF] mt-1.5">
                  {Math.round(hour.pm25)}
                </span>

                {/* Time label */}
                <span className="text-[10px] font-medium text-[#557566] mt-0.5">
                  {formatHourLabel(hour.time)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Details Inspector */}
      {selectedHour && (
        <div className="mt-4 p-4 rounded-xl bg-[#0F1A16]/75 border border-[#2F4A3F] animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2F4A3F]/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#2F4A3F] text-[#DCE7DF]">
                {formatHourLabel(selectedHour.time)} Forecast
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  getSafetyColor(selectedHour.safetyLevel, selectedHour.isTrappingWindow).pill
                }`}
              >
                {getSafetyColor(selectedHour.safetyLevel, selectedHour.isTrappingWindow).label}
              </span>
            </div>
            <button
              onClick={() => setSelectedHourIndex(null)}
              className="text-xs text-[#94AE9F] hover:text-[#DCE7DF] transition-colors"
            >
              Close Details
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
            <div className="p-2.5 rounded-lg bg-[#1C2E27]/60 border border-[#2F4A3F]/70">
              <span className="text-[#557566] text-[11px] block">PM2.5 Concentration</span>
              <span className="text-base font-bold text-[#DCE7DF]">
                {Math.round(selectedHour.pm25)} µg/m³
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#1C2E27]/60 border border-[#2F4A3F]/70">
              <span className="text-[#557566] text-[11px] block">Surface Wind</span>
              <span className="text-base font-bold text-[#DCE7DF] flex items-center gap-1">
                <Wind className="h-3.5 w-3.5 text-[#94AE9F]" />
                {selectedHour.windSpeed} m/s
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#1C2E27]/60 border border-[#2F4A3F]/70">
              <span className="text-[#557566] text-[11px] block">Boundary Mixing Lid</span>
              <span className="text-base font-bold text-[#DCE7DF] flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-[#94AE9F]" />
                {selectedHour.boundaryLayerHeight} m
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#1C2E27]/60 border border-[#2F4A3F]/70">
              <span className="text-[#557566] text-[11px] block">Temperature</span>
              <span className="text-base font-bold text-[#DCE7DF] flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5 text-[#94AE9F]" />
                {Math.round(selectedHour.temperature)}°C
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
