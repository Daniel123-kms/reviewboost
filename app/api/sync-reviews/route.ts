import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API Key fehlt' }, { status: 500 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const { businessId } = await request.json()
  if (!businessId) return NextResponse.json({ error: 'businessId fehlt' }, { status: 400 })

  const { data: biz } = await supabase
    .from('businesses')
    .select('id, name, place_id')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single()

  if (!biz) return NextResponse.json({ error: 'Betrieb nicht gefunden' }, { status: 404 })
  if (!biz.place_id) return NextResponse.json({ error: 'Kein Google Place ID. Bitte Betrieb neu über Suche hinzufügen.' }, { status: 400 })

  try {
    const detailsRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${biz.place_id}&fields=reviews,rating,user_ratings_total&language=de&key=${apiKey}`,
      { next: { revalidate: 0 } }
    )
    const detailsData = await detailsRes.json()

    if (detailsData.status !== 'OK') {
      return NextResponse.json({ error: `Google Fehler: ${detailsData.status}` }, { status: 500 })
    }

    const googleReviews: Array<{ author_name: string; rating: number; text: string; time: number }> =
      detailsData.result?.reviews || []

    let inserted = 0
    let skipped = 0

    for (const review of googleReviews) {
      const reviewDate = new Date(review.time * 1000).toISOString()
      const tsMin = new Date(review.time * 1000 - 86400000).toISOString()
      const tsMax = new Date(review.time * 1000 + 86400000).toISOString()

      const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('author_name', review.author_name)
        .eq('platform', 'Google')
        .gte('created_at', tsMin)
        .lte('created_at', tsMax)
        .limit(1)

      if (existing && existing.length > 0) { skipped++; continue }

      await supabase.from('reviews').insert({
        user_id: user.id,
        business_id: biz.id,
        author_name: review.author_name,
        platform: 'Google',
        rating: review.rating,
        content: review.text || '(Kein Text hinterlassen)',
        created_at: reviewDate,
        responded: false,
      })
      inserted++
    }

    return NextResponse.json({
      inserted,
      skipped,
      total: googleReviews.length,
      businessName: biz.name,
    })
  } catch (err) {
    console.error('sync-reviews error:', err)
    return NextResponse.json({ error: 'Sync fehlgeschlagen.' }, { status: 500 })
  }
}
