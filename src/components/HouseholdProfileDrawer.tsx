"use client";

import React from "react";
import {
  Users,
  Flame,
  Shield,
  Car,
  Home,
  Check,
  SlidersHorizontal,
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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Household & Lifestyle Profile
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personalizes the GenAI action engine & calculates exact inhalation exposure math
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400">Presets:</span>
          <button
            onClick={() => applyPreset("vulnerable_family")}
            className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300 font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            Family + Asthma
          </button>
          <button
            onClick={() => applyPreset("commuter_kerosene")}
            className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300 font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            Commuter + Solid Fuel
          </button>
          <button
            onClick={() => applyPreset("clean_apartment")}
            className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300 font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            Electrified + HEPA
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-6">
        {/* 1. Vulnerabilities */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
            <Users className="h-3.5 w-3.5 text-teal-600" />
            Vulnerable Household Members
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[
              { id: "children", label: "Children (<5 yrs)", desc: "Higher ventilation rate" },
              { id: "elderly", label: "Elderly (65+)", desc: "Vascular vulnerability" },
              { id: "asthma_respiratory", label: "Asthma / Bronchitis", desc: "Airway inflammation" },
              { id: "cardiovascular", label: "Heart / Blood Pressure", desc: "Oxidative stress" },
              { id: "pregnant", label: "Pregnancy", desc: "Maternal-fetal barrier" },
            ].map((item) => {
              const active = profile.vulnerabilities.includes(item.id as VulnerabilityType);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleVulnerability(item.id as VulnerabilityType)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    active
                      ? "border-teal-500 bg-teal-50/80 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold">{item.label}</span>
                    {active && <Check className="h-3.5 w-3.5 text-teal-600 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Commute & Daily Mobility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Car className="h-3.5 w-3.5 text-teal-600" />
              Primary Commute Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: "walk_cycle", label: "Walk / Cycle", desc: "Highest inhalation" },
                { id: "two_wheeler_open", label: "Scooter / Motorbike", desc: "Unshielded exhaust" },
                { id: "public_transit", label: "Bus / Metro Rail", desc: "Low carbon transit" },
                { id: "car_windows_shut", label: "Car (AC recirculate)", desc: "Filtered cabin" },
                { id: "work_from_home", label: "Work from Home", desc: "Zero commute" },
              ].map((m) => {
                const active = profile.commuteMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onChange({ ...profile, commuteMode: m.id as CommuteMode })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      active
                        ? "border-teal-500 bg-teal-50/80 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold">{m.label}</span>
                      {active && <Check className="h-3.5 w-3.5 text-teal-600 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                      {m.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Indoor Air Filtration Setup */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Shield className="h-3.5 w-3.5 text-teal-600" />
              Indoor Air Purifier Setup
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "none", label: "None / Windows Only", desc: "High particle infiltration" },
                { id: "diy_corsirosenthal", label: "DIY Corsi-Rosenthal", desc: "Ultra high CADR fan box" },
                { id: "single_hepa", label: "Single-Room HEPA", desc: "Sanctuary bedroom clean" },
                { id: "whole_home_hepa", label: "Whole-Home HEPA", desc: "90%+ particle reduction" },
              ].map((p) => {
                const active = profile.homePurifierSetup === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onChange({ ...profile, homePurifierSetup: p.id as HomePurifierSetup })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      active
                        ? "border-teal-500 bg-teal-50/80 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold">{p.label}</span>
                      {active && <Check className="h-3.5 w-3.5 text-teal-600 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Energy & Fuels (Heating & Cooking) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Flame className="h-3.5 w-3.5 text-teal-600" />
              Space Heating Fuel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: "electric_heatpump", label: "Heat Pump / AC", desc: "Zero combustion" },
                { id: "lpg_piped_gas", label: "Piped Gas / Boiler", desc: "Low soot, medium CO2" },
                { id: "biomass_wood_coal", label: "Wood / Coal Stove", desc: "Severe indoor PM2.5" },
                { id: "kerosene", label: "Kerosene Heater", desc: "Toxic VOCs & soot" },
                { id: "district_central", label: "District Heating", desc: "Centralized plant" },
              ].map((f) => {
                const active = profile.heatingFuel === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => onChange({ ...profile, heatingFuel: f.id as HeatingFuel })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      active
                        ? "border-teal-500 bg-teal-50/80 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold">{f.label}</span>
                      {active && <Check className="h-3.5 w-3.5 text-teal-600 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                      {f.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Home className="h-3.5 w-3.5 text-teal-600" />
              Cooking Fuel & Stovetop
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {[
                { id: "electric_induction", label: "Electric Induction", desc: "Cleanest indoor air" },
                { id: "lpg_piped_gas", label: "LPG / Piped Gas", desc: "NO2 release during flame" },
                { id: "biomass_wood_coal", label: "Firewood / Biomass", desc: "Extremely high aerosol" },
                { id: "kerosene", label: "Kerosene Stove", desc: "Strong odor and soot" },
              ].map((c) => {
                const active = profile.cookingFuel === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => onChange({ ...profile, cookingFuel: c.id as CookingFuel })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      active
                        ? "border-teal-500 bg-teal-50/80 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold">{c.label}</span>
                      {active && <Check className="h-3.5 w-3.5 text-teal-600 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                      {c.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
