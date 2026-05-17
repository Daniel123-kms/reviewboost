import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect('https://reviewboost-lyart.vercel.app/dashboard?google=error')
  }

  let businessId = ''
  try {
    const decoded = JSON.parse(Buffer.from(state || '', 'base64url').toString())
    businessId = decoded.businessId || ''
  } catch { /* ignore */ }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect('https://reviewboost-lyart.vercel.app/login')

  const clientId = process.env.GOOGLE_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
  const redirectUri = 'https://reviewboost-lyart.vercel.app/auth/google-business/callback'

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: clientId, client_secret: clientSecret,
        redirect_uri: redirectUri, grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokens.access_token) throw new Error('No access token')

    const accessToken = tokens.access_token
    const refreshToken = tokens.refresh_token || ''

    // 2. Get Google Business accounts
    const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const accountsData = await accountsRes.json()
    const accounts: Array<{ name: string }> = accountsData.accounts || []
    if (accounts.length === 0) throw new Error('No accounts found')

    // 3. Get locations for first account
    const accountName = accounts[0].name
    const locationsRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storefrontAddress,metadata`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const locationsData = await locationsRes.json()
    const locations: Array<{ name: string; title: string; metadata?: { placeId?: string } }> = locationsData.locations || []

    // 4. Find matching location (by businessId's place_id or first location)
    let matchedLocation = locations[0]
    if (businessId) {
      const { data: biz } = await supabase.from('businesses').select('place_id').eq('id', businessId).single()
      if (biz?.place_id) {
        const found = locations.find((l) => l.metadata?.placeId === biz.place_id)
        if (found) matchedLocation = found
      }
    }

    if (!matchedLocation) throw new Error('No location found')

    // Extract IDs from name like "accounts/123/locations/456"
    const locationName = matchedLocation.name
    const accountId = accountName.split('/')[1]
    const locationId = locationName.split('/')[3]

    // 5. Store tokens in business
    const updateData = {
      google_access_token: accessToken,
      google_refresh_token: refreshToken,
      google_account_id: accountId,
      google_location_id: locationId,
      google_connected: true,
    }

    if (businessId) {
      await supabase.from('businesses').update(updateData).eq('id', businessId).eq('user_id', user.id)
    } else {
      await supabase.from('businesses').update(updateData).eq('user_id', user.id)
    }

    // 6. Fetch all reviews from past 12 months
    const reviewsRes = await fetch(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews?pageSize=50`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const reviewsData = await reviewsRes.json()
    const googleReviews: Array<{
      reviewId: string; reviewer: { displayName: string };
      starRating: string; comment?: string; createTime: string;
    }> = reviewsData.reviews || []

    const starMap: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }
    const cutoff = new Date(); cutoff.setFullYear(cutoff.getFullYear() - 1)

    let inserted = 0
    for (const review of googleReviews) {
      const reviewDate = new Date(review.createTime)
      if (reviewDate < cutoff) continue

      // Check duplicate by google_review_id
      const { data: existing } = await supabase
        .from('reviews').select('id').eq('google_review_id', review.reviewId).limit(1)
      if (existing && existing.length > 0) continue

      await supabase.from('reviews').insert({
        user_id: user.id,
        business_id: businessId || null,
        google_review_id: review.reviewId,
        author_name: review.reviewer.displayName || 'Google Nutzer',
        platform: 'Google',
        rating: starMap[review.starRating] || 3,
        content: review.comment || '(Kein Text hinterlassen)',
        created_at: review.createTime,
        responded: false,
        google_reply_posted: false,
      })
      inserted++
    }

    return NextResponse.redirect(`https://reviewboost-lyart.vercel.app/dashboard?google=connected&imported=${inserted}`)
  } catch (err) {
    console.error('Google Business callback error:', err)
    return NextResponse.redirect('https://reviewboost-lyart.vercel.app/dashboard?google=error')
  }
}
