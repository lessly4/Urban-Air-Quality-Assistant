"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Shield,
  Clock,
  Calculator,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Layers,
  Leaf,
  Home,
  Compass,
} from "lucide-react";
import {
  RecommendationItem,
  PillarType,
  ImpactMetrics,
} from "@/types/airQuality";
import { ImpactMathModal } from "./ImpactMathModal";

interface ActionCardsSectionProps {
  recommendations: RecommendationItem[];
  isLoading: boolean;
  source?: "genai" | "deterministic_rules";
}

export const ActionCardsSection: React.FC<ActionCardsSectionProps> = ({
  recommendations,
  isLoading,
  source,
}) => {
  const [selectedPillar, setSelectedPillar] = useState<PillarType | "all">("all");
  const [activeModalMetric, setActiveModalMetric] = useState<{
    metrics: ImpactMetrics;
    title: string;
  } | null>(null);
  const [expandedWhyId, setExpandedWhyId] = useState<string | null>(null);

  const pillars: { id: PillarType | "all"; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "All Recommendations", icon: <Layers className="h-4 w-4" /> },
    {
      id: "daily_routines",
      label: "1. Low-Emission Routines",
      icon: <Compass className="h-4 w-4" />,
    },
    {
      id: "indoor_air_quality",
      label: "2. Indoor Air Hacks",
      icon: <Home className="h-4 w-4" />,
    },
    {
      id: "community_alternatives",
      label: "3. Community Alternatives",
      icon: <Leaf className="h-4 w-4" />,
    },
  ];

  const filtered =
    selectedPillar === "all"
      ? recommendations
      : recommendations.filter((r) => r.pillar === selectedPillar);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800";
      case "high":
        return "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800";
      case "medium":
      default:
        return "bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800";
    }
  };

  const getPillarLabel = (pillar: PillarType) => {
    switch (pillar) {
      case "daily_routines":
        return "Daily Routines";
      case "indoor_air_quality":
        return "Indoor Air Quality";
      case "community_alternatives":
        return "Community Action";
    }
  };

  return (
    <div className="space-y-5">
      {/* Pillar Tabs & Generator Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 w-fit">
          {pillars.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedPillar(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPillar === tab.id
                  ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {source === "genai" ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              GenAI Structured Engine
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <Shield className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              Deterministic Rule Engine (Zero-Latency)
            </span>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <p className="text-sm text-slate-500">No actions found for this pillar filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between hover:border-teal-500/50 transition-all group"
            >
              <div>
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityStyle(
                        item.priority
                      )}`}
                    >
                      {item.priority} priority
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                      {getPillarLabel(item.pillar)}
                    </span>
                  </div>

                  {item.timingWindow && (
                    <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.timingWindow}
                    </span>
                  )}
                </div>

                {/* Title & Summary */}
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-50 tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {item.summary}
                </p>

                {/* Action Steps Checklist */}
                <div className="mt-4 space-y-2">
                  {item.actionSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Section: Direct Impact Metrics & Explainer Button */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {/* Metric Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 block">
                      Inhalation Cut
                    </span>
                    <span className="text-sm font-extrabold text-teal-700 dark:text-teal-300">
                      -{item.impact.exposureReductionPercent}%
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      PM2.5 Saved
                    </span>
                    <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                      {item.impact.doseSavedUgPerDay} µg/day
                    </span>
                  </div>

                  {item.impact.co2SavedKgPerWeek > 0 ? (
                    <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 block">
                        CO2 Avoided
                      </span>
                      <span className="text-sm font-extrabold text-sky-700 dark:text-sky-300">
                        {item.impact.co2SavedKgPerWeek} kg/wk
                      </span>
                    </div>
                  ) : item.impact.pm25EmissionsAvoidedKgPerWeek > 0 ? (
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                        Direct PM Avoided
                      </span>
                      <span className="text-sm font-extrabold text-amber-700 dark:text-amber-300">
                        {Math.round(item.impact.pm25EmissionsAvoidedKgPerWeek * 1000)} g/wk
                      </span>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Target Clean Air
                      </span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Sanctuary Zone
                      </span>
                    </div>
                  )}
                </div>

                {/* Evidence why toggle & Math link */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() =>
                      setExpandedWhyId(expandedWhyId === item.id ? null : item.id)
                    }
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-medium transition-colors"
                  >
                    <span>{expandedWhyId === item.id ? "Hide Science" : "Why This Works"}</span>
                    {expandedWhyId === item.id ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() =>
                      setActiveModalMetric({ metrics: item.impact, title: item.title })
                    }
                    className="text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Calculator className="h-3.5 w-3.5" />
                    <span>Direct Impact Math</span>
                  </button>
                </div>

                {/* Expandable Why Science */}
                {expandedWhyId === item.id && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 leading-relaxed animate-fadeIn">
                    <span className="font-bold text-slate-900 dark:text-slate-200 block mb-1">
                      Epidemiological & Atmospheric Rationale:
                    </span>
                    {item.evidenceWhy}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Direct Impact Math Modal */}
      {activeModalMetric && (
        <ImpactMathModal
          isOpen={!!activeModalMetric}
          onClose={() => setActiveModalMetric(null)}
          impactMetrics={activeModalMetric.metrics}
          actionTitle={activeModalMetric.title}
        />
      )}
    </div>
  );
};
