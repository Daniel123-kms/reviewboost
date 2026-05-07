import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

type Template = 'freundlich' | 'professionell' | 'gastro'

function buildEmailHtml(params: {
  customerName: string
  businessName: string
  platform: string
  link: string
  template: Template
}): { subject: string; html: string } {
  const { customerName, businessName, platform, link, template } = params

  if (template === 'professionell') {
    return {
      subject: `Ihre Erfahrung bei ${businessName} — Kurzes Feedback erwünscht`,
      html: `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:48px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:#0f172a;padding:32px 40px;">
            <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">
              Review<span style="color:#a5b4fc;">Boost</span>
            </div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 20px;">Sehr geehrte/r ${customerName},</p>
            <p style="font-size:14px;color:#475569;line-height:1.75;margin:0 0 16px;">
              wir möchten uns herzlich für Ihren Besuch bei <strong>${businessName}</strong> bedanken.
              Ihr Feedback ist für die kontinuierliche Verbesserung unserer Leistungen von großer Bedeutung.
            </p>
            <p style="font-size:14px;color:#475569;line-height:1.75;margin:0 0 32px;">
              Wir würden uns sehr freuen, wenn Sie sich einen Moment Zeit nehmen würden,
              Ihre Erfahrung auf <strong>${platform}</strong> zu teilen. Eine Bewertung dauert in der Regel nur wenige Minuten.
            </p>
            <!-- Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr>
                <td style="background:#0f172a;border-radius:6px;">
                  <a href="${link}" style="display:block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.2px;">
                    Jetzt Bewertung abgeben →
                  </a>
                </td>
              </tr>
            </table>
            <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin:0;">
              Vielen Dank für Ihr Vertrauen und Ihre Zeit.<br>
              Mit freundlichen Grüßen,<br>
              Das Team von ${businessName}
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #f1f5f9;">
            <p style="font-size:11px;color:#94a3b8;margin:0;text-align:center;">
              Diese Nachricht wurde über ReviewBoost versendet. Sie können sich jederzeit abmelden.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    }
  }

  if (template === 'gastro') {
    return {
      subject: `${customerName}, wie hat es dir bei uns geschmeckt? 🍽️`,
      html: `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fff7ed;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#ea580c,#f97316);padding:36px 40px;text-align:center;">
            <div style="font-size:40px;margin-bottom:12px;">🍽️</div>
            <div style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
              Review<span style="color:#fed7aa;">Boost</span>
            </div>
            <p style="font-size:14px;color:rgba(255,255,255,0.85);margin:8px 0 0;">Danke für deinen Besuch!</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="font-size:20px;font-weight:800;color:#0f172a;margin:0 0 6px;">
              Hey ${customerName}! 😊
            </p>
            <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;">
              Hat's dir bei <strong>${businessName}</strong> geschmeckt? 🤤
              Wir hoffen, du hast einen tollen Abend (oder Mittag!) bei uns verbracht.
            </p>
            <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 12px;">
              Ein kurzes Feedback auf <strong>${platform}</strong> würde uns riesig helfen —
              und anderen Foodies zeigen, was sie bei uns erwartet! ✨
            </p>
            <div style="background:#fff7ed;border-radius:12px;padding:16px;margin:0 0 28px;border:1px solid #fed7aa;">
              <p style="font-size:13px;color:#c2410c;font-weight:600;margin:0 0 4px;">⏱️ Dauert nur 60 Sekunden!</p>
              <p style="font-size:13px;color:#9a3412;margin:0;">Klick einfach auf den Button unten und schreib uns, wie es dir gefallen hat.</p>
            </div>
            <!-- Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
              <tr>
                <td style="background:#ea580c;border-radius:14px;padding:0;">
                  <a href="${link}" style="display:block;padding:16px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;letter-spacing:-0.2px;">
                    ⭐ Bewertung schreiben →
                  </a>
                </td>
              </tr>
            </table>
            <p style="font-size:14px;color:#94a3b8;text-align:center;margin:0;">
              Auf eine Wiedersehen bei ${businessName}! 🙌
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#fff7ed;padding:20px 40px;border-top:1px solid #fed7aa;text-align:center;">
            <p style="font-size:11px;color:#fb923c;margin:0;">
              Versendet über ReviewBoost • <a href="#" style="color:#fb923c;">Abmelden</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    }
  }

  // Default: freundlich
  return {
    subject: `${customerName}, wie war dein Besuch? ⭐`,
    html: `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:36px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
              Review<span style="color:#c7d2fe;">Boost</span>
            </div>
            <p style="font-size:14px;color:rgba(255,255,255,0.8);margin:8px 0 0;">Deine Meinung ist uns wichtig ❤️</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 16px;">
              Hey ${customerName}! 👋
            </p>
            <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;">
              Wir hoffen, dass du deinen Besuch bei <strong>${businessName || 'uns'}</strong> genossen hast!
              Danke, dass du bei uns warst — das bedeutet uns wirklich viel. ❤️
            </p>
            <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 32px;">
              Würdest du uns eine kurze Bewertung auf <strong>${platform}</strong> hinterlassen?
              Es dauert nur <strong>eine Minute</strong> und hilft uns enorm, noch besser zu werden! 🙏
            </p>
            <!-- Stars decoration -->
            <div style="text-align:center;font-size:28px;margin:0 0 24px;letter-spacing:4px;">⭐⭐⭐⭐⭐</div>
            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
              <tr>
                <td style="background:#6366f1;border-radius:12px;padding:0;">
                  <a href="${link}" style="display:block;padding:16px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;letter-spacing:-0.2px;">
                    ⭐ Jetzt Bewertung schreiben
                  </a>
                </td>
              </tr>
            </table>
            <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin:0;text-align:center;">
              Dauert nur 60 Sekunden — macht aber einen riesigen Unterschied! 💪
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="font-size:12px;color:#94a3b8;margin:0;">
              Versendet über ReviewBoost •
              <a href="#" style="color:#94a3b8;">Abmelden</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { customerName, customerEmail, platform, reviewLink, businessName, template = 'freundlich' } = await request.json()

  if (!customerName || !customerEmail || !platform) {
    return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
  }

  const platformFallbacks: Record<string, string> = {
    Google: 'https://search.google.com/local/writereview',
    Tripadvisor: 'https://www.tripadvisor.com',
    'Booking.com': 'https://www.booking.com',
    Yelp: 'https://www.yelp.com',
    Facebook: 'https://www.facebook.com',
  }

  const link = reviewLink || platformFallbacks[platform] || '#'

  const { subject, html } = buildEmailHtml({
    customerName,
    businessName: businessName || 'unserem Betrieb',
    platform,
    link,
    template: template as Template,
  })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === 'your_resend_api_key') {
    return NextResponse.json({ error: 'Resend API Key nicht konfiguriert.' }, { status: 500 })
  }

  const resend = new Resend(apiKey)

  try {
    const { data, error } = await resend.emails.send({
      from: 'ReviewBoost <onboarding@resend.dev>',
      to: [customerEmail],
      subject,
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
