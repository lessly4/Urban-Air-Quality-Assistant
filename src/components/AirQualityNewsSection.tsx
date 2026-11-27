"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Newspaper,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Calendar,
  Globe,
  MapPin,
} from "lucide-react";
import { NewsArticle, NewsCategory, NewsResponse } from "@/types/airQuality";

interface AirQualityNewsSectionProps {
  locationName: string;
  countryName?: string;
}

const CATEGORY_FILTERS: { id: NewsCategory | "all"; label: string }[] = [
  { id: "all", label: "All Coverage" },
  { id: "AQI", label: "AQI & Alerts" },
  { id: "Pollution", label: "Urban Pollution" },
  { id: "Health", label: "Respiratory Health" },
  { id: "Policy", label: "Clean-Air Policy" },
];

function formatPublishedDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours >= 0 && diffHours < 24) {
      return diffHours === 0 ? "Just now" : `${diffHours}h ago`;
    }
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recent";
  }
}

function getCategoryStyle(category: NewsCategory): string {
  switch (category) {
    case "AQI":
      return "bg-amber-950/60 text-amber-300 border-amber-500/40";
    case "Health":
      return "bg-rose-950/60 text-rose-300 border-rose-500/40";
    case "Policy":
      return "bg-emerald-950/60 text-emerald-300 border-emerald-500/40";
    case "Pollution":
    default:
      return "bg-[#2F4A3F]/70 text-[#DCE7DF] border-[#94AE9F]/40";
  }
}

const EditorialNewsCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
  <article className="group bg-[#1C2E27]/60 backdrop-blur-md rounded-2xl border border-[#2F4A3F]/80 p-5 shadow-xl flex flex-col justify-between gap-4 hover:border-[#94AE9F]/70 transition-all">
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryStyle(
            article.category
          )}`}
        >
          {article.category}
        </span>

        <span className="text-[11px] text-[#557566] flex items-center gap-1">
          <Calendar className="h-3 w-3" aria-hidden="true" />
          {formatPublishedDate(article.publishedAt)}
        </span>
      </div>

      <h4 className="text-sm font-bold text-[#DCE7DF] leading-snug line-clamp-2 group-hover:text-white transition-colors">
        {article.title}
      </h4>

      <p className="text-xs text-[#94AE9F] leading-relaxed line-clamp-3">
        {article.description}
      </p>
    </div>

    <div className="pt-3.5 border-t border-[#2F4A3F]/60 flex items-center justify-between gap-2">
      <span className="text-[11px] font-semibold text-[#557566] truncate max-w-[58%]">
        {article.source}
      </span>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DCE7DF] hover:text-white px-2.5 py-1 rounded-lg bg-[#2F4A3F]/50 border border-[#94AE9F]/40 hover:border-[#94AE9F] transition-all shrink-0"
      >
        <span>Read Article</span>
        <ExternalLink className="h-3 w-3 text-[#94AE9F]" aria-hidden="true" />
      </a>
    </div>
  </article>
);

const NewsSkeletonGrid: React.FC<{ count?: number; label: string }> = ({
  count = 3,
  label,
}) => (
  <div aria-label={label} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="rounded-2xl bg-[#1C2E27]/40 border border-[#2F4A3F]/60 p-5 space-y-3 animate-pulse"
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 rounded-full bg-[#2F4A3F]/60" />
          <div className="h-3 w-20 rounded bg-[#2F4A3F]/50" />
        </div>
        <div className="h-4 w-full rounded bg-[#2F4A3F]/70" />
        <div className="h-4 w-4/5 rounded bg-[#2F4A3F]/70" />
        <div className="h-3 w-full rounded bg-[#2F4A3F]/50" />
        <div className="h-3 w-2/3 rounded bg-[#2F4A3F]/50" />
        <div className="pt-3 border-t border-[#2F4A3F]/50 flex justify-between items-center">
          <div className="h-3 w-24 rounded bg-[#2F4A3F]/50" />
          <div className="h-6 w-24 rounded-lg bg-[#2F4A3F]/60" />
        </div>
      </div>
    ))}
  </div>
);

export const AirQualityNewsSection: React.FC<AirQualityNewsSectionProps> = ({
  locationName,
  countryName,
}) => {
  const locationKey = `${locationName}|${countryName || ""}`;
  const [localNews, setLocalNews] = useState<NewsArticle[]>([]);
  const [globalNews, setGlobalNews] = useState<NewsArticle[]>([]);
  const [sourceLabel, setSourceLabel] = useState<string>("");
  const [fetchedKey, setFetchedKey] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | "all">("all");

  const isLoading = isRefreshing || fetchedKey !== locationKey;

  const loadNewsPayload = useCallback(async (city: string, country?: string) => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (country) params.set("country", country);

    const res = await fetch(`/api/news?${params.toString()}`);
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        errBody.error || `Failed to load air quality news (status ${res.status})`
      );
    }
    const data: NewsResponse = await res.json();
    return {
      localNews: data.localNews || [],
      globalNews: data.globalNews || [],
      sourceLabel:
        data.source === "rss_fallback"
          ? "Live RSS Feed"
          : data.source === "gnews"
          ? "GNews Live Wire"
          : "NewsAPI Live Wire",
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      const result = await loadNewsPayload(locationName, countryName);
      setLocalNews(result.localNews);
      setGlobalNews(result.globalNews);
      setSourceLabel(result.sourceLabel);
      setFetchedKey(locationKey);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Unable to connect to air quality news feed."
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [loadNewsPayload, locationName, countryName, locationKey]);

  useEffect(() => {
    let isCancelled = false;

    loadNewsPayload(locationName, countryName)
      .then((result) => {
        if (isCancelled) return;
        setLocalNews(result.localNews);
        setGlobalNews(result.globalNews);
        setSourceLabel(result.sourceLabel);
        setErrorMessage(null);
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Unable to connect to air quality news feed."
        );
      })
      .finally(() => {
        if (!isCancelled) {
          setFetchedKey(locationKey);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [loadNewsPayload, locationName, countryName, locationKey]);

  const filterByCategory = (items: NewsArticle[]) =>
    selectedCategory === "all"
      ? items
      : items.filter((a) => a.category === selectedCategory);

  const filteredLocal = filterByCategory(localNews);
  const filteredGlobal = filterByCategory(globalNews);

  return (
    <div className="space-y-6">
      {/* Section Header & Controls */}
      <div className="bg-[#1C2E27]/60 backdrop-blur-md rounded-2xl border border-[#2F4A3F]/80 p-5 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Newspaper className="h-5 w-5 text-[#94AE9F]" aria-hidden="true" />
            <h2 className="text-lg font-bold text-[#DCE7DF] tracking-tight">
              Local &amp; Global Air Quality Dispatch
            </h2>
            {sourceLabel && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0F1A16]/70 text-[#94AE9F] border border-[#2F4A3F]">
                <Globe className="h-3 w-3" aria-hidden="true" />
                {sourceLabel}
              </span>
            )}
          </div>
          <p className="text-xs text-[#94AE9F]/80 mt-1">
            Regional alerts for <strong className="text-[#DCE7DF]">{locationName}</strong> alongside global urban smog &amp; clean-air reporting
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="Filter air quality news by topic"
            className="flex flex-wrap items-center gap-1.5"
          >
            {CATEGORY_FILTERS.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all focus:outline-none focus:ring-2 focus:ring-[#94AE9F]/40 ${
                    active
                      ? "bg-[#2F4A3F]/70 text-[#DCE7DF] border-[#94AE9F] shadow-[0_0_12px_rgba(148,174,159,0.2)]"
                      : "bg-[#0F1A16]/50 text-[#94AE9F] border-[#2F4A3F] hover:border-[#557566] hover:text-[#DCE7DF]"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            aria-label="Refresh air quality news"
            className="px-3 py-1.5 rounded-full border border-[#2F4A3F] bg-[#0F1A16]/70 text-[#DCE7DF] hover:border-[#94AE9F] text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#94AE9F]/40"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-[#94AE9F] ${isLoading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {errorMessage && (
        <div
          role="alert"
          className="p-5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-500 transition-colors self-start sm:self-center"
          >
            Retry
          </button>
        </div>
      )}

      {/* 1. Local Air Quality News Section */}
      <section aria-labelledby="local-news-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#94AE9F]" aria-hidden="true" />
            <h3 id="local-news-heading" className="text-base font-bold text-[#DCE7DF]">
              Local Air Quality News — {locationName}
            </h3>
          </div>
          {!isLoading && (
            <span className="text-[11px] font-medium text-[#557566]">
              {filteredLocal.length} {filteredLocal.length === 1 ? "story" : "stories"}
            </span>
          )}
        </div>

        {isLoading ? (
          <NewsSkeletonGrid count={3} label={`Loading local air quality news for ${locationName}`} />
        ) : !errorMessage && filteredLocal.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-[#2F4A3F] bg-[#1C2E27]/30 p-6 space-y-2">
            <p className="text-sm font-medium text-[#DCE7DF]">
              No recent local air quality news found for {locationName}.
            </p>
            {selectedCategory !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="text-xs px-3 py-1 rounded-full bg-[#2F4A3F]/60 border border-[#94AE9F]/40 text-[#DCE7DF] hover:border-[#94AE9F] transition-all"
              >
                Show All Topics
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLocal.map((article) => (
              <EditorialNewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="border-t border-[#2F4A3F]/60" aria-hidden="true" />

      {/* 2. Global Air Quality News Section */}
      <section aria-labelledby="global-news-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#94AE9F]" aria-hidden="true" />
            <h3 id="global-news-heading" className="text-base font-bold text-[#DCE7DF]">
              Global Air Quality News
            </h3>
          </div>
          {!isLoading && (
            <span className="text-[11px] font-medium text-[#557566]">
              {filteredGlobal.length} {filteredGlobal.length === 1 ? "story" : "stories"}
            </span>
          )}
        </div>

        {isLoading ? (
          <NewsSkeletonGrid count={6} label="Loading global air quality news" />
        ) : !errorMessage && filteredGlobal.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-[#2F4A3F] bg-[#1C2E27]/30 p-6 space-y-2">
            <p className="text-sm font-medium text-[#DCE7DF]">
              No global air quality news articles found for this filter.
            </p>
            {selectedCategory !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="text-xs px-3 py-1 rounded-full bg-[#2F4A3F]/60 border border-[#94AE9F]/40 text-[#DCE7DF] hover:border-[#94AE9F] transition-all"
              >
                Show All Coverage
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGlobal.map((article) => (
              <EditorialNewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
