"use client";

type Review = {
  id: string;
  author_name: string;
  platform: string;
  rating: number;
  content: string;
  created_at: string;
};

const PLATFORM_COLORS: Record<string, string> = {
  Google: "#f59e0b",
  Tripadvisor: "#22c55e",
  "Booking.com": "#3b82f6",
  Yelp: "#ef4444",
  Facebook: "#8b5cf6",
};

export default function WidgetRenderer({ reviews, theme }: { reviews: Review[]; theme: "light" | "dark" }) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0f172a" : "#ffffff";
  const cardBg = isDark ? "#1e1b4b" : "#f8fafc";
  const border = isDark ? "#312e81" : "#e8edf3";
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const subtext = isDark ? "#94a3b8" : "#64748b";

  if (reviews.length === 0) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <p style={{ color: subtext, fontSize: 14 }}>Noch keine Bewertungen vorhanden.</p>
      </div>
    );
  }

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div style={{
      backgroundColor: bg, padding: "20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif",
      minHeight: "100vh",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b" }}>{avgRating}</span>
          <span style={{ fontSize: 20, color: "#f59e0b" }}>★</span>
        </div>
        <p style={{ fontSize: 12, color: subtext, margin: 0 }}>{reviews.length} Bewertung{reviews.length !== 1 ? "en" : ""}</p>
      </div>

      {/* Reviews */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {reviews.map((r) => {
          const accent = PLATFORM_COLORS[r.platform] ?? "#94a3b8";
          return (
            <div key={r.id} style={{
              backgroundColor: cardBg, borderRadius: 12, padding: "14px 16px",
              border: `1px solid ${border}`, borderLeft: `3px solid ${accent}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: text }}>{r.author_name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, letterSpacing: 1 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} style={{ color: s <= r.rating ? "#f59e0b" : isDark ? "#334155" : "#e2e8f0" }}>★</span>
                    ))}
                  </span>
                  <span style={{ fontSize: 10, color: accent, fontWeight: 700, padding: "1px 6px", borderRadius: 999, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}>{r.platform}</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: subtext, margin: "0 0 6px", lineHeight: 1.55 }}>
                {r.content.length > 160 ? r.content.substring(0, 160) + "…" : r.content}
              </p>
              <p style={{ fontSize: 11, color: isDark ? "#475569" : "#94a3b8", margin: 0 }}>
                {new Date(r.created_at).toLocaleDateString("de-AT", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: "center", fontSize: 10, color: isDark ? "#334155" : "#cbd5e1", marginTop: 16 }}>
        Powered by ReviewBoost
      </p>
    </div>
  );
}
