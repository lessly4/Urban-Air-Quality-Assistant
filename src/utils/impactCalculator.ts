import {
  CurrentAirQuality,
  HourlyAirQuality,
  HouseholdProfile,
  ImpactMetrics,
  RecommendationItem,
  CommunityAggregatedImpact,
} from "../types/airQuality";

/**
 * Baseline inhalation rates (m3/hour) based on EPA Exposure Factors Handbook
 */
export const INHALATION_RATES = {
  restingIndoorAdult: 0.55,
  restingIndoorChild: 0.38,
  commuteWalking: 1.25,
  commuteCycling: 2.1,
  commuteMotorbike: 0.9,
  commuteTransit: 0.65,
  commuteCarCabin: 0.55,
} as const;

/**
 * Building penetration / infiltration factors (indoor PM2.5 concentration / outdoor PM2.5)
 */
export const INFILTRATION_FACTORS = {
  unpurifiedNatural: 0.78, // Windows occasionally opened / standard leaks
  unpurifiedClosed: 0.55, // Windows tightly closed
  diyCorsiRosenthal: 0.25, // 75% indoor particle filtration
  singleHepaUnit: 0.15, // 85% indoor particle filtration in target room
  wholeHomeHepa: 0.08, // 92% whole envelope filtration
} as const;

/**
 * Filter protection efficiency (fraction of inhaled particles removed)
 */
export const MASK_EFFICIENCY = {
  none: 0.0,
  clothSurgical: 0.35,
  n95Ffp2Certified: 0.95,
} as const;

/**
 * Emission factors based on IPCC & US EPA guidelines
 */
export const EMISSION_FACTORS = {
  // Transport (kg CO2 per passenger-km)
  carGasolineSolo: 0.192,
  twoWheelerGasoline: 0.068,
  metroRailTransit: 0.032,
  carpoolSplit3: 0.064,
  electricBicycle: 0.005,
  walkingCycling: 0.0,

  // Cooking (kg CO2 & kg PM2.5 per household-week)
  biomassCookingCO2PerWeek: 42.5,
  biomassCookingPM25KgPerWeek: 0.365,
  lpgCookingCO2PerWeek: 16.2,
  lpgCookingPM25KgPerWeek: 0.008,
  inductionCookingCO2PerWeek: 9.5, // Average grid factor
  inductionCookingPM25KgPerWeek: 0.0,

  // Heating (kg CO2 & kg PM2.5 per household-week in winter)
  biomassHeatingCO2PerWeek: 75.0,
  biomassHeatingPM25KgPerWeek: 0.78,
  keroseneHeatingCO2PerWeek: 48.0,
  keroseneHeatingPM25KgPerWeek: 0.15,
  heatPumpCO2PerWeek: 18.5,
  heatPumpPM25KgPerWeek: 0.0,
} as const;

export interface CalculationContext {
  profile: HouseholdProfile;
  currentAQ: CurrentAirQuality;
  hourly: HourlyAirQuality[];
  peakPM25: number;
  troughPM25: number;
  peakHourStr: string;
  troughHourStr: string;
}

export function analyzeHourlyExtremes(hourly: HourlyAirQuality[]) {
  if (!hourly || hourly.length === 0) {
    return {
      peakPM25: 150,
      troughPM25: 60,
      peakHourStr: "08:00 AM",
      troughHourStr: "02:00 PM",
    };
  }

  let peak = hourly[0];
  let trough = hourly[0];

  for (const h of hourly) {
    if (h.pm25 > peak.pm25) peak = h;
    if (h.pm25 < trough.pm25) trough = h;
  }

  const formatHour = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoStr;
    }
  };

  return {
    peakPM25: peak.pm25,
    troughPM25: trough.pm25,
    peakHourStr: formatHour(peak.time),
    troughHourStr: formatHour(trough.time),
  };
}

/**
 * Deterministically compute personal inhalation exposure reduction and emissions avoided
 * for a specific action under the given meteorology and household profile.
 */
