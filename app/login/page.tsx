"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("E-Mail oder Passwort falsch. Bitte versuche es erneut.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
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
            Willkommen zurück! Bitte melde dich an.
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
            Anmelden
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

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label
                style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}
              >
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
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <div>
              <label
                style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}
              >
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
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
                  transition: "border-color 0.15s",
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
                transition: "background-color 0.15s",
                letterSpacing: "-0.1px",
              }}
            >
              {loading ? "Anmelden..." : "Anmelden →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#64748b" }}>
          Noch kein Konto?{" "}
          <Link href="/signup" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
            Kostenlos registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
