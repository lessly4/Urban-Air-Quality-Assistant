import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {
  CurrentAirQuality,
  HourlyAirQuality,
  HouseholdProfile,
  RecommendationItem,
  RecommendationsResponse,
} from "../types/airQuality";
import {
  analyzeHourlyExtremes,
  calculateCommuteShiftImpact,
  calculateIndoorAirPurificationImpact,
  calculateCleanEnergyFuelImpact,
  aggregateCommunityImpact,
  CalculationContext,
} from "../utils/impactCalculator";

/**
 * Deterministic, rule-based recommendation engine that guarantees 100% uptime,
 * zero latency overhead, and error-free operation even when no AI API keys are configured.
 */
export function generateDeterministicRecommendations(
  profile: HouseholdProfile,
  currentAQ: CurrentAirQuality,
  hourly: HourlyAirQuality[],
  locationName: string = "your area"
): RecommendationsResponse {
  const { peakPM25, troughPM25, peakHourStr, troughHourStr } =
    analyzeHourlyExtremes(hourly);

  const ctx: CalculationContext = {
    profile,
    currentAQ,
    hourly,
    peakPM25,
    troughPM25,
    peakHourStr,
    troughHourStr,
  };

  const commuteImpact = calculateCommuteShiftImpact(ctx);
  const indoorImpact = calculateIndoorAirPurificationImpact(ctx);
  const cleanFuelImpact = calculateCleanEnergyFuelImpact(ctx);

  const hasChildren = profile.vulnerabilities.includes("children");
  const hasAsthma = profile.vulnerabilities.includes("asthma_respiratory");
  const hasElderly = profile.vulnerabilities.includes("elderly");
  const hasVulnerabilities = profile.vulnerabilities.length > 0;

  const isSevereSmog = currentAQ.aqi > 200 || currentAQ.pm25 > 120;
  const isInversion = currentAQ.inversionDetected;

  const recommendations: RecommendationItem[] = [];

  // ==========================================
  // PILLAR 1: Low-Emission Daily Routines
  // ==========================================
  const commuteTitle =
    profile.commuteMode === "walk_cycle" || profile.commuteMode === "two_wheeler_open"
      ? "Time Outdoor Travel & Shift Commute to Solar Window"
      : profile.commuteMode === "work_from_home"
      ? "Protect Daily Exercise & Ergonomic Schedule"
      : "Optimize In-Cabin Air Circulation & Stagger Transit";

  const commuteSteps: string[] = [];
  if (profile.commuteMode === "walk_cycle" || profile.commuteMode === "two_wheeler_open") {
    commuteSteps.push(
      `Avoid morning peak rush hour (~${peakHourStr}) when inversion traps vehicle tailpipes at street level.`
    );
    commuteSteps.push(
      `Wear a snug-fitting N95/FFP2 certified respirator with a tight nose bridge clamp during your transit.`
    );
    commuteSteps.push(
      `If possible, reschedule outdoor movement to ${troughHourStr} when solar convection disperses ground-level smog.`
    );
  } else if (profile.commuteMode === "car_windows_shut") {
    commuteSteps.push(
      "Keep vehicle windows sealed tight and switch air circulation strictly to 'Internal Recirculate' mode."
    );
    commuteSteps.push(
      "Check or replace cabin air filter with a HEPA/Activated Carbon blend (filters up to 85% of tailpipe soot)."
    );
    commuteSteps.push(
      "Consider carpooling with 2 colleagues to immediately cut vehicular emissions by 66%."
    );
  } else {
    commuteSteps.push(
      `Wear an N95 respirator on train platforms or bus shelters between 07:00-09:30 AM.`
    );
    commuteSteps.push(
      `Schedule vigorous outdoor walking or running strictly during the afternoon dip (${troughHourStr}).`
    );
  }

  recommendations.push({
    id: "routine-commute-shift",
    pillar: "daily_routines",
    title: commuteTitle,
    summary: `Synchronize travel with daily atmospheric dispersion to cut direct particulate inhalation by ${commuteImpact.exposureReductionPercent}%.`,
    actionSteps: commuteSteps,
    priority: isSevereSmog || hasVulnerabilities ? "critical" : "high",
    timingWindow: `Safest outdoor window: ${troughHourStr} | Hazardous window: ${peakHourStr}`,
    impact: commuteImpact,
    evidenceWhy: `During early morning winter hours, nocturnal radiative cooling compresses the atmospheric boundary layer down to ~${currentAQ.boundaryLayerHeight}m, preventing tailpipe soot from escaping. Shifting travel into the afternoon allows vertical convection to dilute concentrations.`,
  });

  // School & Outdoor Exercise Window
  if (hasChildren || hasAsthma || hasElderly) {
    recommendations.push({
      id: "routine-vulnerable-protection",
      pillar: "daily_routines",
      title: "Protect Sensitive Family Members from Peak Morning Exposure",
      summary: `Children and respiratory patients inhale up to 50% more air per kg of body weight, making exposure avoidance crucial.`,
      actionSteps: [
        `Move school morning outdoor assemblies and athletic practices indoors when PM2.5 exceeds 75 µg/m³.`,
        `Keep asthma rescue inhalers at room temperature and accessible before any unavoidable outdoor transit.`,
        `Encourage nasal breathing rather than mouth breathing during brief outdoor walks to naturally filter coarse dust.`,
      ],
      priority: "critical",
      timingWindow: "Crucial between 06:30 AM - 09:30 AM",
      impact: {
        ...commuteImpact,
        exposureReductionPercent: Math.min(95, commuteImpact.exposureReductionPercent + 5),
        baselineExposureDescription: `Unprotected morning exposure triggers bronchial inflammation in sensitive airways`,
        mitigatedExposureDescription: `Indoor scheduling avoids the daily maximum soot concentration peak`,
      },
      evidenceWhy: `Pediatric lungs have higher airway resistance and developing alveoli, while older adults experience increased vascular stiffness under fine particle oxidative stress.`,
    });
  }

  // ==========================================
  // PILLAR 2: Indoor Air Quality (IAQ) Hacks
  // ==========================================
  const ventSteps: string[] = [];
  if (profile.ventilationHabit === "windows_open_always") {
    ventSteps.push(
      "Close open balcony and window drafts immediately—continuous open windows allow outdoor smog to saturate indoor air within 20 minutes."
    );
  }
  ventSteps.push(
    `Perform rapid 'Cross-Ventilation Bursts' only between ${troughHourStr} and 3:30 PM (10-15 minutes max) to flush built-up CO2 without letting heavy soot settle.`
  );
  ventSteps.push(
    "Use door draft stoppers and weather-stripping along exterior door thresholds to block street-level draft infiltration."
  );

  recommendations.push({
    id: "iaq-ventilation-timing",
    pillar: "indoor_air_quality",
    title: "Timed Cross-Ventilation & Envelope Weather-Stripping",
    summary: `Prevent indoor stagnation while blocking 70%+ of toxic outdoor particles by airing only during the daily smog trough.`,
    actionSteps: ventSteps,
    priority: "high",
    timingWindow: `Airing window: ${troughHourStr} (10-15 mins max)`,
    impact: indoorImpact,
    evidenceWhy: `Unmanaged natural ventilation equilibrates indoor air to 75-80% of outdoor smog levels. Targeted airing during solar heating hours minimizes particulate intake while refreshing indoor oxygen.`,
  });

  // Air Filtration Recommendation
  const isPurifierMissing =
    profile.homePurifierSetup === "none" ||
    profile.homePurifierSetup === "diy_corsirosenthal";

  recommendations.push({
    id: "iaq-purifier-optimization",
    pillar: "indoor_air_quality",
    title:
      profile.homePurifierSetup === "none"
        ? "Deploy a High-CADR Air Purifier or DIY Corsi-Rosenthal Box"
        : "Optimize HEPA Placement & Create a Safe Sleeping Sanctuary",
    summary: `Maintain clean breathing air in primary sleeping and living spaces, removing up to 85% of ambient fine particles.`,
    actionSteps: isPurifierMissing
      ? [
          "For an affordable, ultra-high-CADR solution, build a Corsi-Rosenthal box using a 20-inch box fan and four MERV 13 furnace filters.",
          "Place the unit centrally in the most frequented bedroom, at least 1 meter away from walls for 360-degree intake.",
          "Run continuously on medium-low speed rather than turning on/off intermittently.",
        ]
      : [
          "Seal the primary bedroom as a 'clean air sanctuary' by keeping internal bedroom doors closed and the purifier running 24/7.",
          "Vacuum with a sealed HEPA vacuum cleaner twice weekly; avoid dry sweeping which resuspends settled dust.",
          "Avoid indoor aerosol sources: incense sticks, mosquito coils, unvented frying, and scented paraffin candles.",
        ],
    priority: isSevereSmog ? "critical" : "high",
    timingWindow: "Continuous 24-hour operation (lowest power / whisper quiet at night)",
    impact: {
      ...indoorImpact,
      exposureReductionPercent: profile.homePurifierSetup === "none" ? 85 : 92,
    },
    evidenceWhy: `Fine PM2.5 particles remain airborne for days indoors due to low terminal settling velocities. Active mechanical filtration with HEPA or MERV 13 media is the only reliable way to clear PM2.5.`,
  });

  // ==========================================
  // PILLAR 3: Sustainable Community Alternatives
  // ==========================================
  const isBiomassOrKerosene =
    profile.cookingFuel === "biomass_wood_coal" ||
    profile.heatingFuel === "biomass_wood_coal" ||
    profile.heatingFuel === "kerosene";

  recommendations.push({
    id: "community-clean-fuel-swap",
    pillar: "community_alternatives",
    title: isBiomassOrKerosene
      ? "Transition to Clean Electric Cooking & Radiant Heating Swaps"
      : "Participate in Neighborhood Clean Heat & Transit Collectives",
    summary: `Eliminate direct domestic combustion emissions, preventing ~${cleanFuelImpact.pm25EmissionsAvoidedKgPerWeek} kg of local aerosol and ${cleanFuelImpact.co2SavedKgPerWeek} kg of CO2 weekly.`,
    actionSteps: isBiomassOrKerosene
      ? [
          "Swap solid fuel stoves for a plug-in 1800W electric induction cooktop, instantly eliminating indoor carbon monoxide and soot.",
          "Replace unvented kerosene or coal space heaters with energy-efficient heat pump mini-splits or ceramic radiant heaters.",
          "Check municipal or state clean-energy transition subsidies for low-emission appliance rebates.",
        ]
      : [
          "Coordinate neighborhood carpools or school van pools to reduce the concentration of cold-start vehicle trips on your street.",
          "Report open garbage, leaf, and plastic burning to municipal helplines or community monitoring apps.",
          "Advocate for residential building management to provide electric space heating for watchmen/security rather than open brazier fires.",
        ],
    priority: isBiomassOrKerosene ? "critical" : "medium",
    timingWindow: "Immediate implementation / seasonal transition",
    impact: cleanFuelImpact,
    evidenceWhy: `Domestic biomass and solid fuel combustion in urban valleys account for up to 30-40% of winter surface particulate loading, directly accumulating at human breathing height.`,
  });

  const aggregated = aggregateCommunityImpact(recommendations);

  return {
    generatedAt: new Date().toISOString(),
    source: "deterministic_rules",
    summary: `Analysis for ${locationName}: ${
      isInversion ? "Severe thermal inversion trapping detected. " : ""
    }Current air quality is ${currentAQ.aqiCategory} (AQI ${currentAQ.aqi}, PM2.5 ${Math.round(
      currentAQ.pm25
    )} µg/m³). By following these tailored actions, your household can reduce personal inhalation exposure by up to ${Math.max(
      ...recommendations.map((r) => r.impact.exposureReductionPercent)
    )}% and eliminate ~${aggregated.totalCo2SavedKgPerWeek} kg of weekly carbon emissions.`,
    safeOutdoorWindowDescription: `Best outdoor & airing window: ${troughHourStr} (expected PM2.5 dip to ~${Math.round(
      troughPM25
    )} µg/m³). Avoid outdoor exposure around ${peakHourStr} (expected peak ~${Math.round(
      peakPM25
    )} µg/m³).`,
    inversionGuidance: isInversion
      ? `Atmospheric inversion alert: A shallow boundary layer ceiling (${currentAQ.boundaryLayerHeight}m) with calm winds (${currentAQ.windSpeed} m/s) is creating a lid over ${locationName}, trapping surface particulates. Keep outdoor exposure to a minimum until solar convective heating expands the mixing layer.`
      : `Atmospheric dispersion is moderate to good. Regular ventilation and routine precautions apply.`,
    recommendations,
    aggregatedImpact: aggregated,
  };
}

