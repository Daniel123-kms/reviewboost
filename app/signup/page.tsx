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
      email,
      password,
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
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8faff 0%, #ede9fe 50%, #f0fdf4 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 20,
            padding: "48px 40px",
            boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 20 }}>📧</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>
            Fast geschafft!
          </h2>
          <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.6, margin: "0 0 28px" }}>
            Wir haben dir eine Bestätigungs-E-Mail an <strong>{email}</strong> gesendet.
            Klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
          </p>
          <Link
            href="/login"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              backgroundColor: "#6366f1",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            Zur Anmeldung
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8faff 0%, #ede9fe 50%, #f0fdf4 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link
            href="/"
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#1e293b",
              textDecoration: "none",
              letterSpacing: "-0.5px",
            }}
          >
            Review<span style={{ color: "#6366f1" }}>Boost</span>
          </Link>
          <p style={{ color: "#64748b", fontSize: 15, marginTop: 8, marginBottom: 0 }}>
            14 Tage kostenlos — keine Kreditkarte nötig.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 20,
            padding: "40px 36px",
            boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
            border: "1px solid #f1f5f9",
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 28px", letterSpacing: "-0.5px" }}>
            Konto erstellen
          </h1>

          {error && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 20,
                color: "#dc2626",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Vollständiger Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Max Mustermann"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  color: "#0f172a",
                  backgroundColor: "#f8fafc",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                E-Mail-Adresse
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="deine@email.com"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  color: "#0f172a",
                  backgroundColor: "#f8fafc",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mindestens 6 Zeichen"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  color: "#0f172a",
                  backgroundColor: "#f8fafc",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 10,
                backgroundColor: loading ? "#a5b4fc" : "#6366f1",
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                letterSpacing: "-0.1px",
              }}
            >
              {loading ? "Registrieren..." : "Kostenlos starten →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
            Mit der Registrierung stimmst du unseren{" "}
            <span style={{ color: "#6366f1" }}>Nutzungsbedingungen</span> und der{" "}
            <span style={{ color: "#6366f1" }}>Datenschutzerklärung</span> zu.
          </p>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#64748b" }}>
          Bereits registriert?{" "}
          <Link href="/login" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
