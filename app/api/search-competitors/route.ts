import { NextResponse } from "next/server";

type CompetitorResult = {
  name: string;
  rating: number | null;
  reviewCount: number | null;
  address: string | null;
  types: string[];
};

export async function POST(request: Request) {
  const { businessName, city, radius = 2000, googleApiKey } = await request.json();
  
  if (!businessName || !googleApiKey) {
    return NextResponse.json({ 
      error: "businessName und googleApiKey erforderlich" 
    }, { status: 400 });
  }

  if (!googleApiKey || googleApiKey === "your_google_places_api_key") {
    return NextResponse.json({ 
      error: "Google Places API Key nicht konfiguriert. Trage ihn in Einstellungen ein.",
      configured: false 
    }, { status: 400 });
  }

  try {
    // Step 1: Find our restaurant to get location
    const query = city ? `${businessName} ${city}` : businessName;
    
    const textSearchUrl = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    textSearchUrl.searchParams.append("query", query);
    textSearchUrl.searchParams.append("key", googleApiKey);

    const searchRes = await fetch(textSearchUrl.toString(), {
      signal: AbortSignal.timeout(8000),
    });
    const searchData = await searchRes.json();

    if (searchData.results.length === 0) {
      return NextResponse.json({
        error: "Restaurant nicht gefunden",
        competitors: [],
      });
    }

    // Step 2: Use location to find nearby restaurants
    const ourPlace = searchData.results[0];
    const { lat, lng } = ourPlace.geometry.location;
    const ourRating = ourPlace.rating;

    // Find nearby restaurants
    const nearbyUrl = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    nearbyUrl.searchParams.append("location", `${lat},${lng}`);
    nearbyUrl.searchParams.append("radius", String(radius));
    nearbyUrl.searchParams.append("type", "restaurant");
    nearbyUrl.searchParams.append("key", googleApiKey);

    const nearbyRes = await fetch(nearbyUrl.toString(), {
      signal: AbortSignal.timeout(8000),
    });
    const nearbyData = await nearbyRes.json();

    // Filter out our own restaurant and sort by rating
    const competitors: CompetitorResult[] = (nearbyData.results || [])
      .filter((r: any) => r.name.toLowerCase() !== businessName.toLowerCase())
      .slice(0, 5)
      .map((r: any) => ({
        name: r.name,
        rating: r.rating || null,
        reviewCount: r.user_ratings_total || null,
        address: r.vicinity || null,
        types: r.types || [],
      }))
      .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));

    return NextResponse.json({
      ourBusiness: {
        name: ourPlace.name,
        rating: ourRating,
        reviewCount: ourPlace.user_ratings_total,
      },
      competitors,
      count: competitors.length,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || "Fehler bei Konkurrenz-Suche",
      competitors: [],
    }, { status: 500 });
  }
}
