"use client";

import { useState, useMemo } from "react";

type Review = {
  id: string; author_name: string; platform: string;
  rating: number; content: string; created_at: string; responded: boolean;
};

/* ── Stop words (German + common filler) ── */
const STOP = new Set([
  "ich","die","der","das","und","in","ist","es","ein","eine","einen","einem","einer","auf","für","mit","von","zu","den","dem",
  "des","im","am","an","bei","bis","durch","nach","über","unter","vor","war","war","aber","als","auch","aus","sich","so","wenn",
  "sind","hat","haben","hat","kann","muss","sehr","noch","mehr","nur","nicht","dass","wir","sie","er","ihn","ihm","ihr","uns",
  "wie","was","war","zum","zur","mal","einfach","immer","wieder","man","hier","da","dann","doch","schon","alles","alle","beim",
  "wird","wurde","werden","werde","worden","haben","hatte","hatten","wird","wir","wie","war","sein","ihrer","ihrem","seinen",
  "echt","wirklich","total","absolut","leider","kann","bin","hab","habe","hat","beim","wegen","ohne","kein","keine","keinen",
]);

function extractKeywords(reviews: Review[], positive: boolean): { word: string; count: number }[] {
  const filtered = reviews.filter((r) => positive ? r.rating >= 4 : r.rating <= 3);
  const freq: Record<string, number> = {};
  for (const r of filtered) {
    const words = r.content
      .toLowerCase()
      .replace(/[^\wäöüß\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP.has(w) && !/^\d+$/.test(w));
    for (const w of words) freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

/* ── Visibility Score ── */
function computeVisibility(reviews: Review[]): { score: number; label: string; color: string; tips: string[] } {
  if (reviews.length === 0) return { score: 0, label: "Nicht berechenbar", color: "#94a3b8", tips: ["Erfasse deine ersten Bewertungen um einen Score zu erhalten."] };

  const now = new Date();
  const recentCount = reviews.filter((r) => {
    const d = new Date(r.created_at);
    return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 30;
  }).length;

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const total = reviews.length;

  // Scoring (0–100)
  const countScore = Math.min(total / 50, 1) * 30;           // max 30 pts at 50+ reviews
  const ratingScore = Math.max(0, (avgRating - 3) / 2) * 40; // max 40 pts at 5.0
  const recencyScore = Math.min(recentCount / 5, 1) * 30;    // max 30 pts at 5+ per month

  const score = Math.round(countScore + ratingScore + recencyScore);

  const tips: string[] = [];
  if (avgRating < 4.3) tips.push("Erhöhe deinen Bewertungsschnitt auf 4.3+ — das ist der kritische Schwellenwert für Top-Rankings.");
  if (recentCount < 3) tips.push('Sammle mindestens 3–5 neue Bewertungen pro Monat, um als "aktiv" zu gelten.');
  if (total < 20) tips.push(`Du hast erst ${total} Bewertungen — Betriebe mit 20+ werden deutlich öfter gefunden.`);
  if (reviews.filter((r) => !r.responded).length > 3) tips.push("Beantworte offene Bewertungen — Google wertet das als Engagement positiv.");
  if (tips.length === 0) tips.push("Stark! Halte die Frequenz und den Schnitt aufrecht um deinen Score zu halten.");

  const label = score >= 75 ? "Sehr gut" : score >= 50 ? "Gut" : score >= 30 ? "Ausbaubar" : "Schwach";
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#6366f1" : score >= 30 ? "#f59e0b" : "#ef4444";
  return { score, label, color, tips };
}

/* ── Action items from negative reviews ── */
const ACTION_PATTERNS: { keywords: string[]; action: string; icon: string }[] = [
  { keywords: ["warte", "wartezeit", "lange", "langsam", "geduld", "stunde", "minuten"], action: "Wartezeiten reduzieren — mehrere Kunden erwähnen zu lange Wartezeiten.", icon: "⏱" },
  { keywords: ["freundlich", "unfreundlich", "unhöflich", "grob", "service", "personal", "mitarbeiter"], action: "Service-Schulung prüfen — Freundlichkeit des Personals wird kritisiert.", icon: "👤" },
  { keywords: ["sauber", "dreckig", "schmutzig", "hygiene", "reinigung"], action: "Reinigungsprozesse überprüfen — Sauberkeit wird negativ erwähnt.", icon: "🧹" },
  { keywords: ["preis", "teuer", "günstig", "wert", "kosten", "bezahlen"], action: "Preis-Leistungs-Verhältnis kommunizieren — Kunden empfinden es als nicht gerechtfertigt.", icon: "💶" },
  { keywords: ["parkplatz", "parken", "erreichbar", "anfahrt", "lage"], action: "Erreichbarkeit kommunizieren — Kunden haben Probleme beim Ankommen.", icon: "🅿️" },
  { keywords: ["kalt", "warm", "essen", "speise", "gericht", "qualität"], action: "Speisequalität oder -temperatur verbessern — direktes Kundenfeedback.", icon: "🍽" },
  { keywords: ["reservierung", "tisch", "buchung", "termin"], action: "Reservierungsprozess optimieren — Kunden berichten von Problemen.", icon: "📅" },
  { keywords: ["laut", "lärm", "atmosphäre", "ambiente", "gemütlich"], action: "Atmosphäre verbessern — Lautstärke oder Ambiente werden kritisiert.", icon: "🎵" },
];

function generateActions(reviews: Review[]): { action: string; icon: string; mentions: number }[] {
  const negReviews = reviews.filter((r) => r.rating <= 3);
  if (negReviews.length === 0) return [];
  const allText = negReviews.map((r) => r.content.toLowerCase()).join(" ");
  return ACTION_PATTERNS
    .map(({ keywords, action, icon }) => {
      const mentions = keywords.filter((k) => allText.includes(k)).length;
      return { action, icon, mentions };
    })
    .filter((a) => a.mentions > 0)
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 5);
}

/* ── Growth Simulator ── */
function GrowthSimulator({ reviews }: { reviews: Review[] }) {
  const currentAvg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const currentCount = reviews.length;
  const [extraStars, setExtraStars] = useState(10);
  const [targetRating, setTargetRating] = useState(4.5);

  const newAvg = currentCount > 0
    ? ((currentAvg * currentCount) + (5 * extraStars)) / (currentCount + extraStars)
    : 5;

  const neededFor5Stars = currentCount > 0
    ? Math.max(0, Math.ceil((targetRating * currentCount - currentAvg * currentCount) / (5 - targetRating)))
    : 0;

  const improvement = newAvg - currentAvg;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Simulator */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "24px 28px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>🚀 Wachstums-Simulator</h3>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 24px" }}>Was passiert, wenn du mehr 5-Sterne-Bewertungen sammelst?</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <div style={{ backgroundColor: "#f8fafc", borderRadius: 12, padding: "16px 20px", border: "1px solid #e8edf3", textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", margin: "0 0 6px" }}>Aktueller Schnitt</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: "#f59e0b", margin: 0, letterSpacing: "-1px" }}>
              {currentCount > 0 ? currentAvg.toFixed(1) : "—"} ★
            </p>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>{currentCount} Bewertungen</p>
          </div>
          <div style={{ backgroundColor: improvement > 0 ? "#f0fdf4" : "#f8fafc", borderRadius: 12, padding: "16px 20px", border: `1px solid ${improvement > 0 ? "#bbf7d0" : "#e8edf3"}`, textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", margin: "0 0 6px" }}>Nach +{extraStars} × 5★</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: improvement > 0 ? "#15803d" : "#64748b", margin: 0, letterSpacing: "-1px" }}>
              {currentCount > 0 ? newAvg.toFixed(1) : "5.0"} ★
            </p>
            {improvement > 0 && (
              <p style={{ fontSize: 12, color: "#15803d", margin: "4px 0 0", fontWeight: 600 }}>+{improvement.toFixed(2)} Punkte</p>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
            Neue 5-Sterne-Bewertungen: <span style={{ color: "#6366f1" }}>{extraStars}</span>
          </label>
          <input type="range" min={1} max={100} value={extraStars} onChange={(e) => setExtraStars(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#6366f1" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>1</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>100</span>
          </div>
        </div>

        {/* Target calculator */}
        <div style={{ backgroundColor: "#eef2ff", borderRadius: 12, padding: "16px 18px", border: "1px solid #e0e7ff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Ziel-Schnitt:</span>
              <select value={targetRating} onChange={(e) => setTargetRating(Number(e.target.value))}
                style={{ padding: "5px 10px", borderRadius: 7, border: "1.5px solid #c7d2fe", fontSize: 13, fontWeight: 700, color: "#4338ca", backgroundColor: "#fff", outline: "none", fontFamily: "inherit" }}>
                {[4.0, 4.2, 4.3, 4.5, 4.7, 4.8, 5.0].map((v) => <option key={v} value={v}>{v.toFixed(1)} ★</option>)}
              </select>
            </div>
            {currentCount > 0 && (
              <p style={{ fontSize: 13, color: "#4338ca", fontWeight: 700, margin: 0 }}>
                {neededFor5Stars === 0
                  ? "✓ Ziel bereits erreicht!"
                  : `${neededFor5Stars} × 5★ nötig`}
              </p>
            )}
            {currentCount === 0 && <p style={{ fontSize: 13, color: "#6366f1", margin: 0 }}>Noch keine Bewertungen vorhanden.</p>}
          </div>
        </div>
      </div>

      {/* Monthly Goal */}
      <MonthlyGoal reviews={reviews} />
    </div>
  );
}

/* ── Monthly Goal Tracker ── */
function MonthlyGoal({ reviews }: { reviews: Review[] }) {
  const [goal, setGoal] = useState(20);
  const now = new Date();
  const thisMonthCount = reviews.filter((r) => {
    const d = new Date(r.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  const daysLeft = daysInMonth - daysPassed;
  const expectedByNow = Math.round((goal / daysInMonth) * daysPassed);
  const onTrack = thisMonthCount >= expectedByNow;
  const pct = Math.min((thisMonthCount / goal) * 100, 100);

  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "24px 28px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>🎯 Monatliches Ziel</h3>
      <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>Setze dir ein Ziel und verfolge deinen Fortschritt.</p>

      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
          Ziel: <span style={{ color: "#6366f1" }}>{goal} Bewertungen</span> im {now.toLocaleDateString("de-AT", { month: "long" })}
        </label>
        <input type="range" min={5} max={100} step={5} value={goal} onChange={(e) => setGoal(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#6366f1" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>5</span>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>100</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{thisMonthCount} von {goal}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: pct >= 100 ? "#15803d" : onTrack ? "#6366f1" : "#f97316" }}>{Math.round(pct)}%</span>
        </div>
        <div style={{ height: 14, backgroundColor: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 999,
            width: `${pct}%`,
            background: pct >= 100 ? "#22c55e" : onTrack ? "linear-gradient(90deg,#6366f1,#8b5cf6)" : "#f97316",
            transition: "width 0.5s ease",
            minWidth: thisMonthCount > 0 ? 12 : 0,
          }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Erreicht", value: thisMonthCount, color: "#6366f1" },
          { label: "Verbleibend", value: Math.max(goal - thisMonthCount, 0), color: "#f97316" },
          { label: "Tage noch", value: daysLeft, color: "#64748b" },
        ].map((s) => (
          <div key={s.label} style={{ backgroundColor: "#f8fafc", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {thisMonthCount > 0 && (
        <div style={{ marginTop: 14, padding: "10px 14px", backgroundColor: onTrack ? "#f0fdf4" : "#fff7ed", borderRadius: 10, border: `1px solid ${onTrack ? "#bbf7d0" : "#fde68a"}` }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: onTrack ? "#15803d" : "#b45309", margin: 0 }}>
            {onTrack
              ? `✓ Du bist auf Kurs! ${daysLeft} Tage verbleiben.`
              : `⚠ Du liegst ${expectedByNow - thisMonthCount} Bewertungen hinter dem Soll. Jetzt Einladungen senden!`}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Visibility Score ── */
function VisibilityScore({ reviews }: { reviews: Review[] }) {
  const { score, label, color, tips } = computeVisibility(reviews);
  const circ = 2 * Math.PI * 44;
  const dash = (score / 100) * circ;

  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "24px 28px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>📡 Google-Sichtbarkeits-Score</h3>
      <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>Wie sichtbar bist du aktuell bei Google-Suchen?</p>

      <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 20 }}>
        <svg width={110} height={110} style={{ flexShrink: 0 }}>
          <circle cx={55} cy={55} r={44} fill="none" stroke="#f1f5f9" strokeWidth={9} />
          <circle cx={55} cy={55} r={44} fill="none" stroke={color} strokeWidth={9}
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
            transform="rotate(-90 55 55)" style={{ transition: "stroke-dasharray 0.7s ease" }}
          />
          <text x="55" y="50" textAnchor="middle" fontSize="20" fontWeight="800" fill={color} fontFamily="inherit">{score}</text>
          <text x="55" y="64" textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="inherit">von 100</text>
        </svg>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color, marginBottom: 4 }}>{label}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { lbl: "Bewertungsanzahl", val: Math.min(reviews.length / 50, 1), max: "50+" },
              { lbl: "Ø Bewertung", val: reviews.length > 0 ? Math.max(0, (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length - 3) / 2) : 0, max: "5.0★" },
              { lbl: "Aktualität (30 Tage)", val: Math.min(reviews.filter((r) => (Date.now() - new Date(r.created_at).getTime()) / 86400000 <= 30).length / 5, 1), max: "5/Mo" },
            ].map((f) => (
              <div key={f.lbl} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#64748b", width: 140, flexShrink: 0 }}>{f.lbl}</span>
                <div style={{ flex: 1, height: 6, backgroundColor: "#f1f5f9", borderRadius: 999 }}>
                  <div style={{ height: "100%", width: `${f.val * 100}%`, backgroundColor: color, borderRadius: 999, transition: "width 0.5s ease" }} />
                </div>
                <span style={{ fontSize: 10, color: "#94a3b8", width: 30, textAlign: "right" }}>{f.max}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", margin: 0 }}>💡 Maßnahmen zur Verbesserung:</p>
        {tips.map((tip) => (
          <div key={tip} style={{ display: "flex", gap: 8, padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: 9, border: "1px solid #e8edf3" }}>
            <span style={{ color: color, fontWeight: 700, flexShrink: 0 }}>→</span>
            <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.5 }}>{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Keyword Analysis ── */
function KeywordAnalysis({ reviews }: { reviews: Review[] }) {
  const posKeywords = useMemo(() => extractKeywords(reviews, true), [reviews]);
  const negKeywords = useMemo(() => extractKeywords(reviews, false), [reviews]);

  const maxPos = Math.max(...posKeywords.map((k) => k.count), 1);
  const maxNeg = Math.max(...negKeywords.map((k) => k.count), 1);

  if (reviews.length < 3) {
    return (
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "24px 28px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>Für die Keyword-Analyse werden mindestens 3 Bewertungen benötigt.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "24px 28px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>🔍 Keyword-Analyse</h3>
      <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 22px" }}>Was deine Kunden am häufigsten erwähnen — positiv und negativ.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Positive */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#15803d", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
            ✓ Positiv ({reviews.filter((r) => r.rating >= 4).length} Bewertungen)
          </p>
          {posKeywords.length === 0
            ? <p style={{ fontSize: 13, color: "#94a3b8" }}>Keine positiven Bewertungen.</p>
            : posKeywords.map((k) => (
              <div key={k.word} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, width: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{k.word}</span>
                <div style={{ flex: 1, height: 8, backgroundColor: "#f1f5f9", borderRadius: 999 }}>
                  <div style={{ height: "100%", width: `${(k.count / maxPos) * 100}%`, backgroundColor: "#22c55e", borderRadius: 999 }} />
                </div>
                <span style={{ fontSize: 11, color: "#64748b", width: 16, textAlign: "right", flexShrink: 0 }}>{k.count}×</span>
              </div>
            ))
          }
        </div>

        {/* Negative */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
            ✗ Negativ ({reviews.filter((r) => r.rating <= 3).length} Bewertungen)
          </p>
          {negKeywords.length === 0
            ? <p style={{ fontSize: 13, color: "#94a3b8" }}>Keine negativen Bewertungen — Glückwunsch!</p>
            : negKeywords.map((k) => (
              <div key={k.word} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, width: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{k.word}</span>
                <div style={{ flex: 1, height: 8, backgroundColor: "#f1f5f9", borderRadius: 999 }}>
                  <div style={{ height: "100%", width: `${(k.count / maxNeg) * 100}%`, backgroundColor: "#ef4444", borderRadius: 999 }} />
                </div>
                <span style={{ fontSize: 11, color: "#64748b", width: 16, textAlign: "right", flexShrink: 0 }}>{k.count}×</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

/* ── Action Plan ── */
function ActionPlan({ reviews }: { reviews: Review[] }) {
  const actions = useMemo(() => generateActions(reviews), [reviews]);
  const negCount = reviews.filter((r) => r.rating <= 3).length;
  const [done, setDone] = useState<Set<number>>(new Set());

  if (negCount === 0) {
    return (
      <div style={{ backgroundColor: "#f0fdf4", borderRadius: 16, padding: "24px 28px", border: "1px solid #bbf7d0", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#15803d", margin: "0 0 8px" }}>✅ Maßnahmenplan</h3>
        <p style={{ fontSize: 14, color: "#166534", margin: 0 }}>Keine negativen Bewertungen — keine Maßnahmen nötig. Weiter so!</p>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "24px 28px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>📋 Maßnahmenplan</h3>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
          {negCount} negative Bewertung{negCount > 1 ? "en" : ""} vorhanden — keine konkreten Muster erkannt. Lies die Bewertungen direkt.
        </p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "24px 28px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>📋 Maßnahmenplan</h3>
        <span style={{ fontSize: 12, color: "#64748b" }}>{done.size}/{actions.length} erledigt</span>
      </div>
      <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>
        Basierend auf {negCount} negativen Bewertungen — priorisiert nach Häufigkeit.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {actions.map((a, i) => (
          <div key={i}
            onClick={() => setDone((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; })}
            style={{
              display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px",
              backgroundColor: done.has(i) ? "#f0fdf4" : "#f8fafc",
              borderRadius: 12, border: `1px solid ${done.has(i) ? "#bbf7d0" : "#e8edf3"}`,
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              backgroundColor: done.has(i) ? "#22c55e" : "#e2e8f0",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: done.has(i) ? 14 : 16,
              transition: "all 0.15s",
            }}>
              {done.has(i) ? "✓" : a.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, color: done.has(i) ? "#15803d" : "#374151", margin: 0, lineHeight: 1.5, textDecoration: done.has(i) ? "line-through" : "none" }}>
                {a.action}
              </p>
              {i === 0 && !done.has(i) && (
                <span style={{ fontSize: 11, color: "#f97316", fontWeight: 700, backgroundColor: "#fff7ed", padding: "1px 7px", borderRadius: 999, marginTop: 5, display: "inline-block", border: "1px solid #fed7aa" }}>
                  Priorität 1
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: "#94a3b8", margin: "12px 0 0", textAlign: "right" }}>Klicke auf eine Maßnahme um sie als erledigt zu markieren.</p>
    </div>
  );
}

/* ── Keyword Coach ── */
function KeywordCoach({ reviews, businessName }: { reviews: Review[]; businessName: string }) {
  const [copied, setCopied] = useState(false);

  const posKeywords = useMemo(() => extractKeywords(reviews, true).slice(0, 5), [reviews]);
  const topWords = posKeywords.map((k) => k.word).join(", ");

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "4.5";

  const suggestions = [
    `"Wie war Ihr Besuch bei uns? Falls Sie zufrieden waren, würden wir uns über eine kurze Google-Bewertung sehr freuen. Erwähnen Sie gerne was Ihnen besonders gut gefallen hat — zum Beispiel die frischen Zutaten, unseren Service oder die Atmosphäre."`,
    `"Hat Ihnen das Essen geschmeckt? Wir würden uns riesig freuen wenn Sie Ihre Erfahrung bei ${businessName} auf Google teilen — es hilft uns sehr und dauert nur 30 Sekunden."`,
    `"Vielen Dank für Ihren Besuch! Eine kurze Google-Bewertung bedeutet uns viel. Scannen Sie einfach den QR-Code auf Ihrem Tisch."`,
  ];

  const [selectedTmpl, setSelectedTmpl] = useState(0);

  function handleCopy() {
    navigator.clipboard.writeText(suggestions[selectedTmpl].replace(/"/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (reviews.length < 3) return null;

  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "24px 28px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>💬 Keyword-Coach</h3>
      <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>
        Kunden die bestimmte Keywords erwähnen helfen deinem Google-Ranking. Gib ihnen den richtigen Hinweis.
      </p>

      {posKeywords.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 10px" }}>Deine stärksten Keywords (bereits vorhanden):</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {posKeywords.map((k) => (
              <span key={k.word} style={{ padding: "4px 12px", borderRadius: 999, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 13, fontWeight: 600, color: "#15803d" }}>
                {k.word} <span style={{ color: "#86efac", fontWeight: 400 }}>({k.count}×)</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 10px" }}>Wähle einen Hinweistext für dein Personal:</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {suggestions.map((s, i) => (
          <div key={i} onClick={() => setSelectedTmpl(i)} style={{
            padding: "12px 14px", borderRadius: 10, cursor: "pointer",
            border: `1.5px solid ${selectedTmpl === i ? "#6366f1" : "#e2e8f0"}`,
            backgroundColor: selectedTmpl === i ? "#eef2ff" : "#f8fafc",
            transition: "all 0.12s",
          }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${selectedTmpl === i ? "#6366f1" : "#d1d5db"}`, backgroundColor: selectedTmpl === i ? "#6366f1" : "#fff", flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: selectedTmpl === i ? "#3730a3" : "#475569", margin: 0, lineHeight: 1.55 }}>{s}</p>
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleCopy} style={{
        padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${copied ? "#22c55e" : "#e2e8f0"}`,
        backgroundColor: copied ? "#f0fdf4" : "#f8fafc", color: copied ? "#15803d" : "#374151",
        fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
      }}>
        {copied ? "✓ In Zwischenablage" : "📋 Text kopieren"}
      </button>
      <p style={{ fontSize: 11, color: "#94a3b8", margin: "8px 0 0" }}>Hänge ihn auf, schreib ihn auf Karten oder trag es deinem Personal auf zu sagen.</p>
    </div>
  );
}

/* ── ROI Calculator ── */
function ROICalculator({ reviews }: { reviews: Review[] }) {
  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const [monthlyGuests, setMonthlyGuests] = useState(400);
  const [avgSpend, setAvgSpend] = useState(28);

  // Conversion lift based on rating (research-backed estimates)
  function visibilityMultiplier(rating: number): number {
    if (rating >= 4.7) return 1.0;
    if (rating >= 4.5) return 0.88;
    if (rating >= 4.3) return 0.74;
    if (rating >= 4.0) return 0.60;
    if (rating >= 3.7) return 0.45;
    return 0.30;
  }

  const currentMulti = visibilityMultiplier(avg);
  const target43 = visibilityMultiplier(4.3);
  const target45 = visibilityMultiplier(4.5);
  const target47 = visibilityMultiplier(4.7);

  const baseRevenue = monthlyGuests * avgSpend;
  const gain43 = Math.round(baseRevenue * (target43 - currentMulti));
  const gain45 = Math.round(baseRevenue * (target45 - currentMulti));
  const gain47 = Math.round(baseRevenue * (target47 - currentMulti));

  const scenarios = [
    { label: "4.3 ★", gain: gain43, color: "#f59e0b", bg: "#fffbeb", desc: "Kritischer Google-Schwellenwert" },
    { label: "4.5 ★", gain: gain45, color: "#6366f1", bg: "#eef2ff", desc: "Top-Ranking Bereich" },
    { label: "4.7 ★", gain: gain47, color: "#22c55e", bg: "#f0fdf4", desc: "Absolute Spitze" },
  ].filter((s) => s.gain > 0);

  if (avg === 0) return null;

  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "24px 28px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>💶 ROI-Rechner</h3>
      <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>Was bringt dir eine bessere Bewertung in Euro — monatlich?</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
            Gäste/Monat via Google: <span style={{ color: "#6366f1" }}>{monthlyGuests}</span>
          </label>
          <input type="range" min={50} max={2000} step={50} value={monthlyGuests} onChange={(e) => setMonthlyGuests(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#6366f1" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
            Ø Ausgabe pro Gast: <span style={{ color: "#6366f1" }}>€{avgSpend}</span>
          </label>
          <input type="range" min={10} max={120} step={2} value={avgSpend} onChange={(e) => setAvgSpend(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#6366f1" }} />
        </div>
      </div>

      <div style={{ padding: "12px 16px", backgroundColor: "#f8fafc", borderRadius: 10, marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "#64748b" }}>Dein aktueller Schnitt</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#f59e0b" }}>★ {avg.toFixed(1)}</span>
      </div>

      {scenarios.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: 0 }}>Zusätzlicher monatlicher Umsatz wenn du erreichst:</p>
          {scenarios.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", backgroundColor: s.bg, borderRadius: 10, border: `1px solid ${s.color}22` }}>
              <div>
                <span style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.label}</span>
                <span style={{ fontSize: 12, color: "#64748b", marginLeft: 10 }}>{s.desc}</span>
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>+€{s.gain.toLocaleString("de")}/Mo</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "16px", backgroundColor: "#f0fdf4", borderRadius: 10 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#15803d", margin: 0 }}>🏆 Du bist bereits auf höchstem Niveau!</p>
        </div>
      )}
      <p style={{ fontSize: 11, color: "#94a3b8", margin: "10px 0 0" }}>Schätzung basiert auf Studien zur Google-Sichtbarkeit nach Rating. Tatsächliche Werte variieren je nach Markt und Saison.</p>
    </div>
  );
}

/* ── MAIN ── */
export default function StrategieSection({ reviews, businessName = "" }: { reviews: Review[]; businessName?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1040 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>🎯 Strategie & Wachstum</h2>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Analysiere deine Bewertungen, setze Ziele und verbessere gezielt deine Sichtbarkeit.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <GrowthSimulator reviews={reviews} />
        <VisibilityScore reviews={reviews} />
      </div>

      <ROICalculator reviews={reviews} />
      <KeywordCoach reviews={reviews} businessName={businessName} />
      <KeywordAnalysis reviews={reviews} />
      <ActionPlan reviews={reviews} />
    </div>
  );
}
