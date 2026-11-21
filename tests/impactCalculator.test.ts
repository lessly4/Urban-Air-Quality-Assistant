import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  INHALATION_RATES,
  INFILTRATION_FACTORS,
  MASK_EFFICIENCY,
  analyzeHourlyExtremes,
  calculateCommuteShiftImpact,
  calculateIndoorAirPurificationImpact,
  calculateCleanEnergyFuelImpact,
  aggregateCommunityImpact,
  CalculationContext,
} from "../src/utils/impactCalculator";
import {
  CurrentAirQuality,
  HourlyAirQuality,
  HouseholdProfile,
} from "../src/types/airQuality";

const mockCurrentAQ: CurrentAirQuality = {
  aqi: 220,
  pm25: 180,
  pm10: 220,
  co: 1200,
  no2: 85,
  so2: 40,
  ozone: 15,
  temperature: 14,
  relativeHumidity: 70,
  windSpeed: 1.4,
  windDirection: 90,
  surfacePressure: 1012,
  boundaryLayerHeight: 280,
  inversionDetected: true,
  inversionSeverity: "severe",
  inversionReason: "Thermal inversion trapping",
  dominantPollutant: "PM2.5",
  aqiCategory: "Very Unhealthy",
  aqiColor: "#a855f7",
  updatedAt: "2026-11-21T00:00:00Z",
};

const mockHourly: HourlyAirQuality[] = [
  {
    time: "2026-11-21T08:00:00Z",
    pm25: 240,
    pm10: 280,
    aqi: 250,
    temperature: 11,
    windSpeed: 1.1,
    boundaryLayerHeight: 180,
    isTrappingWindow: true,
    safetyLevel: "hazardous",
  },
  {
    time: "2026-11-21T14:00:00Z",
    pm25: 65,
    pm10: 90,
    aqi: 130,
    temperature: 20,
    windSpeed: 3.2,
    boundaryLayerHeight: 850,
    isTrappingWindow: false,
    safetyLevel: "moderate",
  },
];

describe("Epidemiological & Thermodynamic Constants", () => {
  it("verifies EPA standard inhalation rates", () => {
    assert.equal(INHALATION_RATES.restingIndoorAdult, 0.55);
    assert.equal(INHALATION_RATES.commuteWalking, 1.25);
    assert.equal(INHALATION_RATES.commuteCycling, 2.1);
    assert.ok(INHALATION_RATES.commuteCycling > INHALATION_RATES.commuteTransit);
  });

  it("verifies building envelope infiltration factors", () => {
    assert.ok(INFILTRATION_FACTORS.unpurifiedNatural > INFILTRATION_FACTORS.unpurifiedClosed);
    assert.ok(INFILTRATION_FACTORS.unpurifiedClosed > INFILTRATION_FACTORS.diyCorsiRosenthal);
    assert.ok(INFILTRATION_FACTORS.diyCorsiRosenthal > INFILTRATION_FACTORS.singleHepaUnit);
    assert.ok(INFILTRATION_FACTORS.singleHepaUnit > INFILTRATION_FACTORS.wholeHomeHepa);
  });

  it("verifies respirator filtration efficiencies", () => {
    assert.equal(MASK_EFFICIENCY.n95Ffp2Certified, 0.95);
    assert.equal(MASK_EFFICIENCY.clothSurgical, 0.35);
    assert.equal(MASK_EFFICIENCY.none, 0.0);
  });
});

describe("analyzeHourlyExtremes", () => {
  it("correctly identifies peak and trough pollution windows", () => {
    const extremes = analyzeHourlyExtremes(mockHourly);
    assert.equal(extremes.peakPM25, 240);
    assert.equal(extremes.troughPM25, 65);
    assert.ok(extremes.peakHourStr.length > 0);
    assert.ok(extremes.troughHourStr.length > 0);
  });

  it("handles empty hourly data with safe fallback", () => {
    const fallback = analyzeHourlyExtremes([]);
    assert.equal(fallback.peakPM25, 150);
    assert.equal(fallback.troughPM25, 60);
  });
});

