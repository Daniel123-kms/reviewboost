import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { customerName, customerEmail, platform, reviewLink, businessName } = await request.json()

  if (!customerName || !customerEmail || !platform) {
    return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
  }

  const platformLinks: Record<string, string> = {
    Google: reviewLink || 'https://search.google.com/local/writereview',
    Tripadvisor: reviewLink || 'https://www.tripadvisor.com',
    'Booking.com': reviewLink || 'https://www.booking.com',
    Yelp: reviewLink || 'https://www.yelp.com',
    Facebook: reviewLink || 'https://www.facebook.com',
  }

  const link = platformLinks[platform] || reviewLink

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ihre Meinung ist uns wichtig</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:36px 40px;text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                Review<span style="color:#c7d2fe;">Boost</span>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 16px;">
                Liebe/r ${customerName},
              </p>
              <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;">
                wir hoffen, dass Sie Ihren Besuch bei <strong>${businessName || 'uns'}</strong> genossen haben
                und möchten uns herzlich für Ihr Vertrauen bedanken! ❤️
              </p>
              <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 32px;">
                Ihre Erfahrung bedeutet uns sehr viel. Eine kurze Bewertung auf <strong>${platform}</strong>
                würde uns enorm helfen — es dauert nur <strong>60 Sekunden</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background:#6366f1;border-radius:12px;padding:0;">
                    <a href="${link}" style="display:block;padding:16px 36px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;letter-spacing:-0.2px;">
                      ⭐ Jetzt Bewertung schreiben
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0;text-align:center;">
                Es dauert nur eine Minute — und macht einen riesigen Unterschied für uns! 🙏
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="font-size:12px;color:#94a3b8;margin:0;">
                Diese E-Mail wurde über ReviewBoost versendet.
                Wenn Sie keine weiteren E-Mails erhalten möchten, können Sie sich jederzeit abmelden.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === 'your_resend_api_key') {
    return NextResponse.json({ error: 'Resend API Key nicht konfiguriert.' }, { status: 500 })
  }

  const resend = new Resend(apiKey)

  try {
    const { data, error } = await resend.emails.send({
      from: 'ReviewBoost <onboarding@resend.dev>',
      to: [customerEmail],
      subject: `${customerName}, wie war Ihr Besuch? ⭐`,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'E-Mail konnte nicht gesendet werden.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('Send error:', err)
    return NextResponse.json({ error: 'Interner Fehler.' }, { status: 500 })
  }
}
