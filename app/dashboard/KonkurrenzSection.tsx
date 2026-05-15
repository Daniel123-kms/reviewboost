"use client";

import { useState } from "react";

type Competitor = {
  placeId: string; name: string; rating: number; reviewCount: number;
  vicinity: string; priceLevel?: number | null; mapsUrl: string;
};

const CUISINE_TYPES = [
  "Griechisch", "Italienisch", "Japanisch / Sushi", "Chinesisch", "Türkisch",
  "Indisch", "Thai", "Mexikanisch", "Amerikanisch / Burger", "Österreichisch",
  "Pizza", "Vegetarisch / Vegan", "Meeresfrüchte", "Steakhouse", "Café / Frühstück",
];

const RADIUS_OPTIONS = [
  { label: "300 m", value: 300 },
  { label: "500 m", value: 500 },
  { label: "1 km", value: 1000 },
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
];

const PRICE_LABELS: Record<number, string> = { 1: "€", 2: "€€", 3: "€€€", 4: "€€€€" };

export default function KonkurrenzSection({
  myRating, myReviewCount, businessName, defaultAddress = "",
}: {
  myRating: number; myReviewCount: number; businessName: string; defaultAddress?: string;
}) {
  const [address, setAddress] = useState(defaultAddress);
  const [cuisine, setCuisine] = useState("Griechisch");
  const [radius, setRadius] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [searched, setSearched] = useState(false);
  const [formattedAddress, setFormattedAddress] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true); setError(null); setSearched(false);
    const res = await fetch("/api/competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, radius, cuisine }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); }
    else { setCompetitors(data.competitors || []); setFormattedAddress(data.formattedAddress); setSearched(true); }
    setLoading(false);
  }

  // Build comparison list: me + all competitors, sorted by rating desc
  const me = { name: businessName, rating: myRating, reviewCount: myReviewCount, isMe: true, vicinity: "Dein Betrieb", placeId: "", mapsUrl: "" };
  const allEntries = searched
    ? [me, ...competitors.map((c) => ({ ...c, isMe: false }))].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    : [];

  const myRank = allEntries.findIndex((e) => e.isMe) + 1;
  const leader = allEntries[0];
  const maxReviews = Math.max(...allEntries.map((e) => e.reviewCount), 1);
  const reviewsToLeader = leader && !leader.isMe ? Math.max(0, leader.reviewCount - myReviewCount + 1) : 0;
  const ratingToLeader = leader && !leader.isMe ? Math.max(0, leader.rating - myRating) : 0;

  // Stats
  const avgCompetitorRating = competitors.length
    ? (competitors.reduce((s, c) => s + c.rating, 0) / competitors.length).toFixed(1) : "—";
  const avgCompetitorReviews = competitors.length
    ? Math.round(competitors.reduce((s, c) => s + c.reviewCount, 0) / competitors.length) : 0;
  const betterThanCount = competitors.filter((c) => myRating > c.rating).length;
  const moreReviewsThanCount = competitors.filter((c) => myReviewCount > c.reviewCount).length;

  return (
    <div style={{ maxWidth: 960, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>🔭 Konkurrenz-Radar</h2>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Echte Google-Daten — finde Mitbewerber im Umkreis und sieh wo du stehst.</p>
      </div>

      {/* Search */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 160px auto", gap: 14, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Adresse deines Betriebs</label>
              <input
                value={address} onChange={(e) => setAddress(e.target.value)} required
                placeholder="z.B. Mariahilfer Str. 1, 1060 Wien"
                style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", backgroundColor: "#f8fafc", outline: "none", boxSizing: "border-box", color: "#0f172a" }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Küche / Typ</label>
              <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}
                style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", backgroundColor: "#f8fafc", outline: "none", color: "#0f172a" }}>
                {CUISINE_TYPES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Umkreis</label>
              <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}
                style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", backgroundColor: "#f8fafc", outline: "none", color: "#0f172a" }}>
                {RADIUS_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading}
              style={{ padding: "11px 22px", borderRadius: 10, border: "none", backgroundColor: loading ? "#a5b4fc" : "#6366f1", color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(99,102,241,0.3)", whiteSpace: "nowrap", marginBottom: 1 }}>
              {loading ? "Suche..." : "🔭 Analysieren"}
            </button>
          </div>
        </form>
        {error && (
          <div style={{ marginTop: 12, padding: "10px 14px", backgroundColor: "#fef2f2", borderRadius: 9, border: "1px solid #fecaca", fontSize: 13, color: "#dc2626" }}>{error}</div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "36px", textAlign: "center", border: "1px solid #e8edf3" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <p style={{ fontSize: 15, color: "#64748b", margin: 0 }}>Durchsuche Google Maps nach {cuisine}-Restaurants im {RADIUS_OPTIONS.find((r) => r.value === radius)?.label} Umkreis...</p>
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <>
          {/* Location badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>📍</span>
            <span style={{ fontSize: 13, color: "#64748b" }}>{formattedAddress}</span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>· {competitors.length} Konkurrenten gefunden</span>
          </div>

          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[
              { label: "Dein Rang", value: competitors.length === 0 ? "–" : `#${myRank}`, sub: `von ${allEntries.length} Betrieben`, color: myRank === 1 ? "#15803d" : myRank <= 3 ? "#6366f1" : "#f97316", bg: myRank === 1 ? "#f0fdf4" : myRank <= 3 ? "#eef2ff" : "#fff7ed", icon: "🏆" },
              { label: "Ø Konkurrenz-Note", value: avgCompetitorRating + " ★", sub: "Durchschnitt Umkreis", color: "#f59e0b", bg: "#fffbeb", icon: "⭐" },
              { label: "Besser als", value: `${betterThanCount}/${competitors.length}`, sub: "Konkurrenten (Note)", color: "#22c55e", bg: "#f0fdf4", icon: "📈" },
              { label: "Mehr Bewertungen", value: `${moreReviewsThanCount}/${competitors.length}`, sub: "Konkurrenten (Anzahl)", color: "#6366f1", bg: "#eef2ff", icon: "💬" },
            ].map((s) => (
              <div key={s.label} style={{ backgroundColor: s.bg, borderRadius: 14, padding: "18px 20px", border: "1px solid #e8edf3", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Ranking chart */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "24px 28px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 20px" }}>
              {cuisine}-Restaurants im {RADIUS_OPTIONS.find((r) => r.value === radius)?.label} Umkreis
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {allEntries.map((entry, i) => {
                const barPct = (entry.reviewCount / maxReviews) * 100;
                const accent = entry.isMe ? "#6366f1" : (entry.rating >= 4.5 ? "#22c55e" : entry.rating >= 4.0 ? "#f59e0b" : "#ef4444");
                return (
                  <div key={entry.placeId || "me"}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: i === 0 ? "#f59e0b" : "#94a3b8", width: 22, flexShrink: 0 }}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                        </span>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: accent, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 14, fontWeight: entry.isMe ? 800 : 600, color: entry.isMe ? "#4338ca" : "#0f172a" }}>
                            {entry.name}
                            {entry.isMe && <span style={{ fontSize: 10, color: "#6366f1", fontWeight: 700, marginLeft: 7, backgroundColor: "#eef2ff", padding: "1px 6px", borderRadius: 999 }}>Du</span>}
                          </span>
                          {!entry.isMe && entry.vicinity && (
                            <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>{entry.vicinity}</span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#f59e0b" }}>
                          ★ {entry.rating > 0 ? entry.rating.toFixed(1) : "–"}
                        </span>
                        <span style={{ fontSize: 13, color: "#64748b", minWidth: 70, textAlign: "right" }}>
                          {entry.reviewCount.toLocaleString("de")} Bew.
                        </span>
                        {!entry.isMe && (entry as Competitor).mapsUrl && (
                          <a href={(entry as Competitor).mapsUrl} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 11, color: "#6366f1", textDecoration: "none", fontWeight: 600, padding: "3px 8px", borderRadius: 6, border: "1px solid #e0e7ff", backgroundColor: "#eef2ff", whiteSpace: "nowrap" }}>
                            Maps ↗
                          </a>
                        )}
                      </div>
                    </div>
                    <div style={{ height: 8, backgroundColor: "#f1f5f9", borderRadius: 999, marginLeft: 32 }}>
                      <div style={{ height: "100%", borderRadius: 999, backgroundColor: accent, opacity: entry.isMe ? 1 : 0.7, width: `${barPct}%`, transition: "width 0.5s ease", minWidth: entry.reviewCount > 0 ? 6 : 0 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Gap analysis */}
            <div style={{ backgroundColor: reviewsToLeader === 0 ? "#f0fdf4" : "#fff7ed", borderRadius: 16, padding: "20px 22px", border: `1px solid ${reviewsToLeader === 0 ? "#bbf7d0" : "#fde68a"}` }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: reviewsToLeader === 0 ? "#15803d" : "#b45309", margin: "0 0 10px" }}>
                {reviewsToLeader === 0 ? "🏆 Du führst die Rangliste an!" : "📊 Lücke zum Marktführer"}
              </p>
              {reviewsToLeader > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>
                    <strong>{reviewsToLeader} Bewertungen</strong> bis zur Anzahl von <strong>{leader?.name}</strong>
                  </p>
                  {ratingToLeader > 0.05 && (
                    <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>
                      <strong>{ratingToLeader.toFixed(1)} Sterne</strong> bis zum Durchschnitt des Marktführers
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action tip */}
            <div style={{ backgroundColor: "#eef2ff", borderRadius: 16, padding: "20px 22px", border: "1px solid #e0e7ff" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#4338ca", margin: "0 0 10px" }}>🎯 Empfehlung</p>
              <p style={{ fontSize: 13, color: "#3730a3", margin: 0, lineHeight: 1.6 }}>
                {myReviewCount < avgCompetitorReviews
                  ? `Du hast ${avgCompetitorReviews - myReviewCount} Bewertungen weniger als der Durchschnitt. Starte eine Kampagne an deine Stammkunden — das schließt die Lücke schnell.`
                  : myRating < parseFloat(avgCompetitorRating)
                  ? `Deine Note liegt unter dem Gebiets-Durchschnitt. Nutze den Feedback-Funnel um schlechte Erfahrungen abzufangen.`
                  : `Du liegst über dem Durchschnitt! Halte die Frequenz mit regelmäßigen Einladungen aufrecht.`}
              </p>
            </div>
          </div>
        </>
      )}

      {!searched && !loading && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "40px 28px", border: "2px dashed #e2e8f0", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🔭</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#475569", margin: "0 0 8px" }}>Echte Konkurrenz-Daten von Google</p>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Gib deine Adresse ein und wähle die Küche — die App sucht automatisch alle Mitbewerber im Umkreis.</p>
        </div>
      )}
    </div>
  );
}
