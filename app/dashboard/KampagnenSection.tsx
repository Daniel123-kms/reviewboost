"use client";

import { useState, useRef } from "react";

type Customer = { name: string; email: string; selected: boolean };
type Template = "freundlich" | "professionell" | "gastro";
const PLATFORMS = ["Google", "Tripadvisor", "Booking.com", "Yelp", "Facebook"];

function parseCSV(text: string): Customer[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split(/[,;]/).map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  const nameIdx = header.findIndex((h) => h.includes("name") || h.includes("vorname"));
  const emailIdx = header.findIndex((h) => h.includes("mail"));
  if (emailIdx === -1) return [];
  return lines.slice(1).map((line) => {
    const cols = line.split(/[,;]/).map((c) => c.trim().replace(/"/g, ""));
    const email = cols[emailIdx] || "";
    const name = nameIdx >= 0 ? cols[nameIdx] : email.split("@")[0];
    return { name, email, selected: true };
  }).filter((c) => c.email.includes("@"));
}

export default function KampagnenSection({ businessName, defaultReviewLink = "" }: { businessName: string; defaultReviewLink?: string }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [platform, setPlatform] = useState("Google");
  const [reviewLink, setReviewLink] = useState(defaultReviewLink);
  const [template, setTemplate] = useState<Template>("freundlich");
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [done, setDone] = useState(false);
  const [running, setRunning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function loadFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCSV(e.target?.result as string);
      setCustomers(parsed);
      setDone(false);
      setProgress(null);
    };
    reader.readAsText(file, "UTF-8");
  }

  function toggleSelect(i: number) {
    setCustomers((prev) => prev.map((c, idx) => idx === i ? { ...c, selected: !c.selected } : c));
  }
  function toggleAll() {
    const allSelected = customers.every((c) => c.selected);
    setCustomers((prev) => prev.map((c) => ({ ...c, selected: !allSelected })));
  }

  const selected = customers.filter((c) => c.selected);

  async function handleSend() {
    if (!selected.length || !reviewLink.trim()) return;
    setRunning(true);
    setDone(false);
    setProgress({ sent: 0, failed: 0, total: selected.length });

    let sent = 0, failed = 0;
    for (const c of selected) {
      try {
        const res = await fetch("/api/send-invitation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: c.name, customerEmail: c.email,
            platform, reviewLink, businessName, template,
          }),
        });
        const data = await res.json();
        if (data.success) sent++; else failed++;
      } catch { failed++; }
      setProgress({ sent, failed, total: selected.length });
      await new Promise((r) => setTimeout(r, 300));
    }
    setRunning(false);
    setDone(true);
  }

  const TEMPLATES: { id: Template; label: string; emoji: string }[] = [
    { id: "freundlich", label: "Freundlich", emoji: "😊" },
    { id: "professionell", label: "Professionell", emoji: "💼" },
    { id: "gastro", label: "Gastro", emoji: "🍽️" },
  ];

  return (
    <div style={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>📣 Bewertungs-Kampagne</h2>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Lade eine Kundenliste hoch und versende Einladungen an alle auf einmal.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Left: Upload + List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Drop zone */}
          {customers.length === 0 && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? "#6366f1" : "#e2e8f0"}`,
                borderRadius: 16, padding: "48px 24px", textAlign: "center", cursor: "pointer",
                backgroundColor: dragging ? "#eef2ff" : "#f8fafc", transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 14 }}>📂</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>CSV-Datei hier reinziehen</p>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 16px" }}>oder klicken zum Auswählen</p>
              <p style={{ fontSize: 12, color: "#cbd5e1", margin: 0 }}>Format: Name, Email (Spalten-Reihenfolge egal)</p>
              <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
            </div>
          )}

          {/* Customer list */}
          {customers.length > 0 && (
            <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{customers.length} Kontakte geladen</span>
                  <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: 10 }}>{selected.length} ausgewählt</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={toggleAll} style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    {customers.every((c) => c.selected) ? "Alle abwählen" : "Alle wählen"}
                  </button>
                  <button onClick={() => { setCustomers([]); setDone(false); setProgress(null); }}
                    style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #fecaca", backgroundColor: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    Neu laden
                  </button>
                </div>
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {customers.map((c, i) => (
                  <div key={i} onClick={() => toggleSelect(i)} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "12px 20px",
                    borderBottom: i < customers.length - 1 ? "1px solid #f8fafc" : "none",
                    cursor: "pointer", backgroundColor: c.selected ? "#fafeff" : "#fafafa",
                    transition: "background-color 0.1s",
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      border: `2px solid ${c.selected ? "#6366f1" : "#d1d5db"}`,
                      backgroundColor: c.selected ? "#6366f1" : "#ffffff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {c.selected && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{c.name}</span>
                      <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: 10 }}>{c.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          {progress && (
            <div style={{ backgroundColor: "#ffffff", borderRadius: 14, padding: "20px 24px", border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                  {done ? "✅ Kampagne abgeschlossen" : `Sende... ${progress.sent + progress.failed}/${progress.total}`}
                </span>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>{progress.sent} gesendet · {progress.failed} fehlgeschlagen</span>
              </div>
              <div style={{ height: 10, backgroundColor: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 999, transition: "width 0.3s ease",
                  width: `${((progress.sent + progress.failed) / progress.total) * 100}%`,
                  background: done ? "#22c55e" : "linear-gradient(90deg,#6366f1,#8b5cf6)",
                }} />
              </div>
              {done && (
                <p style={{ fontSize: 13, color: "#15803d", fontWeight: 600, margin: "10px 0 0" }}>
                  {progress.sent} Einladungen erfolgreich versendet! 🎉
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Config */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 18px" }}>⚙️ Kampagnen-Einstellungen</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Plattform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", backgroundColor: "#f8fafc", outline: "none", color: "#0f172a" }}>
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Review-Link</label>
                <input value={reviewLink} onChange={(e) => setReviewLink(e.target.value)} placeholder="https://g.page/r/..."
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", backgroundColor: "#f8fafc", outline: "none", boxSizing: "border-box", color: "#0f172a" }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")} onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>E-Mail-Stil</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {TEMPLATES.map((t) => (
                    <button key={t.id} type="button" onClick={() => setTemplate(t.id)} style={{
                      flex: 1, padding: "10px 6px", borderRadius: 9, cursor: "pointer", fontFamily: "inherit",
                      border: template === t.id ? "2px solid #6366f1" : "2px solid #e2e8f0",
                      backgroundColor: template === t.id ? "#eef2ff" : "#f8fafc", textAlign: "center",
                    }}>
                      <div style={{ fontSize: 18, marginBottom: 3 }}>{t.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: template === t.id ? "#4338ca" : "#374151" }}>{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={running || selected.length === 0 || !reviewLink.trim()}
            style={{
              padding: "14px", borderRadius: 12, border: "none",
              backgroundColor: running || selected.length === 0 || !reviewLink.trim() ? "#a5b4fc" : "#6366f1",
              color: "#fff", fontSize: 15, fontWeight: 800, cursor: (running || selected.length === 0 || !reviewLink.trim()) ? "not-allowed" : "pointer",
              fontFamily: "inherit", boxShadow: "0 4px 14px rgba(99,102,241,0.35)", transition: "all 0.15s",
            }}
          >
            {running ? `Sende ${progress?.sent ?? 0}/${selected.length}...` : `📣 Kampagne starten (${selected.length} Kontakte)`}
          </button>

          {selected.length === 0 && customers.length > 0 && (
            <p style={{ fontSize: 12, color: "#f97316", textAlign: "center", margin: 0 }}>Bitte wähle mindestens einen Kontakt aus.</p>
          )}
          {!reviewLink.trim() && (
            <p style={{ fontSize: 12, color: "#f97316", textAlign: "center", margin: 0 }}>Bitte trage den Review-Link ein.</p>
          )}

          {/* CSV Hint */}
          <div style={{ backgroundColor: "#f0fdf4", borderRadius: 12, padding: "14px 16px", border: "1px solid #bbf7d0" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#15803d", margin: "0 0 6px" }}>💡 CSV-Format</p>
            <p style={{ fontSize: 11, color: "#166534", margin: 0, lineHeight: 1.6 }}>
              Erwartete Spalten: <code style={{ backgroundColor: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: 3 }}>Name, Email</code><br />
              Trennzeichen: Komma oder Semikolon<br />
              Exportierbar aus Excel, Google Contacts, Mailchimp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
