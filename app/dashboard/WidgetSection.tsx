"use client";

import { useState } from "react";

export default function WidgetSection({ userId, businessName }: { userId: string; businessName: string }) {
  const [copied, setCopied] = useState<"iframe" | "script" | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [maxReviews, setMaxReviews] = useState(5);

  const widgetUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/widget/${userId}?theme=${theme}&max=${maxReviews}`;
  const iframeCode = `<iframe\n  src="${widgetUrl}"\n  width="100%"\n  height="520"\n  frameborder="0"\n  style="border:none;border-radius:12px;overflow:hidden;"\n  title="Kundenbewertungen – ${businessName}"\n></iframe>`;

  function copy(type: "iframe" | "script") {
    navigator.clipboard.writeText(iframeCode);
    setCopied(type);
    setTimeout(() => setCopied(null), 2500);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, maxWidth: 980 }}>
      {/* Config Panel */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 28, border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>🌐 Review-Widget</h2>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px", lineHeight: 1.6 }}>
          Bette deine Bewertungen direkt auf deiner Website ein — immer aktuell und automatisch synchronisiert.
        </p>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 24 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Design</label>
            <div style={{ display: "flex", gap: 10 }}>
              {(["light", "dark"] as const).map((t) => (
                <button key={t} onClick={() => setTheme(t)} style={{ flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", border: theme === t ? "2px solid #6366f1" : "2px solid #e2e8f0", backgroundColor: theme === t ? "#eef2ff" : t === "dark" ? "#1e1b4b" : "#ffffff", color: theme === t ? "#4338ca" : t === "dark" ? "#ffffff" : "#374151", fontSize: 13, fontWeight: 700, transition: "all 0.15s" }}>
                  {t === "light" ? "☀️ Hell" : "🌙 Dunkel"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Anzahl Bewertungen: <span style={{ color: "#6366f1" }}>{maxReviews}</span></label>
            <input type="range" min={3} max={10} value={maxReviews} onChange={(e) => setMaxReviews(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#6366f1" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>3</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>10</span>
            </div>
          </div>
        </div>

        {/* Embed Code */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Einbettungs-Code (iframe)</label>
          <div style={{ position: "relative" }}>
            <pre style={{ backgroundColor: "#0f172a", color: "#e2e8f0", padding: "16px", borderRadius: 10, fontSize: 12, lineHeight: 1.6, margin: 0, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {iframeCode}
            </pre>
            <button onClick={() => copy("iframe")} style={{ position: "absolute", top: 10, right: 10, padding: "5px 12px", borderRadius: 6, border: "none", backgroundColor: copied === "iframe" ? "#22c55e" : "rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              {copied === "iframe" ? "✓ Kopiert" : "Kopieren"}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 20, padding: "14px 16px", backgroundColor: "#fffbeb", borderRadius: 12, border: "1px solid #fde68a" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#92400e", margin: "0 0 6px" }}>⚠️ Hinweis: Supabase-Setup erforderlich</p>
          <p style={{ fontSize: 12, color: "#b45309", margin: 0, lineHeight: 1.5 }}>
            Damit das Widget Daten laden kann, führe in Supabase folgendes SQL aus:
            <br /><code style={{ backgroundColor: "rgba(0,0,0,0.06)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace" }}>
              CREATE POLICY "Widget read" ON reviews FOR SELECT TO anon USING (true);
            </code>
          </p>
        </div>
      </div>

      {/* Preview */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 20, border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Live-Vorschau</p>
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e8edf3", height: 420 }}>
            <iframe src={widgetUrl} width="100%" height="420" frameBorder={0} style={{ border: "none", display: "block" }} title="Widget Vorschau" />
          </div>
          <p style={{ fontSize: 11, color: "#94a3b8", margin: "8px 0 0", textAlign: "center" }}>So sieht es auf deiner Website aus</p>
        </div>

        <div style={{ backgroundColor: "#eef2ff", borderRadius: 16, padding: 18, border: "1px solid #e0e7ff" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#4338ca", margin: "0 0 10px" }}>💡 Einsatzmöglichkeiten</p>
          {[
            "Website-Startseite: Social Proof direkt beim Besucher",
            "Kontaktseite: Vertrauen beim Erstbesuch aufbauen",
            "Google Ads Landing Page: Conversion erhöhen",
          ].map((tip) => (
            <div key={tip} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
              <span style={{ color: "#6366f1", fontWeight: 700, flexShrink: 0 }}>→</span>
              <p style={{ fontSize: 12, color: "#4338ca", margin: 0, lineHeight: 1.4 }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
