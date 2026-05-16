import { NextResponse } from 'next/server'

// Country indicators that are NOT DACH – filter these out
const NON_DACH_PATTERNS = [
  ', usa', 'united states', ', uk', 'united kingdom', ', australia',
  ', canada', ', france', ', italy', ', spain', ', netherlands',
  ', poland', ', hungary', ', czech', ', slovakia', ', belgium',
  ', sweden', ', denmark', ', norway', ', finland', ', russia',
  ', china', ', japan', ', brazil', ', mexico', ', india',
];
function isNonDach(address: string): boolean {
  const lc = address.toLowerCase();
  return NON_DACH_PATTERNS.some((p) => lc.includes(p));
}

const COUNTRY_CONFIG: Record<string, { region: string; lat: number; lng: number; radius: number; label: string }> = {
  at: { region: "at", lat: 47.8095, lng: 13.0550, radius: 250000, label: "Österreich" },
  de: { region: "de", lat: 51.1657, lng: 10.4515, radius: 400000, label: "Deutschland" },
  ch: { region: "ch", lat: 46.8182, lng: 8.2275, radius: 200000, label: "Schweiz" },
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const country = searchParams.get('country') || 'at'

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey || apiKey === 'your_google_places_api_key') {
    return NextResponse.json({ results: [] })
  }

  const config = COUNTRY_CONFIG[country] ?? COUNTRY_CONFIG.at
  const locationBias = `circle:${config.radius}@${config.lat},${config.lng}`

  try {
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=de&region=${config.region}&locationbias=${locationBias}&key=${apiKey}`,
      { next: { revalidate: 0 } }
    )
    const searchData = await searchRes.json()

    if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
      return NextResponse.json({ error: `Google API Fehler: ${searchData.status}` }, { status: 500 })
    }

    const places = (searchData.results || [])
      .filter((place: { formatted_address: string }) => !isNonDach(place.formatted_address))
      .slice(0, 6)
      .map((place: {
      place_id: string; name: string; formatted_address: string;
      rating?: number; user_ratings_total?: number;
      photos?: Array<{ photo_reference: string }>; types?: string[];
    }) => ({
      place_id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      total_ratings: place.user_ratings_total,
      photo_url: place.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=120&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
        : null,
      google_maps_url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      google_review_url: `https://search.google.com/local/writereview?placeid=${place.place_id}`,
      types: place.types || [],
    }))

    return NextResponse.json({ results: places })
  } catch (err) {
    console.error('Places search error:', err)
    return NextResponse.json({ error: 'Suche fehlgeschlagen.' }, { status: 500 })
  }
}
