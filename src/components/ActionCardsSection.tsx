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
        return "bg-rose-950/70 text-rose-300 border-rose-500/40";
      case "high":
        return "bg-amber-950/70 text-amber-300 border-amber-500/40";
      case "medium":
      default:
        return "bg-[#2F4A3F]/70 text-[#DCE7DF] border-[#94AE9F]/40";
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
        <div
          role="tablist"
          aria-label="Filter recommendations by pillar"
          className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#1C2E27]/70 border border-[#2F4A3F]/80 w-fit backdrop-blur-md"
        >
          {pillars.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={selectedPillar === tab.id}
              aria-controls="pillar-cards-grid"
              onClick={() => setSelectedPillar(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPillar === tab.id
                  ? "bg-[#2F4A3F] text-[#DCE7DF] border border-[#94AE9F]/60 shadow-[0_0_12px_rgba(148,174,159,0.18)]"
                  : "text-[#94AE9F] hover:text-[#DCE7DF] border border-transparent"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {source === "genai" ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-[#1C2E27] text-[#DCE7DF] border border-[#94AE9F]/50">
              <Sparkles className="h-3.5 w-3.5 text-[#94AE9F]" />
              GenAI Structured Engine
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-[#1C2E27] text-[#94AE9F] border border-[#2F4A3F]">
              <Shield className="h-3.5 w-3.5 text-[#94AE9F]" />
              Deterministic Rule Engine (Zero-Latency)
            </span>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-[#1C2E27]/40 animate-pulse border border-[#2F4A3F]/60"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-[#2F4A3F] bg-[#1C2E27]/30 p-8">
          <p className="text-sm text-[#94AE9F]">No actions found for this pillar filter.</p>
        </div>
      ) : (
        <div id="pillar-cards-grid" role="region" aria-label="Action cards" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#1C2E27]/60 backdrop-blur-md rounded-2xl border border-[#2F4A3F]/80 p-5 shadow-xl flex flex-col justify-between hover:border-[#94AE9F]/70 transition-all group"
            >
              <div>
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getPriorityStyle(
                        item.priority
                      )}`}
                    >
                      {item.priority} priority
                    </span>
                    <span className="text-[10px] font-semibold text-[#94AE9F] px-2.5 py-0.5 rounded-full bg-[#0F1A16]/60 border border-[#2F4A3F]/70">
                      {getPillarLabel(item.pillar)}
                    </span>
                  </div>

                  {item.timingWindow && (
                    <span className="text-[11px] text-[#94AE9F] font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[#94AE9F]" />
                      {item.timingWindow}
                    </span>
                  )}
                </div>

                {/* Title & Summary */}
                <h4 className="text-base font-bold text-[#DCE7DF] tracking-tight group-hover:text-white transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-[#94AE9F] mt-1.5 leading-relaxed">
                  {item.summary}
                </p>

                {/* Action Steps Checklist */}
                <div className="mt-4 space-y-2">
                  {item.actionSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-[#DCE7DF]/90"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[#94AE9F] shrink-0 mt-0.5" />
                      <span className="leading-snug">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Section: Direct Impact Metrics & Explainer Button */}
              <div className="mt-5 pt-4 border-t border-[#2F4A3F]/60 space-y-3">
                {/* Metric Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#0F1A16]/65 border border-[#2F4A3F]/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#557566] block">
                      Inhalation Cut
                    </span>
                    <span className="text-sm font-extrabold text-[#DCE7DF]">
                      -{item.impact.exposureReductionPercent}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0F1A16]/65 border border-[#2F4A3F]/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#557566] block">
                      PM2.5 Saved
                    </span>
                    <span className="text-sm font-extrabold text-emerald-300">
                      {item.impact.doseSavedUgPerDay} µg/day
                    </span>
                  </div>

                  {item.impact.co2SavedKgPerWeek > 0 ? (
                    <div className="p-2.5 rounded-xl bg-[#0F1A16]/65 border border-[#2F4A3F]/80 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#557566] block">
                        CO2 Avoided
                      </span>
                      <span className="text-sm font-extrabold text-[#94AE9F]">
                        {item.impact.co2SavedKgPerWeek} kg/wk
                      </span>
                    </div>
                  ) : item.impact.pm25EmissionsAvoidedKgPerWeek > 0 ? (
                    <div className="p-2.5 rounded-xl bg-[#0F1A16]/65 border border-[#2F4A3F]/80 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#557566] block">
                        Direct PM Avoided
                      </span>
                      <span className="text-sm font-extrabold text-amber-300">
                        {Math.round(item.impact.pm25EmissionsAvoidedKgPerWeek * 1000)} g/wk
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-[#0F1A16]/65 border border-[#2F4A3F]/80 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#557566] block">
                        Target Clean Air
                      </span>
                      <span className="text-sm font-semibold text-[#94AE9F]">
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
                    aria-expanded={expandedWhyId === item.id}
                    aria-controls={`why-science-${item.id}`}
                    className="text-[#94AE9F] hover:text-[#DCE7DF] flex items-center gap-1 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#94AE9F]/40 rounded-md px-1"
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
                    aria-label={`Open direct impact calculation breakdown for ${item.title}`}
                    className="text-[#DCE7DF] hover:text-white font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2F4A3F]/50 border border-[#94AE9F]/40 hover:border-[#94AE9F] transition-all focus:outline-none focus:ring-2 focus:ring-[#94AE9F]/40"
                  >
                    <Calculator className="h-3.5 w-3.5 text-[#94AE9F]" />
                    <span>Direct Impact Math</span>
                  </button>
                </div>

                {/* Expandable Why Science */}
                {expandedWhyId === item.id && (
                  <div
                    id={`why-science-${item.id}`}
                    role="region"
                    aria-label="Epidemiological and atmospheric rationale"
                    className="p-3.5 rounded-xl bg-[#0F1A16]/75 border border-[#2F4A3F] text-xs text-[#94AE9F] leading-relaxed animate-fadeIn"
                  >
                    <span className="font-bold text-[#DCE7DF] block mb-1">
                      Epidemiological &amp; Atmospheric Rationale:
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
