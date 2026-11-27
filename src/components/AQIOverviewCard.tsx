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
  const getCategoryMeta = (category: string) => {
    switch (category) {
      case "Good":
        return {
          badge: "bg-emerald-950/60 border-emerald-500/40 text-emerald-300",
          glow: "rgba(52, 211, 153, 0.25)",
          desc: "Air quality is satisfactory and poses little to no health risk.",
        };
      case "Moderate":
        return {
          badge: "bg-amber-950/60 border-amber-500/40 text-amber-300",
          glow: "rgba(251, 191, 36, 0.22)",
          desc: "Acceptable quality; unusually sensitive individuals should consider limiting prolonged outdoor exertion.",
        };
      case "Unhealthy for Sensitive Groups":
        return {
          badge: "bg-orange-950/60 border-orange-500/40 text-orange-300",
          glow: "rgba(251, 146, 60, 0.22)",
          desc: "Children, older adults, and respiratory patients should reduce heavy outdoor exertion.",
        };
      case "Unhealthy":
        return {
          badge: "bg-rose-950/60 border-rose-500/40 text-rose-300",
          glow: "rgba(244, 63, 94, 0.24)",
          desc: "Everyone may begin to experience health effects; sensitive members may experience more serious effects.",
        };
      case "Very Unhealthy":
        return {
          badge: "bg-purple-950/60 border-purple-400/40 text-purple-300",
          glow: "rgba(192, 132, 252, 0.22)",
          desc: "Health alert: The risk of health effects is increased for everyone in the area.",
        };
      case "Hazardous":
      default:
        return {
          badge: "bg-rose-950/80 border-rose-500/60 text-rose-200",
          glow: "rgba(225, 29, 72, 0.28)",
          desc: "Emergency conditions: Entire population is more likely to be affected by severe smog.",
        };
    }
  };

  const meta = getCategoryMeta(currentAQ.aqiCategory);

  // WHO 24h Guideline multiples (PM2.5: 15 ug/m3, PM10: 45 ug/m3)
  const pm25Multiple = (currentAQ.pm25 / 15).toFixed(1);
  const pm10Multiple = (currentAQ.pm10 / 45).toFixed(1);

  // Radial gauge calculations (0 to 500 AQI over a 270-degree arc)
  const clampedAqi = Math.max(0, Math.min(500, currentAQ.aqi));
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const arcFraction = 0.75; // 270 degree gauge
  const arcLength = circumference * arcFraction;
  const progressLength = arcLength * (clampedAqi / 500);

  return (
    <div className="bg-[#1C2E27]/60 backdrop-blur-md rounded-2xl border border-[#2F4A3F]/80 p-6 shadow-xl flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#2F4A3F]/60">
        <div>
          <span className="text-[11px] font-semibold text-[#557566] uppercase tracking-wider">
            Current Air Quality • {locationName}
          </span>
          <div className="flex items-center gap-2.5 mt-1 flex-wrap">
            <h2 className="text-xl font-bold text-[#DCE7DF] tracking-tight">
              {currentAQ.aqiCategory}
            </h2>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${meta.badge}`}>
              {currentAQ.dominantPollutant} Dominant
            </span>
          </div>
          <p className="text-xs text-[#94AE9F] mt-1.5 max-w-md leading-relaxed">
            {meta.desc}
          </p>
        </div>
      </div>

      {/* Central Radial AQI Gauge flanked by PM2.5 and PM10 */}
      <div className="my-6 grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
        {/* Left: PM2.5 */}
        <div className="p-3.5 rounded-xl bg-[#0F1A16]/60 border border-[#2F4A3F]/70 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[#94AE9F]">
              PM2.5 (Fine Soot)
            </span>
            <Activity className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-[#DCE7DF]">
              {Math.round(currentAQ.pm25)}
            </span>
            <span className="text-xs text-[#557566] font-medium">µg/m³</span>
          </div>
          <span className="text-[11px] font-medium text-rose-400 mt-0.5">
            {pm25Multiple}x WHO limit
          </span>
        </div>

        {/* Center: Radial AQI Dial */}
        <div className="flex flex-col items-center justify-center relative py-2">
          <div
            className="relative flex items-center justify-center w-40 h-40 rounded-full"
            style={{
              boxShadow: `0 0 38px ${meta.glow}`,
            }}
          >
            <svg
              className="w-40 h-40 transform rotate-[135deg]"
              viewBox="0 0 160 160"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="aqiForestGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#94AE9F" />
                  <stop offset="55%" stopColor="#34d399" />
                  <stop offset="85%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>
              </defs>

              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#2F4A3F"
                strokeOpacity="0.55"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${arcLength} ${circumference}`}
              />

              {/* Active AQI Arc */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="url(#aqiForestGrad)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${progressLength} ${circumference}`}
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Center Numeric Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black tracking-tight text-[#DCE7DF]">
                {currentAQ.aqi}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#94AE9F] mt-0.5">
                US AQI
              </span>
            </div>
          </div>
          <span className="text-[11px] text-[#557566] font-medium -mt-2">
            0 – 500 EPA Scale
          </span>
        </div>

        {/* Right: PM10 */}
        <div className="p-3.5 rounded-xl bg-[#0F1A16]/60 border border-[#2F4A3F]/70 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[#94AE9F]">
              PM10 (Coarse Dust)
            </span>
            <Activity className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-[#DCE7DF]">
              {Math.round(currentAQ.pm10)}
            </span>
            <span className="text-xs text-[#557566] font-medium">µg/m³</span>
          </div>
          <span className="text-[11px] font-medium text-amber-400 mt-0.5">
            {pm10Multiple}x WHO limit
          </span>
        </div>
      </div>

      {/* Meteorological & Dispersion Micro-Cards */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#557566] block mb-2.5">
          Atmospheric &amp; Dispersion Telemetry
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* Wind Speed */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0F1A16]/55 border border-[#2F4A3F]/60">
            <Wind className={`h-4 w-4 shrink-0 ${currentAQ.windSpeed < 2.0 ? "text-amber-400" : "text-[#94AE9F]"}`} />
            <div>
              <div className="text-[10px] text-[#557566] font-medium">Wind Speed</div>
              <div className="text-xs font-bold text-[#DCE7DF]">
                {currentAQ.windSpeed} m/s
              </div>
              {currentAQ.windSpeed < 2.0 && (
                <span className="text-[10px] text-amber-400 block leading-tight">Stagnant</span>
              )}
            </div>
          </div>

          {/* Humidity */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0F1A16]/55 border border-[#2F4A3F]/60">
            <Droplets className="h-4 w-4 text-[#94AE9F] shrink-0" />
            <div>
              <div className="text-[10px] text-[#557566] font-medium">Humidity</div>
              <div className="text-xs font-bold text-[#DCE7DF]">
                {Math.round(currentAQ.relativeHumidity)}%
              </div>
            </div>
          </div>

          {/* Boundary Layer Height */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0F1A16]/55 border border-[#2F4A3F]/60">
            <Layers className={`h-4 w-4 shrink-0 ${currentAQ.boundaryLayerHeight < 450 ? "text-rose-400" : "text-emerald-400"}`} />
            <div>
              <div className="text-[10px] text-[#557566] font-medium">Boundary Layer</div>
              <div className="text-xs font-bold text-[#DCE7DF]">
                {currentAQ.boundaryLayerHeight} m
              </div>
              {currentAQ.boundaryLayerHeight < 450 && (
                <span className="text-[10px] text-rose-400 block leading-tight">Trapped Lid</span>
              )}
            </div>
          </div>

          {/* Temperature */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0F1A16]/55 border border-[#2F4A3F]/60">
            <Thermometer className="h-4 w-4 text-[#94AE9F] shrink-0" />
            <div>
              <div className="text-[10px] text-[#557566] font-medium">Temperature</div>
              <div className="text-xs font-bold text-[#DCE7DF]">
                {Math.round(currentAQ.temperature)}°C
              </div>
            </div>
          </div>

          {/* Pressure */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0F1A16]/55 border border-[#2F4A3F]/60">
            <Gauge className="h-4 w-4 text-[#557566] shrink-0" />
            <div>
              <div className="text-[10px] text-[#557566] font-medium">Pressure</div>
              <div className="text-xs font-bold text-[#DCE7DF]">
                {Math.round(currentAQ.surfacePressure)} hPa
              </div>
            </div>
          </div>

          {/* NO2 */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0F1A16]/55 border border-[#2F4A3F]/60">
            <ShieldAlert className="h-4 w-4 text-[#94AE9F] shrink-0" />
            <div>
              <div className="text-[10px] text-[#557566] font-medium">NO2 (Traffic)</div>
              <div className="text-xs font-bold text-[#DCE7DF]">
                {Math.round(currentAQ.no2)} µg/m³
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
