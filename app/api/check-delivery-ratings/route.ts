import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type PlatformResult = {
  platform: string;
  rating: number | null;
  reviewCount: number | null;
  name: string | null;
  error: string | null;
};

// Austria-relevante Plattformen: Lieferando.at, Uber Eats, Wolt, Foodora
const PLATFORMS = ["Lieferando.at", "Uber Eats", "Wolt", "Foodora"];

async function scrapeLieferando(query: string): Promise<PlatformResult> {
  try {
    const searchUrl = `https://www.lieferando.at/lieferservice/essen/${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ReviewBoost/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    const ratingMatch = html.match(/"ratingValue"\s*:\s*"?([\d.]+)"?/);
    const countMatch = html.match(/"ratingCount"\s*:\s*"?(\d+)"?/) || html.match(/"reviewCount"\s*:\s*"?(\d+)"?/);
    const nameMatch = html.match(/"name"\s*:\s*"([^"]+)"/);

    if (ratingMatch) {
      return {
        platform: "Lieferando.at",
        rating: parseFloat(ratingMatch[1]),
        reviewCount: countMatch ? parseInt(countMatch[1]) : null,
        name: nameMatch?.[1] || null,
        error: null,
      };
    }

    return { platform: "Lieferando.at", rating: null, reviewCount: null, name: null, error: "Nicht gefunden" };
  } catch (e) {
    return { platform: "Lieferando.at", rating: null, reviewCount: null, name: null, error: "Fehler beim Scrapen" };
  }
}

async function scrapeUberEats(query: string): Promise<PlatformResult> {
  try {
    const searchUrl = `https://www.ubereats.com/at/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ReviewBoost/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    const ratingMatch = html.match(/"ratingValue"\s*:\s*"?([\d.]+)"?/) || html.match(/(\d\.\d)\s*\(\d+\+?\)/);
    const countMatch = html.match(/"ratingCount"\s*:\s*"?(\d+)"?/) || html.match(/\d\.\d\s*\((\d+)\+?\)/);
    const nameMatch = html.match(/"name"\s*:\s*"([^"]+)"/);

    if (ratingMatch) {
      return {
        platform: "Uber Eats",
        rating: parseFloat(ratingMatch[1]),
        reviewCount: countMatch ? parseInt(countMatch[1]) : null,
        name: nameMatch?.[1] || null,
        error: null,
      };
    }
    return { platform: "Uber Eats", rating: null, reviewCount: null, name: null, error: "Nicht gefunden" };
  } catch (e) {
    return { platform: "Uber Eats", rating: null, reviewCount: null, name: null, error: "Fehler beim Scrapen" };
  }
}

async function scrapeWolt(query: string, city?: string): Promise<PlatformResult> {
  try {
    // Vienna coords (48.2082, 16.3738), adjust based on city if needed
    let lat = 48.2082, lon = 16.3738;
    if (city?.toLowerCase().includes("linz")) { lat = 48.286; lon = 14.290; }
    else if (city?.toLowerCase().includes("salzburg")) { lat = 47.811; lon = 13.050; }
    else if (city?.toLowerCase().includes("graz")) { lat = 47.070; lon = 15.438; }

    const searchUrl = `https://restaurant-api.wolt.com/v1/pages/search?q=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}`;
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ReviewBoost/1.0)" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();
      const results = data?.sections?.[0]?.items || [];
      if (results.length > 0) {
        const first = results[0]?.venue || results[0];
        return {
          platform: "Wolt",
          rating: first?.rating?.score ?? null,
          reviewCount: first?.rating?.count ?? null,
          name: first?.name?.[0]?.value || first?.name || null,
          error: null,
        };
      }
    }
    return { platform: "Wolt", rating: null, reviewCount: null, name: null, error: "Nicht gefunden" };
  } catch (e) {
    return { platform: "Wolt", rating: null, reviewCount: null, name: null, error: "Fehler beim Scrapen" };
  }
}

async function scrapeFoodora(query: string): Promise<PlatformResult> {
  try {
    const searchUrl = `https://www.foodora.at/search?search_query=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ReviewBoost/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    // Foodora uses similar JSON-LD structure as Lieferando
    const ratingMatch = html.match(/"ratingValue"\s*:\s*"?([\d.]+)"?/);
    const countMatch = html.match(/"ratingCount"\s*:\s*"?(\d+)"?/) || html.match(/"reviewCount"\s*:\s*"?(\d+)"?/);
    const nameMatch = html.match(/"name"\s*:\s*"([^"]+)"/);

    if (ratingMatch) {
      return {
        platform: "Foodora",
        rating: parseFloat(ratingMatch[1]),
        reviewCount: countMatch ? parseInt(countMatch[1]) : null,
        name: nameMatch?.[1] || null,
        error: null,
      };
    }

    return { platform: "Foodora", rating: null, reviewCount: null, name: null, error: "Nicht gefunden" };
  } catch (e) {
    return { platform: "Foodora", rating: null, reviewCount: null, name: null, error: "Fehler beim Scrapen" };
  }
}

export async function POST(request: Request) {
  const { businessName, city, userId } = await request.json();
  if (!businessName) return NextResponse.json({ error: "Betriebsname fehlt" }, { status: 400 });

  const query = city ? `${businessName} ${city}` : businessName;

  // Run all scrapers in parallel — Austria-only platforms
  const results = await Promise.all([
    scrapeLieferando(query),
    scrapeUberEats(query),
    scrapeWolt(query, city),
    scrapeFoodora(query),
  ]);

  // Save to Supabase if userId provided
  if (userId) {
    try {
      const supabase = await createClient();
      for (const result of results) {
        if (result.rating !== null) {
          await supabase.from("delivery_platform_ratings").insert({
            user_id: userId,
            platform: result.platform,
            rating: result.rating,
            review_count: result.reviewCount,
            restaurant_name: result.name,
          });
        }
      }
    } catch (e) {
      // Silent fail — don't block the response
    }
  }

  return NextResponse.json({
    results,
    query,
    platforms: PLATFORMS,
    foundCount: results.filter((r) => r.rating !== null).length,
  });
}
