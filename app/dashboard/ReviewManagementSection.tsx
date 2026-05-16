"use client";

import { useState, useMemo } from "react";

type Review = {
  id: string; user_id: string; author_name: string; platform: string;
  rating: number; content: string; created_at: string; responded: boolean;
};

const PLATFORMS = ["Google", "Tripadvisor", "Booking.com", "Yelp", "Facebook"];
const PLATFORM_ACCENT: Record<string, string> = {
  Google: "#f59e0b", Tripadvisor: "#22c55e", "Booking.com": "#3b82f6",
  Yelp: "#ef4444", Facebook: "#8b5cf6",
};
const PLATFORM_COLORS: Record<string, { bg: string; color: string; border: string; accent: string }> = {
  Google: { bg: "#fef3c7", color: "#b45309", border: "#fde68a", accent: "#f59e0b" },
  Tripadvisor: { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0", accent: "#22c55e" },
  "Booking.com": { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe", accent: "#3b82f6" },
  Yelp: { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca", accent: "#ef4444" },
  Facebook: { bg: "#ede9fe", color: "#6d28d9", border: "#ddd6fe", accent: "#8b5cf6" },
};

function urgencyScore(r: Review): number {
  if (r.responded) return 0;
  const ageDays = (Date.now() - new Date(r.created_at).getTime()) / 86400000;
  const ageFactor = ageDays <= 1 ? 4 : ageDays <= 3 ? 3 : ageDays <= 7 ? 2 : 1;
  const ratingFactor = r.rating === 1 ? 5 : r.rating === 2 ? 4 : r.rating === 3 ? 2 : 0;
  return ratingFactor + ageFactor;
}

function formatDateRelative(d: string): string {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "Heute";
  if (days === 1) return "Gestern";
  if (days < 7) return `Vor ${days} Tagen`;
  if (days < 30) return `Vor ${Math.floor(days / 7)} Woche${Math.floor(days / 7) > 1 ? "n" : ""}`;
  return new Date(d).toLocaleDateString("de-AT", { day: "2-digit", month: "short", year: "numeric" });
}

const AVATAR_COLORS = [
  { bg: "#ede9fe", color: "#7c3aed" }, { bg: "#fce7f3", color: "#be185d" },
  { bg: "#dcfce7", color: "#15803d" }, { bg: "#dbeafe", color: "#1d4ed8" },
  { bg: "#fef3c7", color: "#b45309" }, { bg: "#fee2e2", color: "#b91c1c" },
];

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const c = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", backgroundColor: c.bg, color: c.color, fontWeight: 800, fontSize: size * 0.38, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function Stars({ rating, interactive = false, onSelect }: { rating: number; interactive?: boolean; onSelect?: (r: number) => void }) {
  const [hov, setHov] = useState(0);
  return (
    <span style={{ letterSpacing: 2, fontSize: 14 }}>
      {[1,2,3,4,5].map((s) => (
        <span
          key={s}
          style={{ color: s <= (interactive ? hov || rating : rating) ? "#f59e0b" : "#e2e8f0", cursor: interactive ? "pointer" : "default" }}
          onMouseEnter={() => interactive && setHov(s)}
          onMouseLeave={() => interactive && setHov(0)}
          onClick={() => interactive && onSelect?.(s)}
        >★</span>
      ))}
    </span>
  );
}

export default function ReviewManagementSection({
  reviews, onMarkResponded, onDelete, onAiReply, aiReply, setAiReply,
}: {
  reviews: Review[];
  onMarkResponded: (id: string) => void;
  onDelete: (id: string) => void;
  onAiReply: (review: Review, style: "personal" | "neutral") => void;
  aiReply: { reviewId: string; text: string; style: string } | null;
  setAiReply: (v: { reviewId: string; text: string; style: string } | null) => void;
}) {
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "responded">("all");
  const [filterDateRange, setFilterDateRange] = useState<"all" | "30d" | "90d" | "180d" | "365d">("all")
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "urgency" | "rating">("urgency");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Computed stats
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  const pendingCount = reviews.filter((r) => !r.responded).length;
  const responseRate = reviews.length ? Math.round((reviews.filter((r) => r.responded).length / reviews.length) * 100) : 0;
  const urgentCount = reviews.filter((r) => urgencyScore(r) >= 5).length;
  const thisMonthCount = reviews.filter((r) => {
    const d = new Date(r.created_at); const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Filter + sort
  const filtered = useMemo(() => {
    let res = [...reviews];
    if (filterPlatform) res = res.filter((r) => r.platform === filterPlatform);
    if (filterRating !== null) res = res.filter((r) => r.rating === filterRating);
    if (filterStatus === "pending") res = res.filter((r) => !r.responded);
    if (filterStatus === "responded") res = res.filter((r) => r.responded);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter((r) => r.author_name.toLowerCase().includes(q) || r.content.toLowerCase().includes(q));
    }
    if (filterDateRange !== "all") {
      const cutoff = new Date()
      const days = filterDateRange === "30d" ? 30 : filterDateRange === "90d" ? 90 : filterDateRange === "180d" ? 180 : 365
      cutoff.setDate(cutoff.getDate() - days)
      res = res.filter((r) => new Date(r.created_at) >= cutoff)
    }
    if (sortBy === "urgency") res.sort((a, b) => urgencyScore(b) - urgencyScore(a));
    else if (sortBy === "date") res.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sortBy === "rating") res.sort((a, b) => a.rating - b.rating);
    return res;
  }, [reviews, filterPlatform, filterRating, filterStatus, filterDateRange, search, sortBy]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAll() { setSelectedIds(new Set(filtered.map((r) => r.id))); }
  function clearSelection() { setSelectedIds(new Set()); }

  function bulkMarkResponded() {
    selectedIds.forEach((id) => onMarkResponded(id));
    clearSelection();
  }

  function bulkDelete() {
    if (!confirm(`${selectedIds.size} Bewertungen wirklich löschen?`)) return;
    selectedIds.forEach((id) => onDelete(id));
    clearSelection();
  }

  const platformCounts = PLATFORMS.reduce((acc, p) => ({ ...acc, [p]: reviews.filter((r) => r.platform === p).length }), {} as Record<string, number>);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 960 }}>

      {/* ── STATS ROW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {[
          { icon: "⭐", label: "Ø Bewertung", value: avgRating, color: "#b45309", bg: "#fffbeb", sub: "alle Plattformen" },
          { icon: "📊", label: "Gesamt", value: reviews.length, color: "#4338ca", bg: "#eef2ff", sub: "erfasste Bewertungen" },
          { icon: "📅", label: "Diesen Monat", value: thisMonthCount, color: "#15803d", bg: "#f0fdf4", sub: "neue Bewertungen" },
          { icon: "🔔", label: "Ausstehend", value: pendingCount, color: "#c2410c", bg: "#fff7ed", sub: "ohne Antwort" },
          { icon: "🚨", label: "Dringend", value: urgentCount, color: urgentCount > 0 ? "#dc2626" : "#15803d", bg: urgentCount > 0 ? "#fef2f2" : "#f0fdf4", sub: "1-2★ unbeantwortet" },
        ].map((s) => (
          <div key={s.label} style={{ backgroundColor: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-1px", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ backgroundColor: "#fff", borderRadius: 14, padding: "16px 20px", border: "1px solid #e8edf3", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180 }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#94a3b8", pointerEvents: "none" }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name oder Text suchen…"
            style={{ width: "100%", padding: "8px 12px 8px 32px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit", backgroundColor: "#f8fafc", color: "#0f172a", boxSizing: "border-box" }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>

        {/* Platform pills */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {PLATFORMS.filter((p) => platformCounts[p] > 0).map((p) => {
            const active = filterPlatform === p;
            const accent = PLATFORM_ACCENT[p];
            return (
              <button key={p} onClick={() => setFilterPlatform(active ? null : p)} style={{
                padding: "5px 11px", borderRadius: 999, border: `1.5px solid ${active ? accent : "#e2e8f0"}`,
                backgroundColor: active ? accent + "22" : "#f8fafc",
                color: active ? accent : "#64748b",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                {p} <span style={{ fontSize: 10, opacity: 0.7 }}>({platformCounts[p]})</span>
              </button>
            );
          })}
        </div>

        {/* Rating filter */}
        <div style={{ display: "flex", gap: 4 }}>
          {[5,4,3,2,1].map((r) => (
            <button key={r} onClick={() => setFilterRating(filterRating === r ? null : r)} style={{
              padding: "5px 9px", borderRadius: 8, border: `1.5px solid ${filterRating === r ? "#f59e0b" : "#e2e8f0"}`,
              backgroundColor: filterRating === r ? "#fef3c7" : "#f8fafc",
              color: filterRating === r ? "#b45309" : "#64748b",
              fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>{r}★</button>
          ))}
        </div>

        {/* Date range filter */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginRight: 2 }}>Zeitraum:</span>
          {([
            { id: "all", label: "Alle" },
            { id: "30d", label: "30 Tage" },
            { id: "90d", label: "3 Monate" },
            { id: "180d", label: "6 Monate" },
            { id: "365d", label: "12 Monate" },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilterDateRange(opt.id)}
              style={{
                padding: "5px 9px", borderRadius: 8,
                border: `1.5px solid ${filterDateRange === opt.id ? "#6366f1" : "#e2e8f0"}`,
                backgroundColor: filterDateRange === opt.id ? "#eef2ff" : "#f8fafc",
                color: filterDateRange === opt.id ? "#4338ca" : "#64748b",
                fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Status */}
        <div style={{ display: "flex", gap: 0, borderRadius: 9, overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
          {([["all", "Alle"], ["pending", "Ausstehend"], ["responded", "Beantwortet"]] as const).map(([val, label]) => (
            <button key={val} onClick={() => setFilterStatus(val)} style={{
              padding: "6px 12px", border: "none", cursor: "pointer", fontFamily: "inherit",
              fontSize: 12, fontWeight: 600,
              backgroundColor: filterStatus === val ? "#6366f1" : "#f8fafc",
              color: filterStatus === val ? "#fff" : "#64748b",
            }}>{label}</button>
          ))}
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} style={{ padding: "6px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 12, fontFamily: "inherit", backgroundColor: "#f8fafc", color: "#374151", outline: "none", cursor: "pointer" }}>
          <option value="urgency">🚨 Nach Dringlichkeit</option>
          <option value="date">📅 Nach Datum</option>
          <option value="rating">⭐ Nach Bewertung</option>
        </select>

        {/* Clear */}
        {(filterPlatform || filterRating !== null || filterStatus !== "all" || filterDateRange !== "all" || search) && (
          <button onClick={() => { setFilterPlatform(null); setFilterRating(null); setFilterStatus("all"); setFilterDateRange("all"); setSearch(""); }} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #fecaca", backgroundColor: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            ✕ Filter zurücksetzen
          </button>
        )}
      </div>

      {/* ── RESPONSE RATE BAR ── */}
      {reviews.length > 0 && (
        <div style={{ backgroundColor: "#fff", borderRadius: 14, padding: "14px 20px", border: "1px solid #e8edf3", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" }}>Antwortrate</span>
          <div style={{ flex: 1, height: 8, backgroundColor: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${responseRate}%`, borderRadius: 999, background: responseRate >= 70 ? "#22c55e" : responseRate >= 40 ? "#f59e0b" : "#ef4444", transition: "width 0.6s ease" }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: responseRate >= 70 ? "#15803d" : responseRate >= 40 ? "#b45309" : "#dc2626", whiteSpace: "nowrap" }}>{responseRate}%</span>
          <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{reviews.filter((r) => r.responded).length}/{reviews.length} beantwortet</span>
        </div>
      )}

      {/* ── BULK ACTION BAR ── */}
      {selectedIds.size > 0 && (
        <div style={{ backgroundColor: "#1e1b4b", borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc" }}>{selectedIds.size} ausgewählt</span>
          <button onClick={bulkMarkResponded} style={{ padding: "7px 14px", borderRadius: 8, border: "none", backgroundColor: "#22c55e", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✓ Als beantwortet markieren</button>
          <button onClick={bulkDelete} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.4)", backgroundColor: "rgba(239,68,68,0.1)", color: "#fca5a5", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✕ Ausgewählte löschen</button>
          <button onClick={clearSelection} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginLeft: "auto" }}>Aufheben</button>
        </div>
      )}

      {/* ── REVIEW LIST ── */}
      <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #e8edf3", boxShadow: "0 1px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {/* List header */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 14, backgroundColor: "#fafafa" }}>
          <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={() => selectedIds.size === filtered.length ? clearSelection() : selectAll()} style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#6366f1" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
            {filtered.length} {filtered.length === 1 ? "Bewertung" : "Bewertungen"}
            {filtered.length !== reviews.length && ` (von ${reviews.length})`}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#475569", margin: "0 0 6px" }}>Keine Bewertungen gefunden</p>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Versuche andere Filter oder lösche die Suche.</p>
          </div>
        ) : (
          filtered.map((review, idx) => {
            const pc = PLATFORM_COLORS[review.platform] ?? { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0", accent: "#94a3b8" };
            const isUrgent = urgencyScore(review) >= 5;
            const isShowingAi = aiReply?.reviewId === review.id;
            const isSelected = selectedIds.has(review.id);

            return (
              <div key={review.id} style={{
                borderBottom: idx < filtered.length - 1 ? "1px solid #f8fafc" : "none",
                borderLeft: `3px solid ${isUrgent ? "#ef4444" : pc.accent}`,
                backgroundColor: isSelected ? "#f5f3ff" : isUrgent ? "#fff9f9" : "#fff",
                transition: "background-color 0.1s",
              }}>
                <div style={{ padding: "18px 20px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  {/* Checkbox */}
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(review.id)} style={{ marginTop: 4, width: 15, height: 15, cursor: "pointer", accentColor: "#6366f1", flexShrink: 0 }} />

                  <Avatar name={review.author_name} size={38} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{review.author_name}</span>
                      <Stars rating={review.rating} />
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 999, backgroundColor: pc.bg, color: pc.color, border: `1px solid ${pc.border}` }}>{review.platform}</span>
                      {isUrgent && <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999, backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>🚨 Dringend</span>}
                      {review.responded && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, backgroundColor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>✓ Beantwortet</span>}
                      <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>{formatDateRelative(review.created_at)}</span>
                    </div>
                    <p style={{ fontSize: 14, color: "#374151", margin: "0 0 10px", lineHeight: 1.65 }}>{review.content}</p>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button onClick={() => onAiReply(review, "personal")} style={actionBtn("#6366f1", "#eef2ff", "#e0e7ff")}>💜 Persönlich antworten</button>
                      <button onClick={() => onAiReply(review, "neutral")} style={actionBtn("#475569", "#f8fafc", "#e2e8f0")}>📝 Neutral antworten</button>
                      {!review.responded && (
                        <button onClick={() => onMarkResponded(review.id)} style={actionBtn("#15803d", "#f0fdf4", "#bbf7d0")}>✓ Als beantwortet</button>
                      )}
                      <button onClick={() => onDelete(review.id)} style={{ ...actionBtn("#dc2626", "#fef2f2", "#fecaca"), marginLeft: "auto" }}>✕</button>
                    </div>
                  </div>
                </div>

                {/* AI Reply */}
                {isShowingAi && (
                  <div style={{ margin: "0 20px 18px 68px", backgroundColor: aiReply!.style === "personal" ? "#f5f3ff" : "#f8fafc", border: `1.5px solid ${aiReply!.style === "personal" ? "#e0e7ff" : "#e2e8f0"}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: aiReply!.style === "personal" ? "#6366f1" : "#64748b" }}>
                        {aiReply!.style === "personal" ? "💜 Persönliche Antwort" : "📝 Neutrale Antwort"}
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => navigator.clipboard.writeText(aiReply!.text)} style={{ padding: "4px 10px", borderRadius: 7, border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#475569", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>📋 Kopieren</button>
                        <button onClick={() => setAiReply(null)} style={{ padding: "4px 8px", borderRadius: 7, border: "none", backgroundColor: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>✕</button>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{aiReply!.text}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function actionBtn(color: string, bg: string, border: string): React.CSSProperties {
  return { padding: "6px 11px", borderRadius: 8, border: `1.5px solid ${border}`, backgroundColor: bg, color, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" };
}
