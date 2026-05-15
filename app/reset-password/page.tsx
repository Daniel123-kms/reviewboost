"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    // Supabase fires PASSWORD_RECOVERY once it processes the token from the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwörter stimmen nicht überein."); return; }
    if (password.length < 6) { setError("Passwort muss mindestens 6 Zeichen haben."); return; }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError("Fehler beim Zurücksetzen. Bitte fordere einen neuen Link an.");
    } else {
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2000);
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
          {done ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>Passwort geändert!</h1>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Du wirst automatisch weitergeleitet...</p>
            </div>
          ) : !sessionReady ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔐</div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Link wird geprüft...</h1>
              <p style={{ fontSize: 14, color: "#94a3b8" }}>Einen Moment bitte.</p>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Neues Passwort setzen</h1>
              <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px" }}>Wähle ein neues Passwort für deinen Account.</p>

              {error && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Neues Passwort</label>
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    required placeholder="Mindestens 6 Zeichen" autoFocus
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#0f172a", backgroundColor: "#f8fafc" }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Passwort bestätigen</label>
                  <input
                    type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    required placeholder="Passwort wiederholen"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#0f172a", backgroundColor: "#f8fafc" }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  style={{ width: "100%", padding: "13px", borderRadius: 11, border: "none", background: loading ? "#a5b4fc" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                >
                  {loading ? "Wird gespeichert..." : "Passwort speichern →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
