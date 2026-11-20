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

  // Focus on the first 24 hours
  const displayHours = hourly.slice(0, 24);

  // Find safest and most hazardous hours in the 24h window
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
        bg: "bg-emerald-500",
        border: "border-emerald-500",
        pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
        label: "Safe Window",
      };
    }
    if (level === "moderate" && !isTrap) {
      return {
        bg: "bg-amber-400",
        border: "border-amber-400",
        pill: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
        label: "Moderate",
      };
    }
    return {
      bg: isTrap ? "bg-purple-600" : "bg-rose-500",
      border: isTrap ? "border-purple-600" : "border-rose-500",
      pill: isTrap
        ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
        : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
      label: isTrap ? "Inversion Trap" : "Hazardous",
    };
  };

  // Find max PM2.5 for proportional bar height
  const maxPM25 = Math.max(...displayHours.map((h) => h.pm25), 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              24-Hour Smog & Atmospheric Dispersion Timeline
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Identify safe ventilation windows vs. morning/night winter thermal inversion traps
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Safe (&lt;35 µg/m³)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Moderate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            Hazardous
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
            Inversion Trap
          </span>
        </div>
      </div>

      {/* Safe Window Highlight Card */}
      {safeWindowDescription && (
        <div className="my-4 p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/50 flex items-start sm:items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-teal-600/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <Sun className="h-4 w-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-teal-900 dark:text-teal-200 mr-1.5">
              Target Activity Window:
            </span>
            <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {safeWindowDescription}
            </span>
          </div>
        </div>
      )}

      {/* Scrollable Hourly Bar Chart */}
      <div className="mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        <div className="flex items-end gap-1.5 min-w-[760px] h-48 pt-6 px-1">
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
                className={`flex-1 flex flex-col items-center justify-end h-full group focus:outline-none transition-all rounded-t-md p-1 ${
                  isSelected
                    ? "bg-slate-100 dark:bg-slate-800/80 ring-2 ring-teal-500"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
                title={`Click to inspect ${formatHourLabel(hour.time)}: ${Math.round(hour.pm25)} µg/m³`}
              >
                {/* Safe / Worst badges above bar */}
                <div className="h-6 flex items-center justify-center mb-1">
                  {isSafest && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 animate-bounce">
                      Best
                    </span>
                  )}
                  {isWorst && !isSafest && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                      Peak
                    </span>
                  )}
                </div>

                {/* Bar */}
                <div
                  className={`w-full max-w-[22px] rounded-t-md transition-all ${color.bg} group-hover:opacity-90 ${
                    isSelected ? "ring-2 ring-offset-1 ring-teal-500" : ""
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />

                {/* Concentration label */}
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1.5">
                  {Math.round(hour.pm25)}
                </span>

                {/* Time label */}
                <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                  {formatHourLabel(hour.time)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Details Inspector */}
      {selectedHour && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300">
                {formatHourLabel(selectedHour.time)} Detailed Forecast
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  getSafetyColor(selectedHour.safetyLevel, selectedHour.isTrappingWindow).pill
                }`}
              >
                {getSafetyColor(selectedHour.safetyLevel, selectedHour.isTrappingWindow).label}
              </span>
            </div>
            <button
              onClick={() => setSelectedHourIndex(null)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Close Details
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 text-[11px] block">PM2.5 Concentration</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                {Math.round(selectedHour.pm25)} µg/m³
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 text-[11px] block">Surface Wind</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <Wind className="h-3.5 w-3.5 text-teal-500" />
                {selectedHour.windSpeed} m/s
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 text-[11px] block">Boundary Mixing Lid</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                {selectedHour.boundaryLayerHeight} m
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 text-[11px] block">Temperature</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5 text-sky-500" />
                {Math.round(selectedHour.temperature)}°C
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
