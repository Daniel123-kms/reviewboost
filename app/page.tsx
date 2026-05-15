import Link from "next/link";

/* ─── DATA ─── */
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Betrieb einrichten",
    desc: "In 2 Minuten verbindest du Google, Tripadvisor & Co. Kein technisches Wissen nötig.",
    icon: "🏪",
  },
  {
    step: "02",
    title: "Kunden einladen",
    desc: "QR-Code am Tisch, E-Mail nach dem Besuch, oder WhatsApp — du wählst, wie du anfragst.",
    icon: "✉️",
  },
  {
    step: "03",
    title: "Mehr Sterne ernten",
    desc: "Zufriedene Kunden landen direkt auf Google. Kritisches Feedback bekommst du zuerst.",
    icon: "⭐",
  },
];

const FEATURES = [
  {
    icon: "🤖",
    tag: "KI-gestützt",
    title: "Antworten in einer Sekunde",
    desc: "ReviewBoost schreibt professionelle Antworten auf jede Bewertung — persönlich, neutral, auf Deutsch. Du kopierst, du postest, fertig.",
    color: "#6366f1",
    bg: "#eef2ff",
  },
  {
    icon: "🔔",
    tag: "Echtzeit",
    title: "Sofort-Alarm bei schlechten Bewertungen",
    desc: "1-Stern-Bewertung um 22 Uhr? Du weißt es in Sekunden. Reagiere bevor es eskaliert.",
    color: "#f97316",
    bg: "#fff7ed",
  },
  {
    icon: "🔭",
    tag: "Strategie",
    title: "Was machen deine Konkurrenten?",
    desc: "Sieh automatisch, wie du gegen Restaurants im gleichen Umkreis abschneidest — und was du besser machen kannst.",
    color: "#22c55e",
    bg: "#f0fdf4",
  },
  {
    icon: "🛡️",
    tag: "Funnel",
    title: "Kritik bleibt intern",
    desc: "Der smarte Feedback-Filter schickt unzufriedene Gäste zu dir — nicht zu Google.",
    color: "#8b5cf6",
    bg: "#f5f3ff",
  },
  {
    icon: "📣",
    tag: "Kampagne",
    title: "Massenmails per CSV",
    desc: "Kundenliste hochladen, Template wählen, senden. In 3 Minuten gehen Hunderte personalisierte Einladungen raus.",
    color: "#0ea5e9",
    bg: "#f0f9ff",
  },
  {
    icon: "🖨️",
    tag: "Print",
    title: "Tischaufsteller & QR-Codes",
    desc: "Druckfertige Aufsteller, Fensterkleber und Bonstreifen — mit deinem Branding, direkt aus dem Browser.",
    color: "#ec4899",
    bg: "#fdf2f8",
  },
];

const TESTIMONIALS = [
  {
    name: "Stefan Mayer",
    role: "Restaurant-Inhaber, Wien",
    text: "Von 4,1 auf 4,7 Sterne in 3 Monaten. Die Einladungs-QR-Codes am Tisch haben alles verändert. Unsere Gäste scannen das wirklich.",
    stars: 5,
    initials: "SM",
    color: "#6366f1",
  },
  {
    name: "Laura Klein",
    role: "Hotel-Managerin, Graz",
    text: "Ich spare täglich 1–2 Stunden. Die KI-Antworten klingen so menschlich, dass unsere Gäste nie merken, dass ich nicht selbst schreibe.",
    stars: 5,
    initials: "LK",
    color: "#22c55e",
  },
  {
    name: "Marco Fusco",
    role: "Café-Besitzer, Salzburg",
    text: "Das Konkurrenz-Radar war der Game-Changer. Ich hab endlich schwarz auf weiß gesehen, warum das Lokal nebenan besser rankt — und was ich ändern muss.",
    stars: 5,
    initials: "MF",
    color: "#f97316",
  },
];

