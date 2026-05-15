"use client";

import { useState } from "react";

type Competitor = {
  placeId: string; name: string; rating: number; reviewCount: number;
  vicinity: string; priceLevel?: number | null; mapsUrl: string;
};

type CompetitorWithMe = (Competitor & { isMe?: boolean });

const CUISINE_TYPES = [
  "Griechisch", "Italienisch", "Japanisch / Sushi", "Chinesisch", "Türkisch",
  "Indisch", "Thai", "Mexikanisch", "Amerikanisch / Burger", "Österreichisch",
  "Pizza", "Vegetarisch / Vegan", "Meeresfrüchte", "Steakhouse", "Café / Frühstück",
];

const RADIUS_OPTIONS = [
  { label: "300 m", value: 300 }, { label: "500 m", value: 500 },
  { label: "1 km", value: 1000 }, { label: "2 km", value: 2000 }, { label: "5 km", value: 5000 },
];

/* ── SVG Scatter Plot ── */
function ScatterPlot({ competitors, me }: { competitors: Competitor[]; me: { rating: number; reviewCount: number; name: string } }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; rating: number; reviews: number } | null>(null);
  const all = [{ ...me, isMe: true, placeId: "me", vicinity: "", mapsUrl: "" }, ...competitors];
  const maxReviews = Math.max(...all.map((c) => c.reviewCount), 50);
  const W = 560, H = 280, PAD = { top: 20, right: 20, bottom: 36, left: 44 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  function cx(reviews: number) { return PAD.left + (reviews / maxReviews) * plotW; }
  function cy(rating: number) { return PAD.top + plotH - ((rating - 1) / 4) * plotH; }

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "visible" }}>
        {/* Grid lines */}
        {[1,2,3,4,5].map((r) => (
          <g key={r}>
            <line x1={PAD.left} y1={cy(r)} x2={W - PAD.right} y2={cy(r)} stroke="#f1f5f9" strokeWidth={1} />
            <text x={PAD.left - 6} y={cy(r) + 4} textAnchor="end" fontSize={10} fill="#94a3b8" fontFamily="inherit">{r}★</text>
          </g>
        ))}
        {/* X axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <text key={pct} x={PAD.left + pct * plotW} y={H - 4} textAnchor="middle" fontSize={9} fill="#94a3b8" fontFamily="inherit">
            {Math.round(pct * maxReviews)}
          </text>
        ))}
        {/* Axis labels */}
        <text x={W / 2} y={H} textAnchor="middle" fontSize={10} fill="#94a3b8" fontFamily="inherit">Anzahl Bewertungen →</text>
        {/* Zones */}
        <rect x={PAD.left} y={cy(4)} width={plotW} height={cy(1) - cy(4)} fill="#f0fdf4" opacity={0.5} />
        <rect x={PAD.left} y={cy(3)} width={plotW} height={cy(4) - cy(3)} fill="#fffbeb" opacity={0.5} />
        <rect x={PAD.left} y={cy(1)} width={plotW} height={cy(3) - cy(1)} fill="#fef2f2" opacity={0.5} />
        {/* Target line at 4.5 */}
        <line x1={PAD.left} y1={cy(4.5)} x2={W - PAD.right} y2={cy(4.5)} stroke="#6366f1" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
        <text x={W - PAD.right + 3} y={cy(4.5) + 4} fontSize={9} fill="#6366f1" fontFamily="inherit">Ziel 4.5</text>
        {/* Dots */}
        {all.map((c) => {
          const x = cx(c.reviewCount), y = cy(c.rating);
          const isMe = (c as CompetitorWithMe).isMe;
          return (
            <g key={c.placeId}
              onMouseEnter={() => setTooltip({ x, y, label: c.name, rating: c.rating, reviews: c.reviewCount })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: "pointer" }}
            >
              {isMe && <circle cx={x} cy={y} r={16} fill="#6366f1" opacity={0.12} />}
              <circle cx={x} cy={y} r={isMe ? 8 : 6} fill={isMe ? "#6366f1" : c.rating >= 4.5 ? "#22c55e" : c.rating >= 4 ? "#f59e0b" : "#ef4444"} stroke="#fff" strokeWidth={2} />
              {isMe && <text x={x} y={y - 12} textAnchor="middle" fontSize={9} fill="#6366f1" fontWeight="700" fontFamily="inherit">Du</text>}
            </g>
          );
        })}
        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect x={Math.min(tooltip.x - 60, W - 130)} y={tooltip.y - 52} width={120} height={44} rx={7} fill="#0f172a" opacity={0.9} />
            <text x={Math.min(tooltip.x, W - 70)} y={tooltip.y - 36} textAnchor="middle" fontSize={11} fill="#fff" fontWeight="700" fontFamily="inherit">{tooltip.label.substring(0, 18)}</text>
            <text x={Math.min(tooltip.x, W - 70)} y={tooltip.y - 20} textAnchor="middle" fontSize={10} fill="#a5b4fc" fontFamily="inherit">★ {tooltip.rating} · {tooltip.reviews} Bew.</text>
          </g>
        )}
      </svg>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 6 }}>
        {[
          { color: "#6366f1", label: "Dein Betrieb" },
          { color: "#22c55e", label: "≥ 4.5★" },
          { color: "#f59e0b", label: "4–4.5★" },
          { color: "#ef4444", label: "< 4★" },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Rating Bar Chart ── */
function RankingChart({ all, me }: { all: { name: string; rating: number; isMe?: boolean }[]; me: { name: string; rating: number } }) {
  const sorted = [...all].sort((a, b) => b.rating - a.rating);
  const max = 5;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {sorted.map((c, i) => {
        const isMe = c.isMe;
        const pct = (c.rating / max) * 100;
        return (
          <div key={c.name + i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", width: 16, textAlign: "right", flexShrink: 0 }}>#{i + 1}</div>
            <div style={{ fontSize: 12, fontWeight: isMe ? 800 : 500, color: isMe ? "#4338ca" : "#374151", width: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{c.name}</div>
            <div style={{ flex: 1, height: 10, backgroundColor: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999,
                width: `${pct}%`,
                background: isMe ? "linear-gradient(90deg, #6366f1, #8b5cf6)" : c.rating >= 4.5 ? "#22c55e" : c.rating >= 4 ? "#f59e0b" : "#ef4444",
                transition: "width 0.6s ease",
              }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: isMe ? "#4338ca" : "#374151", width: 30, textAlign: "right", flexShrink: 0 }}>
              {c.rating > 0 ? c.rating.toFixed(1) : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Benchmark Badge ── */
function BenchmarkBadge({ betterThan, total, myRating, topRating }: { betterThan: number; total: number; myRating: number; topRating: number }) {
  const pct = total > 0 ? Math.round((betterThan / total) * 100) : 0;
  const gapToTop = topRating > myRating ? (topRating - myRating).toFixed(1) : null;
  const color = pct >= 75 ? "#15803d" : pct >= 50 ? "#b45309" : "#dc2626";
  const bg = pct >= 75 ? "#f0fdf4" : pct >= 50 ? "#fffbeb" : "#fef2f2";
  const border = pct >= 75 ? "#bbf7d0" : pct >= 50 ? "#fde68a" : "#fecaca";

  return (
    <div style={{ backgroundColor: bg, border: `1.5px solid ${border}`, borderRadius: 16, padding: "20px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Dein Benchmark</div>
      <div style={{ fontSize: 52, fontWeight: 800, color, letterSpacing: "-2px", lineHeight: 1 }}>Top {100 - pct}%</div>
      <div style={{ fontSize: 13, color, margin: "8px 0 4px", fontWeight: 600 }}>
        Besser als {pct}% der lokalen Konkurrenten
      </div>
      {gapToTop && (
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 8, paddingTop: 8, borderTop: `1px solid ${border}` }}>
          {Number(gapToTop) <= 0.2 ? "🏆 Du bist nahe an der Spitze!" : `Noch ${gapToTop}★ bis zum Spitzenreiter`}
        </div>
      )}
    </div>
  );
}

/* ── Gap Analysis ── */
function GapAnalysis({ me, competitors }: { me: { rating: number; reviewCount: number }; competitors: Competitor[] }) {
  if (competitors.length === 0) return null;
  const avgRating = competitors.reduce((s, c) => s + c.rating, 0) / competitors.length;
  const avgReviews = Math.round(competitors.reduce((s, c) => s + c.reviewCount, 0) / competitors.length);
  const topRating = Math.max(...competitors.map((c) => c.rating));
  const topReviews = Math.max(...competitors.map((c) => c.reviewCount));
  const ratingGap = avgRating - me.rating;
  const reviewGap = avgReviews - me.reviewCount;
  const topReviewGap = topReviews - me.reviewCount;

  const insights: { icon: string; text: string; type: "good" | "warn" | "bad" }[] = [];

  if (me.rating > avgRating + 0.2) insights.push({ icon: "✅", text: `Deine Bewertung (${me.rating}★) liegt ${(me.rating - avgRating).toFixed(1)} über dem Schnitt deiner Konkurrenten.`, type: "good" });
  else if (ratingGap > 0.2) insights.push({ icon: "⚠️", text: `Deine Bewertung liegt ${ratingGap.toFixed(1)}★ unter dem Konkurrenz-Schnitt (${avgRating.toFixed(1)}★).`, type: "warn" });
  else insights.push({ icon: "📊", text: `Du liegst im Schnitt der lokalen Konkurrenz (${avgRating.toFixed(1)}★).`, type: "warn" });

  if (me.reviewCount >= avgReviews) insights.push({ icon: "✅", text: `Du hast mehr Bewertungen als der Durchschnitt (${avgReviews}). Gut sichtbar in der Suche.`, type: "good" });
  else if (reviewGap > 0) insights.push({ icon: "📈", text: `Im Schnitt haben Konkurrenten ${avgReviews} Bewertungen — du ${me.reviewCount}. ${reviewGap} mehr würden deinen Rang verbessern.`, type: "warn" });

  if (topReviewGap > 50) insights.push({ icon: "🎯", text: `Der Marktführer hat ${topReviews} Bewertungen — ein Ziel von +${Math.min(topReviewGap, 100)} neuen Bewertungen ist realistisch.`, type: "warn" });

  if (me.rating >= 4.5) insights.push({ icon: "🏆", text: "Du bist in der Top-Klasse (4.5+ Sterne). Fokus jetzt auf Volumen — mehr Bewertungen stärken deine Sichtbarkeit.", type: "good" });
  else if (me.rating < 4.0) insights.push({ icon: "🔴", text: "Unter 4.0★ verlierst du Kunden an die Konkurrenz. Priorisiere die Antwort auf Kritik und sammle aktiv neue 5-Sterne.", type: "bad" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {insights.map((ins, i) => (
        <div key={i} style={{
          padding: "12px 16px", borderRadius: 12,
          backgroundColor: ins.type === "good" ? "#f0fdf4" : ins.type === "bad" ? "#fef2f2" : "#fffbeb",
          border: `1px solid ${ins.type === "good" ? "#bbf7d0" : ins.type === "bad" ? "#fecaca" : "#fde68a"}`,
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>{ins.icon}</span>
          <p style={{ fontSize: 13, color: ins.type === "good" ? "#15803d" : ins.type === "bad" ? "#991b1b" : "#92400e", margin: 0, lineHeight: 1.55, fontWeight: 500 }}>{ins.text}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Action Plan ── */
function ActionPlan({ me, competitors }: { me: { rating: number; reviewCount: number }; competitors: Competitor[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  if (competitors.length === 0) return null;

  const avgReviews = Math.round(competitors.reduce((s, c) => s + c.reviewCount, 0) / competitors.length);
  const topCompetitor = [...competitors].sort((a, b) => b.rating - a.rating)[0];

  const actions: { title: string; desc: string; priority: "hoch" | "mittel" | "niedrig" }[] = [];

  if (me.rating < 4.0) actions.push({ priority: "hoch", title: "Kritische Bewertungen sofort beantworten", desc: "Unbeantwortet 1-2★ Bewertungen schaden deinem Ranking. Antworte innerhalb von 24h professionell." });
  if (me.reviewCount < avgReviews) actions.push({ priority: "hoch", title: `${avgReviews - me.reviewCount} neue Bewertungen sammeln`, desc: "Nutze den Feedback-Funnel oder Tisch-QR-Codes um gezielt zufriedene Gäste um eine Bewertung zu bitten." });
  if (me.rating < 4.5) actions.push({ priority: "mittel", title: "Aktiv 5-Sterne-Momente schaffen", desc: "Identifiziere mit dem Keyword-Coach was Gäste loben und stärke genau diese Punkte." });
  if (topCompetitor && topCompetitor.rating > me.rating) actions.push({ priority: "mittel", title: `Von ${topCompetitor.name} lernen`, desc: `Schau dir an, was ${topCompetitor.name} (${topCompetitor.rating}★) besonders gut macht — und was du davon übernehmen kannst.` });
  actions.push({ priority: "niedrig", title: "Wöchentlich Konkurrenz-Check", desc: "Prüfe jeden Montag, ob neue Wettbewerber hinzugekommen sind oder Konkurrenten ihre Bewertung verbessert haben." });

  const priorityColor = { hoch: "#dc2626", mittel: "#d97706", niedrig: "#2563eb" };
  const priorityBg = { hoch: "#fef2f2", mittel: "#fffbeb", niedrig: "#eff6ff" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {actions.map((a, i) => (
        <div key={i} onClick={() => setDone((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; })} style={{
          padding: "14px 16px", borderRadius: 12, cursor: "pointer",
          backgroundColor: done.has(i) ? "#f8fafc" : "#fff",
          border: `1.5px solid ${done.has(i) ? "#e2e8f0" : "#e8edf3"}`,
          display: "flex", gap: 12, alignItems: "flex-start",
          opacity: done.has(i) ? 0.5 : 1, transition: "opacity 0.2s",
        }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${done.has(i) ? "#22c55e" : "#e2e8f0"}`, backgroundColor: done.has(i) ? "#22c55e" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
            {done.has(i) && <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>✓</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: done.has(i) ? "#94a3b8" : "#0f172a", textDecoration: done.has(i) ? "line-through" : "none" }}>{a.title}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 999, backgroundColor: priorityBg[a.priority], color: priorityColor[a.priority], textTransform: "uppercase", letterSpacing: "0.3px" }}>{a.priority}</span>
            </div>
            <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{a.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── MAIN ── */
export default function KonkurrenzRadarSection({
  businessName, myRating, myReviewCount, defaultAddress = "",
}: {
  businessName: string; myRating: number; myReviewCount: number; defaultAddress?: string;
}) {
  const [address, setAddress] = useState(defaultAddress);
  const [cuisine, setCuisine] = useState("Griechisch");
  const [radius, setRadius] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [formattedAddress, setFormattedAddress] = useState("");
  const [searched, setSearched] = useState(false);
  const [activeView, setActiveView] = useState<"chart" | "karten" | "analyse">("chart");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true); setError(null); setSearched(false);
    const res = await fetch("/api/competitors", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, radius, cuisine }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); }
    else { setCompetitors(data.competitors || []); setFormattedAddress(data.formattedAddress); setSearched(true); }
    setLoading(false);
  }

  const me = { name: businessName, rating: myRating, reviewCount: myReviewCount };
  const meAsCompetitor: CompetitorWithMe = { ...me, isMe: true, placeId: "me", vicinity: "", mapsUrl: "" };
  const allEntries: CompetitorWithMe[] = searched
    ? [meAsCompetitor, ...competitors.map((c) => ({ ...c, isMe: false }))].sort((a, b) => b.rating - a.rating)
    : [];

  const betterThan = competitors.filter((c) => myRating > c.rating).length;
  const topRating = competitors.length ? Math.max(...competitors.map((c) => c.rating)) : myRating;
  const avgRating = competitors.length ? (competitors.reduce((s, c) => s + c.rating, 0) / competitors.length) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1040 }}>

      {/* ── SEARCH FORM ── */}
      <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e8edf3", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>
          🔭 Konkurrenz-Radar
        </h2>
        <form onSubmit={handleSearch} style={{ display: "grid", gridTemplateColumns: "1fr 200px 160px auto", gap: 10, alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Adresse deines Betriebs</label>
            <input
              value={address} onChange={(e) => setAddress(e.target.value)} required
              placeholder="z.B. Mariahilfer Str. 1, Wien"
              style={{ width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", backgroundColor: "#f8fafc", color: "#0f172a", outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Küche / Typ</label>
            <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} style={{ width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", backgroundColor: "#f8fafc", color: "#0f172a", outline: "none", cursor: "pointer" }}>
              {CUISINE_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Umkreis</label>
            <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} style={{ width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", backgroundColor: "#f8fafc", color: "#0f172a", outline: "none", cursor: "pointer" }}>
              {RADIUS_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: loading ? "#a5b4fc" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>
            {loading ? "Suche…" : "🔍 Analysieren"}
          </button>
        </form>
        {error && <div style={{ marginTop: 12, padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, color: "#dc2626", fontSize: 13 }}>{error}</div>}
      </div>

      {/* ── RESULTS ── */}
      {searched && competitors.length === 0 && (
        <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: "40px 24px", border: "1px solid #e8edf3", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔭</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#475569", margin: "0 0 6px" }}>Keine Konkurrenten gefunden</p>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Versuche einen größeren Umkreis oder anderen Küchen-Typ.</p>
        </div>
      )}

      {searched && competitors.length > 0 && (
        <>
          {/* Quick stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "Konkurrenten", value: competitors.length, sub: `im ${RADIUS_OPTIONS.find((r) => r.value === radius)?.label} Umkreis`, color: "#4338ca", bg: "#eef2ff" },
              { label: "Deine Bewertung", value: myRating > 0 ? `${myRating.toFixed(1)}★` : "—", sub: myRating > avgRating ? `+${(myRating - avgRating).toFixed(1)} über Schnitt` : avgRating > 0 ? `${(avgRating - myRating).toFixed(1)} unter Schnitt` : "kein Vergleich", color: myRating >= avgRating ? "#15803d" : "#dc2626", bg: myRating >= avgRating ? "#f0fdf4" : "#fef2f2" },
              { label: "Konkurrenz-Schnitt", value: `${avgRating.toFixed(1)}★`, sub: `${Math.round(competitors.reduce((s, c) => s + c.reviewCount, 0) / competitors.length)} Ø Bewertungen`, color: "#b45309", bg: "#fffbeb" },
              { label: "Deine Position", value: `#${allEntries.findIndex((e) => e.isMe) + 1}`, sub: `von ${allEntries.length} Betrieben`, color: "#7c3aed", bg: "#f5f3ff" },
            ].map((s) => (
              <div key={s.label} style={{ backgroundColor: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: "-0.5px", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* View toggle + content */}
          <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #e8edf3", boxShadow: "0 1px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", padding: "0 24px" }}>
              {([
                ["chart", "📊 Positionierung"],
                ["karten", "📋 Alle Konkurrenten"],
                ["analyse", "🎯 Analyse & Plan"],
              ] as const).map(([id, label]) => (
                <button key={id} onClick={() => setActiveView(id)} style={{
                  padding: "14px 18px", border: "none", cursor: "pointer", fontFamily: "inherit",
                  borderBottom: activeView === id ? "2px solid #6366f1" : "2px solid transparent",
                  backgroundColor: "transparent",
                  color: activeView === id ? "#6366f1" : "#64748b",
                  fontSize: 13, fontWeight: activeView === id ? 700 : 500,
                }}>
                  {label}
                </button>
              ))}
              <div style={{ marginLeft: "auto", padding: "14px 0", fontSize: 12, color: "#94a3b8", alignSelf: "center" }}>
                {formattedAddress && `📍 ${formattedAddress}`}
              </div>
            </div>

            <div style={{ padding: 28 }}>

              {/* ── CHART VIEW ── */}
              {activeView === "chart" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 28 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>Bewertung vs. Anzahl Bewertungen</h3>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 20px" }}>Jeder Punkt = ein Betrieb. Hover für Details.</p>
                    <ScatterPlot competitors={competitors} me={me} />

                    <div style={{ marginTop: 24 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 14px" }}>Bewertungs-Ranking</h3>
                      <RankingChart all={allEntries} me={me} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <BenchmarkBadge betterThan={betterThan} total={competitors.length} myRating={myRating} topRating={topRating} />
                    {/* Review count comparison */}
                    <div style={{ backgroundColor: "#f8fafc", borderRadius: 14, padding: "18px 20px", border: "1px solid #e8edf3" }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Bewertungsvolumen</p>
                      {[...competitors].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5).concat([{ ...me, placeId: "me", vicinity: "", mapsUrl: "", isMe: true } as Competitor]).sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 6).map((c, i) => {
                        const maxR = Math.max(...competitors.map((x) => x.reviewCount), myReviewCount, 1);
                        const isMe = (c as CompetitorWithMe).isMe;
                        return (
                          <div key={i} style={{ marginBottom: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                              <span style={{ fontSize: 11, fontWeight: isMe ? 800 : 500, color: isMe ? "#4338ca" : "#374151" }}>{c.name.substring(0, 20)}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: isMe ? "#4338ca" : "#64748b" }}>{c.reviewCount}</span>
                            </div>
                            <div style={{ height: 6, backgroundColor: "#e8edf3", borderRadius: 999 }}>
                              <div style={{ height: "100%", borderRadius: 999, width: `${(c.reviewCount / maxR) * 100}%`, background: isMe ? "linear-gradient(90deg, #6366f1, #8b5cf6)" : "#cbd5e1" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── KARTEN VIEW ── */}
              {activeView === "karten" && (
                <div>
                  {/* Me card */}
                  <div style={{ backgroundColor: "#eef2ff", borderRadius: 14, padding: "16px 20px", border: "2px solid #6366f1", marginBottom: 16, display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>Du</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 15, fontWeight: 800, color: "#4338ca", margin: "0 0 2px" }}>{businessName}</p>
                      <p style={{ fontSize: 12, color: "#6366f1", margin: 0 }}>Dein Betrieb · Rang #{allEntries.findIndex((e) => e.isMe) + 1} von {allEntries.length}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#4338ca" }}>{myRating > 0 ? `${myRating.toFixed(1)}★` : "—"}</div>
                      <div style={{ fontSize: 12, color: "#6366f1" }}>{myReviewCount} Bewertungen</div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                    {[...competitors].sort((a, b) => b.rating - a.rating).map((c, i) => {
                      const betterMe = myRating > 0 && c.rating < myRating;
                      const worseMe = myRating > 0 && c.rating > myRating;
                      return (
                        <div key={c.placeId} style={{
                          backgroundColor: "#fff", borderRadius: 14, padding: "16px 18px",
                          border: `1.5px solid ${betterMe ? "#bbf7d0" : worseMe ? "#fecaca" : "#e8edf3"}`,
                          display: "flex", flexDirection: "column", gap: 8,
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.vicinity}</p>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
                              <div style={{ fontSize: 20, fontWeight: 800, color: c.rating >= 4.5 ? "#15803d" : c.rating >= 4 ? "#b45309" : "#dc2626" }}>{c.rating.toFixed(1)}★</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "#64748b" }}>{c.reviewCount} Bewertungen</span>
                            {myRating > 0 && (
                              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, backgroundColor: betterMe ? "#f0fdf4" : worseMe ? "#fef2f2" : "#f1f5f9", color: betterMe ? "#15803d" : worseMe ? "#dc2626" : "#64748b" }}>
                                {betterMe ? `+${(myRating - c.rating).toFixed(1)}★ besser` : worseMe ? `-${(c.rating - myRating).toFixed(1)}★ schlechter` : "Gleich"}
                              </span>
                            )}
                          </div>
                          {c.priceLevel && <div style={{ fontSize: 11, color: "#94a3b8" }}>{"€".repeat(c.priceLevel)}</div>}
                          <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#6366f1", textDecoration: "none", fontWeight: 600, marginTop: 2 }}>
                            → Auf Google Maps ansehen
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── ANALYSE VIEW ── */}
              {activeView === "analyse" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 14px" }}>📊 Analyse</h3>
                    <GapAnalysis me={me} competitors={competitors} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 14px" }}>✅ Aktionsplan</h3>
                    <ActionPlan me={me} competitors={competitors} />
                  </div>
                </div>
              )}

            </div>
          </div>
        </>
      )}

      {/* Empty state before search */}
      {!searched && !loading && (
        <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: "52px 32px", border: "1px solid #e8edf3", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🔭</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 10px" }}>Konkurrenz-Radar starten</h3>
          <p style={{ fontSize: 14, color: "#64748b", maxWidth: 420, margin: "0 auto", lineHeight: 1.65 }}>
            Gib die Adresse deines Betriebs ein — ReviewBoost analysiert automatisch alle Konkurrenten in deinem Umkreis und zeigt dir, wo du stehst.
          </p>
        </div>
      )}
    </div>
  );
}