describe("calculateCommuteShiftImpact", () => {
  it("calculates substantial inhalation reduction when shifting from peak smog to solar dip with N95", () => {
    const profile: HouseholdProfile = {
      vulnerabilities: ["asthma_respiratory"],
      commuteMode: "two_wheeler_open",
      heatingFuel: "electric_heatpump",
      cookingFuel: "electric_induction",
      homePurifierSetup: "single_hepa",
      ventilationHabit: "sealed_ac_purifier",
      commuteDistanceKm: 15,
      roomSizeM2: 35,
    };

    const ctx: CalculationContext = {
      profile,
      currentAQ: mockCurrentAQ,
      hourly: mockHourly,
      peakPM25: 240,
      troughPM25: 65,
      peakHourStr: "08:00 AM",
      troughHourStr: "02:00 PM",
    };

    const impact = calculateCommuteShiftImpact(ctx);

    // Should achieve 90%+ exposure reduction by shifting hour AND wearing certified N95
    assert.ok(impact.exposureReductionPercent >= 90);
    assert.ok(impact.doseSavedUgPerDay > 0);
    assert.ok(impact.co2SavedKgPerWeek > 0);
    assert.ok(impact.calculationFormula.includes("Dose_saved"));
  });

  it("handles solo car commute modal shift carbon savings", () => {
    const profile: HouseholdProfile = {
      vulnerabilities: [],
      commuteMode: "car_windows_shut",
      heatingFuel: "electric_heatpump",
      cookingFuel: "electric_induction",
      homePurifierSetup: "none",
      ventilationHabit: "timed_windows",
      commuteDistanceKm: 20,
    };

    const ctx: CalculationContext = {
      profile,
      currentAQ: mockCurrentAQ,
      hourly: mockHourly,
      peakPM25: 180,
      troughPM25: 50,
      peakHourStr: "08:00 AM",
      troughHourStr: "02:00 PM",
    };

    const impact = calculateCommuteShiftImpact(ctx);
    // 40km roundtrip * 5 days * (0.192 - 0.032) = 32 kg CO2 saved per week
    assert.ok(impact.co2SavedKgPerWeek >= 25);
  });

  it("applies vulnerability sensitivity multiplier for sensitive groups", () => {
    const baseProfile: HouseholdProfile = {
      vulnerabilities: [],
      commuteMode: "walk_cycle",
      heatingFuel: "electric_heatpump",
      cookingFuel: "electric_induction",
      homePurifierSetup: "single_hepa",
      ventilationHabit: "sealed_ac_purifier",
      commuteDistanceKm: 5,
    };

    const sensitiveProfile: HouseholdProfile = {
      ...baseProfile,
      vulnerabilities: ["children", "asthma_respiratory"],
    };

    const ctx1: CalculationContext = {
      profile: baseProfile,
      currentAQ: mockCurrentAQ,
      hourly: mockHourly,
      peakPM25: 200,
      troughPM25: 80,
      peakHourStr: "08:00 AM",
      troughHourStr: "02:00 PM",
    };

    const ctx2: CalculationContext = {
      ...ctx1,
      profile: sensitiveProfile,
    };

    const impact1 = calculateCommuteShiftImpact(ctx1);
    const impact2 = calculateCommuteShiftImpact(ctx2);

    assert.ok(impact2.doseSavedUgPerDay > impact1.doseSavedUgPerDay);
  });
});

describe("calculateIndoorAirPurificationImpact", () => {
  it("shows high particle filtration when deploying HEPA in previously unpurified home", () => {
    const profile: HouseholdProfile = {
      vulnerabilities: ["elderly"],
      commuteMode: "public_transit",
      heatingFuel: "district_central",
      cookingFuel: "lpg_piped_gas",
      homePurifierSetup: "none",
      ventilationHabit: "windows_open_always",
    };

    const ctx: CalculationContext = {
      profile,
      currentAQ: mockCurrentAQ,
      hourly: mockHourly,
      peakPM25: 240,
      troughPM25: 65,
      peakHourStr: "08:00 AM",
      troughHourStr: "02:00 PM",
    };

    const impact = calculateIndoorAirPurificationImpact(ctx);
    assert.ok(impact.exposureReductionPercent >= 75);
    assert.ok(impact.doseSavedUgPerDay > 500);
  });
});

