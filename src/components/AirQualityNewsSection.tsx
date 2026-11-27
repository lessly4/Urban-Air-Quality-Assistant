"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Newspaper,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Wind,
  Calendar,
  Globe,
} from "lucide-react";
import { NewsArticle, NewsCategory, NewsResponse } from "@/types/airQuality";

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

const ArticleThumbnail: React.FC<{
  imageUrl: string | null;
  title: string;
  category: NewsCategory;
}> = ({ imageUrl, title, category }) => {
  const [hasError, setHasError] = useState(false);

  if (!imageUrl || hasError) {
    return (
      <div className="h-36 w-full bg-gradient-to-br from-[#0F1A16] via-[#1C2E27] to-[#2F4A3F]/80 border-b border-[#2F4A3F]/70 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
        <div className="h-10 w-10 rounded-xl bg-[#2F4A3F]/60 border border-[#94AE9F]/30 flex items-center justify-center text-[#94AE9F]">
          <Wind className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#557566]">
          Global {category} Dispatch
        </span>
      </div>
    );
  }

  return (
    <div className="h-36 w-full overflow-hidden border-b border-[#2F4A3F]/70 bg-[#0F1A16]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={title}
        loading="lazy"
        onError={() => setHasError(true)}
        className="h-full w-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
      />
    </div>
  );
};

export const AirQualityNewsSection: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [sourceLabel, setSourceLabel] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | "all">("all");

  const loadNewsPayload = useCallback(async () => {
    const res = await fetch("/api/news");
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        errBody.error || `Failed to load air quality news (status ${res.status})`
      );
    }
    const data: NewsResponse = await res.json();
    return {
      articles: data.articles || [],
      sourceLabel:
        data.source === "rss_fallback"
          ? "Live Global RSS Feed"
          : data.source === "gnews"
          ? "GNews Live Wire"
          : "NewsAPI Live Wire",
    };
  }, []);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await loadNewsPayload();
      setArticles(result.articles);
      setSourceLabel(result.sourceLabel);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Unable to connect to global air quality news feed."
      );
    } finally {
      setIsLoading(false);
    }
  }, [loadNewsPayload]);

  useEffect(() => {
    let isCancelled = false;

    loadNewsPayload()
      .then((result) => {
        if (isCancelled) return;
        setArticles(result.articles);
        setSourceLabel(result.sourceLabel);
        setErrorMessage(null);
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Unable to connect to global air quality news feed."
        );
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [loadNewsPayload]);

  const filteredArticles =
    selectedCategory === "all"
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  const getCategoryStyle = (category: NewsCategory) => {
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
  };

  return (
    <div className="space-y-5">
      {/* Section Header & Controls */}
      <div className="bg-[#1C2E27]/60 backdrop-blur-md rounded-2xl border border-[#2F4A3F]/80 p-5 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Newspaper className="h-5 w-5 text-[#94AE9F]" aria-hidden="true" />
            <h2 className="text-lg font-bold text-[#DCE7DF] tracking-tight">
              Global Air Quality &amp; Clean-Air Dispatch
            </h2>
            {sourceLabel && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0F1A16]/70 text-[#94AE9F] border border-[#2F4A3F]">
                <Globe className="h-3 w-3" aria-hidden="true" />
                {sourceLabel}
              </span>
            )}
          </div>
          <p className="text-xs text-[#94AE9F]/80 mt-1">
            Live international coverage on urban smog events, respiratory research, and municipal clean-air policies
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Topic Filter Pills */}
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
            onClick={fetchNews}
            disabled={isLoading}
            aria-label="Refresh global air quality news"
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
            onClick={fetchNews}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-500 transition-colors self-start sm:self-center"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div
          aria-label="Loading air quality news"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="rounded-2xl bg-[#1C2E27]/40 border border-[#2F4A3F]/60 overflow-hidden animate-pulse"
            >
              <div className="h-36 w-full bg-[#2F4A3F]/40" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-24 rounded bg-[#2F4A3F]/60" />
                <div className="h-4 w-full rounded bg-[#2F4A3F]/70" />
                <div className="h-4 w-3/4 rounded bg-[#2F4A3F]/70" />
                <div className="h-3 w-full rounded bg-[#2F4A3F]/50" />
              </div>
            </div>
          ))}
        </div>
      ) : !errorMessage && filteredArticles.length === 0 ? (
        /* Empty State */
        <div className="text-center py-14 rounded-2xl border border-dashed border-[#2F4A3F] bg-[#1C2E27]/30 p-8 space-y-3">
          <Newspaper className="h-8 w-8 text-[#557566] mx-auto" aria-hidden="true" />
          <p className="text-sm font-medium text-[#DCE7DF]">
            No air quality news articles found for this filter.
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className="text-xs px-3.5 py-1.5 rounded-full bg-[#2F4A3F]/60 border border-[#94AE9F]/40 text-[#DCE7DF] hover:border-[#94AE9F] transition-all"
          >
            Show All Coverage
          </button>
        </div>
      ) : (
        /* Responsive News Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="group bg-[#1C2E27]/60 backdrop-blur-md rounded-2xl border border-[#2F4A3F]/80 overflow-hidden shadow-xl flex flex-col justify-between hover:border-[#94AE9F]/70 transition-all"
            >
              <div>
                <ArticleThumbnail
                  imageUrl={article.imageUrl}
                  title={article.title}
                  category={article.category}
                />

                <div className="p-5 space-y-2.5">
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

                  <h3 className="text-sm font-bold text-[#DCE7DF] leading-snug line-clamp-2 group-hover:text-white transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-xs text-[#94AE9F] leading-relaxed line-clamp-3">
                    {article.description}
                  </p>
                </div>
              </div>

              <div className="px-5 py-3.5 border-t border-[#2F4A3F]/60 bg-[#0F1A16]/40 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-[#557566] truncate max-w-[60%]">
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
          ))}
        </div>
      )}
    </div>
  );
};
