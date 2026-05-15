import Link from "next/link";

export const metadata = { title: "Impressum — ReviewBoost" };

export default function ImpressumPage() {
  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#f8fafc",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: "#ffffff", borderBottom: "1px solid #e8edf3",
        padding: "0 32px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
            Review<span style={{ color: "#6366f1" }}>Boost</span>
          </span>
        </Link>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link href="/datenschutz" style={{ fontSize: 14, color: "#64748b", textDecoration: "none" }}>Datenschutz</Link>
          <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "#6366f1", textDecoration: "none" }}>Anmelden →</Link>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{
          backgroundColor: "#ffffff", borderRadius: 20, padding: "48px 52px",
          border: "1px solid #e8edf3", boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 12px" }}>
            Rechtliches
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
            Impressum
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 40px", lineHeight: 1.6 }}>
            Angaben gemäß § 5 ECG (Österreich) und § 5 TMG (Deutschland)
          </p>

          <hr style={{ border: "none", borderTop: "1px solid #e8edf3", margin: "0 0 36px" }} />

          <Section title="Medieninhaber & Herausgeber">
            <InfoRow label="Unternehmen" value="ReviewBoost e.U." />
            <InfoRow label="Rechtsform" value="Eingetragenes Einzelunternehmen" />
            <InfoRow label="Inhaberin / Inhaber" value="[Dein Name]" />
            <InfoRow label="Adresse" value={<>
              [Straße & Hausnummer]<br />
              [PLZ] [Stadt]<br />
              Österreich
            </>} />
          </Section>

          <Section title="Kontakt">
            <InfoRow label="E-Mail" value={
              <a href="mailto:hallo@reviewboost.at" style={{ color: "#6366f1", textDecoration: "none" }}>
                hallo@reviewboost.at
              </a>
            } />
            <InfoRow label="Telefon" value="[+43 XXX XXX XXXX]" />
            <InfoRow label="Website" value={
              <a href="https://reviewboost-lyart.vercel.app" style={{ color: "#6366f1", textDecoration: "none" }}>
                reviewboost-lyart.vercel.app
              </a>
            } />
          </Section>

          <Section title="Unternehmensregistrierung">
            <InfoRow label="Firmenbuchnummer" value="[FN XXXXXX x] — Handelsgericht Wien" />
            <InfoRow label="UID-Nummer" value="ATU[XXXXXXXX]" />
            <InfoRow label="WKO-Mitglied" value="Wirtschaftskammer Wien — Fachgruppe Unternehmensberatung" />
          </Section>

          <Section title="Aufsichtsbehörde">
            <p style={bodyText}>
              Zuständige Aufsichtsbehörde: Bezirkshauptmannschaft / Magistrat [Stadt]
            </p>
            <p style={bodyText}>
              Anwendbare Rechtsvorschriften: Gewerbeordnung (GewO), abrufbar unter{" "}
              <a href="https://www.ris.bka.gv.at" target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1" }}>
                www.ris.bka.gv.at
              </a>
            </p>
          </Section>

          <Section title="Haftungsausschluss">
            <p style={bodyText}>
              Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte
              externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber
              verantwortlich.
            </p>
            <p style={bodyText}>
              Die auf dieser Website bereitgestellten Informationen wurden mit größtmöglicher Sorgfalt
              zusammengestellt. Dennoch kann keine Gewähr für die Richtigkeit, Vollständigkeit und
              Aktualität der Inhalte übernommen werden.
            </p>
          </Section>

          <Section title="Urheberrecht">
            <p style={bodyText}>
              Alle Inhalte dieser Website (Texte, Grafiken, Logos, Bilder) sind urheberrechtlich
              geschützt und Eigentum von ReviewBoost e.U. Eine Vervielfältigung, Verbreitung oder
              öffentliche Zugänglichmachung — auch auszugsweise — bedarf der vorherigen schriftlichen
              Zustimmung.
            </p>
          </Section>

          <Section title="Online-Streitbeilegung (ODR)">
            <p style={bodyText}>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1" }}>
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
            <p style={bodyText}>
              Wir sind zur Teilnahme an einem Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle weder verpflichtet noch bereit.
            </p>
          </Section>

          <div style={{ marginTop: 40, padding: "20px 24px", backgroundColor: "#f8fafc", borderRadius: 12, border: "1px solid #e8edf3" }}>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "#64748b" }}>Hinweis:</strong> Die mit [ ] markierten Felder sind Platzhalter und müssen
              vor dem offiziellen Betrieb mit deinen echten Unternehmensdaten ausgefüllt werden.
              Bitte lass das Impressum von einem österreichischen Rechtsanwalt prüfen.
            </p>
          </div>

          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 40, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
            Stand: Mai 2026 · ReviewBoost e.U.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "24px", borderTop: "1px solid #e8edf3", backgroundColor: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          <Link href="/" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>← Zurück zur Startseite</Link>
          <Link href="/datenschutz" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>Datenschutzerklärung</Link>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 14px", paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8, marginBottom: 10, alignItems: "start" }}>
      <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{value}</span>
    </div>
  );
}

const bodyText: React.CSSProperties = {
  fontSize: 14, color: "#475569", lineHeight: 1.75, margin: "0 0 12px",
};
