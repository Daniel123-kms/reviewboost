"use client";

import { useState } from "react";

type Mode = "tisch" | "einzel" | "whatsapp";

const ACCENT = "#6366f1";
const ACCENT_GRAD = "linear-gradient(135deg, #6366f1, #8b5cf6)";

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: 16,
  padding: 28,
  border: "1px solid #e8edf3",
  boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
};

const inputStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  border: "1.5px solid #e2e8f0",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 14,
  color: "#1e293b",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const btnPrimary: React.CSSProperties = {
  background: ACCENT_GRAD,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "11px 22px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  letterSpacing: 0.2,
};

const btnSecondary: React.CSSProperties = {
  background: "#fff",
  color: "#374151",
  border: "1.5px solid #e2e8f0",
  borderRadius: 10,
  padding: "10px 20px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const tipsBoxStyle: React.CSSProperties = {
  backgroundColor: "#eef2ff",
  borderRadius: 12,
  padding: 20,
  color: "#4338ca",
  fontSize: 13,
  lineHeight: 1.7,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#475569",
  marginBottom: 6,
};

function Label({ children }: { children: React.ReactNode }) {
  return <span style={labelStyle}>{children}</span>;
}

function FocusInput({
  value,
  onChange,
  placeholder,
  type = "text",
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  style?: React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        ...inputStyle,
        borderColor: focused ? ACCENT : "#e2e8f0",
        ...style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

// ─── MODE 1: TISCH-QR ───────────────────────────────────────────────────────

function TischQRMode({ userId, businessName }: { userId: string; businessName: string }) {
  const [tableCount, setTableCount] = useState(8);
  const [prefix, setPrefix] = useState("Tisch");
  const [googleLink, setGoogleLink] = useState("");
  const [generated, setGenerated] = useState(false);

  const prefixes = ["Tisch", "Table", "Nr.", "Platz"];
  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  function getQrUrl(table: number) {
    const funnelUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/r/${userId}?tisch=${table}&link=${encodeURIComponent(googleLink)}`
        : `/r/${userId}?tisch=${table}&link=${encodeURIComponent(googleLink)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(funnelUrl)}`;
  }

  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win) return;

    const cards = tables
      .map((t) => {
        const funnelUrl = `${window.location.origin}/r/${userId}?tisch=${t}&link=${encodeURIComponent(googleLink)}`;
        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=340x340&data=${encodeURIComponent(funnelUrl)}&bgcolor=ffffff&color=1e1b4b&margin=16`;
        return `<div class="card">
          <div class="table-num">${prefix} ${t}</div>
          <img src="${qr}" alt="QR ${t}" />
          <p class="tagline">Wie war Ihr Besuch? · Scannen &amp; bewerten</p>
          <p class="brand">${businessName}</p>
        </div>`;
      })
      .join("");

    win.document.write(`<!DOCTYPE html><html lang="de"><head>
      <meta charset="utf-8">
      <title>${businessName} — Tisch QR-Codes</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #f8fafc; padding: 20px; }
        h1 { text-align: center; font-size: 18px; color: #1e1b4b; margin-bottom: 24px; font-weight: 800; }
        .grid { display: flex; flex-wrap: wrap; justify-content: center; }
        .card { width: 148mm; break-inside: avoid; background: #fff; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; display: inline-block; margin: 8px; }
        .table-num { font-size: 26px; font-weight: 800; color: #1e1b4b; margin-bottom: 14px; }
        .card img { width: 160px; height: 160px; border-radius: 8px; }
        .tagline { font-size: 13px; font-weight: 600; color: #374151; margin-top: 14px; }
        .brand { font-size: 11px; color: #94a3b8; margin-top: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        @media print {
          body { background: #fff; padding: 0; }
          h1 { margin-bottom: 16px; }
        }
      </style>
    </head><body>
      <h1>${businessName} — QR-Codes für Tischaufsteller</h1>
      <div class="grid">${cards}</div>
    </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 600);
  }

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {/* Left: controls + grid */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
            <div>
              <Label>Prefix</Label>
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {prefixes.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Anzahl Tische: {tableCount}</Label>
              <input
                type="range"
                min={1}
                max={30}
                value={tableCount}
                onChange={(e) => { setTableCount(Number(e.target.value)); setGenerated(false); }}
                style={{ width: "100%", marginTop: 10, accentColor: ACCENT }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <Label>Google Review Link (optional)</Label>
            <FocusInput
              value={googleLink}
              onChange={(v) => { setGoogleLink(v); setGenerated(false); }}
              placeholder="https://g.page/r/..."
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button style={btnPrimary} onClick={() => setGenerated(true)}>
              Generieren →
            </button>
            {generated && (
              <button style={btnSecondary} onClick={handlePrint}>
                🖨 Alle drucken
              </button>
            )}
          </div>
        </div>

        {generated && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            {tables.map((t) => (
              <div
                key={t}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 16,
                  border: "1px solid #e8edf3",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 15, color: "#1e1b4b" }}>
                  {prefix} {t}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getQrUrl(t)}
                  alt={`QR ${prefix} ${t}`}
                  width={80}
                  height={80}
                  style={{ borderRadius: 6 }}
                />
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{businessName}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: tips */}
      <div style={{ width: 220, flexShrink: 0 }}>
        <div style={tipsBoxStyle}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>💡 Tipps</div>
          <div>✅ Drucken Sie auf Karton (250g) für langlebige Tischaufsteller.</div>
          <div style={{ marginTop: 8 }}>✅ Laminieren schützt die Karte vor Feuchtigkeit.</div>
          <div style={{ marginTop: 8 }}>✅ Platzieren Sie den Aufsteller gut sichtbar — Augenhöhe sitzend.</div>
        </div>
      </div>
    </div>
  );
}

// ─── MODE 2: EINZEL-QR ──────────────────────────────────────────────────────

const PLATFORMS = [
  { label: "Google", value: "google" },
  { label: "Tripadvisor", value: "tripadvisor" },
  { label: "Booking.com", value: "booking" },
  { label: "Yelp", value: "yelp" },
  { label: "Facebook", value: "facebook" },
];

function EinzelQRMode({ businessName }: { businessName: string }) {
  const [link, setLink] = useState("");
  const [platform, setPlatform] = useState("google");
  const [cardLabel, setCardLabel] = useState("Jetzt auf Google bewerten");

  const qrUrl = link
    ? `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(link)}&bgcolor=ffffff&color=1e1b4b&margin=16`
    : null;

  const downloadUrl = link
    ? `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(link)}&bgcolor=ffffff&color=1e1b4b&margin=20`
    : null;

  function handlePrint() {
    if (!link) return;
    const win = window.open("", "_blank");
    if (!win) return;

    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(link)}&bgcolor=ffffff&color=1e1b4b&margin=20`;

    win.document.write(`<!DOCTYPE html><html lang="de"><head>
      <meta charset="utf-8">
      <title>${businessName} — QR-Code</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .card { background: #fff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 36px 40px; text-align: center; max-width: 340px; }
        .brand { font-size: 15px; font-weight: 800; color: #1e1b4b; margin-bottom: 20px; }
        .card img { width: 200px; height: 200px; border-radius: 8px; }
        .label { font-size: 15px; font-weight: 700; color: #374151; margin-top: 20px; }
        .sub { font-size: 12px; color: #94a3b8; margin-top: 6px; }
        @media print { body { background: #fff; } }
      </style>
    </head><body>
      <div class="card">
        <div class="brand">${businessName}</div>
        <img src="${qr}" alt="QR Code" />
        <div class="label">${cardLabel}</div>
        <div class="sub">Scannen &amp; in 30 Sekunden fertig</div>
      </div>
    </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 600);
  }

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {/* Left: form */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={cardStyle}>
          <div style={{ marginBottom: 18 }}>
            <Label>Review Link *</Label>
            <FocusInput
              value={link}
              onChange={setLink}
              placeholder="https://g.page/r/..."
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <Label>Plattform</Label>
            <select
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value);
                const p = PLATFORMS.find((pl) => pl.value === e.target.value);
                if (p) setCardLabel(`Jetzt auf ${p.label} bewerten`);
              }}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Label>Beschriftung unter QR</Label>
            <FocusInput
              value={cardLabel}
              onChange={setCardLabel}
              placeholder="Jetzt auf Google bewerten"
            />
          </div>

          {/* Live QR preview */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            {qrUrl ? (
              <div
                style={{
                  textAlign: "center",
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 20,
                  border: "1px solid #e8edf3",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                  display: "inline-block",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="QR Preview" width={180} height={180} style={{ borderRadius: 8, display: "block" }} />
                {cardLabel && (
                  <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: "#374151" }}>
                    {cardLabel}
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 12,
                  backgroundColor: "#f1f5f9",
                  border: "2px dashed #cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontSize: 13,
                }}
              >
                QR-Vorschau
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download="qr-code.png"
                style={{ ...btnPrimary, textDecoration: "none", display: "inline-block" }}
              >
                ⬇ PNG herunterladen
              </a>
            )}
            <button
              style={{ ...btnSecondary, opacity: link ? 1 : 0.5 }}
              onClick={handlePrint}
              disabled={!link}
            >
              🖨 Karte drucken
            </button>
          </div>
        </div>

        {/* Tips below for mode 2 */}
        <div style={{ ...tipsBoxStyle, marginTop: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>💡 Tipps</div>
          <div>✅ Verwenden Sie den direkten Review-Link ohne Weiterleitungen für den besten QR-Scan.</div>
          <div style={{ marginTop: 8 }}>✅ Testen Sie den QR vor dem Drucken mit Ihrem Smartphone.</div>
          <div style={{ marginTop: 8 }}>✅ Laden Sie die PNG-Datei (600×600 px) für Druckqualität herunter.</div>
        </div>
      </div>
    </div>
  );
}

// ─── MODE 3: WHATSAPP-QR ────────────────────────────────────────────────────

function WhatsAppQRMode({ userId, businessName }: { userId: string; businessName: string }) {
  const defaultLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/r/${userId}`
      : `/r/${userId}`;

  const [reviewLink, setReviewLink] = useState(defaultLink);
  const [message, setMessage] = useState(
    `Wie war Ihr Besuch bei ${businessName}? Wir freuen uns über eine Bewertung 🌟 ${defaultLink}`
  );
  const [copied, setCopied] = useState(false);

  const waLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(waLink)}&bgcolor=ffffff&color=128C7E&margin=16`;
  const downloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(waLink)}&bgcolor=ffffff&color=128C7E&margin=20`;

  function handleCopy() {
    navigator.clipboard.writeText(waLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Sync message when review link changes
  function handleLinkChange(v: string) {
    setReviewLink(v);
    setMessage((prev) => {
      // replace old link at end with new link, or append
      const base = prev.replace(/https?:\/\/\S+$/, "").trimEnd();
      return `${base} ${v}`.trimStart();
    });
  }

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {/* Left: form + preview */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={cardStyle}>
          <div style={{ marginBottom: 18 }}>
            <Label>Review Link</Label>
            <FocusInput
              value={reviewLink}
              onChange={handleLinkChange}
              placeholder={`${typeof window !== "undefined" ? window.location.origin : ""}/r/${userId}`}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <Label>WhatsApp-Nachricht</Label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              style={{
                ...inputStyle,
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: 1.6,
              }}
            />
          </div>

          {/* Message preview bubble */}
          <div
            style={{
              backgroundColor: "#dcf8c6",
              borderRadius: "18px 18px 4px 18px",
              padding: "12px 16px",
              fontSize: 14,
              color: "#1a1a1a",
              maxWidth: 320,
              lineHeight: 1.6,
              marginBottom: 20,
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {message || "Nachricht…"}
          </div>

          {/* QR preview */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="WhatsApp QR"
              width={180}
              height={180}
              style={{ borderRadius: 12, border: "1px solid #e8edf3" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href={downloadUrl}
              download="whatsapp-qr.png"
              style={{ ...btnPrimary, textDecoration: "none", display: "inline-block" }}
            >
              ⬇ QR herunterladen
            </a>
            <button style={btnSecondary} onClick={handleCopy}>
              {copied ? "✓ Kopiert!" : "📋 WA-Link kopieren"}
            </button>
          </div>
        </div>
      </div>

      {/* Right: tips */}
      <div style={{ width: 220, flexShrink: 0 }}>
        <div style={tipsBoxStyle}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>💡 Tipps</div>
          <div>✅ Senden Sie den WA-Link nach dem Besuch per Nachricht an Stammgäste.</div>
          <div style={{ marginTop: 8 }}>✅ Drucken Sie den QR-Code auf die Rechnung oder den Bon.</div>
          <div style={{ marginTop: 8 }}>✅ Personalisieren Sie die Nachricht mit dem Vornamen des Gastes für höhere Conversion.</div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function QRStudioSection({
  userId,
  businessName,
}: {
  userId: string;
  businessName: string;
}) {
  const [mode, setMode] = useState<Mode>("tisch");

  const tabs: { id: Mode; label: string }[] = [
    { id: "tisch", label: "🪑 Tisch-QR" },
    { id: "einzel", label: "🔗 Einzel-QR" },
    { id: "whatsapp", label: "💬 WhatsApp-QR" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1e1b4b", margin: 0 }}>
          QR-Code Studio
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
          Erstellen, anpassen und drucken Sie QR-Codes für Ihr Restaurant.
        </p>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: "inline-flex",
          backgroundColor: "#f1f5f9",
          borderRadius: 12,
          padding: 4,
          gap: 2,
          marginBottom: 24,
        }}
      >
        {tabs.map((tab) => {
          const active = mode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              style={{
                padding: "8px 18px",
                borderRadius: 9,
                border: "none",
                fontSize: 14,
                fontWeight: active ? 700 : 500,
                color: active ? "#1e1b4b" : "#64748b",
                backgroundColor: active ? "#ffffff" : "transparent",
                boxShadow: active ? "0 1px 6px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Mode content */}
      {mode === "tisch" && (
        <TischQRMode userId={userId} businessName={businessName} />
      )}
      {mode === "einzel" && (
        <EinzelQRMode businessName={businessName} />
      )}
      {mode === "whatsapp" && (
        <WhatsAppQRMode userId={userId} businessName={businessName} />
      )}
    </div>
  );
}