const FAQS = [
  {
    q: "Wie lange dauert die Einrichtung?",
    a: "Unter 5 Minuten. Du gibst deinen Betriebsnamen ein, verbindest deine Plattformen und kannst sofort die erste Bewertungseinladung senden.",
  },
  {
    q: "Funktioniert das auch für mehrere Standorte?",
    a: "Ja. Im Pro- und Enterprise-Plan kannst du mehrere Filialen mit einem Login verwalten — jede mit eigenen Statistiken.",
  },
  {
    q: "Was passiert mit negativen Bewertungen?",
    a: "Der Feedback-Funnel filtert unzufriedene Gäste raus: Sie werden zu einem privaten Formular weitergeleitet, nicht zu Google. So bleibt Kritik intern.",
  },
  {
    q: "Brauche ich technisches Wissen?",
    a: "Überhaupt nicht. ReviewBoost ist für Gastronomen und Einzelhändler gebaut — nicht für IT-Profis. Alles funktioniert per Klick.",
  },
  {
    q: "Kann ich jederzeit kündigen?",
    a: "Ja, monatlich kündbar, keine Mindestlaufzeit. Deine Daten kannst du vorher als CSV exportieren.",
  },
];

/* ─── COMPONENTS ─── */
function DashboardPreview() {
  return (
    <div style={{
      background: "#1e1b4b",
      borderRadius: 16,
      padding: "16px 20px 0",
      boxShadow: "0 32px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08)",
      overflow: "hidden",
      maxWidth: 560,
      width: "100%",
    }}>
      {/* Window chrome */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: c }} />
        ))}
        <div style={{ flex: 1, height: 10, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.08)", marginLeft: 8 }} />
      </div>
      {/* Mini stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Ø Bewertung", value: "4.7 ★", color: "#fbbf24" },
          { label: "Gesamt", value: "143", color: "#a5b4fc" },
          { label: "Ausstehend", value: "3", color: "#fb923c" },
        ].map((s) => (
          <div key={s.label} style={{ backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Review items */}
      {[
        { name: "Maria S.", rating: 5, text: "Absolut fantastisches Essen! Das griechische Lammgericht war perfekt.", platform: "Google", responded: true },
        { name: "Thomas K.", rating: 2, text: "Wartezeit war leider zu lang, der Service hätte besser sein können.", platform: "Tripadvisor", responded: false, alert: true },
        { name: "Julia M.", rating: 5, text: "Bestes Restaurant im Bezirk — wir kommen immer wieder!", platform: "Google", responded: true },
      ].map((r) => (
        <div key={r.name} style={{
          backgroundColor: r.alert ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)",
          borderRadius: 10,
          padding: "11px 13px",
          marginBottom: 8,
          borderLeft: `3px solid ${r.alert ? "#ef4444" : r.rating === 5 ? "#22c55e" : "#f59e0b"}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{r.name}</span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {r.alert && <span style={{ fontSize: 9, fontWeight: 700, backgroundColor: "#ef4444", color: "#fff", padding: "1px 6px", borderRadius: 999 }}>NEU</span>}
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", backgroundColor: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 999 }}>{r.platform}</span>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 5 }}>
            {r.text.substring(0, 60)}…
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#fbbf24" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
            {r.responded
              ? <span style={{ fontSize: 9, color: "#4ade80", fontWeight: 600 }}>✓ Beantwortet</span>
              : <span style={{ fontSize: 9, color: "#fb923c", fontWeight: 600 }}>→ Antworten</span>}
          </div>
        </div>
      ))}
      {/* Bottom bar */}
      <div style={{ backgroundColor: "rgba(255,255,255,0.03)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "10px 0", marginTop: 4, display: "flex", gap: 8, justifyContent: "center" }}>
        {["🏠 Übersicht", "⭐ Bewertungen", "📱 Akquise", "🔍 Markt", "⚙️"].map((label) => (
          <span key={label} style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", padding: "4px 8px", borderRadius: 6 }}>{label}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── PAGE ─── */
export default function LandingPage() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        backgroundColor: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #f1f5f9",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <span style={{ fontSize: 21, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
            Review<span style={{ color: "#6366f1" }}>Boost</span>
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/login" style={{ padding: "8px 18px", borderRadius: 8, color: "#475569", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
              Anmelden
            </Link>
            <Link href="/signup" style={{
              padding: "9px 20px", borderRadius: 9,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700,
              boxShadow: "0 2px 12px rgba(99,102,241,0.35)",
            }}>
              Kostenlos starten →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        padding: "80px 24px 100px",
        background: "linear-gradient(160deg, #f8f9ff 0%, #ede9fe 45%, #f0fdf4 100%)",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
          {/* Left */}
          <div style={{ flex: "1 1 400px", minWidth: 300 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              backgroundColor: "#fff", border: "1px solid #e0e7ff",
              borderRadius: 999, padding: "6px 14px", marginBottom: 28,
              boxShadow: "0 1px 6px rgba(99,102,241,0.12)",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6366f1" }}>Jetzt live — inkl. KI-Antworten</span>
            </div>

            <h1 style={{
              fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800,
              color: "#0f172a", lineHeight: 1.08, margin: "0 0 20px",
              letterSpacing: "-2px",
            }}>
              Mehr Sterne.<br />
              <span style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Mehr Gäste.</span><br />
              Weniger Aufwand.
            </h1>

            <p style={{ fontSize: 18, color: "#475569", lineHeight: 1.7, margin: "0 0 36px", maxWidth: 440 }}>
              ReviewBoost automatisiert dein Bewertungsmanagement für Restaurants & lokale Betriebe — von der Einladung bis zur KI-Antwort.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <Link href="/signup" style={{
                display: "inline-block", padding: "15px 32px", borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700,
                boxShadow: "0 6px 24px rgba(99,102,241,0.4)",
                letterSpacing: "-0.2px",
              }}>
                Ersten Monat gratis testen →
              </Link>
              <Link href="/login" style={{
                display: "inline-block", padding: "15px 24px", borderRadius: 12,
                backgroundColor: "#fff", color: "#374151",
                textDecoration: "none", fontSize: 15, fontWeight: 600,
                border: "1.5px solid #e2e8f0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}>
                Anmelden
              </Link>
            </div>

            <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
              {["Keine Kreditkarte", "Setup in 2 Min.", "Jederzeit kündbar"].map((t) => (
                <span key={t} style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Product Preview */}
          <div style={{ flex: "1 1 320px", display: "flex", justifyContent: "center" }}>
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ── PLATFORM LOGOS ── */}
      <section style={{ backgroundColor: "#ffffff", padding: "28px 24px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 18 }}>
            Alle wichtigen Plattformen verbunden
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { name: "Google", emoji: "🔵", color: "#4285F4", bg: "#EFF6FF" },
              { name: "Tripadvisor", emoji: "🟢", color: "#34A853", bg: "#F0FDF4" },
              { name: "Booking.com", emoji: "🔷", color: "#003580", bg: "#EFF6FF" },
              { name: "Facebook", emoji: "🟣", color: "#1877F2", bg: "#F0F4FF" },
              { name: "Lieferando", emoji: "🟠", color: "#FF8000", bg: "#FFF7ED" },
              { name: "Foodora", emoji: "🔴", color: "#D70F64", bg: "#FFF1F2" },
            ].map((p) => (
              <div key={p.name} style={{
                padding: "8px 18px", borderRadius: 99,
                backgroundColor: p.bg, border: `1px solid ${p.bg}`,
                fontSize: 13, fontWeight: 700, color: p.color,
              }}>
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "96px 24px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 12px" }}>SO EINFACH GEHT&apos;S</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#0f172a", margin: "0 0 14px", letterSpacing: "-1px" }}>
              In 3 Schritten zur Top-Bewertung
            </h2>
            <p style={{ fontSize: 17, color: "#64748b", maxWidth: 480, margin: "0 auto" }}>
              Kein technisches Wissen nötig. Einrichten, anlaufen lassen, Bewertungen sammeln.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} style={{
                backgroundColor: "#ffffff",
                borderRadius: 20, padding: "36px 32px",
                border: "1.5px solid #f1f5f9",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                position: "relative",
              }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 48, height: 48, borderRadius: 14,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff", fontSize: 22, marginBottom: 20,
                  boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#d1d5db", letterSpacing: "1px", marginBottom: 8 }}>
                  SCHRITT {step.step}
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: "#0f172a", margin: "0 0 10px" }}>{step.title}</h3>
                <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{
                    display: "none",
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ backgroundColor: "#0f172a", padding: "60px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, textAlign: "center" }}>
          {[
            { val: "3×", label: "Mehr Bewertungen", sub: "Branchendurchschnitt mit Einladungs-Tools" },
            { val: "4,7★", label: "Ø Rating-Ziel", sub: "erreichbar in 90 Tagen" },
            { val: "45 Min", label: "Zeitersparnis", sub: "pro Woche durch KI-Antworten" },
            { val: "2 Min", label: "Setup-Zeit", sub: "bis zur ersten Einladung" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 40, fontWeight: 800, color: "#a5b4fc", letterSpacing: "-1px" }}>{s.val}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", marginTop: 6 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "96px 24px", backgroundColor: "#ffffff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 12px" }}>FUNKTIONEN</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#0f172a", margin: "0 0 14px", letterSpacing: "-1px" }}>
              Alles was du brauchst — nichts was du nicht brauchst
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{
                padding: "28px 28px",
                borderRadius: 18, border: "1.5px solid #f1f5f9",
                backgroundColor: "#fafafa",
                display: "flex", gap: 18, alignItems: "flex-start",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  backgroundColor: f.bg, fontSize: 22,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {f.icon}
                </div>
                <div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: f.color,
                    backgroundColor: f.bg, padding: "2px 8px", borderRadius: 999,
                    letterSpacing: "0.3px",
                  }}>
                    {f.tag}
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "8px 0 6px" }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "96px 24px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 12px" }}>KUNDENSTIMMEN</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#0f172a", margin: "0 0 14px", letterSpacing: "-1px" }}>
              Das sagen Gastronomen
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Basierend auf Erfahrungsberichten aus der Beta-Phase</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{
                backgroundColor: "#ffffff", borderRadius: 20, padding: "32px",
                border: "1.5px solid #e8edf3",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}>
                <div style={{ fontSize: 18, color: "#fbbf24", marginBottom: 18, letterSpacing: 2 }}>
                  {"★".repeat(t.stars)}
                </div>
                <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.75, margin: "0 0 24px" }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    backgroundColor: t.color + "22",
                    color: t.color, fontWeight: 800, fontSize: 15,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: "96px 24px", backgroundColor: "#ffffff" }} id="preise">
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 12px" }}>PREISE</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#0f172a", margin: "0 0 14px", letterSpacing: "-1px" }}>
              Was kostet ein ignoriertes 1-Stern-Review?
            </h2>
            <p style={{ fontSize: 17, color: "#64748b", maxWidth: 560, margin: "0 auto" }}>
              Studien zeigen: 22 % der Leser meiden einen Betrieb nach einer unbeantworteten Negativ-Bewertung.
              ReviewBoost kostet weniger als ein durchschnittlicher Tisch pro Monat.
            </p>
          </div>

          {/* ROI Banner */}
          <div style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
            borderRadius: 16, padding: "24px 32px", marginBottom: 40,
            display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
              {[
                { label: "Ø Umsatz pro Tisch/Abend", value: "€85" },
                { label: "Leser die abspringen (1★ unbeantwortet)", value: "22 %" },
                { label: "ReviewBoost Pro / Monat", value: "€79" },
                { label: "Break-even: 1 gewonnener Gast", value: "✓" },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#a5b4fc" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <Link href="/signup" style={{
              padding: "12px 24px", borderRadius: 10, backgroundColor: "#6366f1",
              color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700,
              whiteSpace: "nowrap", flexShrink: 0,
            }}>
              Ersten Monat gratis →
            </Link>
          </div>

          {/* Trust strip */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              ✓ Ersten Monat gratis &nbsp;·&nbsp; ✓ Keine Kreditkarte nötig &nbsp;·&nbsp; ✓ Jederzeit monatlich kündbar &nbsp;·&nbsp; ✓ Setup in 2 Minuten
            </p>
          </div>

          {/* Plans */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {[
              {
                name: "Starter",
                price: "€29",
                per: "/Monat",
                desc: "Perfekt für einen Standort",
                roi: "Spart ~3 Std. manuelle Arbeit pro Woche",
                highlight: false,
                badge: null,
                features: [
                  { text: "1 Standort", detail: null },
                  { text: "Bis zu 200 Bewertungseinladungen/Monat", detail: null },
                  { text: "Google & Tripadvisor Import", detail: null },
                  { text: "QR-Code Generator", detail: null },
                  { text: "Wöchentlicher Bericht per E-Mail", detail: "Neu" },
                  { text: "1-Stern Sofort-Alarm", detail: "Neu" },
                  { text: "E-Mail-Support", detail: null },
                ],
                cta: "Ersten Monat gratis starten",
                ctaNote: "Kein Abo, keine Kreditkarte",
              },
              {
                name: "Pro",
                price: "€79",
                per: "/Monat",
                desc: "Für wachsende Betriebe",
                roi: "Ø +1,2 Sterne mehr in 3 Monaten",
                highlight: true,
                badge: "BELIEBTESTE WAHL",
                features: [
                  { text: "Bis zu 5 Standorte", detail: null },
                  { text: "Unbegrenzte Einladungen", detail: null },
                  { text: "Alle Plattformen (Google, Trip, Booking, FB)", detail: null },
                  { text: "KI-Antworten mit einem Klick", detail: null },
                  { text: "Konkurrenz-Radar & Benchmark", detail: null },
                  { text: "CSV-Massenkampagnen", detail: null },
                  { text: "Tisch-QR & druckfertige Assets", detail: null },
                  { text: "Wöchentlicher Bericht + Insights", detail: "Neu" },
                  { text: "Priority-Support (< 4h)", detail: null },
                ],
                cta: "Pro — Ersten Monat gratis",
                ctaNote: "Dann €79/Monat, jederzeit kündbar",
              },
              {
                name: "Enterprise",
                price: "€199",
                per: "/Monat",
                desc: "Für Ketten & Agenturen",
                roi: "White-Label: Verkaufe ReviewBoost unter deiner Marke",
                highlight: false,
                badge: null,
                features: [
                  { text: "Unbegrenzte Standorte", detail: null },
                  { text: "White-Label (dein Logo, deine Domain)", detail: null },
                  { text: "API-Zugang für POS-Integration", detail: null },
                  { text: "Dedicated Ansprechpartner", detail: null },
                  { text: "Onboarding & persönliche Schulung", detail: null },
                  { text: "SLA-Garantie 99,9 % Uptime", detail: null },
                  { text: "Monatlicher Strategy-Call", detail: null },
                ],
                cta: "Kontakt aufnehmen",
                ctaNote: "Individuelles Angebot in 24h",
              },
            ].map((plan) => (
              <div key={plan.name} style={{
                padding: "36px 28px", borderRadius: 20, position: "relative",
                border: plan.highlight ? "2px solid #6366f1" : "1.5px solid #e2e8f0",
                backgroundColor: plan.highlight ? "#f5f3ff" : "#ffffff",
                boxShadow: plan.highlight ? "0 12px 40px rgba(99,102,241,0.18)" : "0 2px 8px rgba(0,0,0,0.04)",
                display: "flex", flexDirection: "column",
              }}>
                {plan.badge && (
                  <div style={{
                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff", fontSize: 11, fontWeight: 800,
                    padding: "5px 16px", borderRadius: 999, letterSpacing: "0.8px",
                    whiteSpace: "nowrap",
                  }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{plan.name}</span>
                </div>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 4px" }}>{plan.desc}</p>
                <p style={{ fontSize: 12, color: "#22c55e", fontWeight: 600, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 4 }}>
                  <span>📈</span> {plan.roi}
                </p>

                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 44, fontWeight: 800, color: "#0f172a", letterSpacing: "-2px" }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: "#94a3b8", marginLeft: 2 }}>{plan.per}</span>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
                  {plan.features.map((f) => (
                    <li key={f.text} style={{ fontSize: 14, color: "#374151", display: "flex", alignItems: "flex-start", gap: 9 }}>
                      <span style={{ color: "#22c55e", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ flex: 1 }}>{f.text}</span>
                      {f.detail && (
                        <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: "#eef2ff", color: "#6366f1", padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>
                          {f.detail}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                <div>
                  <Link href="/signup" style={{
                    display: "block", textAlign: "center",
                    padding: "14px 20px", borderRadius: 11,
                    background: plan.highlight ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#f1f5f9",
                    color: plan.highlight ? "#fff" : "#374151",
                    textDecoration: "none", fontSize: 14, fontWeight: 700,
                    boxShadow: plan.highlight ? "0 4px 16px rgba(99,102,241,0.35)" : "none",
                    marginBottom: 8,
                  }}>
                    {plan.cta}
                  </Link>
                  <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", margin: 0 }}>{plan.ctaNote}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom guarantee */}
          <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { icon: "🔒", title: "DSGVO-konform", desc: "Alle Daten in EU-Rechenzentren. Österreichisches Datenschutzrecht." },
              { icon: "💳", title: "Kein Risiko", desc: "Ersten Monat kostenlos. Kündbar per Klick, ohne Formular." },
              { icon: "⚡", title: "Sofort startklar", desc: "Kein IT-Wissen nötig. In 2 Minuten einsatzbereit." },
              { icon: "🤝", title: "Persönlicher Support", desc: "Kein Bot. Echter Mensch antwortet innerhalb von 4 Stunden." },
            ].map((g) => (
              <div key={g.title} style={{ textAlign: "center", padding: "20px 16px" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{g.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{g.title}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{g.desc}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "96px 24px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 12px" }}>FAQ</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-1px" }}>
              Häufige Fragen
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map((faq) => (
              <div key={faq.q} style={{
                backgroundColor: "#ffffff", borderRadius: 14,
                padding: "22px 24px", border: "1.5px solid #e8edf3",
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>{faq.q}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)",
        padding: "96px 24px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🚀</div>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800,
            color: "#ffffff", margin: "0 0 16px", letterSpacing: "-1px",
          }}>
            Bereit, durchzustarten?
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.7)", margin: "0 0 36px", lineHeight: 1.6 }}>
            Starte heute gratis — und sieh in 30 Tagen, wie sich deine Bewertungen verbessern.
          </p>
          <Link href="/signup" style={{
            display: "inline-block", padding: "17px 44px", borderRadius: 14,
            backgroundColor: "#ffffff", color: "#6366f1",
            textDecoration: "none", fontSize: 17, fontWeight: 800,
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            letterSpacing: "-0.3px",
          }}>
            Kostenlos registrieren →
          </Link>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 16 }}>
            Keine Kreditkarte · Sofort startklar · Jederzeit kündbar
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: "#0f172a", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#ffffff" }}>
            Review<span style={{ color: "#a5b4fc" }}>Boost</span>
          </span>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { label: "Datenschutz", href: "/datenschutz" },
              { label: "Impressum", href: "/impressum" },
              { label: "Kontakt", href: "mailto:support@reviewboost.at" },
              { label: "Anmelden", href: "/login" },
            ].map((l) => (
              <Link key={l.label} href={l.href} style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}>
                {l.label}
              </Link>
            ))}
          </div>
          <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>
            © {new Date().getFullYear()} ReviewBoost. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  );
}
