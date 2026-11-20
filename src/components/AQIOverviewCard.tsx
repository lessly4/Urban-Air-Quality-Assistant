"use client";

import React from "react";
import {
  Wind,
  Thermometer,
  Droplets,
  Layers,
  Gauge,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { CurrentAirQuality } from "@/types/airQuality";

interface AQIOverviewCardProps {
  currentAQ: CurrentAirQuality;
  locationName: string;
}

export const AQIOverviewCard: React.FC<AQIOverviewCardProps> = ({
  currentAQ,
  locationName,
}) => {
  const getBadgeStyle = (category: string) => {
    switch (category) {
      case "Good":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300",
          ring: "text-emerald-500",
          desc: "Air quality is satisfactory and poses little to no health risk.",
        };
      case "Moderate":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300",
          ring: "text-amber-500",
          desc: "Acceptable quality; unusually sensitive individuals should consider limiting prolonged outdoor exertion.",
        };
      case "Unhealthy for Sensitive Groups":
        return {
          bg: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300",
          ring: "text-orange-500",
          desc: "Children, older adults, and respiratory patients should reduce heavy outdoor exertion.",
        };
      case "Unhealthy":
        return {
          bg: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300",
          ring: "text-red-500",
          desc: "Everyone may begin to experience health effects; sensitive members may experience more serious effects.",
        };
      case "Very Unhealthy":
        return {
          bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300",
          ring: "text-purple-500",
          desc: "Health alert: The risk of health effects is increased for everyone in the area.",
        };
      case "Hazardous":
      default:
        return {
          bg: "bg-rose-950/20 border-rose-800/60 text-rose-300",
          ring: "text-rose-600",
          desc: "Emergency conditions: Entire population is more likely to be affected by severe smog.",
        };
    }
  };

  const style = getBadgeStyle(currentAQ.aqiCategory);

  // WHO 24h Guideline multiples (PM2.5: 15 ug/m3, PM10: 45 ug/m3)
  const pm25Multiple = (currentAQ.pm25 / 15).toFixed(1);
  const pm10Multiple = (currentAQ.pm10 / 45).toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        {/* Main AQI Pill & Category */}
        <div className="flex items-start sm:items-center gap-5">
          <div
            className="flex flex-col items-center justify-center w-28 h-28 rounded-2xl text-white shadow-lg shrink-0 transition-transform hover:scale-105"
            style={{ backgroundColor: currentAQ.aqiColor }}
          >
            <span className="text-xs uppercase font-bold tracking-wider opacity-90">
              US AQI
            </span>
            <span className="text-4xl font-extrabold tracking-tight">
              {currentAQ.aqi}
            </span>
            <span className="text-[10px] opacity-80 mt-0.5">
              {currentAQ.dominantPollutant} Dominant
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Current Status • {locationName}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-0.5">
              {currentAQ.aqiCategory}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              {style.desc}
            </p>
          </div>
        </div>

        {/* Particulate Health Indicators (PM2.5 & PM10) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                PM2.5 (Fine Soot)
              </span>
              <Activity className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {Math.round(currentAQ.pm25)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                µg/m³
              </span>
            </div>
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
              {pm25Multiple}x WHO limit
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                PM10 (Dust & Coarse)
              </span>
              <Activity className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {Math.round(currentAQ.pm10)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                µg/m³
              </span>
            </div>
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
              {pm10Multiple}x WHO limit
            </span>
          </div>
        </div>
      </div>

      {/* Meteorological & Dispersion Indicators */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Temperature */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <Thermometer className="h-5 w-5 text-sky-500 shrink-0" />
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Temperature</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {Math.round(currentAQ.temperature)}°C
            </div>
          </div>
        </div>

        {/* Humidity */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <Droplets className="h-5 w-5 text-indigo-500 shrink-0" />
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Humidity</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {Math.round(currentAQ.relativeHumidity)}%
            </div>
          </div>
        </div>

        {/* Wind Speed & Stagnation */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <Wind className={`h-5 w-5 shrink-0 ${currentAQ.windSpeed < 2.0 ? "text-amber-500" : "text-teal-500"}`} />
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Wind Speed</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {currentAQ.windSpeed} m/s
              {currentAQ.windSpeed < 2.0 && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-normal leading-tight">
                  Calm / Stagnant
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Boundary Layer Height */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <Layers className={`h-5 w-5 shrink-0 ${currentAQ.boundaryLayerHeight < 450 ? "text-rose-500" : "text-emerald-500"}`} />
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Inversion Ceiling</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {currentAQ.boundaryLayerHeight} m
              {currentAQ.boundaryLayerHeight < 450 && (
                <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-normal leading-tight">
                  Trapped Lid
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pressure */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <Gauge className="h-5 w-5 text-slate-400 shrink-0" />
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Pressure</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {Math.round(currentAQ.surfacePressure)} hPa
            </div>
          </div>
        </div>

        {/* Nitrogen Dioxide (NO2) */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <ShieldAlert className="h-5 w-5 text-violet-500 shrink-0" />
          <div>
            <div className="text-[11px] text-slate-400 font-medium">NO2 (Traffic)</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {Math.round(currentAQ.no2)} µg/m³
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
