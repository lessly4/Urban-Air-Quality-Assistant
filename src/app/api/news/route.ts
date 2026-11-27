import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { newsRateLimiter, getClientIp } from "@/utils/rateLimiter";
import {
  NewsArticle,
  NewsCategory,
  NewsResponseSchema,
} from "@/types/airQuality";

const NewsQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(120)
    .optional()
    .default('("air quality" OR "air pollution" OR PM2.5 OR smog OR AQI)'),
  city: z.string().trim().max(80).optional(),
  country: z.string().trim().max(80).optional(),
  location: z.string().trim().max(100).optional(),
});

const RELEVANCE_KEYWORDS = [
  "aqi",
  "pm2.5",
  "pm10",
  "air quality",
  "air pollution",
  "smog",
  "particulate",
  "clean air",
  "respiratory",
  "inversion",
  "emissions",
];

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function classifyCategory(title: string, description: string): NewsCategory {
  const combined = `${title} ${description}`.toLowerCase();
  if (
    /\b(health|asthma|lung|respiratory|hospital|cardiovascular|children|who)\b/.test(
      combined
    )
  ) {
    return "Health";
  }
  if (
    /\b(policy|government|ban|law|regulation|initiative|epa|standard|clean air act|subsidy|ev|transit)\b/.test(
      combined
    )
  ) {
    return "Policy";
  }
  if (/\b(aqi|index|pm2\.5|pm10|forecast|alert|level|hazardous)\b/.test(combined)) {
    return "AQI";
  }
  return "Pollution";
}

function sortArticlesByRelevanceAndDate(articles: NewsArticle[]): NewsArticle[] {
  return [...articles].sort((a, b) => {
    const aText = `${a.title} ${a.description}`.toLowerCase();
    const bText = `${b.title} ${b.description}`.toLowerCase();

    const aScore = RELEVANCE_KEYWORDS.reduce(
      (acc, kw) => (aText.includes(kw) ? acc + 1 : acc),
      0
    );
    const bScore = RELEVANCE_KEYWORDS.reduce(
      (acc, kw) => (bText.includes(kw) ? acc + 1 : acc),
      0
    );

    const aTime = new Date(a.publishedAt).getTime() || 0;
    const bTime = new Date(b.publishedAt).getTime() || 0;

    const aRank = aTime + aScore * 3_600_000;
    const bRank = bTime + bScore * 3_600_000;
    return bRank - aRank;
  });
}

async function fetchFromGNews(
  query: string,
  apiKey: string,
  prefix: string
): Promise<NewsArticle[]> {
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
    query
  )}&lang=en&max=9&sortby=publishedAt&apikey=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) {
    throw new Error(`GNews API failed with status ${res.status}`);
  }

  const data = await res.json();
  const rawArticles = Array.isArray(data?.articles) ? data.articles : [];

  return rawArticles
    .filter((item: Record<string, unknown>) => item?.title && item?.url)
    .map((item: Record<string, unknown>, idx: number) => {
      const title = String(item.title);
      const description = String(item.description || item.content || "").slice(0, 240);
      const sourceObj = item.source as { name?: string } | undefined;
      return {
        id: `${prefix}-gnews-${idx}-${Buffer.from(String(item.url)).toString("base64").slice(0, 12)}`,
        title,
        description:
          description || "Read the full report for updated regional air quality insights.",
        url: String(item.url),
        imageUrl: null,
        source: sourceObj?.name ? String(sourceObj.name) : "Global News",
        publishedAt: item.publishedAt
          ? new Date(String(item.publishedAt)).toISOString()
          : new Date().toISOString(),
        category: classifyCategory(title, description),
      };
    });
}

async function fetchFromNewsApi(
  query: string,
  apiKey: string,
  prefix: string
): Promise<NewsArticle[]> {
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
    query
  )}&language=en&sortBy=publishedAt&pageSize=9&apiKey=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) {
    throw new Error(`NewsAPI failed with status ${res.status}`);
  }

  const data = await res.json();
  const rawArticles = Array.isArray(data?.articles) ? data.articles : [];

  return rawArticles
    .filter(
      (item: Record<string, unknown>) =>
        item?.title && item?.url && String(item.title) !== "[Removed]"
    )
    .map((item: Record<string, unknown>, idx: number) => {
      const title = String(item.title);
      const description = String(item.description || "").slice(0, 240);
      const sourceObj = item.source as { name?: string } | undefined;
      return {
        id: `${prefix}-newsapi-${idx}-${Buffer.from(String(item.url)).toString("base64").slice(0, 12)}`,
        title,
        description:
          description || "Read the full report for updated regional air quality insights.",
        url: String(item.url),
        imageUrl: null,
        source: sourceObj?.name ? String(sourceObj.name) : "NewsWire",
        publishedAt: item.publishedAt
          ? new Date(String(item.publishedAt)).toISOString()
          : new Date().toISOString(),
        category: classifyCategory(title, description),
      };
    });
}

function extractXmlTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

