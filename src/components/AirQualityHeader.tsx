"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, RefreshCw, Wind, AlertTriangle, ShieldCheck, X } from "lucide-react";
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
    <header className="border-b border-[#2F4A3F]/80 bg-[#0F1A16]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#2F4A3F] to-[#557566] border border-[#94AE9F]/40 flex items-center justify-center text-[#DCE7DF] shadow-[0_0_18px_rgba(148,174,159,0.2)]">
              <Wind className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-[#DCE7DF] tracking-tight">
                  Urban Air Quality Assistant
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1C2E27] text-[#94AE9F] border border-[#2F4A3F]">
                  Winter Smog &amp; Inversion
                </span>
              </div>
              <p className="text-xs text-[#94AE9F]/80">
                Deterministic impact math &amp; hyper-local GenAI guidance
              </p>
            </div>
          </div>

          {/* Search bar & Refresh */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-80" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#557566]" aria-hidden="true" />
                <input
                  type="text"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={isOpen && results.length > 0}
                  aria-controls="city-suggestions-listbox"
                  placeholder="Search city or neighborhood..."
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val.trim().length < 2) {
                      setResults([]);
                      setIsSearching(false);
                    }
                  }}
                  onFocus={() => results.length > 0 && setIsOpen(true)}
                  className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-[#2F4A3F] bg-[#1C2E27]/70 text-[#DCE7DF] placeholder-[#557566] focus:outline-none focus:border-[#94AE9F] focus:ring-2 focus:ring-[#94AE9F]/30 transition-all shadow-inner"
                  aria-label="Search city location"
                />
                {searchQuery && !isSearching && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setResults([]);
                      setIsOpen(false);
                    }}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#557566] hover:text-[#DCE7DF] transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <RefreshCw className="h-3.5 w-3.5 text-[#94AE9F] animate-spin" aria-hidden="true" />
                  </div>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {isOpen && results.length > 0 && (
                <div
                  id="city-suggestions-listbox"
                  role="listbox"
                  aria-label="Matching locations"
                  className="absolute top-full left-0 right-0 mt-1.5 bg-[#1C2E27]/95 backdrop-blur-xl rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.55)] border border-[#2F4A3F] py-1.5 z-50 max-h-64 overflow-y-auto"
                >
                  <div className="px-3 py-1 text-[10px] font-semibold text-[#557566] uppercase tracking-wider" aria-hidden="true">
                    Matching Locations
                  </div>
                  {results.map((item, idx) => (
                    <button
                      key={`${item.latitude}-${item.longitude}-${idx}`}
                      role="option"
                      aria-selected={false}
                      onClick={() => handleSelect(item)}
                      className="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-[#2F4A3F]/60 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#94AE9F] group-hover:text-[#DCE7DF] group-hover:scale-110 transition-all" />
                        <div>
                          <span className="font-medium text-[#DCE7DF]">
                            {item.name}
                          </span>
                          {item.admin1 && (
                            <span className="text-xs text-[#94AE9F]/70 ml-1.5">
                              ({item.admin1})
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-[#557566] group-hover:text-[#94AE9F]">
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
              className="px-3.5 py-2 rounded-xl border border-[#2F4A3F] bg-[#1C2E27]/70 text-[#DCE7DF] hover:border-[#94AE9F] hover:bg-[#2F4A3F]/50 text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#94AE9F]/40"
              title="Refresh live data"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#94AE9F] ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Updated {formattedTime}</span>
            </button>
          </div>
        </div>

        {/* Quick presets & live banner pill */}
        <div className="mt-3 pt-2.5 border-t border-[#2F4A3F]/50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[#557566] mr-1 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#94AE9F]" />
              Hotspots:
            </span>
            {PRESET_CITIES.map((city) => {
              const isActive = currentLocationName.toLowerCase().includes(city.name.toLowerCase());
              return (
                <button
                  key={city.name}
                  onClick={() => onSelectLocation(city)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all border ${
                    isActive
                      ? "bg-[#2F4A3F]/70 text-[#DCE7DF] border-[#94AE9F] shadow-[0_0_12px_rgba(148,174,159,0.22)]"
                      : "bg-[#1C2E27]/60 text-[#94AE9F] border-[#2F4A3F]/80 hover:border-[#557566] hover:text-[#DCE7DF]"
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {inversionDetected ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/40 shadow-[0_0_14px_rgba(245,158,11,0.18)]">
                <AlertTriangle className="h-3 w-3 text-amber-400" />
                Thermal Inversion Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#1C2E27] text-[#94AE9F] border border-[#2F4A3F]">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                Atmospheric Mixing Normal
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