export function calculateCommuteShiftImpact(ctx: CalculationContext): ImpactMetrics {
  const { profile, peakPM25, troughPM25, peakHourStr, troughHourStr } = ctx;
  const distanceKm = profile.commuteDistanceKm ?? 12;
  const roundtripKm = distanceKm * 2;
  const commuteDaysPerWeek = profile.commuteMode === "work_from_home" ? 0 : 5;

  // Baseline commute duration (hours roundtrip)
  const durationH = profile.commuteMode === "walk_cycle" ? 1.5 : 1.0;

  // Inhalation rate for commute mode
  let baseRate: number = INHALATION_RATES.commuteTransit;

  switch (profile.commuteMode) {
    case "walk_cycle":
      baseRate = INHALATION_RATES.commuteCycling;
      break;
    case "two_wheeler_open":
      baseRate = INHALATION_RATES.commuteMotorbike;
      break;
    case "car_windows_shut":
      baseRate = INHALATION_RATES.commuteCarCabin;
      break;
    case "work_from_home":
      baseRate = INHALATION_RATES.restingIndoorAdult;
      break;
    case "public_transit":
    default:
      baseRate = INHALATION_RATES.commuteTransit;
      break;
  }

  // Vulnerability multiplier
  const hasSensitivities = profile.vulnerabilities.some((v) =>
    ["children", "asthma_respiratory", "elderly"].includes(v)
  );
  const sensitivityMultiplier = hasSensitivities ? 1.3 : 1.0;

  // Baseline inhalation dose during peak smog commute without N95
  const baselineDoseUg = peakPM25 * baseRate * durationH * sensitivityMultiplier;

  // Mitigated inhalation dose: shifted to solar afternoon window + wearing N95 respirator
  const mitigatedDoseUg =
    troughPM25 *
    baseRate *
    durationH *
    (1 - MASK_EFFICIENCY.n95Ffp2Certified) *
    sensitivityMultiplier;

  const exposureReductionPercent = Math.min(
    99,
    Math.max(10, Math.round(((baselineDoseUg - mitigatedDoseUg) / baselineDoseUg) * 100))
  );

  const doseSavedUgPerDay = Math.round(baselineDoseUg - mitigatedDoseUg);

  // CO2 savings from modal shift or carpool / optimized transit
  let co2SavedKgPerWeek = 0;
  if (profile.commuteMode === "car_windows_shut") {
    // Shifting from solo driving to carpooling/metro
    co2SavedKgPerWeek =
      (EMISSION_FACTORS.carGasolineSolo - EMISSION_FACTORS.metroRailTransit) *
      roundtripKm *
      commuteDaysPerWeek;
  } else if (profile.commuteMode === "two_wheeler_open") {
    co2SavedKgPerWeek =
      (EMISSION_FACTORS.twoWheelerGasoline - EMISSION_FACTORS.metroRailTransit) *
      roundtripKm *
      commuteDaysPerWeek;
  } else {
    co2SavedKgPerWeek = 2.4; // Average efficiency optimization
  }
  co2SavedKgPerWeek = Math.round(co2SavedKgPerWeek * 10) / 10;

  return {
    exposureReductionPercent,
    doseSavedUgPerDay,
    co2SavedKgPerWeek,
    pm25EmissionsAvoidedKgPerWeek: 0.04,
    baselineExposureDescription: `${Math.round(baselineDoseUg)} µg inhaled during peak rush hour (${peakHourStr}) at ${Math.round(peakPM25)} µg/m³ PM2.5`,
    mitigatedExposureDescription: `${Math.round(mitigatedDoseUg)} µg inhaled by shifting to mid-day dip (${troughHourStr}, ${Math.round(troughPM25)} µg/m³) with N95 filtering`,
    calculationFormula: "Dose_saved = (C_peak × V_commute × t) - (C_trough × V_commute × t × (1 - 0.95))",
    breakdownVariables: {
      peakPM25: `${Math.round(peakPM25)} µg/m³`,
      troughPM25: `${Math.round(troughPM25)} µg/m³`,
      ventilationRate: `${baseRate} m³/h`,
      commuteDuration: `${durationH} h`,
      n95FiltrationEfficiency: "95%",
    },
  };
}

