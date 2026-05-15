"use client";

import { useState } from "react";

type Review = {
  id: string; author_name: string; platform: string;
  rating: number; content: string; created_at: string; responded: boolean;
};

const PLATFORMS = ["Google", "Tripadvisor", "Booking.com", "Yelp", "Facebook"];
const PLATFORM_ACCENT: Record<string, string> = {
  Google: "#f59e0b", Tripadvisor: "#22c55e", "Booking.com": "#3b82f6",
  Yelp: "#ef4444", Facebook: "#8b5cf6",
};

/* ── SVG Bar Chart ── */
function BarChart({ data, color = "#6366f1" }: { data: { label: string; value: number }[]; color?: string }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const H = 110, BAR_W = 32, GAP = data.length > 8 ? 6 : 10;
  const totalW = data.length * (BAR_W + GAP) - GAP;

  return (
    <svg viewBox={`0 0 ${totalW + 8} ${H + 36}`} width="100%" style={{ overflow: "visible" }}>
      {data.map((d, i) => {
        const barH = Math.max((d.value / maxVal) * H, d.value > 0 ? 5 : 0);
        const x = 4 + i * (BAR_W + GAP);
        const y = H - barH;
        const isHov = hoveredIdx === i;
        return (
          <g key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{ cursor: "default" }}
          >
            <rect x={x} y={0} width={BAR_W} height={H} fill={color} rx={6} opacity={0.06} />
            {barH > 0 && (
              <rect x={x} y={y} width={BAR_W} height={barH} fill={color} rx={6}
                opacity={isHov ? 1 : 0.85}
                style={{ transition: "opacity 0.12s" }}
              />
            )}
            {isHov && d.value > 0 && (
              <rect x={x - 2} y={y - 30} width={BAR_W + 4} height={22} rx={5} fill="#0f172a" opacity={0.88} />
            )}
            {isHov && d.value > 0 && (
              <text x={x + BAR_W / 2} y={y - 15} textAnchor="middle" fontSize={11} fill="#ffffff" fontWeight="700" fontFamily="inherit">
                {d.value}
              </text>
            )}
            <text x={x + BAR_W / 2} y={H + 18} textAnchor="middle" fontSize={10} fill="#94a3b8" fontFamily="inherit">{d.label}</text>
            {!isHov && d.value > 0 && (
              <text x={x + BAR_W / 2} y={y - 6} textAnchor="middle" fontSize={10} fill={color} fontWeight="700" fontFamily="inherit">{d.value}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── Rating Bar ── */
function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const color = stars >= 4 ? "#22c55e" : stars === 3 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <span style={{ fontSize: 12, color: "#64748b", width: 22, textAlign: "right", flexShrink: 0 }}>{stars}★</span>
      <div style={{ flex: 1, height: 10, backgroundColor: "#f1f5f9", borderRadius: 999 }}>
        <div style={{ height: "100%", width: `${pct}%`, backgroundColor: color, borderRadius: 999, transition: "width 0.5s ease", minWidth: pct > 0 ? 6 : 0 }} />
      </div>
      <span style={{ fontSize: 12, color: "#64748b", width: 28, textAlign: "right", flexShrink: 0 }}>{count}</span>
      <span style={{ fontSize: 11, color: "#94a3b8", width: 34, textAlign: "right", flexShrink: 0 }}>{total > 0 ? Math.round(pct) : 0}%</span>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ icon, label, value, sub, bg, color }: { icon: string; label: string; value: string | number; sub?: string; bg: string; color: string }) {
  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: 14, padding: "20px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: "-0.5px", lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ── Response Rate Ring ── */
function ResponseRing({ rate, responded, total }: { rate: number; responded: number; total: number }) {
  const R = 44, stroke = 9;
  const circ = 2 * Math.PI * R;
  const dash = (rate / 100) * circ;
  const color = rate >= 70 ? "#22c55e" : rate >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={110} height={110} style={{ flexShrink: 0 }}>
        <circle cx={55} cy={55} r={R} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        <circle cx={55} cy={55} r={R} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x="55" y="52" textAnchor="middle" fontSize="18" fontWeight="800" fill={color} fontFamily="inherit">{rate}%</text>
        <text x="55" y="67" textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="inherit">Antwortrate</text>
      </svg>
      <div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 2 }}>Beantwortet</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#22c55e" }}>{responded}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 2 }}>Ausstehend</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f97316" }}>{total - responded}</div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsSection({ reviews }: { reviews: Review[] }) {
  const [chartView, setChartView] = useState<"week" | "month">("month");

  /* ── Computed data ── */
  const now = new Date();

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      label: d.toLocaleDateString("de-AT", { month: "short" }),
      value: reviews.filter((r) => {
        const rd = new Date(r.created_at);
        return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
      }).length,
    };
  });

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    return {
      label: d.toLocaleDateString("de-AT", { weekday: "short" }),
      value: reviews.filter((r) => {
        const rd = new Date(r.created_at);
        return rd >= dayStart && rd < dayEnd;
      }).length,
    };
  });

  const chartData = chartView === "week" ? weeklyData : monthlyData;

  const ratingDist = [5, 4, 3, 2, 1].map((s) => ({
    stars: s, count: reviews.filter((r) => r.rating === s).length,
  }));

  const respondedCount = reviews.filter((r) => r.responded).length;
  const responseRate = reviews.length > 0 ? Math.round(respondedCount / reviews.length * 100) : 0;
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  const thisMonthCount = monthlyData[5].value;
  const lastMonthCount = monthlyData[4].value;
  const trend = lastMonthCount > 0 ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100) : null;

  const thisWeekCount = weeklyData.reduce((s, d) => s + d.value, 0);

  const platformRows = PLATFORMS.map((p) => {
    const pr = reviews.filter((r) => r.platform === p);
    const resp = pr.filter((r) => r.responded).length;
    return {
      name: p,
      count: pr.length,
      avgRating: pr.length > 0 ? (pr.reduce((s, r) => s + r.rating, 0) / pr.length).toFixed(1) : "—",
      responded: resp,
      rate: pr.length > 0 ? Math.round((resp / pr.length) * 100) : 0,
      accent: PLATFORM_ACCENT[p],
    };
  }).filter((p) => p.count > 0).sort((a, b) => b.count - a.count);

  const maxPlatformCount = Math.max(...platformRows.map((p) => p.count), 1);

  /* ── Exports ── */
  function exportCSV() {
    const headers = ["Name", "Plattform", "Bewertung (Sterne)", "Datum", "Beantwortet", "Inhalt"];
    const rows = reviews.map((r) => [
      r.author_name, r.platform, r.rating,
      new Date(r.created_at).toLocaleDateString("de-AT"),
      r.responded ? "Ja" : "Nein",
      `"${r.content.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "bewertungen.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = reviews.map((r) => `
      <tr>
        <td>${r.author_name}</td>
        <td>${r.platform}</td>
        <td>${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)} (${r.rating}/5)</td>
        <td>${new Date(r.created_at).toLocaleDateString("de-AT")}</td>
        <td>${r.responded ? "Ja" : "Nein"}</td>
        <td style="max-width:300px;word-break:break-word">${r.content}</td>
      </tr>`).join("");
    win.document.write(`<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">
      <title>ReviewBoost – Bewertungsexport</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #1e293b; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        p.sub { color: #64748b; font-size: 13px; margin: 0 0 24px; }
        .stats { display: flex; gap: 24px; margin-bottom: 28px; }
        .stat { background: #f8fafc; border-radius: 8px; padding: 14px 18px; }
        .stat-val { font-size: 24px; font-weight: 800; color: #4338ca; }
        .stat-lbl { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: #64748b; border-bottom: 2px solid #e2e8f0; }
        td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        tr:last-child td { border-bottom: none; }
        @media print { body { padding: 16px; } }
      </style>
    </head><body>
      <h1>ReviewBoost – Bewertungsexport</h1>
      <p class="sub">Erstellt am ${new Date().toLocaleDateString("de-AT", { day: "2-digit", month: "long", year: "numeric" })}</p>
      <div class="stats">
        <div class="stat"><div class="stat-lbl">Gesamt</div><div class="stat-val">${reviews.length}</div></div>
        <div class="stat"><div class="stat-lbl">Ø Bewertung</div><div class="stat-val">${avgRating}</div></div>
        <div class="stat"><div class="stat-lbl">Antwortrate</div><div class="stat-val">${responseRate}%</div></div>
        <div class="stat"><div class="stat-lbl">5-Sterne</div><div class="stat-val">${reviews.filter((r) => r.rating === 5).length}</div></div>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Plattform</th><th>Bewertung</th><th>Datum</th><th>Beantwortet</th><th>Inhalt</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <script>window.onload = () => { window.print(); }<\/script>
    </body></html>`);
    win.document.close();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1040 }}>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard icon="📅" label="Diese Woche" value={thisWeekCount}
          sub="Neue Bewertungen" bg="#eef2ff" color="#4338ca" />
        <StatCard icon="📈" label="Diesen Monat" value={thisMonthCount}
          sub={trend !== null ? `${trend >= 0 ? "+" : ""}${trend}% zum Vormonat` : "Erster Monat"}
          bg="#f0fdf4" color="#15803d" />
        <StatCard icon="⭐" label="Ø Bewertung" value={avgRating}
          sub="Alle Plattformen" bg="#fffbeb" color="#b45309" />
        <StatCard icon="🏆" label="5-Sterne" value={reviews.filter((r) => r.rating === 5).length}
          sub={reviews.length > 0 ? `${Math.round(reviews.filter((r) => r.rating === 5).length / reviews.length * 100)}% aller Bewertungen` : "—"}
          bg="#fef3c7" color="#92400e" />
      </div>

      {/* Chart + Rating Distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* Chart with toggle */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "24px 28px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Bewertungs-Verlauf</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "3px 0 0" }}>
                {chartView === "week" ? "Letzte 7 Tage" : "Letzte 6 Monate"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 0, borderRadius: 9, overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
              {(["week", "month"] as const).map((v) => (
                <button key={v} onClick={() => setChartView(v)} style={{
                  padding: "7px 14px", border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 12, fontWeight: 700,
                  backgroundColor: chartView === v ? "#6366f1" : "#f8fafc",
                  color: chartView === v ? "#ffffff" : "#64748b",
                  transition: "all 0.15s",
                }}>
                  {v === "week" ? "Woche" : "Monat"}
                </button>
              ))}
            </div>
          </div>
          <BarChart data={chartData} />
        </div>

        {/* Rating Distribution */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "24px 28px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 20px" }}>Bewertungsverteilung</h3>
          {ratingDist.map((r) => <RatingBar key={r.stars} stars={r.stars} count={r.count} total={reviews.length} />)}
          {reviews.length === 0 && <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, textAlign: "center", paddingTop: 20 }}>Noch keine Bewertungen</p>}
          {reviews.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Gesamt</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{reviews.length} Bewertungen</span>
            </div>
          )}
        </div>
      </div>

      {/* Response Rate + Platform Comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>

        {/* Response Rate Ring */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "24px 28px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 20px" }}>Antwortrate</h3>
          <ResponseRing rate={responseRate} responded={respondedCount} total={reviews.length} />
          <div style={{ marginTop: 18, padding: "10px 14px", backgroundColor: responseRate >= 70 ? "#f0fdf4" : responseRate >= 40 ? "#fffbeb" : "#fef2f2", borderRadius: 10, border: `1px solid ${responseRate >= 70 ? "#bbf7d0" : responseRate >= 40 ? "#fde68a" : "#fecaca"}` }}>
            <p style={{ fontSize: 12, color: responseRate >= 70 ? "#15803d" : responseRate >= 40 ? "#92400e" : "#dc2626", margin: 0, fontWeight: 600 }}>
              {responseRate >= 70 ? "✓ Sehr gute Antwortrate" : responseRate >= 40 ? "⚠ Antwortrate ausbaubar" : "⚠ Niedrige Antwortrate"}
            </p>
          </div>
        </div>

        {/* Platform Comparison */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "24px 28px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 20px" }}>Plattform-Vergleich</h3>
          {platformRows.length === 0 ? (
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Noch keine Bewertungen erfasst.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {platformRows.map((p) => (
                <div key={p.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: p.accent, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{p.name}</span>
                      <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>★ {p.avgRating}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{p.count}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                        backgroundColor: p.rate >= 70 ? "#f0fdf4" : "#fff7ed",
                        color: p.rate >= 70 ? "#15803d" : "#b45309",
                      }}>{p.rate}% Antw.</span>
                    </div>
                  </div>
                  <div style={{ height: 8, backgroundColor: "#f1f5f9", borderRadius: 999 }}>
                    <div style={{
                      height: "100%", borderRadius: 999, backgroundColor: p.accent,
                      width: `${(p.count / maxPlatformCount) * 100}%`,
                      transition: "width 0.5s ease", minWidth: p.count > 0 ? 8 : 0,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Export Bar */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "20px 28px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 2px" }}>📤 Daten exportieren</p>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{reviews.length} Bewertungen · Ø {avgRating} Sterne · {responseRate}% Antwortrate</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={exportCSV}
            disabled={reviews.length === 0}
            style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#374151", fontSize: 13, fontWeight: 700, cursor: reviews.length === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, opacity: reviews.length === 0 ? 0.5 : 1 }}
          >
            📊 CSV exportieren
          </button>
          <button
            onClick={exportPDF}
            disabled={reviews.length === 0}
            style={{ padding: "10px 18px", borderRadius: 10, border: "none", backgroundColor: "#6366f1", color: "#fff", fontSize: 13, fontWeight: 700, cursor: reviews.length === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, opacity: reviews.length === 0 ? 0.5 : 1, boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}
          >
            📄 PDF exportieren
          </button>
        </div>
      </div>

    </div>
  );
}

/* Old manual delivery platforms card removed — now using automatic scraper in Markt-Check tab */
