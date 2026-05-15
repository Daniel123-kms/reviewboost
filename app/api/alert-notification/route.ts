import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildAlertHtml(params: {
  businessName: string;
  authorName: string;
  rating: number;
  content: string;
  platform: string;
  reviewDate: string;
  dashboardUrl: string;
}): string {
  const { businessName, authorName, rating, content, platform, reviewDate, dashboardUrl } = params;

  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const urgencyText = rating === 1 ? "KRITISCH — Sofort handeln" : "Dringend — Bitte schnell antworten";
  const urgencyColor = rating === 1 ? "#dc2626" : "#ea580c";
  const urgencyBg = rating === 1 ? "#fef2f2" : "#fff7ed";
  const urgencyBorder = rating === 1 ? "#fecaca" : "#fed7aa";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
  <tr><td align="center">
    <table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;">

      <!-- ALERT HEADER -->
      <tr>
        <td style="background:${urgencyColor};border-radius:16px 16px 0 0;padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="font-size:28px;margin-bottom:6px;">🚨</div>
                <div style="font-size:18px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">${urgencyText}</div>
                <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px;">${businessName} · ${platform} · ${reviewDate}</div>
              </td>
              <td align="right">
                <div style="font-size:32px;color:rgba(255,255,255,0.3);">${rating}★</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- MAIN -->
      <tr>
        <td style="background:#ffffff;padding:32px;">

          <p style="font-size:15px;color:#0f172a;font-weight:700;margin:0 0 6px;">
            Neue ${rating}-Stern-Bewertung von ${authorName}
          </p>
          <p style="font-size:13px;color:#64748b;margin:0 0 20px;">
            Eine schnelle Antwort (innerhalb 24h) kann den Schaden erheblich begrenzen.
            Studien zeigen: Betriebe die auf negative Reviews antworten, gewinnen 45% der Leser zurück.
          </p>

          <!-- REVIEW CARD -->
          <div style="background:${urgencyBg};border:1.5px solid ${urgencyBorder};border-left:4px solid ${urgencyColor};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <div style="font-size:20px;color:#f59e0b;margin-bottom:8px;letter-spacing:2px;">${stars}</div>
            <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 12px;font-style:italic;">
              "${content}"
            </p>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:30px;height:30px;border-radius:50%;background:${urgencyColor};display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;">
                ${authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="font-size:13px;font-weight:700;color:#0f172a;">${authorName}</div>
                <div style="font-size:11px;color:#94a3b8;">${platform} · ${reviewDate}</div>
              </div>
            </div>
          </div>

          <!-- TIPS -->
          <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:24px;border:1px solid #e8edf3;">
            <p style="font-size:13px;font-weight:700;color:#374151;margin:0 0 10px;">💡 So antwortest du richtig:</p>
            ${[
              "Danke für das ehrliche Feedback sagen — auch wenn es wehtut",
              "Konkret auf den Kritikpunkt eingehen, nicht ausweichen",
              "Lösungsangebot machen (z.B. direkter Kontakt, Entschädigung)",
              "Professionell bleiben — andere Gäste lesen mit",
            ].map(tip => `<p style="font-size:13px;color:#475569;margin:0 0 6px;padding-left:16px;border-left:2px solid #e2e8f0;line-height:1.5;">• ${tip}</p>`).join("")}
          </div>

          <!-- CTA BUTTONS -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:8px;">
                <a href="${dashboardUrl}" style="display:block;text-align:center;padding:13px 16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;box-shadow:0 4px 12px rgba(99,102,241,0.35);">
                  🤖 KI-Antwort generieren
                </a>
              </td>
              <td style="padding-left:8px;">
                <a href="${dashboardUrl}" style="display:block;text-align:center;padding:13px 16px;background:#f1f5f9;color:#374151;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;border:1.5px solid #e2e8f0;">
                  📊 Dashboard öffnen
                </a>
              </td>
            </tr>
          </table>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#f8fafc;border-radius:0 0 16px 16px;padding:16px 32px;border-top:1px solid #e8edf3;">
          <p style="font-size:11px;color:#94a3b8;margin:0;text-align:center;">
            ReviewBoost Sofort-Alarm · <a href="${dashboardUrl}" style="color:#6366f1;text-decoration:none;">Einstellungen</a> · <a href="${dashboardUrl}" style="color:#6366f1;text-decoration:none;">Alarm deaktivieren</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const { email, businessName, authorName, rating, content, platform, reviewDate } = await request.json();

    if (!email || !rating || rating > 2) {
      return NextResponse.json({ error: "Kein Alert nötig" }, { status: 400 });
    }

    const dashboardUrl = "https://reviewboost-lyart.vercel.app/dashboard";
    const html = buildAlertHtml({ businessName, authorName, rating, content, platform, reviewDate, dashboardUrl });

    const { error } = await resend.emails.send({
      from: "ReviewBoost Alert <alarm@reviewboost.at>",
      to: email,
      subject: `🚨 ${rating}-Stern-Bewertung von ${authorName} — ${businessName} braucht deine Antwort`,
      html,
    });

    if (error) {
      console.error("Alert email error:", error);
      return NextResponse.json({ error: "Alert konnte nicht gesendet werden" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Alert notification error:", err);
    return NextResponse.json({ error: "Fehler beim Senden" }, { status: 500 });
  }
}
