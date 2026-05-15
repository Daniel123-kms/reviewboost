"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Business = { id: string; name: string; google_review_url: string | null };
type FeedbackSub = { id: string; rating: number; message: string | null; created_at: string };

export default function FunnelSection({ userId }: { userId: string }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);
  const [feedback, setFeedback] = useState<FeedbackSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: biz }, { data: fb }] = await Promise.all([
        supabase.from("businesses").select("id,name,google_review_url").eq("user_id", userId),
        supabase.from("feedback_submissions").select("*").eq("business_owner_id", userId).order("created_at", { ascending: false }).limit(20),
      ]);
      const bizList = biz || [];
      setBusinesses(bizList);
      setSelectedBiz(bizList[0] || null);
      setFeedback(fb || []);
      setLoading(false);
    }
    load();
  }, [userId]);

  const funnelUrl = selectedBiz
    ? `${window.location.origin}/r/${userId}?business=${encodeURIComponent(selectedBiz.name)}&link=${encodeURIComponent(selectedBiz.google_review_url || "")}`
    : `${window.location.origin}/r/${userId}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(funnelUrl)}&bgcolor=ffffff&color=1e1b4b&margin=12`;

  function handleCopy() {
    navigator.clipboard.writeText(funnelUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const avgFeedbackRating = feedback.length
    ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : "—";
  const negativeCount = feedback.filter((f) => f.rating <= 3).length;
  const positiveCount = feedback.filter((f) => f.rating >= 4).length;

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Lade...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 960 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        {/* Setup Card */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 28, border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>🛡️ Feedback-Funnel</h2>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px", lineHeight: 1.6 }}>
            Kunden bewerten zuerst intern. Zufriedene werden zu Google weitergeleitet — unzufriedene geben privates Feedback.
          </p>

          {businesses.length > 1 && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Betrieb wählen:</label>
              <select
                value={selectedBiz?.id || ""}
                onChange={(e) => setSelectedBiz(businesses.find((b) => b.id === e.target.value) || null)}
                style={{ width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", backgroundColor: "#f8fafc", color: "#0f172a", outline: "none" }}
              >
                {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}

          <div style={{ backgroundColor: "#f8fafc", borderRadius: 12, padding: "14px 16px", marginBottom: 16, border: "1px solid #e8edf3" }}>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Dein Funnel-Link</p>
            <p style={{ fontSize: 13, color: "#374151", margin: 0, wordBreak: "break-all", lineHeight: 1.5 }}>{funnelUrl}</p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={handleCopy} style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1.5px solid ${copied ? "#22c55e" : "#e2e8f0"}`, backgroundColor: copied ? "#f0fdf4" : "#f8fafc", color: copied ? "#15803d" : "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              {copied ? "✓ Kopiert!" : "🔗 Link kopieren"}
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent("Wie war dein Besuch? " + funnelUrl)}`} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, padding: "11px", borderRadius: 10, backgroundColor: "#22c55e", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700, textAlign: "center" }}>
              📱 WhatsApp
            </a>
          </div>

          {/* How it works */}
          <div style={{ marginTop: 24, padding: "16px 18px", backgroundColor: "#f0fdf4", borderRadius: 12, border: "1px solid #bbf7d0" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d", margin: "0 0 10px" }}>✨ So funktioniert der Funnel:</p>
            {[
              { step: "1", text: "Kunde besucht deinen Funnel-Link" },
              { step: "2", text: "Gibt intern 1–5 Sterne" },
              { step: "★", text: "4–5 Sterne → direkt zu Google-Bewertung", green: true },
              { step: "!", text: "1–3 Sterne → privates Feedback (nur für dich)", red: true },
            ].map((s) => (
              <div key={s.step} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: s.green ? "#15803d" : s.red ? "#dc2626" : "#64748b", flexShrink: 0, width: 16, textAlign: "center" }}>{s.step}</span>
                <p style={{ fontSize: 13, color: s.green ? "#166534" : s.red ? "#991b1b" : "#374151", margin: 0, lineHeight: 1.4, fontWeight: s.green || s.red ? 600 : 400 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* QR + Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 20, border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", textAlign: "center" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.4px" }}>QR-Code</p>
            <img src={qrUrl} alt="Funnel QR" style={{ width: 160, height: 160, borderRadius: 10, border: "1px solid #e8edf3" }} />
            <a href={qrUrl} download="funnel-qr.png" style={{ display: "block", marginTop: 12, fontSize: 12, color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>⬇️ QR herunterladen</a>
          </div>

          <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 20, border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 14px" }}>📊 Funnel-Statistik</p>
            {[
              { label: "Eingegangene Meinungen", value: feedback.length, color: "#6366f1" },
              { label: "Weitergeleitet zu Google", value: positiveCount, color: "#22c55e" },
              { label: "Privates Feedback", value: negativeCount, color: "#f97316" },
              { label: "Ø interne Note", value: avgFeedbackRating, color: "#f59e0b" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>{s.label}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback List */}
      {feedback.length > 0 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 28, border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>📬 Eingegangene Rückmeldungen</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {feedback.map((fb) => (
              <div key={fb.id} style={{ padding: "14px 18px", borderRadius: 12, backgroundColor: fb.rating >= 4 ? "#f0fdf4" : "#fef2f2", border: `1px solid ${fb.rating >= 4 ? "#bbf7d0" : "#fecaca"}`, display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ fontSize: 20, flexShrink: 0 }}>{fb.rating >= 4 ? "😊" : fb.rating === 3 ? "😐" : "😟"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: fb.message ? 6 : 0 }}>
                    <span style={{ fontSize: 13, color: "#f59e0b", letterSpacing: 1 }}>{"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{new Date(fb.created_at).toLocaleDateString("de-AT", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </div>
                  {fb.message && <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.5 }}>{fb.message}</p>}
                  {!fb.message && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, fontStyle: "italic" }}>Kein Kommentar hinterlassen</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
