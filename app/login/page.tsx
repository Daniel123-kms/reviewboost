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
    <div style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    }}>
      {/* LEFT — Brand panel */}
      <div style={{
        flex: "0 0 420px", display: "none",
        background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 100%)",
        padding: "48px 44px", flexDirection: "column",
      }}
        className="auth-left"
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            Review<span style={{ color: "#a5b4fc" }}>Boost</span>
          </span>
        </Link>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
            Willkommen zurück 👋
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", margin: "0 0 40px", lineHeight: 1.6 }}>
            Dein Dashboard wartet. Sieh nach, was heute an Bewertungen rein kam.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: "⭐", text: "Alle Bewertungen auf einen Blick" },
              { icon: "🤖", text: "KI-Antworten mit einem Klick" },
              { icon: "🔔", text: "Echtzeit-Alarm bei 1-Stern-Reviews" },
              { icon: "📈", text: "Analytics & Konkurrenz-Radar" },
            ].map((item) => (
              <div key={item.text} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>{item.text}</span>
              </div>
            ))}
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
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
              Anmelden
            </h1>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 28px" }}>
              Noch kein Konto?{" "}
              <Link href="/signup" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
                Kostenlos registrieren
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

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  E-Mail-Adresse
                </label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required placeholder="deine@email.com"
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
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Passwort
                </label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  required placeholder="••••••••"
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

              <button
                type="submit" disabled={loading}
                style={{
                  width: "100%", padding: "13px", borderRadius: 11, border: "none",
                  background: loading ? "#a5b4fc" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff", fontSize: 15, fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  boxShadow: loading ? "none" : "0 4px 16px rgba(99,102,241,0.35)",
                }}
              >
                {loading ? "Anmelden..." : "Anmelden →"}
              </button>
            </form>
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
          <span style={{ fontSize: 12, color: "#94a3b8" }}>© {new Date().getFullYear()} ReviewBoost</span>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .auth-left { display: flex !important; } }
      `}</style>
    </div>
  );
}
