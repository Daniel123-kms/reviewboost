import Link from "next/link";

const features = [
  {
    icon: "⭐",
    title: "Mehr Bewertungen",
    desc: "Automatisierte Einladungen per E-Mail & SMS steigern deine Bewertungsanzahl um bis zu 300%.",
  },
  {
    icon: "📊",
    title: "Echtzeit-Analytics",
    desc: "Verfolge deine Reputation auf allen Plattformen in einem zentralen Dashboard.",
  },
  {
    icon: "🔔",
    title: "Sofort-Benachrichtigungen",
    desc: "Reagiere innerhalb von Minuten auf neue Bewertungen — positiv wie negativ.",
  },
  {
    icon: "🤖",
    title: "KI-Antworten",
    desc: "Generiere professionelle Antworten auf Bewertungen mit einem Klick.",
  },
  {
    icon: "🔗",
    title: "Alle Plattformen",
    desc: "Google, Tripadvisor, Booking.com, Yelp und viele mehr — alles an einem Ort.",
  },
  {
    icon: "🛡️",
    title: "Reputationsschutz",
    desc: "Erkenne negative Trends frühzeitig und reagiere, bevor sie viral gehen.",
  },
];

const testimonials = [
  {
    name: "Stefan M.",
    role: "Restaurant-Inhaber, Wien",
    text: "Unsere Google-Bewertungen sind in 3 Monaten von 4,1 auf 4,7 Sterne gestiegen. ReviewBoost hat unser Business verändert.",
    stars: 5,
  },
  {
    name: "Laura K.",
    role: "Hotel-Managerin, München",
    text: "Endlich behalte ich den Überblick über alle Plattformen. Das Dashboard spart mir täglich 2 Stunden.",
    stars: 5,
  },
  {
    name: "Marco F.",
    role: "Fitnessstudio-Betreiber, Berlin",
    text: "Die KI-Antworten klingen so natürlich — unsere Kunden glauben, ich schreibe alles selbst!",
    stars: 5,
  },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      {/* Navbar */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e2e8f0",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px" }}>
            Review<span style={{ color: "#6366f1" }}>Boost</span>
          </span>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link
              href="/login"
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "1.5px solid #e2e8f0",
                color: "#475569",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                transition: "all 0.15s",
              }}
            >
              Anmelden
            </Link>
            <Link
              href="/signup"
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                backgroundColor: "#6366f1",
                color: "#ffffff",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                boxShadow: "0 1px 3px rgba(99,102,241,0.4)",
              }}
            >
              Kostenlos starten
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #f8faff 0%, #ede9fe 50%, #f0fdf4 100%)",
          padding: "100px 24px 80px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <span
            style={{
              display: "inline-block",
              backgroundColor: "#ede9fe",
              color: "#7c3aed",
              fontSize: 13,
              fontWeight: 600,
              padding: "6px 16px",
              borderRadius: 999,
              marginBottom: 24,
              letterSpacing: "0.3px",
            }}
          >
            🚀 Jetzt mit KI-gestützten Antworten
          </span>
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.1,
              margin: "0 0 24px",
              letterSpacing: "-1.5px",
            }}
          >
            Mehr Bewertungen.
            <br />
            <span style={{ color: "#6366f1" }}>Besseres Ranking.</span>
            <br />
            Mehr Kunden.
          </h1>
          <p
            style={{
              fontSize: 19,
              color: "#475569",
              lineHeight: 1.7,
              margin: "0 0 40px",
              maxWidth: 560,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            ReviewBoost automatisiert dein Bewertungsmanagement auf Google, Tripadvisor & Co.
            Sammle 3× mehr echte Bewertungen — komplett auf Autopilot.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/signup"
              style={{
                display: "inline-block",
                padding: "16px 36px",
                backgroundColor: "#6366f1",
                color: "#ffffff",
                textDecoration: "none",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                letterSpacing: "-0.2px",
              }}
            >
              Gratis testen — 14 Tage kostenlos →
            </Link>
            <Link
              href="/login"
              style={{
                display: "inline-block",
                padding: "16px 36px",
                backgroundColor: "#ffffff",
                color: "#1e293b",
                textDecoration: "none",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                border: "1.5px solid #e2e8f0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              Anmelden
            </Link>
          </div>
          <p style={{ marginTop: 20, fontSize: 13, color: "#94a3b8" }}>
            Keine Kreditkarte erforderlich · Sofort loslegen · Jederzeit kündbar
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ backgroundColor: "#0f172a", padding: "60px 24px" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 40,
            textAlign: "center",
          }}
        >
          {[
            { val: "12.000+", label: "Zufriedene Betriebe" },
            { val: "4,8 ★", label: "Ø Bewertungsverbesserung" },
            { val: "300%", label: "Mehr Bewertungen" },
            { val: "2 Min", label: "Setup-Zeit" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#a5b4fc" }}>{s.val}</div>
              <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "100px 24px", backgroundColor: "#ffffff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 16px",
                letterSpacing: "-1px",
              }}
            >
              Alles was du brauchst, um top bewertet zu werden
            </h2>
            <p style={{ fontSize: 17, color: "#64748b", maxWidth: 520, margin: "0 auto" }}>
              Von der Einladung bis zur Antwort — ReviewBoost deckt den gesamten Bewertungsprozess ab.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 28,
            }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  padding: "32px",
                  borderRadius: 16,
                  border: "1.5px solid #f1f5f9",
                  backgroundColor: "#fafafa",
                  transition: "box-shadow 0.2s",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 10px" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "100px 24px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 16px",
                letterSpacing: "-1px",
              }}
            >
              Was unsere Kunden sagen
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 28,
            }}
          >
            {testimonials.map((t) => (
              <div
                key={t.name}
                style={{
                  padding: "32px",
                  borderRadius: 16,
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #e2e8f0",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 16, color: "#f59e0b" }}>
                  {"★".repeat(t.stars)}
                </div>
                <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.7, margin: "0 0 20px", fontStyle: "italic" }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{t.name}</div>
                  <div style={{ color: "#94a3b8", fontSize: 13 }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "100px 24px", backgroundColor: "#ffffff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 16px",
                letterSpacing: "-1px",
              }}
            >
              Einfache, transparente Preise
            </h2>
            <p style={{ fontSize: 17, color: "#64748b" }}>Keine versteckten Kosten. Jederzeit kündbar.</p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 28,
            }}
          >
            {[
              {
                name: "Starter",
                price: "€29",
                period: "/Monat",
                highlight: false,
                features: ["1 Standort", "Bis zu 100 Einladungen/Mo.", "Google & Tripadvisor", "E-Mail Support"],
              },
              {
                name: "Pro",
                price: "€79",
                period: "/Monat",
                highlight: true,
                features: ["5 Standorte", "Unbegrenzte Einladungen", "Alle Plattformen", "KI-Antworten", "Priority Support"],
              },
              {
                name: "Enterprise",
                price: "€199",
                period: "/Monat",
                highlight: false,
                features: ["Unbegrenzte Standorte", "White-Label Option", "API-Zugang", "Dedicated Manager", "SLA-Garantie"],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                style={{
                  padding: "36px 28px",
                  borderRadius: 16,
                  border: plan.highlight ? "2px solid #6366f1" : "1.5px solid #e2e8f0",
                  backgroundColor: plan.highlight ? "#f5f3ff" : "#ffffff",
                  position: "relative",
                  boxShadow: plan.highlight ? "0 8px 32px rgba(99,102,241,0.15)" : "none",
                }}
              >
                {plan.highlight && (
                  <span
                    style={{
                      position: "absolute",
                      top: -13,
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "#6366f1",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "4px 14px",
                      borderRadius: 999,
                      letterSpacing: "0.5px",
                    }}
                  >
                    BELIEBTESTE WAHL
                  </span>
                )}
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>{plan.name}</h3>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: "#0f172a" }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: "#94a3b8" }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ fontSize: 14, color: "#374151", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "12px 20px",
                    borderRadius: 10,
                    backgroundColor: plan.highlight ? "#6366f1" : "#f1f5f9",
                    color: plan.highlight ? "#ffffff" : "#0f172a",
                    textDecoration: "none",
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  Jetzt starten
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(26px, 4vw, 40px)",
              fontWeight: 800,
              color: "#ffffff",
              margin: "0 0 16px",
              letterSpacing: "-0.5px",
            }}
          >
            Bereit für mehr Bewertungen?
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.85)", margin: "0 0 36px" }}>
            Starte heute kostenlos und sieh in 30 Tagen echte Ergebnisse.
          </p>
          <Link
            href="/signup"
            style={{
              display: "inline-block",
              padding: "16px 40px",
              backgroundColor: "#ffffff",
              color: "#6366f1",
              textDecoration: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            Kostenlos registrieren →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#0f172a",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#ffffff" }}>
            Review<span style={{ color: "#a5b4fc" }}>Boost</span>
          </span>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 16 }}>
            © {new Date().getFullYear()} ReviewBoost. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  );
}
