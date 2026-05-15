import Link from "next/link";

export const metadata = { title: "Datenschutzerklärung — ReviewBoost" };

export default function DatenschutzPage() {
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
          <Link href="/impressum" style={{ fontSize: 14, color: "#64748b", textDecoration: "none" }}>Impressum</Link>
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
            Datenschutzerklärung
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 40px", lineHeight: 1.6 }}>
            Gemäß DSGVO (EU) 2016/679, DSG 2018 (Österreich) und BDSG (Deutschland)
          </p>

          <hr style={{ border: "none", borderTop: "1px solid #e8edf3", margin: "0 0 36px" }} />

          {/* TOC */}
          <div style={{ backgroundColor: "#f8fafc", borderRadius: 12, padding: "20px 24px", marginBottom: 40, border: "1px solid #e8edf3" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: "0 0 12px" }}>Inhalt</p>
            <ol style={{ margin: 0, padding: "0 0 0 20px", display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                "Verantwortlicher",
                "Welche Daten wir verarbeiten",
                "Rechtsgrundlagen der Verarbeitung",
                "Drittanbieter & Auftragsverarbeiter",
                "Datenspeicherung & Löschung",
                "Deine Rechte als betroffene Person",
                "Cookies & Tracking",
                "Datensicherheit",
                "Änderungen dieser Datenschutzerklärung",
                "Kontakt & Beschwerden",
              ].map((item, i) => (
                <li key={i} style={{ fontSize: 13, color: "#6366f1" }}>{item}</li>
              ))}
            </ol>
          </div>

          <Section num="1" title="Verantwortlicher">
            <p style={bodyText}>
              Verantwortlicher im Sinne der DSGVO für die Verarbeitung deiner personenbezogenen Daten ist:
            </p>
            <div style={{ backgroundColor: "#f8fafc", borderRadius: 10, padding: "16px 20px", marginBottom: 12, border: "1px solid #e8edf3" }}>
              <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.8 }}>
                <strong>ReviewBoost e.U.</strong><br />
                [Straße & Hausnummer], [PLZ] [Stadt], Österreich<br />
                E-Mail: <a href="mailto:datenschutz@reviewboost.at" style={{ color: "#6366f1" }}>datenschutz@reviewboost.at</a><br />
                Telefon: [+43 XXX XXX XXXX]
              </p>
            </div>
          </Section>

          <Section num="2" title="Welche Daten wir verarbeiten">
            <SubHeading>2.1 Bei der Registrierung</SubHeading>
            <p style={bodyText}>
              Wenn du ein Konto bei ReviewBoost erstellst, verarbeiten wir folgende Daten:
            </p>
            <DataList items={[
              "Name und E-Mail-Adresse",
              "Passwort (verschlüsselt gespeichert, nie im Klartext)",
              "Zeitpunkt der Registrierung",
              "Name und Adresse deines Betriebs",
            ]} />

            <SubHeading>2.2 Bei der Nutzung der Plattform</SubHeading>
            <DataList items={[
              "Bewertungsinhalte, die du importierst oder manuell erfasst (Kundennamen, Bewertungstexte, Sternebewertungen)",
              "Von dir verfasste oder KI-generierte Antworten auf Bewertungen",
              "Generierte QR-Codes und zugehörige Review-Links",
              "E-Mail-Einladungen (Empfänger-E-Mail, Name, Zeitpunkt des Versands)",
              "Einstellungen und Präferenzen in deinem Dashboard",
            ]} />

            <SubHeading>2.3 Technische Daten (automatisch)</SubHeading>
            <DataList items={[
              "IP-Adresse (anonymisiert nach 24 Stunden)",
              "Browser-Typ und -Version",
              "Betriebssystem",
              "Datum und Uhrzeit des Zugriffs",
              "Aufgerufene Seiten (Server-Logs, 7 Tage aufbewahrt)",
            ]} />

            <SubHeading>2.4 Kundendaten deiner Gäste</SubHeading>
            <p style={bodyText}>
              Wenn du über ReviewBoost Bewertungseinladungen versendest, verarbeitest du als Betreiber
              die E-Mail-Adressen und Namen deiner Gäste. Du bist in diesem Fall selbst
              <strong> Verantwortlicher</strong> dieser Daten; ReviewBoost handelt als Auftragsverarbeiter gemäß
              Art. 28 DSGVO. Ein Auftragsverarbeitungsvertrag (AVV) wird auf Anfrage bereitgestellt.
            </p>
          </Section>

          <Section num="3" title="Rechtsgrundlagen der Verarbeitung">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "#374151", fontWeight: 700, borderRadius: "8px 0 0 0" }}>Zweck</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "#374151", fontWeight: 700 }}>Rechtsgrundlage</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "#374151", fontWeight: 700, borderRadius: "0 8px 0 0" }}>Art. DSGVO</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Kontoerstellung & Login", "Vertragserfüllung", "Art. 6(1)(b)"],
                  ["KI-Antwortgenerierung", "Vertragserfüllung", "Art. 6(1)(b)"],
                  ["Bewertungseinladungen senden", "Berechtigtes Interesse", "Art. 6(1)(f)"],
                  ["Zahlungsabwicklung", "Vertragserfüllung", "Art. 6(1)(b)"],
                  ["Sicherheit & Missbrauchsschutz", "Berechtigtes Interesse", "Art. 6(1)(f)"],
                  ["Marketing-Newsletter", "Einwilligung", "Art. 6(1)(a)"],
                  ["Gesetzliche Aufbewahrungspflichten", "Rechtliche Verpflichtung", "Art. 6(1)(c)"],
                ].map(([zweck, grund, art], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px", color: "#475569" }}>{zweck}</td>
                    <td style={{ padding: "10px 14px", color: "#475569" }}>{grund}</td>
                    <td style={{ padding: "10px 14px", color: "#6366f1", fontWeight: 600 }}>{art}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section num="4" title="Drittanbieter & Auftragsverarbeiter">
            <p style={bodyText}>
              Wir setzen folgende sorgfältig ausgewählte Dienstleister ein, mit denen
              Auftragsverarbeitungsverträge gemäß Art. 28 DSGVO bestehen:
            </p>
            {[
              {
                name: "Supabase Inc.", role: "Datenbank & Authentifizierung",
                location: "USA (EU-Datenzentrum Frankfurt)", detail: "Speicherung aller Kontodaten und Bewertungen. Daten werden in der EU-Region (Frankfurt/de) gehostet.",
                link: "https://supabase.com/privacy",
              },
              {
                name: "Vercel Inc.", role: "Hosting & CDN",
                location: "USA (DSGVO-konform über SCCs)", detail: "Bereitstellung der Webanwendung. Vercel verarbeitet technische Zugriffsdaten (IP, User-Agent) kurzfristig für das CDN.",
                link: "https://vercel.com/legal/privacy-policy",
              },
              {
                name: "Anthropic PBC", role: "KI-Antwortgenerierung",
                location: "USA (Datenverarbeitungsvertrag vorhanden)", detail: "Bewertungstexte und Autornamen werden zur KI-Antwortgenerierung übermittelt. Anthropic speichert diese Daten nicht für Training.",
                link: "https://www.anthropic.com/privacy",
              },
              {
                name: "Resend Inc.", role: "E-Mail-Versand",
                location: "USA (EU-Datenzentrum)", detail: "Versand von Bewertungseinladungen. Empfänger-E-Mail und Name werden verarbeitet, 30 Tage gespeichert.",
                link: "https://resend.com/legal/privacy-policy",
              },
              {
                name: "Google LLC", role: "Google Places API / Business Profile API",
                location: "USA (DSGVO-konform über SCCs)", detail: "Abruf öffentlicher Bewertungsdaten über die Google Places API. Deine Betriebsadresse wird für die Suche übermittelt.",
                link: "https://policies.google.com/privacy",
              },
            ].map((p) => (
              <div key={p.name} style={{ border: "1px solid #e8edf3", borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{p.name}</span>
                    <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, marginLeft: 10, backgroundColor: "#eef2ff", padding: "2px 8px", borderRadius: 999 }}>{p.role}</span>
                  </div>
                  <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none", whiteSpace: "nowrap" }}>Datenschutz ↗</a>
                </div>
                <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px" }}>📍 {p.location}</p>
                <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6 }}>{p.detail}</p>
              </div>
            ))}
          </Section>

          <Section num="5" title="Datenspeicherung & Löschung">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "#374151", fontWeight: 700 }}>Datenkategorie</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "#374151", fontWeight: 700 }}>Speicherdauer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Kontodaten (Name, E-Mail)", "Bis zur Kontolöschung + 30 Tage"],
                  ["Bewertungen & Antworten", "Bis zur Kontolöschung"],
                  ["E-Mail-Einladungen (Logs)", "30 Tage"],
                  ["Server-Zugriffslogs", "7 Tage"],
                  ["Rechnungsdaten", "7 Jahre (gesetzliche Aufbewahrungspflicht)"],
                  ["IP-Adressen", "Anonymisierung nach 24 Stunden"],
                  ["Newsletter-Einwilligung", "Bis zum Widerruf"],
                ].map(([kat, dauer], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px", color: "#475569" }}>{kat}</td>
                    <td style={{ padding: "10px 14px", color: "#374151", fontWeight: 500 }}>{dauer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section num="6" title="Deine Rechte als betroffene Person">
            <p style={bodyText}>Gemäß DSGVO hast du folgende Rechte, die du jederzeit kostenlos ausüben kannst:</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { recht: "Auskunft", art: "Art. 15", desc: "Welche Daten wir über dich speichern" },
                { recht: "Berichtigung", art: "Art. 16", desc: "Korrektur unrichtiger Daten" },
                { recht: "Löschung", art: "Art. 17", desc: "\"Recht auf Vergessenwerden\"" },
                { recht: "Einschränkung", art: "Art. 18", desc: "Verarbeitung einschränken lassen" },
                { recht: "Datenübertragbarkeit", art: "Art. 20", desc: "Daten in maschinenlesbarem Format" },
                { recht: "Widerspruch", art: "Art. 21", desc: "Gegen berechtigte Interessen" },
                { recht: "Widerruf", art: "Art. 7(3)", desc: "Einwilligungen jederzeit widerrufen" },
                { recht: "Beschwerde", art: "Art. 77", desc: "Bei der Datenschutzbehörde" },
              ].map((r) => (
                <div key={r.recht} style={{ border: "1px solid #e8edf3", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{r.recht}</span>
                    <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 600 }}>{r.art}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{r.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: "14px 18px", backgroundColor: "#eef2ff", borderRadius: 10, border: "1px solid #c7d2fe" }}>
              <p style={{ fontSize: 13, color: "#4338ca", margin: 0 }}>
                📧 Anfragen an: <a href="mailto:datenschutz@reviewboost.at" style={{ color: "#4338ca", fontWeight: 700 }}>datenschutz@reviewboost.at</a>
                {" "}— wir antworten innerhalb von 30 Tagen.
              </p>
            </div>
            <p style={{ ...bodyText, marginTop: 16 }}>
              <strong>Beschwerderecht:</strong> Du hast das Recht, eine Beschwerde bei der österreichischen
              Datenschutzbehörde einzureichen: Österreichische Datenschutzbehörde,
              Barichgasse 40–42, 1030 Wien,{" "}
              <a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1" }}>www.dsb.gv.at</a>
            </p>
          </Section>

          <Section num="7" title="Cookies & Tracking">
            <p style={bodyText}>
              ReviewBoost verwendet ausschließlich technisch notwendige Cookies. Es werden
              <strong> keine Tracking-Cookies, keine Werbe-Cookies und kein Google Analytics</strong> eingesetzt.
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "#374151", fontWeight: 700 }}>Cookie</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "#374151", fontWeight: 700 }}>Zweck</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "#374151", fontWeight: 700 }}>Dauer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["sb-access-token", "Supabase Auth Session", "1 Stunde"],
                  ["sb-refresh-token", "Supabase Auth Refresh", "60 Tage"],
                ].map(([name, zweck, dauer], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px", color: "#475569", fontFamily: "monospace", fontSize: 12 }}>{name}</td>
                    <td style={{ padding: "10px 14px", color: "#475569" }}>{zweck}</td>
                    <td style={{ padding: "10px 14px", color: "#374151" }}>{dauer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section num="8" title="Datensicherheit">
            <p style={bodyText}>Wir setzen folgende technische und organisatorische Maßnahmen (TOMs) zum Schutz deiner Daten ein:</p>
            <DataList items={[
              "Verschlüsselung aller Datenübertragungen via TLS 1.3 (HTTPS)",
              "Passwörter werden mit bcrypt gehasht und nie im Klartext gespeichert",
              "Supabase Row Level Security (RLS): Jeder Nutzer kann nur seine eigenen Daten sehen",
              "API-Keys werden ausschließlich als Server-seitige Umgebungsvariablen gespeichert",
              "Regelmäßige automatische Backups durch Supabase (tägliche Snapshots)",
              "Zugriffsbeschränkung: Nur autorisierte Mitarbeiter haben Zugang zur Datenbank",
            ]} />
          </Section>

          <Section num="9" title="Änderungen dieser Datenschutzerklärung">
            <p style={bodyText}>
              Wir behalten uns vor, diese Datenschutzerklärung bei Änderungen der Rechtslage oder
              unserer Dienste anzupassen. Die aktuelle Version ist stets unter{" "}
              <a href="/datenschutz" style={{ color: "#6366f1" }}>reviewboost.at/datenschutz</a> abrufbar.
              Bei wesentlichen Änderungen informieren wir registrierte Nutzer per E-Mail.
            </p>
          </Section>

          <Section num="10" title="Kontakt & Beschwerden">
            <p style={bodyText}>Für alle datenschutzrelevanten Anliegen erreichst du uns unter:</p>
            <div style={{ backgroundColor: "#f8fafc", borderRadius: 10, padding: "16px 20px", border: "1px solid #e8edf3" }}>
              <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 2 }}>
                📧 <a href="mailto:datenschutz@reviewboost.at" style={{ color: "#6366f1", fontWeight: 600 }}>datenschutz@reviewboost.at</a><br />
                📮 ReviewBoost e.U., [Adresse], Österreich<br />
                ⏱️ Antwortzeit: innerhalb von 30 Tagen (gesetzliche Frist)
              </p>
            </div>
          </Section>

          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 40, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
            Stand: Mai 2026 · ReviewBoost e.U. · Version 1.0
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "24px", borderTop: "1px solid #e8edf3", backgroundColor: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          <Link href="/" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>← Zurück zur Startseite</Link>
          <Link href="/impressum" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>Impressum</Link>
        </div>
      </footer>
    </div>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 16px", paddingBottom: 12, borderBottom: "1px solid #f1f5f9", display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ width: 26, height: 26, backgroundColor: "#eef2ff", borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#6366f1", flexShrink: 0 }}>{num}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 14, fontWeight: 700, color: "#374151", margin: "20px 0 10px" }}>{children}</h3>;
}

function DataList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: "0 0 16px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item) => (
        <li key={item} style={{ fontSize: 14, color: "#475569", paddingLeft: 20, position: "relative", lineHeight: 1.6 }}>
          <span style={{ position: "absolute", left: 0, color: "#6366f1", fontWeight: 700 }}>·</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

const bodyText: React.CSSProperties = {
  fontSize: 14, color: "#475569", lineHeight: 1.75, margin: "0 0 14px",
};
