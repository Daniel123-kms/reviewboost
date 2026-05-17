import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  return data.access_token || null
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const { reviewId, replyText } = await request.json()
  if (!reviewId || !replyText?.trim()) return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 })

  // Load review
  const { data: review } = await supabase.from('reviews').select('*').eq('id', reviewId).eq('user_id', user.id).single()
  if (!review) return NextResponse.json({ error: 'Bewertung nicht gefunden' }, { status: 404 })
  if (review.google_reply_posted) return NextResponse.json({ error: 'Bereits auf Google gepostet' }, { status: 409 })
  if (!review.google_review_id) return NextResponse.json({ error: 'Keine Google Review ID — nur über Google Business Profile verbundene Bewertungen können direkt beantwortet werden.' }, { status: 400 })

  // Load business with Google tokens
  const bizQuery = review.business_id
    ? supabase.from('businesses').select('*').eq('id', review.business_id).single()
    : supabase.from('businesses').select('*').eq('user_id', user.id).eq('google_connected', true).limit(1).single()

  const { data: biz } = await bizQuery
  if (!biz?.google_account_id || !biz?.google_location_id) {
    return NextResponse.json({ error: 'Google Business nicht verbunden' }, { status: 400 })
  }

  // Get fresh access token
  let accessToken = biz.google_access_token
  if (biz.google_refresh_token) {
    const fresh = await refreshAccessToken(biz.google_refresh_token)
    if (fresh) {
      accessToken = fresh
      await supabase.from('businesses').update({ google_access_token: fresh }).eq('id', biz.id)
    }
  }

  // Post reply to Google
  const replyUrl = `https://mybusiness.googleapis.com/v4/accounts/${biz.google_account_id}/locations/${biz.google_location_id}/reviews/${review.google_review_id}/reply`
  const replyRes = await fetch(replyUrl, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment: replyText.trim() }),
  })

  if (!replyRes.ok) {
    const errData = await replyRes.json()
    console.error('Google reply error:', errData)
    return NextResponse.json({ error: `Google Fehler: ${errData?.error?.message || replyRes.status}` }, { status: 500 })
  }

  // Mark as posted — cannot be undone
  await supabase.from('reviews').update({ google_reply_posted: true, responded: true }).eq('id', reviewId)

  return NextResponse.json({ success: true })
}
