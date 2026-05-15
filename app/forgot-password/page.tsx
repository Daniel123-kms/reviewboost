"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError("Fehler beim Senden. Bitte versuche es erneut.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#f8fafc",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: "#1e293b" }}>
              Review<span style={{ color: "#6366f1" }}>Boost</span>
            </span>
          </Link>
        </div>

        <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: "40px 36px", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9" }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📧</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>E-Mail gesendet!</h1>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, margin: "0 0 24px" }}>
                Falls ein Konto mit <strong>{email}</strong> existiert, erhältst du in Kürze einen Link zum Zurücksetzen deines Passworts.
              </p>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 24px" }}>
                Kein E-Mail erhalten? Schau auch im Spam-Ordner nach.
              </p>
              <Link href="/login" style={{ display: "inline-block", padding: "12px 28px", backgroundColor: "#6366f1", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                Zurück zum Login →
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Passwort zurücksetzen</h1>
              <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px", lineHeight: 1.6 }}>
                Gib deine E-Mail-Adresse ein — wir schicken dir einen Reset-Link.
              </p>

              {error && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>E-Mail-Adresse</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    required placeholder="deine@email.com"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#0f172a", backgroundColor: "#f8fafc" }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
                <button
                  type="submit" disabled={loading || !email}
                  style={{ width: "100%", padding: "13px", borderRadius: 11, border: "none", background: loading ? "#a5b4fc" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading || !email ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: !email ? 0.6 : 1 }}
                >
                  {loading ? "Wird gesendet..." : "Reset-Link senden →"}
                </button>
              </form>

              <p style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", margin: "20px 0 0" }}>
                <Link href="/login" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>← Zurück zum Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