describe("calculateCleanEnergyFuelImpact", () => {
  it("calculates massive aerosol and carbon avoidance for solid biomass cooking swaps", () => {
    const profile: HouseholdProfile = {
      vulnerabilities: ["children"],
      commuteMode: "public_transit",
      heatingFuel: "electric_heatpump",
      cookingFuel: "biomass_wood_coal",
      homePurifierSetup: "single_hepa",
      ventilationHabit: "sealed_ac_purifier",
    };

    const ctx: CalculationContext = {
      profile,
      currentAQ: mockCurrentAQ,
      hourly: mockHourly,
      peakPM25: 200,
      troughPM25: 80,
      peakHourStr: "08:00 AM",
      troughHourStr: "02:00 PM",
    };

    const impact = calculateCleanEnergyFuelImpact(ctx);
    assert.equal(impact.co2SavedKgPerWeek, 33);
    assert.equal(impact.pm25EmissionsAvoidedKgPerWeek, 0.365);
    assert.equal(impact.exposureReductionPercent, 82);
  });

  it("calculates space heating emissions avoidance for kerosene or coal heaters", () => {
    const profile: HouseholdProfile = {
      vulnerabilities: [],
      commuteMode: "car_windows_shut",
      heatingFuel: "kerosene",
      cookingFuel: "electric_induction",
      homePurifierSetup: "single_hepa",
      ventilationHabit: "sealed_ac_purifier",
    };

    const ctx: CalculationContext = {
      profile,
      currentAQ: mockCurrentAQ,
      hourly: mockHourly,
      peakPM25: 200,
      troughPM25: 80,
      peakHourStr: "08:00 AM",
      troughHourStr: "02:00 PM",
    };

    const impact = calculateCleanEnergyFuelImpact(ctx);
    // Kerosene (48) - Heat pump (18.5) = 29.5 kg CO2/week
    assert.equal(impact.co2SavedKgPerWeek, 29.5);
    assert.equal(impact.pm25EmissionsAvoidedKgPerWeek, 0.15);
  });
});

describe("aggregateCommunityImpact", () => {
  it("scales individual household savings to 1,000 households annually", () => {
    const recs = [
      {
        id: "r1",
        pillar: "daily_routines" as const,
        title: "Shift commute",
        summary: "test",
        actionSteps: ["step 1"],
        priority: "high" as const,
        timingWindow: "12pm",
        impact: {
          exposureReductionPercent: 90,
          doseSavedUgPerDay: 500,
          co2SavedKgPerWeek: 12,
          pm25EmissionsAvoidedKgPerWeek: 0.04,
          baselineExposureDescription: "b",
          mitigatedExposureDescription: "m",
          calculationFormula: "f",
          breakdownVariables: {},
        },
        evidenceWhy: "why",
      },
      {
        id: "r2",
        pillar: "community_alternatives" as const,
        title: "Clean fuel swap",
        summary: "test",
        actionSteps: ["step 1"],
        priority: "critical" as const,
        timingWindow: "now",
        impact: {
          exposureReductionPercent: 80,
          doseSavedUgPerDay: 800,
          co2SavedKgPerWeek: 30,
          pm25EmissionsAvoidedKgPerWeek: 0.36,
          baselineExposureDescription: "b",
          mitigatedExposureDescription: "m",
          calculationFormula: "f",
          breakdownVariables: {},
        },
        evidenceWhy: "why",
      },
    ];

    const agg = aggregateCommunityImpact(recs);

    assert.equal(agg.totalDoseSavedUgPerDay, 1300);
    assert.equal(agg.totalCo2SavedKgPerWeek, 42);
    assert.equal(agg.totalPm25EmissionsAvoidedKgPerWeek, 0.4);

    // 42 kg/wk * 52 wks * 1000 homes / 1000 = 2184 tons CO2/year
    assert.equal(agg.communityScaling1000Households.co2SavedTonsPerYear, 2184);
    // 0.4 kg/wk * 52 wks * 1000 homes = 20800 kg PM2.5/year
    assert.equal(agg.communityScaling1000Households.pm25AvoidedKgPerYear, 20800);
  });
});
