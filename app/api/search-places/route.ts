import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'Google Places API Key nicht konfiguriert.' }, { status: 500 })
  }

  try {
    // Text Search
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=de&key=${apiKey}`,
      { next: { revalidate: 0 } }
    )
    const searchData = await searchRes.json()

    if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
      return NextResponse.json({ error: `Google API Fehler: ${searchData.status}` }, { status: 500 })
    }

    const places = (searchData.results || []).slice(0, 6).map((place: {
      place_id: string;
      name: string;
      formatted_address: string;
      rating?: number;
      user_ratings_total?: number;
      photos?: Array<{ photo_reference: string }>;
      types?: string[];
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