/**
 * Main GenAI generator that utilizes Anthropic or OpenAI SDK with structured output
 * when API keys are available, and gracefully falls back to the deterministic engine.
 */
export async function generateRecommendations(
  profile: HouseholdProfile,
  currentAQ: CurrentAirQuality,
  hourly: HourlyAirQuality[],
  locationName: string = "your city"
): Promise<RecommendationsResponse> {
  // Always prepare deterministic baseline calculations first to ensure mathematical precision
  const deterministicFallback = generateDeterministicRecommendations(
    profile,
    currentAQ,
    hourly,
    locationName
  );

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!anthropicKey && !openaiKey) {
    console.log("No AI API keys configured; serving deterministic high-precision recommendations.");
    return deterministicFallback;
  }

  const promptContext = {
    location: locationName,
    currentAQ: {
      aqi: currentAQ.aqi,
      category: currentAQ.aqiCategory,
      pm25: currentAQ.pm25,
      pm10: currentAQ.pm10,
      windSpeed: currentAQ.windSpeed,
      temperature: currentAQ.temperature,
      boundaryLayerHeight: currentAQ.boundaryLayerHeight,
      inversionDetected: currentAQ.inversionDetected,
      inversionSeverity: currentAQ.inversionSeverity,
    },
    householdProfile: profile,
    computedDeterministicMetrics: deterministicFallback.recommendations.map((r) => ({
      pillar: r.pillar,
      title: r.title,
      exposureReductionPercent: r.impact.exposureReductionPercent,
      doseSavedUgPerDay: r.impact.doseSavedUgPerDay,
      co2SavedKgPerWeek: r.impact.co2SavedKgPerWeek,
      pm25EmissionsAvoidedKgPerWeek: r.impact.pm25EmissionsAvoidedKgPerWeek,
      calculationFormula: r.impact.calculationFormula,
      baselineExposureDescription: r.impact.baselineExposureDescription,
      mitigatedExposureDescription: r.impact.mitigatedExposureDescription,
    })),
    safeWindow: deterministicFallback.safeOutdoorWindowDescription,
  };

  try {
    if (anthropicKey) {
      const anthropic = new Anthropic({ apiKey: anthropicKey });
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 3500,
        system: `You are the Urban Air Quality Assistant GenAI Engine.
Your role is to produce empathetic, medically sound, and practical guidance for families navigating severe winter smog and urban air pollution.
CRITICAL CONSTRAINT: You MUST preserve the exact computed deterministic impact numbers provided in the input context (exposureReductionPercent, doseSavedUgPerDay, co2SavedKgPerWeek, pm25EmissionsAvoidedKgPerWeek). Do NOT invent or hallucinate new numbers.
Respond ONLY with a valid JSON object matching the provided schema, with no markdown code fences or conversational preamble.`,
        messages: [
          {
            role: "user",
            content: `Analyze this urban air quality scenario and household profile:
${JSON.stringify(promptContext, null, 2)}

Produce a JSON response with this structure:
{
  "summary": "...",
  "safeOutdoorWindowDescription": "...",
  "inversionGuidance": "...",
  "recommendations": [
    {
      "id": "...",
      "pillar": "daily_routines" | "indoor_air_quality" | "community_alternatives",
      "title": "...",
      "summary": "...",
      "actionSteps": ["step 1", "step 2", "..."],
      "priority": "critical" | "high" | "medium",
      "timingWindow": "...",
      "evidenceWhy": "...",
      "impact": {
        "exposureReductionPercent": <number from input>,
        "doseSavedUgPerDay": <number from input>,
        "co2SavedKgPerWeek": <number from input>,
        "pm25EmissionsAvoidedKgPerWeek": <number from input>,
        "baselineExposureDescription": "...",
        "mitigatedExposureDescription": "...",
        "calculationFormula": "...",
        "breakdownVariables": { ... }
      }
    }
  ]
}`,
          },
        ],
      });

      const firstBlock = response.content[0];
      if (firstBlock && firstBlock.type === "text") {
        const parsed = JSON.parse(firstBlock.text.trim());
        const aggregated = aggregateCommunityImpact(parsed.recommendations);
        return {
          generatedAt: new Date().toISOString(),
          source: "genai",
          summary: parsed.summary || deterministicFallback.summary,
          safeOutdoorWindowDescription:
            parsed.safeOutdoorWindowDescription ||
            deterministicFallback.safeOutdoorWindowDescription,
          inversionGuidance:
            parsed.inversionGuidance || deterministicFallback.inversionGuidance,
          recommendations: parsed.recommendations,
          aggregatedImpact: aggregated,
        };
      }
    } else if (openaiKey) {
      const openai = new OpenAI({ apiKey: openaiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are the Urban Air Quality Assistant GenAI Engine. Return a valid JSON object. Do not hallucinate math: adopt the exact deterministic values provided in the prompt.`,
          },
          {
            role: "user",
            content: JSON.stringify(promptContext),
          },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        const aggregated = aggregateCommunityImpact(parsed.recommendations);
        return {
          generatedAt: new Date().toISOString(),
          source: "genai",
          summary: parsed.summary || deterministicFallback.summary,
          safeOutdoorWindowDescription:
            parsed.safeOutdoorWindowDescription ||
            deterministicFallback.safeOutdoorWindowDescription,
          inversionGuidance:
            parsed.inversionGuidance || deterministicFallback.inversionGuidance,
          recommendations: parsed.recommendations,
          aggregatedImpact: aggregated,
        };
      }
    }
  } catch (aiError) {
    console.error("AI service call failed, seamlessly falling back to deterministic engine:", aiError);
  }

  return deterministicFallback;
}
