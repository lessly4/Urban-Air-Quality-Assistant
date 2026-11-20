"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, RefreshCw, Wind, AlertTriangle, ShieldCheck } from "lucide-react";
import { GeoLocation } from "@/types/airQuality";

interface AirQualityHeaderProps {
  currentLocationName: string;
  onSelectLocation: (location: GeoLocation) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated?: string;
  inversionDetected?: boolean;
}

const PRESET_CITIES: GeoLocation[] = [
  { name: "Delhi", country: "India", latitude: 28.65195, longitude: 77.23149, timezone: "Asia/Kolkata", countryCode: "IN" },
  { name: "Lahore", country: "Pakistan", latitude: 31.558, longitude: 74.3507, timezone: "Asia/Karachi", countryCode: "PK" },
  { name: "Beijing", country: "China", latitude: 39.9075, longitude: 116.3972, timezone: "Asia/Shanghai", countryCode: "CN" },
  { name: "Salt Lake City", country: "United States", latitude: 40.7608, longitude: -111.891, timezone: "America/Denver", countryCode: "US" },
  { name: "London", country: "United Kingdom", latitude: 51.5085, longitude: -0.1257, timezone: "Europe/London", countryCode: "GB" },
];

export const AirQualityHeader: React.FC<AirQualityHeaderProps> = ({
  currentLocationName,
  onSelectLocation,
  onRefresh,
  isRefreshing,
  lastUpdated,
  inversionDetected,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Failed to query cities:", err);
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleSelect = (loc: GeoLocation) => {
    onSelectLocation(loc);
    setSearchQuery("");
    setIsOpen(false);
  };

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Live";

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Wind className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  Urban Air Quality Assistant
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Winter Smog & Inversion MVP
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deterministic impact math & hyper-local GenAI guidance
              </p>
            </div>
          </div>

          {/* Search bar & Refresh */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search city or neighborhood..."
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val.trim().length < 2) {
                      setResults([]);
                      setIsSearching(false);
                    }
                  }}
                  onFocus={() => results.length > 0 && setIsOpen(true)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  aria-label="Search city location"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <RefreshCw className="h-3.5 w-3.5 text-teal-500 animate-spin" />
                  </div>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 max-h-64 overflow-y-auto">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Matching Locations
                  </div>
                  {results.map((item, idx) => (
                    <button
                      key={`${item.latitude}-${item.longitude}-${idx}`}
                      onClick={() => handleSelect(item)}
                      className="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {item.name}
                          </span>
                          {item.admin1 && (
                            <span className="text-xs text-slate-500 ml-1.5">
                              ({item.admin1})
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                        {item.country}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              title="Refresh live data"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-teal-600 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Updated {formattedTime}</span>
            </button>
          </div>
        </div>

        {/* Quick presets & live banner pill */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-400" />
              Smog Hotspots:
            </span>
            {PRESET_CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => onSelectLocation(city)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                  currentLocationName.toLowerCase().includes(city.name.toLowerCase())
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {inversionDetected ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                Thermal Inversion Detected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                Atmospheric Mixing Normal
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
