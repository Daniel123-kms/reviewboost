import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildReportHtml(params: {
  businessName: string;
  email: string;
  weekReviews: number;
  avgRating: number;
  totalReviews: number;
  pendingCount: number;
  responseRate: number;
  topReview: { author: string; rating: number; content: string } | null;
  worstReview: { author: string; rating: number; content: string } | null;
  platformBreakdown: { platform: string; count: number }[];
  trend: "up" | "down" | "stable";
  weekStart: string;
  weekEnd: string;
}): string {
  const {
    businessName, email, weekReviews, avgRating, totalReviews,
    pendingCount, responseRate, topReview, worstReview,
    platformBreakdown, trend, weekStart, weekEnd,
  } = params;

  const trendEmoji = trend === "up" ? "📈" : trend === "down" ? "📉" : "➡️";
  const trendText = trend === "up" ? "Aufwärtstrend" : trend === "down" ? "Abwärtstrend" : "Stabil";
  const ratingColor = avgRating >= 4.5 ? "#15803d" : avgRating >= 4.0 ? "#b45309" : "#b91c1c";
  const responseColor = responseRate >= 80 ? "#15803d" : responseRate >= 50 ? "#b45309" : "#b91c1c";

  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dein Wochenbericht — ReviewBoost</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- HEADER -->
      <tr>
        <td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 100%);border-radius:16px 16px 0 0;padding:32px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">
                  Review<span style="color:#a5b4fc;">Boost</span>
                </div>
                <div style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:4px;">Wochenbericht für ${businessName}</div>
              </td>
              <td align="right">
                <div style="font-size:13px;color:rgba(255,255,255,0.4);">${weekStart} – ${weekEnd}</div>
                <div style="font-size:24px;margin-top:4px;">${trendEmoji}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- MAIN CARD -->
      <tr>
        <td style="background:#ffffff;padding:36px 40px;">

          <p style="font-size:15px;color:#0f172a;font-weight:700;margin:0 0 4px;">
            Guten Morgen! Hier ist dein Wochenbericht 👋
          </p>
          <p style="font-size:14px;color:#64748b;margin:0 0 28px;line-height:1.6;">
            Diese Woche gab es <strong>${weekReviews} neue Bewertungen</strong> für ${businessName}.
            Deine Gesamtbewertung liegt bei <strong style="color:${ratingColor};">${avgRating.toFixed(1)} ★</strong>.
            Trend: <strong>${trendText}</strong>
          </p>

          <!-- KPI GRID -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              ${[
                { label: "Neue diese Woche", value: weekReviews.toString(), color: "#4338ca", bg: "#eef2ff" },
                { label: "Ø Gesamtrating", value: `${avgRating.toFixed(1)} ★`, color: ratingColor, bg: "#f0fdf4" },
                { label: "Ausstehende Antworten", value: pendingCount.toString(), color: pendingCount > 5 ? "#b91c1c" : "#b45309", bg: pendingCount > 5 ? "#fef2f2" : "#fffbeb" },
                { label: "Antwortrate", value: `${responseRate}%`, color: responseColor, bg: "#f0fdf4" },
              ].map(k => `
              <td width="25%" style="padding:4px;">
                <div style="background:${k.bg};border-radius:10px;padding:14px 12px;text-align:center;">
                  <div style="font-size:22px;font-weight:800;color:${k.color};letter-spacing:-0.5px;">${k.value}</div>
                  <div style="font-size:11px;color:#64748b;margin-top:3px;line-height:1.3;">${k.label}</div>
                </div>
              </td>`).join("")}
            </tr>
          </table>

          <!-- RESPONSE RATE BAR -->
          <div style="margin-bottom:28px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:13px;font-weight:600;color:#374151;">Antwortrate</span>
              <span style="font-size:13px;font-weight:700;color:${responseColor};">${responseRate}%</span>
            </div>
            <div style="background:#e2e8f0;border-radius:999px;height:8px;overflow:hidden;">
              <div style="background:${responseColor};height:100%;width:${Math.min(responseRate, 100)}%;border-radius:999px;"></div>
            </div>
            ${pendingCount > 0 ? `<p style="font-size:12px;color:#b45309;margin:6px 0 0;">⚠️ ${pendingCount} Bewertungen warten noch auf eine Antwort.</p>` : `<p style="font-size:12px;color:#15803d;margin:6px 0 0;">✓ Alle Bewertungen beantwortet. Ausgezeichnet!</p>`}
          </div>

          <!-- PLATFORM BREAKDOWN -->
          ${platformBreakdown.length > 0 ? `
          <div style="margin-bottom:28px;border-top:1px solid #f1f5f9;padding-top:24px;">
            <p style="font-size:14px;font-weight:700;color:#0f172a;margin:0 0 14px;">Bewertungen nach Plattform</p>
            ${platformBreakdown.map(p => `
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <span style="font-size:13px;color:#475569;">${p.platform}</span>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="background:#e2e8f0;border-radius:999px;height:6px;width:120px;overflow:hidden;">
                    <div style="background:#6366f1;height:100%;width:${Math.min((p.count / totalReviews) * 100, 100)}%;border-radius:999px;"></div>
                  </div>
                  <span style="font-size:13px;font-weight:700;color:#374151;min-width:20px;text-align:right;">${p.count}</span>
                </div>
              </div>
            `).join("")}
          </div>` : ""}

          <!-- BEST REVIEW -->
          ${topReview ? `
          <div style="margin-bottom:20px;border-top:1px solid #f1f5f9;padding-top:24px;">
            <p style="font-size:14px;font-weight:700;color:#0f172a;margin:0 0 12px;">⭐ Beste Bewertung der Woche</p>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #22c55e;border-radius:10px;padding:16px 20px;">
              <div style="font-size:16px;color:#f59e0b;margin-bottom:6px;">${stars(topReview.rating)}</div>
              <p style="font-size:14px;color:#166534;margin:0 0 8px;line-height:1.6;font-style:italic;">"${topReview.content.substring(0, 180)}${topReview.content.length > 180 ? "…" : ""}"</p>
              <p style="font-size:12px;color:#15803d;margin:0;font-weight:600;">— ${topReview.author}</p>
            </div>
          </div>` : ""}

          <!-- WORST REVIEW -->
          ${worstReview && worstReview.rating <= 2 ? `
          <div style="margin-bottom:28px;">
            <p style="font-size:14px;font-weight:700;color:#991b1b;margin:0 0 12px;">🚨 Dringende Bewertung — bitte antworten</p>
            <div style="background:#fef2f2;border:1px solid #fecaca;border-left:4px solid #ef4444;border-radius:10px;padding:16px 20px;">
              <div style="font-size:16px;color:#ef4444;margin-bottom:6px;">${stars(worstReview.rating)}</div>
              <p style="font-size:14px;color:#991b1b;margin:0 0 8px;line-height:1.6;font-style:italic;">"${worstReview.content.substring(0, 180)}${worstReview.content.length > 180 ? "…" : ""}"</p>
              <p style="font-size:12px;color:#b91c1c;margin:0;font-weight:600;">— ${worstReview.author}</p>
            </div>
          </div>` : ""}

          <!-- CTA -->
          <div style="text-align:center;background:#f8fafc;border-radius:12px;padding:24px;margin-top:8px;">
            <p style="font-size:14px;color:#64748b;margin:0 0 16px;">
              Alle Details, KI-Antworten und Konkurrenz-Analyse im Dashboard
            </p>
            <a href="https://reviewboost-lyart.vercel.app/dashboard" style="display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;box-shadow:0 4px 16px rgba(99,102,241,0.35);">
              Dashboard öffnen →
            </a>
          </div>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#f8fafc;border-radius:0 0 16px 16px;padding:20px 40px;border-top:1px solid #e8edf3;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="font-size:12px;color:#94a3b8;margin:0;">
                  ReviewBoost · Dein automatischer Wochenbericht<br>
                  Dieser Bericht wurde an <a href="mailto:${email}" style="color:#6366f1;">${email}</a> gesendet.
                </p>
              </td>
              <td align="right">
                <a href="https://reviewboost-lyart.vercel.app/dashboard" style="font-size:12px;color:#6366f1;text-decoration:none;">Abmelden</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  // Allow manual trigger with userId override for cron jobs
  const body = await request.json().catch(() => ({}));
  const targetUserId = body.userId || user.id;
  const targetEmail = body.email || user.email;
  const businessName = body.businessName || "Dein Betrieb";

  // Fetch all reviews for this user
  const { data: allReviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", targetUserId)
    .order("created_at", { ascending: false });

  if (!allReviews) return NextResponse.json({ error: "Keine Bewertungen gefunden" }, { status: 404 });

  // Calculate week range
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekReviews = allReviews.filter(r => new Date(r.created_at) >= weekAgo);

  const totalReviews = allReviews.length;
  const avgRating = totalReviews > 0
    ? allReviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / totalReviews
    : 0;
  const pendingCount = allReviews.filter((r: { responded: boolean }) => !r.responded).length;
  const respondedCount = allReviews.filter((r: { responded: boolean }) => r.responded).length;
  const responseRate = totalReviews > 0 ? Math.round((respondedCount / totalReviews) * 100) : 0;

  // Trend: compare this week avg vs. last week avg
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const lastWeekReviews = allReviews.filter((r: { created_at: string }) => {
    const d = new Date(r.created_at);
    return d >= twoWeeksAgo && d < weekAgo;
  });
  const thisWeekAvg = weekReviews.length > 0
    ? weekReviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / weekReviews.length : 0;
  const lastWeekAvg = lastWeekReviews.length > 0
    ? lastWeekReviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / lastWeekReviews.length : 0;
  const trend: "up" | "down" | "stable" = thisWeekAvg > lastWeekAvg + 0.2 ? "up"
    : thisWeekAvg < lastWeekAvg - 0.2 ? "down" : "stable";

  // Top and worst review this week
  const sorted = [...weekReviews].sort((a: { rating: number }, b: { rating: number }) => b.rating - a.rating);
  const topReview = sorted[0] ? { author: sorted[0].author_name, rating: sorted[0].rating, content: sorted[0].content } : null;
  const worstReview = sorted[sorted.length - 1] && sorted[sorted.length - 1].rating <= 2
    ? { author: sorted[sorted.length - 1].author_name, rating: sorted[sorted.length - 1].rating, content: sorted[sorted.length - 1].content }
    : null;

  // Platform breakdown
  const platformMap: Record<string, number> = {};
  allReviews.forEach((r: { platform: string }) => {
    platformMap[r.platform] = (platformMap[r.platform] || 0) + 1;
  });
  const platformBreakdown = Object.entries(platformMap)
    .map(([platform, count]) => ({ platform, count }))
    .sort((a, b) => b.count - a.count);

  const fmt = (d: Date) => d.toLocaleDateString("de-AT", { day: "2-digit", month: "short" });

  const html = buildReportHtml({
    businessName,
    email: targetEmail || "",
    weekReviews: weekReviews.length,
    avgRating,
    totalReviews,
    pendingCount,
    responseRate,
    topReview,
    worstReview,
    platformBreakdown,
    trend,
    weekStart: fmt(weekAgo),
    weekEnd: fmt(now),
  });

  try {
    const { error } = await resend.emails.send({
      from: "ReviewBoost <berichte@reviewboost.at>",
      to: targetEmail || "",
      subject: `📊 Dein Wochenbericht: ${weekReviews.length} neue Bewertungen · ${avgRating.toFixed(1)}★ Ø — ${businessName}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "E-Mail konnte nicht gesendet werden." }, { status: 500 });
    }

    return NextResponse.json({ success: true, weekReviews: weekReviews.length, avgRating, pendingCount });
  } catch (err) {
    console.error("Weekly report error:", err);
    return NextResponse.json({ error: "Fehler beim Senden." }, { status: 500 });
  }
}
