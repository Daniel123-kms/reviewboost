"use client";

import { useState } from "react";

export default function TischQRSection({ userId, businessName }: { userId: string; businessName: string }) {
  const [tableCount, setTableCount] = useState(8);
  const [googleLink, setGoogleLink] = useState("");
  const [generated, setGenerated] = useState(false);
  const [prefix, setPrefix] = useState("Tisch");

  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  function getQrUrl(table: number) {
    const funnelUrl = `${window.location.origin}/r/${userId}?business=${encodeURIComponent(businessName)}&link=${encodeURIComponent(googleLink)}&tisch=${table}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(funnelUrl)}&bgcolor=ffffff&color=1e1b4b&margin=14`;
  }

  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win) return;

    const cards = tables.map((t) => {
      const funnelUrl = `${window.location.origin}/r/${userId}?business=${encodeURIComponent(businessName)}&link=${encodeURIComponent(googleLink)}&tisch=${t}`;
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(funnelUrl)}&bgcolor=ffffff&color=1e1b4b&margin=16`;
      return `
        <div class="card">
          <div class="table-num">${prefix} ${t}</div>
          <img src="${qr}" alt="QR ${t}" />
          <p class="tagline">Wie war Ihr Besuch?</p>
          <p class="sub">Scannen & bewerten</p>
          <p class="brand">${businessName}</p>
        </div>`;
    }).join("");

    win.document.write(`<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">
      <title>${businessName} — Tisch QR-Codes</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #f8fafc; padding: 20px; }
        h1 { text-align: center; font-size: 18px; color: #1e1b4b; margin-bottom: 24px; font-weight: 800; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .card {
          background: #ffffff; border-radius: 16px; padding: 20px 16px;
          text-align: center; border: 2px solid #e8edf3;
          page-break-inside: avoid;
        }
        .table-num { font-size: 22px; font-weight: 800; color: #1e1b4b; margin-bottom: 12px; }
        .card img { width: 140px; height: 140px; border-radius: 8px; }
        .tagline { font-size: 13px; font-weight: 700; color: #374151; margin-top: 12px; }
        .sub { font-size: 11px; color: #94a3b8; margin-top: 3px; }
        .brand { font-size: 10px; color: #c7d2fe; margin-top: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        @media print {
          body { background: #fff; padding: 0; }
          h1 { margin-bottom: 16px; }
          .grid { gap: 12px; }
        }
      </style>
    </head><body>
      <h1>${businessName} — QR-Codes für Tischaufsteller</h1>
      <div class="grid">${cards}</div>
      <script>window.onload = () => window.print();<\/script>
    </body></html>`);
    win.document.close();
  }

  return (
    <div style={{ maxWidth: 960, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>🪑 Tisch-QR System</h2>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Individuelle QR-Codes pro Tisch — druckfertig für Aufsteller, Karten oder Bons.</p>
      </div>

      {/* Config */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 200px", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Google Review-Link</label>
            <input value={googleLink} onChange={(e) => setGoogleLink(e.target.value)} placeholder="https://g.page/r/..."
              style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", backgroundColor: "#f8fafc", outline: "none", boxSizing: "border-box", color: "#0f172a" }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")} onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Anzahl Tische: <span style={{ color: "#6366f1" }}>{tableCount}</span>
            </label>
            <input type="range" min={1} max={30} value={tableCount} onChange={(e) => { setTableCount(Number(e.target.value)); setGenerated(false); }}
              style={{ width: "100%", accentColor: "#6366f1", marginTop: 8 }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>1</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>30</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Bezeichnung</label>
            <select value={prefix} onChange={(e) => setPrefix(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", backgroundColor: "#f8fafc", outline: "none", color: "#0f172a" }}>
              <option>Tisch</option>
              <option>Table</option>
              <option>Nr.</option>
              <option>Platz</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setGenerated(true)}
            style={{ padding: "11px 24px", borderRadius: 10, border: "none", backgroundColor: "#6366f1", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>
            🪑 QR-Codes generieren
          </button>
          {generated && (
            <button onClick={handlePrint}
              style={{ padding: "11px 24px", borderRadius: 10, border: "1.5px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#374151", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              🖨️ Alle drucken / PDF
            </button>
          )}
        </div>
      </div>

      {/* QR Grid */}
      {generated && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>{tableCount} QR-Codes generiert</p>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Jeder Code führt zum Feedback-Funnel mit Tischnummer</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
            {tables.map((t) => (
              <div key={t} style={{
                backgroundColor: "#f8fafc", borderRadius: 14, padding: "16px 12px",
                border: "1px solid #e8edf3", textAlign: "center",
              }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#1e1b4b", margin: "0 0 10px" }}>{prefix} {t}</p>
                <img
                  src={getQrUrl(t)}
                  alt={`QR ${prefix} ${t}`}
                  style={{ width: 110, height: 110, borderRadius: 8, border: "1px solid #e8edf3" }}
                />
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "8px 0 0" }}>Bewertungs-Funnel</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, padding: "14px 16px", backgroundColor: "#eef2ff", borderRadius: 12, border: "1px solid #e0e7ff" }}>
            <p style={{ fontSize: 13, color: "#4338ca", margin: 0, fontWeight: 600 }}>
              💡 Tipp: Drucke die Karten auf A6 oder laminiere sie für Tischaufsteller. Der "Alle drucken" Button erzeugt ein druckoptimiertes Layout mit 4 Karten pro Reihe.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
