# Project Context: Urban Air Quality Assistant

> **Repository**: [https://github.com/lessly4/Urban-Air-Quality-Assistant](https://github.com/lessly4/Urban-Air-Quality-Assistant)  
> **Primary Stack**: Next.js 16 (App Router), React 19, TypeScript (Strict), Tailwind CSS v4, Zod, Lucide React  
> **External Data**: Open-Meteo Geocoding, Air Quality, and Weather APIs (keyless)  
> **Optional AI Backends**: Anthropic (`@anthropic-ai/sdk`), OpenAI (`openai`), with built-in deterministic fallback

---

## 1. Purpose & Core Architecture

The **Urban Air Quality Assistant** helps families and communities navigate severe winter smog, thermal inversions, and elevated $\text{PM}_{2.5}/\text{PM}_{10}$ pollution.

### Key Architectural Principles
1. **Strict Separation of Concerns (No Hallucinated Math)**:
   - All inhalation dose reductions ($\mu\text{g/day}$), exposure percentage cuts, and weekly avoided emissions ($\text{kg/week}$ of $\text{CO}_2$ and $\text{PM}_{2.5}$) are computed deterministically in `src/utils/impactCalculator.ts` using EPA Exposure Factors Handbook and IPCC heuristics.
   - The AI layer (`src/services/aiService.ts`) receives those exact pre-computed metrics and generates plain-language, empathetic explanations of *why* and *how* the impact occurs.
2. **Resilient Dual-Mode AI Engine**:
   - If `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` is configured in `.env.local` (or deployment environment variables), structured JSON recommendations are synthesized by the LLM.
   - If no key is present, `aiService.ts` automatically falls back to a deterministic rule-based recommendation engine so the app runs out-of-the-box with zero errors.
3. **Client-Side Caching & Deduplication**:
   - `src/hooks/useAirQuality.ts` manages location/profile state, in-memory TTL caching, and in-flight Promise deduplication to prevent redundant network requests.
4. **API Abuse Protection & Security Hardening**:
   - Sliding-window per-IP rate limiting (`src/utils/rateLimiter.ts`) protects all Route Handlers with HTTP `429` + `Retry-After` headers.
   - `next.config.ts` configures security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`).

---

## 2. Directory & File Map

```text
urban-air-quality-assistant/
├── AGENTS.md                         # Next.js agent compatibility notice
├── CONTEXT.md                        # This project context file
├── README.md                         # Project overview & setup guide
├── next.config.ts                    # Next.js config, Turbopack rules, security headers
├── postcss.config.mjs                # PostCSS config with @tailwindcss/postcss (for webpack/Vercel)
├── package.json                      # Scripts: dev, build (webpack), start, lint, test
├── tsconfig.json                     # Strict TypeScript configuration (@/* -> src/*)
├── .env.example                      # Optional LLM API key template
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout & SEO metadata (system font stack)
│   │   ├── globals.css               # Tailwind v4 entry & class-based dark mode config
│   │   ├── page.tsx                  # Main responsive dashboard consuming useAirQuality
│   │   └── api/
│   │       ├── geocode/route.ts      # GET /api/geocode?q=... (30 req/min limit)
│   │       ├── air-quality/route.ts  # GET /api/air-quality?lat=...&lon=... (20 req/min limit)
│   │       └── recommendations/route.ts # POST /api/recommendations (15 req/min limit)
│   │
│   ├── components/
│   │   ├── AirQualityHeader.tsx      # Brand header, ARIA combobox city search, hotspot presets
│   │   ├── AQIOverviewCard.tsx       # Current US AQI badge, PM2.5/PM10 WHO multiples, meteorology
│   │   ├── InversionAlertBanner.tsx  # Thermal inversion trapping alert & physics explainer
│   │   ├── HourlyTimeline.tsx        # 24-hour PM2.5 bar chart & safe solar mixing window
│   │   ├── HouseholdProfileDrawer.tsx# Vulnerability, commute, heating/cooking fuel, purifier controls
│   │   ├── ActionCardsSection.tsx    # 3-pillar recommendation tabs & cards
│   │   ├── ImpactMathModal.tsx       # Accessible dialog (focus trap, Escape) showing impact formulas
│   │   └── CommunityImpactSummary.tsx# 1,000-household airshed scaling projection
│   │
│   ├── config/
│   │   └── constants.ts              # Default location, default profile, preset cities, cache config
│   │
│   ├── hooks/
│   │   └── useAirQuality.ts          # Data fetching, memory cache, request deduplication
│   │
│   ├── services/
│   │   ├── openMeteo.ts              # Open-Meteo API client, AQI classification, inversion detection
│   │   └── aiService.ts              # Anthropic/OpenAI structured output + deterministic fallback
│   │
│   ├── types/
│   │   └── airQuality.ts             # Centralized TypeScript interfaces & Zod validation schemas
│   │
│   └── utils/
│       ├── impactCalculator.ts       # Deterministic exposure dose & emission savings math
│       └── rateLimiter.ts            # Sliding-window IP rate limiter & client IP extractor
│
└── tests/
    ├── run-all.ts                    # Master test runner (executed via `npm test`)
    ├── impactCalculator.test.ts      # Constants, hourly extremes, commute, HEPA, fuel swap, scaling tests
    ├── openMeteo.test.ts             # AQI classification & thermal inversion physics tests
    └── rateLimiter.test.ts           # Sliding-window quota & IP extraction tests
```

---

## 3. Data Flow

1. **Location Selection (`AirQualityHeader.tsx` → `/api/geocode`)**:
   - User searches a city or selects a preset hotspot (`Delhi`, `Lahore`, `Beijing`, `Salt Lake City`, `London`).
   - `/api/geocode` validates query length via Zod and fetches coordinates/timezone from Open-Meteo Geocoding API.
2. **Air Quality & Meteorology (`/api/air-quality` → `openMeteo.ts`)**:
   - Fetches current and 24-hour hourly forecasts: `us_aqi`, `pm2_5`, `pm10`, `nitrogen_dioxide`, `carbon_monoxide`, `sulphur_dioxide`, `ozone`, `temperature_2m`, `relative_humidity_2m`, `wind_speed_10m`, `surface_pressure`, and `boundary_layer_height`.
   - Evaluates **Thermal Inversion** conditions (`windSpeed < 2.5 m/s`, `boundaryLayerHeight < 450 m`, elevated `pm2_5`).
3. **Recommendations & Impact Math (`/api/recommendations` → `impactCalculator.ts` + `aiService.ts`)**:
   - Validates `location`, `currentAQ`, `hourly`, and `profile` via Zod.
   - Computes deterministic metrics for 3 pillars:
     1. *Low-Emission Daily Routines*
     2. *Indoor Air Quality (IAQ) Hacks*
     3. *Sustainable Community Alternatives*
   - Passes computed metrics to `aiService.ts` (LLM synthesis if keys exist, otherwise rich deterministic copy).

---

## 4. Build, Styling, & Deployment Notes

- **Tailwind CSS v4 & Webpack Compatibility**:
  - `package.json` uses `"build": "next build --webpack"` for reliable production builds in environments where Turbopack worker IPC is constrained.
  - `postcss.config.mjs` enables `@tailwindcss/postcss` so webpack compiles all Tailwind v4 utility classes properly on Vercel and local builds.
- **Fonts & Offline Builds**:
  - `src/app/layout.tsx` uses native system font stacks (`--font-sans`, `--font-mono` in `globals.css`) rather than `next/font/google`, enabling zero-network builds and zero external font requests.
- **Dark Mode**:
  - Configured as class-based in `src/app/globals.css` (`@custom-variant dark (&:where(.dark, .dark *));`) so light mode is the baseline unless `.dark` is applied to `<html>`.

---

## 5. Verification Commands

| Check | Command | Notes |
| :--- | :--- | :--- |
| **Type Check** | `npx tsc --noEmit` | Must exit with `0` |
| **Linting** | `npm run lint` | ESLint 9 (`eslint-config-next`) |
| **Unit Tests** | `npm test` | Runs `npx jiti tests/run-all.ts` (29 tests across 10 suites) |
| **Production Build** | `npm run build` | Runs `next build --webpack` |
| **Local Dev Server** | `npm run dev` | Starts Next.js dev server on `http://localhost:3000` |
