"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message === "User already registered"
        ? "Diese E-Mail-Adresse ist bereits registriert."
        : "Registrierung fehlgeschlagen. Bitte versuche es erneut.");
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: "100vh", backgroundColor: "#f8fafc",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      }}>
        <div style={{
          backgroundColor: "#ffffff", borderRadius: 20,
          padding: "52px 44px", maxWidth: 440, width: "100%",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          border: "1.5px solid #e8edf3",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, margin: "0 auto 24px",
            boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
          }}>
            📧
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 12px", letterSpacing: "-0.5px" }}>
            Fast geschafft!
          </h2>
          <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.65, margin: "0 0 8px" }}>
            Wir haben eine Bestätigungs-E-Mail an
          </p>
          <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, margin: "0 0 28px" }}>
            {email}
          </p>
          <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 32px", lineHeight: 1.6 }}>
            Klicke auf den Link in der E-Mail, um dein Konto zu aktivieren. Schau auch im Spam-Ordner nach.
          </p>
          <Link href="/login" style={{
            display: "inline-block", padding: "13px 32px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff", textDecoration: "none",
            borderRadius: 11, fontSize: 15, fontWeight: 700,
            boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
          }}>
            Zur Anmeldung →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    }}>
      {/* LEFT — Brand panel */}
      <div
        className="auth-left"
        style={{
          flex: "0 0 420px",
          background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 100%)",
          padding: "48px 44px",
          flexDirection: "column",
          display: "none",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            Review<span style={{ color: "#a5b4fc" }}>Boost</span>
          </span>
        </Link>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
            Ersten Monat gratis.<br />Kein Risiko.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", margin: "0 0 40px", lineHeight: 1.6 }}>
            Probiere ReviewBoost vollständig aus — keine Kreditkarte, keine Bindung.
          </p>

          {/* Mini stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 36 }}>
            {[
              { val: "3×", label: "Mehr Bewertungen" },
              { val: "4,7★", label: "Ø Ergebnis" },
              { val: "2 Min", label: "Setup-Zeit" },
              { val: "100%", label: "Ohne Code" },
            ].map((s) => (
              <div key={s.label} style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                borderRadius: 12, padding: "14px 16px",
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#a5b4fc", letterSpacing: "-0.5px" }}>{s.val}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            borderRadius: 14, padding: "18px 20px",
            borderLeft: "3px solid #a5b4fc",
          }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.65, margin: "0 0 10px", fontStyle: "italic" }}>
              &ldquo;Von 4,1 auf 4,7 Sterne in 3 Monaten. ReviewBoost hat unser Business verändert.&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                backgroundColor: "#6366f1", color: "#fff",
                fontSize: 12, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>S</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Stefan M.</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Restaurant-Inhaber, Wien</div>
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0 }}>
          © {new Date().getFullYear()} ReviewBoost
        </p>
      </div>

      {/* RIGHT — Form */}
      <div style={{
        flex: 1, backgroundColor: "#f8fafc",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Mobile logo */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>
                Review<span style={{ color: "#6366f1" }}>Boost</span>
              </span>
            </Link>
          </div>

          <div style={{
            backgroundColor: "#ffffff", borderRadius: 20,
            padding: "40px 36px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            border: "1.5px solid #e8edf3",
          }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
              Konto erstellen
            </h1>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 28px" }}>
              Bereits registriert?{" "}
              <Link href="/login" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
                Anmelden
              </Link>
            </p>

            {error && (
              <div style={{
                backgroundColor: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 10, padding: "12px 16px", marginBottom: 20,
                color: "#dc2626", fontSize: 14,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Name", key: "name", type: "text", placeholder: "Max Mustermann", value: name, setter: setName },
                { label: "E-Mail-Adresse", key: "email", type: "email", placeholder: "deine@email.com", value: email, setter: setEmail },
                { label: "Passwort", key: "password", type: "password", placeholder: "Mindestens 6 Zeichen", value: password, setter: setPassword },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={f.value}
                    onChange={(e) => f.setter(e.target.value)}
                    required
                    placeholder={f.placeholder}
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: 10,
                      border: "1.5px solid #e2e8f0", fontSize: 15, outline: "none",
                      boxSizing: "border-box", fontFamily: "inherit",
                      color: "#0f172a", backgroundColor: "#f8fafc",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
              ))}

              <button
                type="submit" disabled={loading}
                style={{
                  width: "100%", padding: "13px", borderRadius: 11, border: "none",
                  background: loading ? "#a5b4fc" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff", fontSize: 15, fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit", marginTop: 4,
                  boxShadow: loading ? "none" : "0 4px 16px rgba(99,102,241,0.35)",
                }}
              >
                {loading ? "Konto wird erstellt..." : "Kostenlos starten →"}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: 18, fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
              Keine Kreditkarte · Ersten Monat gratis · Jederzeit kündbar
            </p>
          </div>
        </div>
      </div>

      {/* Legal footer */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, textAlign: "center", padding: "12px", backgroundColor: "rgba(248,250,252,0.9)", backdropFilter: "blur(4px)", borderTop: "1px solid #e8edf3", zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <Link href="/datenschutz" style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none" }}>Datenschutzerklärung</Link>
          <span style={{ color: "#e2e8f0" }}>·</span>
          <Link href="/impressum" style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none" }}>Impressum</Link>
          <span style={{ color: "#e2e8f0" }}>·</span>
          <Link href="/datenschutz" style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none" }}>Mit der Registrierung stimmst du unserer Datenschutzerklärung zu.</Link>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .auth-left { display: flex !important; } }
      `}</style>
    </div>
  );
}
