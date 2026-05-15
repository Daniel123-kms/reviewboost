import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { address, radius, cuisine } = await request.json();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) return NextResponse.json({ error: "API Key fehlt" }, { status: 500 });
  if (!address) return NextResponse.json({ error: "Adresse fehlt" }, { status: 400 });

  try {
    // 1. Geocode address → lat/lng
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&language=de&key=${apiKey}`,
      { next: { revalidate: 0 } }
    );
    const geoData = await geoRes.json();

    if (geoData.status !== "OK" || !geoData.results?.[0]) {
      return NextResponse.json({ error: "Adresse nicht gefunden. Bitte genauer eingeben." }, { status: 400 });
    }

    const { lat, lng } = geoData.results[0].geometry.location;
    const formattedAddress = geoData.results[0].formatted_address;

    // 2. Nearby Search — type=restaurant, keyword = cuisine type
    const keyword = cuisine ? encodeURIComponent(cuisine) : "restaurant";
    const nearbyRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=restaurant&keyword=${keyword}&language=de&key=${apiKey}`,
      { next: { revalidate: 0 } }
    );
    const nearbyData = await nearbyRes.json();

    if (nearbyData.status !== "OK" && nearbyData.status !== "ZERO_RESULTS") {
      return NextResponse.json({ error: `Google Fehler: ${nearbyData.status}` }, { status: 500 });
    }

    const competitors = (nearbyData.results || [])
      .slice(0, 15)
      .map((p: {
        place_id: string;
        name: string;
        rating?: number;
        user_ratings_total?: number;
        vicinity?: string;
        business_status?: string;
        photos?: { photo_reference: string }[];
        price_level?: number;
      }) => ({
        placeId: p.place_id,
        name: p.name,
        rating: p.rating ?? 0,
        reviewCount: p.user_ratings_total ?? 0,
        vicinity: p.vicinity ?? "",
        status: p.business_status ?? "OPERATIONAL",
        priceLevel: p.price_level ?? null,
        mapsUrl: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
      }))
      .filter((p: { status: string }) => p.status === "OPERATIONAL");

    return NextResponse.json({ competitors, location: { lat, lng }, formattedAddress });
  } catch (err) {
    console.error("Competitors error:", err);
    return NextResponse.json({ error: "Suche fehlgeschlagen." }, { status: 500 });
  }
}
