# Urban Air Quality Assistant 🌬️🍃

A production-ready, error-free GenAI-powered web application that helps families and urban communities navigate severe winter smog, temperature inversions, and high PM2.5/PM10 air pollution with deterministic impact mathematics.

---

## 🌟 Key Features

1. **Hyper-Local Air Quality & Inversion Context:**
   - **Open-Meteo Geocoding**: Resolve any global city or neighborhood dynamically.
   - **Live Meteorological & AQ Data**: Real-time US AQI, PM2.5, PM10, NO2, CO, SO2, O3, temperature, relative humidity, wind speed, surface pressure, and boundary-layer height.
   - **Winter Smog Trapping Detector**: Detects thermal inversions when boundary layer ceiling ($< 450\,\text{m}$) and calm surface winds ($< 2.5\,\text{m/s}$) trap smoke and vehicular emissions near breathing level.
   - **24-Hour Safety Timeline**: Classifies each hour into `Safe` ($< 35\,\mu\text{g/m}^3$), `Moderate`, or `Hazardous / Inversion Trap`, highlighting optimal solar ventilation windows.

2. **Household & Lifestyle Profiling:**
   - Interactive vulnerability tracking (children under 5, elderly 65+, asthma/respiratory, cardiovascular, pregnant).
   - Primary commute modes (cycling/walking, open two-wheeler, transit, filtered car, work-from-home).
   - Heating and cooking fuels (heat pump, gas, solid biomass, kerosene, district heat).
   - Air purifier configurations (none, DIY Corsi-Rosenthal box, single-room HEPA, whole-home HEPA).

3. **Tailored GenAI Action Engine (3 Pillars):**
   - **Pillar 1: Low-Emission Daily Routines** (commute timing shifts avoiding morning inversion peaks, N95 respirator guidance, indoor school activities).
   - **Pillar 2: Indoor Air Quality (IAQ) Hacks** (targeted cross-ventilation during solar dips, bedroom sanctuary sealing, low-speed continuous HEPA air filtration).
   - **Pillar 3: Sustainable Community Alternatives** (clean electric cooking & heating swaps, carpooling, reporting open burning).

4. **Deterministic Direct Impact Calculator & Explainer:**
   - **Strict Separation of Concerns**: All exposure doses and carbon/particulate reductions are calculated deterministically in `src/utils/impactCalculator.ts` using EPA Exposure Factors Handbook and IPCC standards.
   - **Direct Impact Math Modal**: Interactive breakdown showing exact baseline vs. mitigated inhalation doses ($\mu\text{g/day}$), $\%$ exposure reductions, and avoided $\text{kg/week}$ of $\text{CO}_2$ and $\text{PM}_{2.5}$ aerosol.
   - **Community Scaling**: Aggregates collective benefit if 1,000 households in the airshed adopt similar measures.

5. **Resilient Dual-Mode AI Architecture:**
   - **Out-of-the-Box Fallback**: Operates deterministically with zero latency, zero errors, and zero API costs if no LLM key is configured.
   - **GenAI Structured Engine**: Connects to Anthropic Claude or OpenAI when `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` is present.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Validation**: Zod
- **External Data**: Open-Meteo APIs (Geocoding, Air Quality, Weather) - *No API key required*
- **AI SDKs**: `@anthropic-ai/sdk`, `openai`

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone <repository-url>
cd urban-air-quality-assistant
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(Optional) If you have an Anthropic or OpenAI API key, configure it in `.env.local`. If left empty, the application automatically uses the built-in deterministic rule engine.*

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

### 5. Type Check & Lint
```bash
npx tsc --noEmit
npm run lint
```

---

## 📐 Mathematical Heuristics

### 1. Inhalation Exposure
$$\text{Dose}\,(\mu\text{g}) = C \times V \times t \times (1 - \eta)$$
- $C$: Ambient or indoor particulate concentration ($\mu\text{g/m}^3$)
- $V$: Ventilation rate ($\text{m}^3/\text{h}$) from US EPA Exposure Factors Handbook:
  - Resting/indoor: $0.55\,\text{m}^3/\text{h}$
  - Walking commute: $1.25\,\text{m}^3/\text{h}$
  - Cycling: $2.10\,\text{m}^3/\text{h}$
- $t$: Duration (hours)
- $\eta$: Filtration efficiency ($\text{N95} = 0.95$, $\text{HEPA} = 0.85$, Unfiltered $= 0$)

### 2. Indoor Infiltration Factors
- Natural unsealed ventilation: $0.78$
- Windows tightly closed: $0.55$
- DIY Corsi-Rosenthal unit: $0.25$
- Target bedroom HEPA sanctuary: $0.12$

### 3. Emission Reductions
- Solo car to metro transit: Saves $\approx 11.8\,\text{kg CO}_2/\text{week}$ per $15\,\text{km}$ daily roundtrip.
- Solid biomass cookstove to induction: Eliminates $\approx 0.365\,\text{kg PM}_{2.5}$ direct aerosol and avoids $\approx 33\,\text{kg CO}_2/\text{week}$.

---

## 📂 Project Structure

```
urban-air-quality-assistant/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── air-quality/route.ts       # Open-Meteo AQ & weather fetcher with Zod validation
│   │   │   ├── geocode/route.ts           # Location search endpoint with Zod validation
│   │   │   └── recommendations/route.ts   # Action Engine endpoint with Zod validation
│   │   ├── layout.tsx                     # Root layout & metadata
│   │   ├── page.tsx                       # Main responsive dashboard
│   │   └── globals.css                    # Tailwind CSS configuration
│   ├── components/
│   │   ├── AirQualityHeader.tsx           # City search, presets, refresh & live status
│   │   ├── AQIOverviewCard.tsx            # Real-time AQI badge, particulates & WHO limits
│   │   ├── InversionAlertBanner.tsx       # Thermal inversion trap detection & explainer
│   │   ├── HourlyTimeline.tsx             # 24-hour PM2.5 slider & safe window finder
│   │   ├── HouseholdProfileDrawer.tsx     # Vulnerability & lifestyle controls
│   │   ├── ActionCardsSection.tsx         # 3-pillar recommendation cards
│   │   ├── ImpactMathModal.tsx            # Transparent formula breakdown modal
│   │   └── CommunityImpactSummary.tsx     # 1,000-household scaling projections
│   ├── services/
│   │   ├── openMeteo.ts                   # Open-Meteo typed API client & inversion logic
│   │   └── aiService.ts                   # GenAI integration with deterministic fallback
│   ├── types/
│   │   └── airQuality.ts                  # Centralized TypeScript types & Zod schemas
│   └── utils/
│       └── impactCalculator.ts            # Deterministic exposure & emission math
├── .env.example
├── package.json
└── tsconfig.json
```

---

## ⚖️ Medical & Scientific Disclaimer
This application provides decision support heuristics based on EPA and IPCC exposure factors. It is intended for educational and harm-reduction guidance and does not replace individualized clinical advice. High-risk patients with severe COPD, asthma, or cardiovascular conditions should consult their primary physician during hazardous smog events.