export function calculateIndoorAirPurificationImpact(ctx: CalculationContext): ImpactMetrics {
  const { profile, currentAQ } = ctx;
  const outdoorPM25 = Math.max(35, currentAQ.pm25);

  // Baseline indoor infiltration factor based on current purifier setup
  let currentInfiltration: number = INFILTRATION_FACTORS.unpurifiedNatural;
  if (profile.homePurifierSetup === "diy_corsirosenthal") {
    currentInfiltration = INFILTRATION_FACTORS.diyCorsiRosenthal;
  } else if (profile.homePurifierSetup === "single_hepa") {
    currentInfiltration = INFILTRATION_FACTORS.singleHepaUnit;
  } else if (profile.homePurifierSetup === "whole_home_hepa") {
    currentInfiltration = INFILTRATION_FACTORS.wholeHomeHepa;
  }

  // Proposed mitigation: High-efficiency target room filtration + weather-stripping (0.12 factor)
  const targetInfiltration = 0.12;

  // Assuming 14 indoor hours per day (sleep + evening)
  const indoorHours = 14;
  const inhalationRate = INHALATION_RATES.restingIndoorAdult;

  const baselineIndoorConc = outdoorPM25 * currentInfiltration;
  const targetIndoorConc = outdoorPM25 * targetInfiltration;

  const baselineDoseUg = baselineIndoorConc * inhalationRate * indoorHours;
  const targetDoseUg = targetIndoorConc * inhalationRate * indoorHours;

  const exposureReductionPercent = Math.min(
    95,
    Math.max(
      15,
      Math.round(((baselineIndoorConc - targetIndoorConc) / baselineIndoorConc) * 100)
    )
  );

  const doseSavedUgPerDay = Math.round(baselineDoseUg - targetDoseUg);

  return {
    exposureReductionPercent,
    doseSavedUgPerDay,
    co2SavedKgPerWeek: 0, // Focus is IAQ health
    pm25EmissionsAvoidedKgPerWeek: 0,
    baselineExposureDescription: `${Math.round(baselineIndoorConc)} µg/m³ average indoor PM2.5 level without optimized filtration`,
    mitigatedExposureDescription: `${Math.round(targetIndoorConc)} µg/m³ protected indoor air with continuous HEPA/Corsi-Rosenthal air exchange`,
    calculationFormula: "Dose_saved = (C_ambient × I_current - C_ambient × I_hepa) × V_rest × t_indoor",
    breakdownVariables: {
      ambientPM25: `${Math.round(outdoorPM25)} µg/m³`,
      unmitigatedInfiltration: `${Math.round(currentInfiltration * 100)}%`,
      hepaProtectedInfiltration: `${Math.round(targetInfiltration * 100)}%`,
      indoorDuration: `${indoorHours} hours/day`,
    },
  };
}