async function fetchFromGoogleNewsRss(
  query: string,
  prefix: string
): Promise<NewsArticle[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    query
  )}&hl=en-US&gl=US&ceid=US:en`;

  const res = await fetch(url, {
    next: { revalidate: 900 },
    headers: {
      "User-Agent": "UrbanAirQualityAssistant/1.0",
    },
  });

  if (!res.ok) {
    throw new Error(`RSS feed failed with status ${res.status}`);
  }

  const xml = await res.text();
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];

  const articles: NewsArticle[] = [];
  for (let idx = 0; idx < Math.min(itemMatches.length, 12); idx++) {
    const block = itemMatches[idx];
    const rawTitle = stripTags(extractXmlTag(block, "title"));
    const link = decodeHtmlEntities(extractXmlTag(block, "link")).trim();
    const pubDate = extractXmlTag(block, "pubDate");
    const sourceTag = stripTags(extractXmlTag(block, "source"));
    const rawDesc = stripTags(extractXmlTag(block, "description"));

    if (!rawTitle || !link || !link.startsWith("http")) {
      continue;
    }

    let cleanTitle = rawTitle;
    let sourceName = sourceTag || "Global Environmental Desk";
    const dashIndex = rawTitle.lastIndexOf(" - ");
    if (dashIndex > 15) {
      cleanTitle = rawTitle.slice(0, dashIndex).trim();
      if (!sourceTag) {
        sourceName = rawTitle.slice(dashIndex + 3).trim();
      }
    }

    const cleanDesc =
      rawDesc && rawDesc !== cleanTitle
        ? rawDesc.slice(0, 220)
        : `Coverage from ${sourceName} on urban air quality, particulate trends, and public health.`;

    const parsedDate = pubDate ? new Date(pubDate) : new Date();
    const isoDate = Number.isNaN(parsedDate.getTime())
      ? new Date().toISOString()
      : parsedDate.toISOString();

    articles.push({
      id: `${prefix}-rss-${idx}-${Buffer.from(link).toString("base64").slice(0, 12)}`,
      title: cleanTitle,
      description: cleanDesc,
      url: link,
      imageUrl: null,
      source: sourceName,
      publishedAt: isoDate,
      category: classifyCategory(cleanTitle, cleanDesc),
    });
  }

  return articles;
}

async function fetchNewsByQuery(
  query: string,
  rssFallbackQuery: string,
  prefix: string,
  gnewsKey?: string,
  newsApiKey?: string
): Promise<{ articles: NewsArticle[]; source: "gnews" | "newsapi" | "rss_fallback" }> {
  let articles: NewsArticle[] = [];
  let source: "gnews" | "newsapi" | "rss_fallback" = "rss_fallback";

  if (gnewsKey) {
    try {
      articles = await fetchFromGNews(query, gnewsKey, prefix);
      source = "gnews";
    } catch (err) {
      console.warn(`GNews fetch failed (${prefix}), falling back to RSS:`, err);
    }
  } else if (newsApiKey) {
    try {
      articles = await fetchFromNewsApi(query, newsApiKey, prefix);
      source = "newsapi";
    } catch (err) {
      console.warn(`NewsAPI fetch failed (${prefix}), falling back to RSS:`, err);
    }
  }

  if (articles.length === 0) {
    articles = await fetchFromGoogleNewsRss(rssFallbackQuery, prefix);
    source = "rss_fallback";
  }

  return {
    articles: sortArticlesByRelevanceAndDate(articles).slice(0, 9),
    source,
  };
}

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request.headers);
  const rateLimit = newsRateLimiter.check(clientIp);

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: "Too many requests. Please slow down.",
        retryAfter: Math.ceil(rateLimit.resetInMs / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(rateLimit.resetInMs / 1000).toString(),
          "X-RateLimit-Limit": rateLimit.limit.toString(),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const rawQuery = request.nextUrl.searchParams.get("q") || undefined;
    const rawCity = request.nextUrl.searchParams.get("city") || undefined;
    const rawCountry = request.nextUrl.searchParams.get("country") || undefined;
    const rawLocation = request.nextUrl.searchParams.get("location") || undefined;

    const validation = NewsQuerySchema.safeParse({
      q: rawQuery,
      city: rawCity,
      country: rawCountry,
      location: rawLocation,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid news query parameter", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { q: globalQuery, city, country, location } = validation.data;
    const activeCity = (city || location || "").trim();
    const gnewsKey = process.env.GNEWS_API_KEY?.trim();
    const newsApiKey = process.env.NEWS_API_KEY?.trim();

    const localQuery = activeCity
      ? `"${activeCity}" ("air quality" OR "air pollution" OR smog OR PM2.5 OR AQI)`
      : "";
    const localRssQuery = activeCity
      ? `${activeCity}${country ? ` ${country}` : ""} ("air quality" OR "air pollution" OR smog OR PM2.5)`
      : "";

    const [globalResult, localResult] = await Promise.all([
      fetchNewsByQuery(
        globalQuery,
        "air quality OR PM2.5 OR urban smog OR air pollution",
        "global",
        gnewsKey,
        newsApiKey
      ),
      activeCity
        ? fetchNewsByQuery(
            localQuery,
            localRssQuery,
            "local",
            gnewsKey,
            newsApiKey
          ).catch((err) => {
            console.warn(`Local news fetch failed for ${activeCity}:`, err);
            return { articles: [] as NewsArticle[], source: "rss_fallback" as const };
          })
        : Promise.resolve({ articles: [] as NewsArticle[], source: "rss_fallback" as const }),
    ]);

    const payload = NewsResponseSchema.parse({
      localNews: localResult.articles,
      globalNews: globalResult.articles,
      locationName: activeCity || undefined,
      source: globalResult.source,
      fetchedAt: new Date().toISOString(),
    });

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        "X-RateLimit-Limit": rateLimit.limit.toString(),
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      },
    });
  } catch (error: unknown) {
    const err = error as { digest?: string; name?: string };
    if (err?.digest === "NEXT_PRERENDER_INTERRUPTED" || err?.name === "DynamicServerError") {
      throw error;
    }
    console.error("News API route error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve global air quality news" },
      { status: 500 }
    );
  }
}
