import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function extractFromMapsUrl(url: string): { name: string | null; lat: number | null; lng: number | null } {
  try {
    // Extract name from /place/Name+Here/
    const nameMatch = url.match(/\/place\/([^/@]+)/);
    const name = nameMatch ? decodeURIComponent(nameMatch[1].replace(/\+/g, " ")) : null;

    // Extract coordinates
    const coordMatch = url.match(/@([-\d.]+),([-\d.]+)/);
    const lat = coordMatch ? parseFloat(coordMatch[1]) : null;
    const lng = coordMatch ? parseFloat(coordMatch[2]) : null;

    return { name, lat, lng };
  } catch {
    return { name: null, lat: null, lng: null };
  }
}

async function resolveUrl(url: string): Promise<string> {
  // Follow redirects for shortened URLs (goo.gl, maps.app.goo.gl, etc.)
  if (url.includes("goo.gl") || url.includes("maps.app.goo.gl")) {
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      return res.url || url;
    } catch {
      return url;
    }
  }
  return url;
}

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API Key fehlt" }, { status: 500 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const { mapsUrl: rawUrl } = await request.json();
  if (!rawUrl) return NextResponse.json({ error: "URL fehlt" }, { status: 400 });

  const mapsUrl = await resolveUrl(rawUrl);
  const { name, lat, lng } = extractFromMapsUrl(mapsUrl);

  if (!name) return NextResponse.json({ error: "Business-Name konnte nicht aus URL gelesen werden." }, { status: 400 });

  try {
    // Step 1: Find place_id via Text Search (use coordinate bias if available)
    const locationBias = lat && lng ? `&location=${lat},${lng}&radius=500` : "";
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(name)}${locationBias}&language=de&key=${apiKey}`,
      { next: { revalidate: 0 } }
    );
    const searchData = await searchRes.json();

    if (searchData.status !== "OK" || !searchData.results?.[0]) {
      return NextResponse.json({ error: `Ort nicht gefunden: ${searchData.status}` }, { status: 404 });
    }

    // Pick closest result if we have coordinates
    let place = searchData.results[0];
    if (lat && lng) {
      place = searchData.results.reduce((best: typeof place, current: typeof place) => {
        const dl = (p: typeof place) => Math.abs(p.geometry.location.lat - lat!) + Math.abs(p.geometry.location.lng - lng!);
        return dl(current) < dl(best) ? current : best;
      }, searchData.results[0]);
    }

    const placeId = place.place_id;
    const businessRating = place.rating ?? null;
    const totalReviews = place.user_ratings_total ?? 0;

    // Step 2: Get Place Details with reviews
    const detailsRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,formatted_address&language=de&key=${apiKey}`,
      { next: { revalidate: 0 } }
    );
    const detailsData = await detailsRes.json();

    if (detailsData.status !== "OK") {
      return NextResponse.json({ error: `Place Details Fehler: ${detailsData.status}` }, { status: 500 });
    }

    const details = detailsData.result;
    const googleReviews: Array<{
      author_name: string;
      rating: number;
      text: string;
      time: number;
    }> = details.reviews || [];

    if (googleReviews.length === 0) {
      return NextResponse.json({
        error: "Google gibt für diesen Betrieb keine öffentlichen Bewertungen zurück. Das ist eine Einschränkung der Google Places API (max. 5 Bewertungen, nur wenn öffentlich verfügbar).",
        placeId, businessName: details.name, totalReviews,
      }, { status: 404 });
    }

    // Step 3: Insert into reviews table (skip duplicates by author+content)
    const inserted: string[] = [];
    const skipped: string[] = [];

    for (const r of googleReviews) {
      // Check if already exists
      const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", user.id)
        .eq("author_name", r.author_name)
        .eq("platform", "Google")
        .eq("rating", r.rating)
        .maybeSingle();

      if (existing) { skipped.push(r.author_name); continue; }

      const reviewDate = new Date(r.time * 1000).toISOString();

      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        author_name: r.author_name,
        platform: "Google",
        rating: r.rating,
        content: r.text || "(Keine Bewertungstext)",
        responded: false,
        created_at: reviewDate,
      });

      if (!error) {
        inserted.push(r.author_name);
        // Fire alert for low-rating NEW reviews (1-2 stars)
        if (r.rating <= 2) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "https://reviewboost-lyart.vercel.app"}/api/alert-notification`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                businessName: details.name,
                authorName: r.author_name,
                rating: r.rating,
                content: r.text || "(Kein Bewertungstext)",
                platform: "Google",
                reviewDate: new Date(r.time * 1000).toLocaleDateString("de-AT", { day: "2-digit", month: "short", year: "numeric" }),
              }),
            });
          } catch {
            // Alert failure should not block the import
          }
        }
      } else {
        skipped.push(r.author_name);
      }
    }

    return NextResponse.json({
      success: true,
      inserted: inserted.length,
      skipped: skipped.length,
      totalOnGoogle: totalReviews,
      businessName: details.name,
      businessRating,
      placeId,
      note: totalReviews > 5
        ? `Google Places API gibt maximal 5 Bewertungen zurück. Dein Betrieb hat ${totalReviews} auf Google. Für alle Bewertungen ist die Google Business Profile API nötig (OAuth-Verbindung).`
        : null,
    });

  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json({ error: "Import fehlgeschlagen." }, { status: 500 });
  }
}
