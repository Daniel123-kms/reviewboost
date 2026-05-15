"use client";

import { useState } from "react";

export default function PrintAssetsSection({ businessName, userId, googleLink = "" }: {
  businessName: string; userId: string; googleLink?: string;
}) {
  const [link, setLink] = useState(googleLink);
  const [tagline, setTagline] = useState("Wie war Ihr Besuch?");
  const [color, setColor] = useState("#1e1b4b");

  const funnelUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/r/${userId}`;
  const qrFunnel = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(funnelUrl)}&bgcolor=ffffff&color=${color.replace("#", "")}&margin=14`;
  const qrDirect = link ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}&bgcolor=ffffff&color=${color.replace("#", "")}&margin=14` : null;

  function printAsset(type: "tischaufsteller" | "bonstreifen" | "fensteraufkleber" | "visitenkarte") {
    const win = window.open("", "_blank");
    if (!win) return;

    const colorHex = color;
    const colorLight = colorHex + "18";

    const assets: Record<string, string> = {
      tischaufsteller: `
        <div class="card tent">
          <div class="front">
            <div class="logo">${businessName}</div>
            <div class="big-emoji">⭐</div>
            <h1>${tagline}</h1>
            <p class="sub">Scannen & 30 Sekunden bewerten</p>
            <img src="${qrFunnel}" class="qr" />
            <p class="footnote">Ihre Meinung zählt!</p>
          </div>
          <div class="back">
            <p>Vielen Dank für Ihren Besuch bei <strong>${businessName}</strong>!</p>
          </div>
        </div>`,
      bonstreifen: `
        <div class="card bon">
          <div style="display:flex;align-items:center;gap:16px;">
            <div>
              <p class="bon-title">${tagline}</p>
              <p class="bon-sub">Scannen & auf Google bewerten — danke!</p>
            </div>
            <img src="${qrDirect || qrFunnel}" class="qr-small" />
          </div>
          <p class="bon-brand">${businessName}</p>
        </div>`,
      fensteraufkleber: `
        <div class="card sticker">
          <div class="stars">★★★★★</div>
          <h2>Bewerte uns!</h2>
          <img src="${qrDirect || qrFunnel}" class="qr-lg" />
          <p class="sticker-name">${businessName}</p>
          <p class="sticker-sub">Google · Tripadvisor · & mehr</p>
        </div>`,
      visitenkarte: `
        <div class="card vcard">
          <div class="vc-back">
            <p class="vc-ask">${tagline}</p>
            <img src="${qrDirect || qrFunnel}" class="qr-vc" />
            <p class="vc-name">${businessName}</p>
            <p class="vc-sub">30 Sekunden. Riesige Hilfe.</p>
          </div>
        </div>`,
    };

    win.document.write(`<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">
      <title>${businessName} — ${type}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f8fafc; padding: 24px; }
        .card { background: #fff; border-radius: 16px; padding: 32px; text-align: center; border: 2px solid #e2e8f0; }
        .tent { max-width: 320px; }
        .tent .logo { font-size: 13px; font-weight: 800; color: ${colorHex}; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 20px; }
        .tent .big-emoji { font-size: 52px; margin-bottom: 14px; }
        .tent h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
        .tent .sub { font-size: 14px; color: #64748b; margin-bottom: 20px; }
        .tent .qr { width: 160px; height: 160px; border-radius: 10px; border: 1px solid #e2e8f0; }
        .tent .footnote { font-size: 12px; color: #94a3b8; margin-top: 14px; }
        .tent .back { margin-top: 24px; padding-top: 24px; border-top: 2px dashed #e2e8f0; font-size: 14px; color: #64748b; line-height: 1.6; }
        .bon { max-width: 500px; padding: 18px 22px; border-radius: 8px; }
        .bon-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 3px; }
        .bon-sub { font-size: 12px; color: #64748b; }
        .bon-brand { font-size: 11px; color: #94a3b8; margin-top: 12px; font-weight: 600; }
        .qr-small { width: 80px; height: 80px; border-radius: 6px; flex-shrink: 0; }
        .sticker { max-width: 260px; background: ${colorHex}; border: none; }
        .sticker .stars { font-size: 28px; color: #fbbf24; letter-spacing: 2px; margin-bottom: 10px; }
        .sticker h2 { font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 16px; }
        .qr-lg { width: 150px; height: 150px; border-radius: 10px; border: 3px solid rgba(255,255,255,0.3); }
        .sticker-name { font-size: 14px; fontWeight: 700; color: rgba(255,255,255,0.9); margin-top: 14px; }
        .sticker-sub { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 4px; }
        .vcard { max-width: 340px; min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, ${colorHex}, #4338ca); border: none; }
        .vc-ask { font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 14px; }
        .qr-vc { width: 120px; height: 120px; border-radius: 8px; background: #fff; padding: 4px; }
        .vc-name { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.9); margin-top: 12px; }
        .vc-sub { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 3px; }
        @media print { body { background: #fff; padding: 0; } }
      </style>
    </head><body>
      ${assets[type]}
      <script>window.onload = () => { setTimeout(() => window.print(), 600); }<\/script>
    </body></html>`);
    win.document.close();
  }

  const ASSETS = [
    { key: "tischaufsteller", icon: "🪑", label: "Tischaufsteller", desc: "A5 Faltkarte · Beidseitig druckbar", color: "#eef2ff", border: "#e0e7ff", textColor: "#4338ca" },
    { key: "bonstreifen", icon: "🧾", label: "Bon-Streifen", desc: "Kleiner Hinweis für Kassenzettel", color: "#f0fdf4", border: "#bbf7d0", textColor: "#15803d" },
    { key: "fensteraufkleber", icon: "🪟", label: "Fensteraufkleber", desc: "Großes Format · Farbiger Hintergrund", color: "#fff7ed", border: "#fde68a", textColor: "#b45309" },
    { key: "visitenkarte", icon: "💳", label: "Visitenkarten-Rückseite", desc: "8,5 × 5,5 cm · QR + Aufforderung", color: "#fdf4ff", border: "#e9d5ff", textColor: "#7c3aed" },
  ] as const;

  return (
    <div style={{ maxWidth: 860, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>🖨️ Print-Assets</h2>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Druckfertige Marketing-Materialien für Tisch, Bon, Fenster und Visitenkarte — direkt aus dem Browser.</p>
      </div>

      {/* Config */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#374151", margin: "0 0 16px" }}>Einstellungen</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Aufforderungstext</label>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", backgroundColor: "#f8fafc", outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")} onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Google-Link (optional)</label>
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://g.page/r/..."
              style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", backgroundColor: "#f8fafc", outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")} onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Hauptfarbe</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["#1e1b4b", "#15803d", "#b45309", "#dc2626", "#0369a1"].map((c) => (
                <button key={c} onClick={() => setColor(c)} style={{
                  width: 28, height: 28, borderRadius: 6, backgroundColor: c, border: `3px solid ${color === c ? "#6366f1" : "transparent"}`,
                  cursor: "pointer", transition: "border 0.12s",
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Asset cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {ASSETS.map((a) => (
          <div key={a.key} style={{ backgroundColor: a.color, borderRadius: 16, padding: "22px 24px", border: `1px solid ${a.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ fontSize: 32, flexShrink: 0 }}>{a.icon}</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: a.textColor, margin: "0 0 3px" }}>{a.label}</p>
                <p style={{ fontSize: 12, color: a.textColor, opacity: 0.7, margin: 0 }}>{a.desc}</p>
              </div>
            </div>
            <button
              onClick={() => printAsset(a.key)}
              style={{ padding: "9px 18px", borderRadius: 9, border: "none", backgroundColor: a.textColor, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              Drucken / PDF
            </button>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: "#f8fafc", borderRadius: 14, padding: "14px 18px", border: "1px solid #e8edf3" }}>
        <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
          💡 <strong>QR-Code Logik:</strong> Tischaufsteller und Fensteraufkleber verlinken auf deinen Feedback-Funnel (filtert schlechte Bewertungen heraus). Falls du einen direkten Google-Link angibst, nutzen Bon und Visitenkarte diesen stattdessen.
        </p>
      </div>
    </div>
  );
}
