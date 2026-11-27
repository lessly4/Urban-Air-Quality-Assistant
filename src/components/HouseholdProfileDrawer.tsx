"use client";

import React from "react";
import {
  Users,
  Flame,
  Shield,
  Car,
  Utensils,
  SlidersHorizontal,
  HeartPulse,
  Baby,
  Wind,
  Train,
  Footprints,
  Laptop,
  Zap,
  Sparkles,
} from "lucide-react";
import {
  HouseholdProfile,
  VulnerabilityType,
  CommuteMode,
  HeatingFuel,
  CookingFuel,
  HomePurifierSetup,
} from "@/types/airQuality";

interface HouseholdProfileDrawerProps {
  profile: HouseholdProfile;
  onChange: (updated: HouseholdProfile) => void;
}

export const HouseholdProfileDrawer: React.FC<HouseholdProfileDrawerProps> = ({
  profile,
  onChange,
}) => {
  const toggleVulnerability = (vuln: VulnerabilityType) => {
    const exists = profile.vulnerabilities.includes(vuln);
    const updated = exists
      ? profile.vulnerabilities.filter((v) => v !== vuln)
      : [...profile.vulnerabilities, vuln];
    onChange({ ...profile, vulnerabilities: updated });
  };

  const isStandardSensitivity = profile.vulnerabilities.length === 0;

  const applyPreset = (presetKey: string) => {
    if (presetKey === "vulnerable_family") {
      onChange({
        vulnerabilities: ["children", "asthma_respiratory"],
        commuteMode: "two_wheeler_open",
        heatingFuel: "biomass_wood_coal",
        cookingFuel: "lpg_piped_gas",
        homePurifierSetup: "none",
        ventilationHabit: "morning_airing",
        commuteDistanceKm: 12,
        roomSizeM2: 30,
      });
    } else if (presetKey === "clean_apartment") {
      onChange({
        vulnerabilities: ["elderly"],
        commuteMode: "public_transit",
        heatingFuel: "electric_heatpump",
        cookingFuel: "electric_induction",
        homePurifierSetup: "single_hepa",
        ventilationHabit: "sealed_ac_purifier",
        commuteDistanceKm: 15,
        roomSizeM2: 45,
      });
    } else if (presetKey === "commuter_kerosene") {
      onChange({
        vulnerabilities: ["cardiovascular"],
        commuteMode: "car_windows_shut",
        heatingFuel: "kerosene",
        cookingFuel: "biomass_wood_coal",
        homePurifierSetup: "none",
        ventilationHabit: "windows_open_always",
        commuteDistanceKm: 20,
        roomSizeM2: 25,
      });
    }
  };

  const pillBase =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#94AE9F]/40";
  const pillActive =
    "border-[#94AE9F] bg-[#2F4A3F]/60 text-[#DCE7DF] shadow-[0_0_12px_rgba(148,174,159,0.2)]";
  const pillInactive =
    "border-[#2F4A3F]/80 bg-[#0F1A16]/45 text-[#94AE9F] hover:border-[#557566] hover:text-[#DCE7DF]";

  return (
    <section
      aria-label="Personalization and Household Profile"
      className="bg-[#1C2E27]/60 backdrop-blur-md rounded-2xl border border-[#2F4A3F]/80 shadow-xl overflow-hidden"
    >
      {/* Compact Header Bar */}
      <div className="px-5 py-4 border-b border-[#2F4A3F]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#2F4A3F]/70 border border-[#94AE9F]/30 flex items-center justify-center text-[#94AE9F] shrink-0">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#DCE7DF] tracking-tight">
              Personalization &amp; Household Profile
            </h3>
            <p className="text-[11px] text-[#94AE9F]/80">
              Unified control panel driving deterministic dose math &amp; tailored guidance
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-[#557566] mr-1">Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset("vulnerable_family")}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#0F1A16]/60 border border-[#2F4A3F] text-[#94AE9F] hover:border-[#94AE9F] hover:text-[#DCE7DF] font-medium transition-all"
          >
            Family + Asthma
          </button>
          <button
            type="button"
            onClick={() => applyPreset("commuter_kerosene")}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#0F1A16]/60 border border-[#2F4A3F] text-[#94AE9F] hover:border-[#94AE9F] hover:text-[#DCE7DF] font-medium transition-all"
          >
            Commuter + Solid Fuel
          </button>
          <button
            type="button"
            onClick={() => applyPreset("clean_apartment")}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#0F1A16]/60 border border-[#2F4A3F] text-[#94AE9F] hover:border-[#94AE9F] hover:text-[#DCE7DF] font-medium transition-all"
          >
            Electrified + HEPA
          </button>
        </div>
      </div>

      {/* Unified Report-Style Rows */}
      <div className="divide-y divide-[#2F4A3F]/60">
        {/* Row 1: Sensitivity */}
        <div className="px-5 py-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 md:items-center">
          <div className="md:col-span-3 flex items-center gap-2 text-xs font-semibold text-[#DCE7DF]">
            <Users className="h-4 w-4 text-[#94AE9F] shrink-0" aria-hidden="true" />
            <span>Household Sensitivity</span>
          </div>
          <div className="md:col-span-9 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...profile, vulnerabilities: [] })}
              aria-pressed={isStandardSensitivity}
              className={`${pillBase} ${isStandardSensitivity ? pillActive : pillInactive}`}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Standard</span>
            </button>
            {[
              { id: "children" as VulnerabilityType, label: "Children (<5 yrs)", icon: <Baby className="h-3.5 w-3.5" /> },
              { id: "elderly" as VulnerabilityType, label: "Elderly (65+)", icon: <Users className="h-3.5 w-3.5" /> },
              { id: "asthma_respiratory" as VulnerabilityType, label: "Asthma / Respiratory", icon: <Wind className="h-3.5 w-3.5" /> },
              { id: "cardiovascular" as VulnerabilityType, label: "Cardiovascular", icon: <HeartPulse className="h-3.5 w-3.5" /> },
              { id: "pregnant" as VulnerabilityType, label: "Pregnancy", icon: <Shield className="h-3.5 w-3.5" /> },
            ].map((item) => {
              const active = profile.vulnerabilities.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleVulnerability(item.id)}
                  aria-pressed={active}
                  className={`${pillBase} ${active ? pillActive : pillInactive}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Commute & HEPA Purifier */}
        <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-[#2F4A3F]/60">
          <div className="px-5 py-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#DCE7DF]">
              <Car className="h-4 w-4 text-[#94AE9F] shrink-0" aria-hidden="true" />
              <span>Primary Commute Mode</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "car_windows_shut" as CommuteMode, label: "Car (AC)", icon: <Car className="h-3.5 w-3.5" /> },
                { id: "two_wheeler_open" as CommuteMode, label: "Motorbike / Scooter", icon: <Wind className="h-3.5 w-3.5" /> },
                { id: "public_transit" as CommuteMode, label: "Public Transit", icon: <Train className="h-3.5 w-3.5" /> },
                { id: "walk_cycle" as CommuteMode, label: "Walk / Cycle", icon: <Footprints className="h-3.5 w-3.5" /> },
                { id: "work_from_home" as CommuteMode, label: "Work From Home", icon: <Laptop className="h-3.5 w-3.5" /> },
              ].map((m) => {
                const active = profile.commuteMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onChange({ ...profile, commuteMode: m.id })}
                    aria-pressed={active}
                    className={`${pillBase} ${active ? pillActive : pillInactive}`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-5 py-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#DCE7DF]">
              <Shield className="h-4 w-4 text-[#94AE9F] shrink-0" aria-hidden="true" />
              <span>HEPA Air Purifier Setup</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "none" as HomePurifierSetup, label: "None" },
                { id: "diy_corsirosenthal" as HomePurifierSetup, label: "DIY Corsi-Rosenthal" },
                { id: "single_hepa" as HomePurifierSetup, label: "Active HEPA (Room)" },
                { id: "whole_home_hepa" as HomePurifierSetup, label: "Whole-Home HEPA" },
              ].map((p) => {
                const active = profile.homePurifierSetup === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onChange({ ...profile, homePurifierSetup: p.id })}
                    aria-pressed={active}
                    className={`${pillBase} ${active ? pillActive : pillInactive}`}
                  >
                    <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Space Heating & Cooking Fuel */}
        <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-[#2F4A3F]/60">
          <div className="px-5 py-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#DCE7DF]">
              <Flame className="h-4 w-4 text-[#94AE9F] shrink-0" aria-hidden="true" />
              <span>Space Heating Fuel</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "electric_heatpump" as HeatingFuel, label: "Electric / Heat Pump", icon: <Zap className="h-3.5 w-3.5" /> },
                { id: "lpg_piped_gas" as HeatingFuel, label: "Natural Gas / LPG", icon: <Flame className="h-3.5 w-3.5" /> },
                { id: "biomass_wood_coal" as HeatingFuel, label: "Wood / Solid Fuel", icon: <Flame className="h-3.5 w-3.5" /> },
                { id: "kerosene" as HeatingFuel, label: "Kerosene", icon: <Flame className="h-3.5 w-3.5" /> },
                { id: "district_central" as HeatingFuel, label: "District Heat", icon: <Zap className="h-3.5 w-3.5" /> },
              ].map((f) => {
                const active = profile.heatingFuel === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onChange({ ...profile, heatingFuel: f.id })}
                    aria-pressed={active}
                    className={`${pillBase} ${active ? pillActive : pillInactive}`}
                  >
                    {f.icon}
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-5 py-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#DCE7DF]">
              <Utensils className="h-4 w-4 text-[#94AE9F] shrink-0" aria-hidden="true" />
              <span>Cooking Stovetop Fuel</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "electric_induction" as CookingFuel, label: "Electric / Induction", icon: <Zap className="h-3.5 w-3.5" /> },
                { id: "lpg_piped_gas" as CookingFuel, label: "Natural Gas / LPG", icon: <Flame className="h-3.5 w-3.5" /> },
                { id: "biomass_wood_coal" as CookingFuel, label: "Wood / Solid Fuel", icon: <Flame className="h-3.5 w-3.5" /> },
                { id: "kerosene" as CookingFuel, label: "Kerosene Stove", icon: <Flame className="h-3.5 w-3.5" /> },
              ].map((c) => {
                const active = profile.cookingFuel === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onChange({ ...profile, cookingFuel: c.id })}
                    aria-pressed={active}
                    className={`${pillBase} ${active ? pillActive : pillInactive}`}
                  >
                    {c.icon}
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
