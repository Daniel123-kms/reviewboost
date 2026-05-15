"use client";

import { useState } from "react";

type Categories = { wartezeit: number; service: number; essen: number; getraenke: number };

const CATEGORY_LABELS: { key: keyof Categories; label: string; icon: string }[] = [
  { key: "wartezeit", label: "Wartezeit", icon: "⏱️" },
  { key: "service", label: "Service", icon: "🤝" },
  { key: "essen", label: "Essen", icon: "🍽️" },
  { key: "getraenke", label: "Getränke", icon: "🥤" },
];

const STAR_LABELS = ["", "Sehr schlecht", "Schlecht", "Ok", "Gut", "Ausgezeichnet"];

export default function FunnelPage({
  userId, businessName, googleLink, logoUrl, brandColor,
}: {
  userId: string; businessName: string; googleLink: string;
  logoUrl?: string | null; brandColor?: string | null;
}) {
  const [step, setStep] = useState<"rate" | "categories" | "feedback" | "redirect" | "done">("rate");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [categories, setCategories] = useState<Categories>({ wartezeit: 0, service: 0, essen: 0, getraenke: 0 });
  const [catHovered, setCatHovered] = useState<{ key: keyof Categories; val: number } | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const accent = brandColor || "#6366f1";

  async function submitFeedback(r: number, msg: string | null, cats: Categories) {
    const categoryText = Object.entries(cats)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `${k}: ${v}/5`)
      .join(", ");
    const fullMessage = [categoryText ? `[Kategorien: ${categoryText}]` : null, msg].filter(Boolean).join("\n");
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, rating: r, message: fullMessage || null }),
    });
  }

  function handleRatingSelect(r: number) {
    setRating(r);
    setStep("categories");
  }

  async function handleCategoriesDone() {
    if (rating >= 4) {
      await submitFeedback(rating, null, categories);
      setStep("redirect");
    } else {
      setStep("feedback");
    }
  }

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await submitFeedback(rating, message || null, categories);
    setSubmitting(false);
    setStep("done");
  }

  // Google fallback: search if no specific link
  const googleSearchLink = `https://www.google.com/search?q=${encodeURIComponent(businessName + " Bewertungen")}`;
  const finalGoogleLink = googleLink || googleSearchLink;

  return (
    <div style={{
      minHeight: "100vh",
      background: brandColor
        ? `linear-gradient(160deg, ${brandColor}18 0%, ${brandColor}35 100%)`
        : "linear-gradient(160deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif",
    }}>
      <div style={{
        backgroundColor: "#ffffff", borderRadius: 24, padding: "36px 32px",
        width: "100%", maxWidth: 440, textAlign: "center",
        boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
      }}>

        {/* ── PARTNER BRANDING ── */}
        <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {logoUrl ? (
            <img src={logoUrl} alt={businessName} style={{ height: 48, maxWidth: 160, objectFit: "contain", borderRadius: 8 }} />
          ) : (
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 800, color: "#fff",
            }}>
              {businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>{businessName}</span>
        </div>

        {/* ── STEP: OVERALL RATING ── */}
        {step === "rate" && (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 12px" }}>Schritt 1 von 3</p>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
              Wie war dein Erlebnis?
            </h1>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px", lineHeight: 1.6 }}>
              Deine Meinung hilft uns besser zu werden.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => handleRatingSelect(s)}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  style={{
                    width: 56, height: 56, borderRadius: 14, border: "none",
                    backgroundColor: (hovered || rating) >= s ? "#fbbf24" : "#f1f5f9",
                    color: (hovered || rating) >= s ? "#fff" : "#94a3b8",
                    fontSize: 26, cursor: "pointer", transition: "all 0.12s",
                    transform: hovered === s ? "scale(1.18)" : "scale(1)",
                    boxShadow: hovered === s ? "0 4px 16px rgba(251,191,36,0.45)" : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >★</button>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", height: 18, margin: 0 }}>
              {hovered > 0 ? STAR_LABELS[hovered] : " "}
            </p>
          </>
        )}

        {/* ── STEP: CATEGORY RATINGS ── */}
        {step === "categories" && (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 12px" }}>Schritt 2 von 3</p>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
              Was hat dir gefallen?
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 24px" }}>Optional — hilft uns beim Verbessern</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, textAlign: "left" }}>
              {CATEGORY_LABELS.map(({ key, label, icon }) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", backgroundColor: "#f8fafc", borderRadius: 12, border: "1px solid #e8edf3" }}>
                  <span style={{ fontSize: 20, width: 28, textAlign: "center", flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#374151", flex: 1, minWidth: 70 }}>{label}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setCategories((p) => ({ ...p, [key]: s }))}
                        onMouseEnter={() => setCatHovered({ key, val: s })}
                        onMouseLeave={() => setCatHovered(null)}
                        style={{
                          width: 30, height: 30, border: "none", borderRadius: 7,
                          backgroundColor: (catHovered?.key === key ? catHovered.val : categories[key]) >= s ? "#fbbf24" : "#e2e8f0",
                          color: (catHovered?.key === key ? catHovered.val : categories[key]) >= s ? "#fff" : "#94a3b8",
                          fontSize: 14, cursor: "pointer", transition: "all 0.1s",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          padding: 0,
                        }}
                      >★</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleCategoriesDone}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", marginBottom: 8,
                boxShadow: `0 4px 16px ${accent}44`,
              }}
            >
              Weiter →
            </button>
            <button
              onClick={handleCategoriesDone}
              style={{ background: "none", border: "none", fontSize: 13, color: "#94a3b8", cursor: "pointer", fontFamily: "inherit", padding: "4px 0" }}
            >
              Überspringen
            </button>
          </>
        )}

        {/* ── STEP: PRIVATE FEEDBACK (1-3 stars) ── */}
        {step === "feedback" && (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 12px" }}>Schritt 3 von 3</p>
            <div style={{ fontSize: 44, marginBottom: 12 }}>💬</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
              Was können wir besser machen?
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px", lineHeight: 1.6 }}>
              Dein Feedback bleibt <strong>privat</strong> — nur für uns sichtbar.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 20 }}>
              {[1,2,3,4,5].map((s) => (
                <span key={s} style={{ fontSize: 22, color: s <= rating ? "#fbbf24" : "#e2e8f0" }}>★</span>
              ))}
            </div>
            <form onSubmit={handleFeedbackSubmit}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Was hat nicht gepasst? Was können wir verbessern?"
                rows={4}
                style={{
                  width: "100%", padding: "13px", borderRadius: 12,
                  border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
                  boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#f8fafc",
                  resize: "vertical", minHeight: 100, color: "#374151", lineHeight: 1.6,
                }}
                onFocus={(e) => (e.target.style.borderColor = accent)}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
              <button
                type="submit" disabled={submitting}
                style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "none",
                  background: submitting ? "#a5b4fc" : `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  color: "#fff", fontSize: 15, fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "inherit", marginTop: 12,
                }}
              >
                {submitting ? "Sendet..." : "Feedback senden"}
              </button>
            </form>
          </>
        )}

        {/* ── STEP: REDIRECT TO GOOGLE (4-5 stars) ── */}
        {step === "redirect" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
            <h2 style={{ fontSize: 21, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
              Danke für deine {rating} Sterne!
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px", lineHeight: 1.6 }}>
              Teile deine Erfahrung jetzt auf Google —<br/>
              <strong style={{ color: "#374151" }}>klick dort auf Stern {rating}</strong> um deine Bewertung abzugeben.
            </p>

            {/* Visual star guidance */}
            <div style={{
              backgroundColor: "#fffbeb", border: "1.5px solid #fde68a",
              borderRadius: 14, padding: "16px 20px", marginBottom: 20,
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#b45309", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                So geht's auf Google:
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8 }}>
                {[1,2,3,4,5].map((s) => (
                  <div key={s} style={{
                    width: 38, height: 38, borderRadius: 10,
                    backgroundColor: s <= rating ? "#fbbf24" : "#e2e8f0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, transition: "all 0.1s",
                    boxShadow: s === rating ? "0 2px 8px rgba(251,191,36,0.5)" : "none",
                    border: s === rating ? "2px solid #f59e0b" : "2px solid transparent",
                  }}>
                    <span style={{ color: s <= rating ? "#fff" : "#94a3b8" }}>★</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "#92400e", margin: 0 }}>
                ← Klick auf <strong>Stern {rating}</strong> wenn Google sich öffnet
              </p>
            </div>

            <a
              href={finalGoogleLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: "15px 20px", borderRadius: 12, textDecoration: "none",
                background: "linear-gradient(135deg, #4285f4, #1a73e8)",
                color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 8,
                boxShadow: "0 4px 16px rgba(66,133,244,0.4)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity=".8"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#fff" opacity=".6"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity=".9"/>
              </svg>
              Jetzt auf Google bewerten
            </a>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "8px 0 0" }}>
              {googleLink ? "Öffnet deine Google-Bewertungsseite direkt." : "Suche dort nach: " + businessName}
            </p>
          </>
        )}

        {/* ── STEP: DONE ── */}
        {step === "done" && (
          <>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🙏</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>
              Vielen Dank!
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.7 }}>
              Dein Feedback wurde <strong>privat</strong> übermittelt.
              Wir nehmen es ernst und arbeiten daran, uns für deinen nächsten Besuch zu verbessern.
            </p>
            <div style={{ marginTop: 20, padding: "14px 18px", backgroundColor: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
              <p style={{ fontSize: 13, color: "#15803d", fontWeight: 600, margin: 0 }}>
                Wir freuen uns auf deinen nächsten Besuch! 👋
              </p>
            </div>
          </>
        )}

        {/* Footer */}
        <p style={{ fontSize: 11, color: "#cbd5e1", margin: "28px 0 0" }}>
          Powered by <span style={{ fontWeight: 700, color: "#a5b4fc" }}>ReviewBoost</span>
        </p>
      </div>
    </div>
  );
}