export function calculateCleanEnergyFuelImpact(ctx: CalculationContext): ImpactMetrics {
  const { profile, currentAQ } = ctx;

  let co2SavedKgPerWeek = 0;
  let pm25EmissionsAvoidedKgPerWeek = 0;
  let baselineDescription = "";
  let mitigatedDescription = "";
  let calculationFormula = "";

  if (profile.cookingFuel === "biomass_wood_coal") {
    co2SavedKgPerWeek =
      EMISSION_FACTORS.biomassCookingCO2PerWeek -
      EMISSION_FACTORS.inductionCookingCO2PerWeek;
    pm25EmissionsAvoidedKgPerWeek = EMISSION_FACTORS.biomassCookingPM25KgPerWeek;
    baselineDescription =
      "Solid biomass cookstove: ~24.5 kg fuel/week, emitting ~0.365 kg direct PM2.5 aerosol inside the home";
    mitigatedDescription =
      "Electric induction cooktop: 0 indoor combustion emissions, 77% net lifecycle CO2 reduction";
    calculationFormula = "Avoided_PM25 = Mass_biomass × EF_pm25 (15g/kg); Avoided_CO2 = Net_CO2_grid_swap";
  } else if (profile.heatingFuel === "biomass_wood_coal" || profile.heatingFuel === "kerosene") {
    const isBiomass = profile.heatingFuel === "biomass_wood_coal";
    const baseCo2 = isBiomass
      ? EMISSION_FACTORS.biomassHeatingCO2PerWeek
      : EMISSION_FACTORS.keroseneHeatingCO2PerWeek;
    const basePM = isBiomass
      ? EMISSION_FACTORS.biomassHeatingPM25KgPerWeek
      : EMISSION_FACTORS.keroseneHeatingPM25KgPerWeek;

    co2SavedKgPerWeek = baseCo2 - EMISSION_FACTORS.heatPumpCO2PerWeek;
    pm25EmissionsAvoidedKgPerWeek = basePM;
    baselineDescription = `${isBiomass ? "Wood/Coal heating" : "Kerosene space heater"} generating ~${Math.round(baseCo2)} kg CO2 and ~${basePM} kg PM2.5 weekly`;
    mitigatedDescription =
      "High-efficiency heat pump / inverter climate control with zero local combustion fumes";
    calculationFormula = "Avoided_Emissions = Fuel_consumption_weekly × (EF_combustion - EF_heatpump)";
  } else {
    // Already on cleaner fuel -> Community anti-burning & neighborhood carpooling action
    co2SavedKgPerWeek = 18.5;
    pm25EmissionsAvoidedKgPerWeek = 0.18; // 1 open leaf/trash fire prevented
    baselineDescription =
      "Neighborhood open waste burning and single-occupancy vehicles contributing to local smog blankets";
    mitigatedDescription =
      "Municipal compost reporting & collective transit carpool preventing open trash fires";
    calculationFormula = "Community_action = 1 prevented open trash fire (~10kg) + 2 weekly pooled trips";
  }

  // Exposure reduction inside home from removing combustion source
  const exposureReductionPercent = profile.cookingFuel === "biomass_wood_coal" ? 82 : 45;
  const doseSavedUgPerDay = Math.round(
    Math.max(60, currentAQ.pm25 * 0.45 * INHALATION_RATES.restingIndoorAdult * 8)
  );

  return {
    exposureReductionPercent,
    doseSavedUgPerDay,
    co2SavedKgPerWeek: Math.round(co2SavedKgPerWeek * 10) / 10,
    pm25EmissionsAvoidedKgPerWeek:
      Math.round(pm25EmissionsAvoidedKgPerWeek * 1000) / 1000,
    baselineExposureDescription: baselineDescription,
    mitigatedExposureDescription: mitigatedDescription,
    calculationFormula,
    breakdownVariables: {
      avoidedCO2: `${Math.round(co2SavedKgPerWeek * 10) / 10} kg/week`,
      avoidedPM25Aerosol: `${Math.round(pm25EmissionsAvoidedKgPerWeek * 1000)} g/week`,
      heatingProfile: profile.heatingFuel,
      cookingProfile: profile.cookingFuel,
    },
  };
}

export function aggregateCommunityImpact(
  recommendations: RecommendationItem[]
): CommunityAggregatedImpact {
  let totalDoseSaved = 0;
  let totalCo2 = 0;
  let totalPm25 = 0;

  for (const item of recommendations) {
    totalDoseSaved += item.impact.doseSavedUgPerDay;
    totalCo2 += item.impact.co2SavedKgPerWeek;
    totalPm25 += item.impact.pm25EmissionsAvoidedKgPerWeek;
  }

  // 1,000 households over 1 year (52 weeks)
  const co2SavedTonsPerYear = Math.round(((totalCo2 * 52 * 1000) / 1000) * 10) / 10;
  const pm25AvoidedKgPerYear = Math.round(totalPm25 * 52 * 1000);

  return {
    totalDoseSavedUgPerDay: totalDoseSaved,
    totalCo2SavedKgPerWeek: Math.round(totalCo2 * 10) / 10,
    totalPm25EmissionsAvoidedKgPerWeek: Math.round(totalPm25 * 1000) / 1000,
    communityScaling1000Households: {
      co2SavedTonsPerYear,
      pm25AvoidedKgPerYear,
    },
  };
}
