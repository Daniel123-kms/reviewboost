"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Review = {
  id: string;
  user_id: string;
  author_name: string;
  platform: string;
  rating: number;
  content: string;
  created_at: string;
  responded: boolean;
};

type User = {
  id: string;
  email: string;
  name: string;
};

const PLATFORMS = ["Google", "Tripadvisor", "Booking.com", "Yelp", "Facebook"] as const;

const platformColors: Record<string, { bg: string; color: string }> = {
  Google: { bg: "#fef3c7", color: "#d97706" },
  Tripadvisor: { bg: "#dcfce7", color: "#16a34a" },
  "Booking.com": { bg: "#dbeafe", color: "#2563eb" },
  Yelp: { bg: "#fee2e2", color: "#dc2626" },
  Facebook: { bg: "#ede9fe", color: "#7c3aed" },
};

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span style={{ fontSize: size, letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? "#f59e0b" : "#e2e8f0" }}>★</span>
      ))}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-AT", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DashboardClient({ user, initialReviews }: { user: User; initialReviews: Review[] }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [activeTab, setActiveTab] = useState<"all" | "responded" | "pending">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [aiReply, setAiReply] = useState<{ reviewId: string; text: string; style: string } | null>(null);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "—";
  const pendingCount = reviews.filter((r) => !r.responded).length;
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;

  const filteredReviews = reviews.filter((r) => {
    if (activeTab === "responded") return r.responded;
    if (activeTab === "pending") return !r.responded;
    return true;
  });

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleMarkResponded(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("reviews").update({ responded: true }).eq("id", id);
    if (!error) setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, responded: true } : r)));
  }

  async function handleDeleteReview(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (!error) setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleAiReply(review: Review, style: "personal" | "neutral") {
    setAiReply({ reviewId: review.id, text: "Generiere Antwort...", style });
    const res = await fetch("/api/ai-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewContent: review.content,
        authorName: review.author_name,
        rating: review.rating,
        platform: review.platform,
        style,
        businessName: user.name,
      }),
    });
    const data = await res.json();
    if (data.reply) {
      setAiReply({ reviewId: review.id, text: data.reply, style });
    } else {
      setAiReply({ reviewId: review.id, text: "Fehler beim Generieren. Bitte versuche es erneut.", style });
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Top Nav */}
      <nav style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px" }}>
            Review<span style={{ color: "#6366f1" }}>Boost</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#7c3aed" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{user.name}</span>
            <button onClick={handleLogout} disabled={loggingOut} style={{ padding: "8px 16px", borderRadius: 8, border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {loggingOut ? "..." : "Abmelden"}
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
              Guten Tag, {user.name.split(" ")[0]}! 👋
            </h1>
            <p style={{ color: "#64748b", fontSize: 15, margin: 0 }}>Hier ist eine Übersicht deiner Bewertungen.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => setShowQrModal(true)} style={{ padding: "11px 20px", backgroundColor: "#f1f5f9", color: "#0f172a", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              📱 QR-Code & Links
            </button>
            <button onClick={() => setShowInviteModal(true)} style={{ padding: "11px 20px", backgroundColor: "#22c55e", color: "#ffffff", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(34,197,94,0.3)" }}>
              ✉️ Einladung senden
            </button>
            <button onClick={() => setShowAddModal(true)} style={{ padding: "11px 20px", backgroundColor: "#6366f1", color: "#ffffff", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(99,102,241,0.35)" }}>
              + Bewertung
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
          {[
            { label: "Ø Bewertung", value: avgRating, sub: "Alle Plattformen", icon: "⭐", color: "#f59e0b", bg: "#fffbeb" },
            { label: "Bewertungen gesamt", value: reviews.length, sub: "Alle Zeit", icon: "📊", color: "#6366f1", bg: "#f5f3ff" },
            { label: "Ausstehend", value: pendingCount, sub: "Nicht beantwortet", icon: "🔔", color: "#f97316", bg: "#fff7ed" },
            { label: "5-Sterne", value: fiveStarCount, sub: "Topbewertungen", icon: "🏆", color: "#22c55e", bg: "#f0fdf4" },
          ].map((stat) => (
            <div key={stat.label} style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "24px", border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{stat.label}</span>
                <span style={{ fontSize: 20, backgroundColor: stat.bg, padding: "6px 8px", borderRadius: 8 }}>{stat.icon}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px" }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Reviews Panel */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", padding: "0 24px", gap: 4 }}>
            {(["all", "pending", "responded"] as const).map((tab) => {
              const labels = { all: "Alle", pending: "Ausstehend", responded: "Beantwortet" };
              const isActive = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "16px 16px 14px", border: "none", borderBottom: isActive ? "2px solid #6366f1" : "2px solid transparent", backgroundColor: "transparent", color: isActive ? "#6366f1" : "#64748b", fontSize: 14, fontWeight: isActive ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>
                  {labels[tab]}
                  {tab === "pending" && pendingCount > 0 && (
                    <span style={{ marginLeft: 6, backgroundColor: "#f97316", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 999 }}>{pendingCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Review List */}
          <div>
            {filteredReviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px", color: "#94a3b8" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#475569", margin: "0 0 8px" }}>Keine Bewertungen gefunden</p>
                <p style={{ fontSize: 14, margin: 0 }}>{activeTab === "all" ? "Füge deine erste Bewertung hinzu!" : "Keine Einträge."}</p>
              </div>
            ) : (
              filteredReviews.map((review, idx) => {
                const platStyle = platformColors[review.platform] ?? { bg: "#f1f5f9", color: "#475569" };
                const isShowingAi = aiReply?.reviewId === review.id;
                return (
                  <div key={review.id} style={{ padding: "20px 24px", borderBottom: idx < filteredReviews.length - 1 ? "1px solid #f8fafc" : "none" }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      {/* Avatar */}
                      <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#7c3aed", flexShrink: 0 }}>
                        {review.author_name.charAt(0).toUpperCase()}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{review.author_name}</span>
                          <StarRating rating={review.rating} />
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, backgroundColor: platStyle.bg, color: platStyle.color }}>{review.platform}</span>
                          {review.responded && (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, backgroundColor: "#dcfce7", color: "#16a34a" }}>✓ Beantwortet</span>
                          )}
                        </div>
                        <p style={{ fontSize: 14, color: "#374151", margin: "6px 0 8px", lineHeight: 1.6 }}>{review.content}</p>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{formatDate(review.created_at)}</div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <button onClick={() => handleAiReply(review, "personal")} style={{ padding: "6px 10px", borderRadius: 7, border: "1.5px solid #e0e7ff", backgroundColor: "#eef2ff", color: "#6366f1", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                          💜 Persönlich
                        </button>
                        <button onClick={() => handleAiReply(review, "neutral")} style={{ padding: "6px 10px", borderRadius: 7, border: "1.5px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#475569", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                          📝 Neutral
                        </button>
                        {!review.responded && (
                          <button onClick={() => handleMarkResponded(review.id)} style={{ padding: "6px 10px", borderRadius: 7, border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff", color: "#16a34a", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                            ✓ Beantwortet
                          </button>
                        )}
                        <button onClick={() => handleDeleteReview(review.id)} style={{ padding: "6px 10px", borderRadius: 7, border: "1.5px solid #fee2e2", backgroundColor: "#fef2f2", color: "#dc2626", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* AI Reply Box */}
                    {isShowingAi && (
                      <div style={{ marginTop: 16, marginLeft: 56, backgroundColor: aiReply.style === "personal" ? "#f5f3ff" : "#f8fafc", border: `1.5px solid ${aiReply.style === "personal" ? "#e0e7ff" : "#e2e8f0"}`, borderRadius: 12, padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: aiReply.style === "personal" ? "#6366f1" : "#64748b" }}>
                            {aiReply.style === "personal" ? "💜 Persönliche Antwort" : "📝 Neutrale Antwort"}
                          </span>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => { navigator.clipboard.writeText(aiReply.text); }}
                              style={{ padding: "4px 10px", borderRadius: 6, border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff", color: "#475569", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                            >
                              📋 Kopieren
                            </button>
                            <button onClick={() => setAiReply(null)} style={{ padding: "4px 8px", borderRadius: 6, border: "none", backgroundColor: "transparent", color: "#94a3b8", fontSize: 14, cursor: "pointer" }}>✕</button>
                          </div>
                        </div>
                        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                          {aiReply.text}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && <AddReviewModal userId={user.id} onClose={() => setShowAddModal(false)} onAdded={(r) => { setReviews((prev) => [r, ...prev]); setShowAddModal(false); }} />}
      {showInviteModal && <InviteModal businessName={user.name} onClose={() => setShowInviteModal(false)} />}
      {showQrModal && <QrModal businessName={user.name} onClose={() => setShowQrModal(false)} />}
    </div>
  );
}

/* ─── INVITE MODAL ─── */
function InviteModal({ businessName, onClose }: { businessName: string; onClose: () => void }) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [platform, setPlatform] = useState("Google");
  const [reviewLink, setReviewLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/send-invitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName, customerEmail, platform, reviewLink, businessName }),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess(true);
    } else {
      setError(data.error || "Fehler beim Senden.");
    }
    setLoading(false);
  }

  return (
    <ModalWrapper onClose={onClose}>
      {success ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>Einladung gesendet!</h3>
          <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 24px" }}>
            {customerName} hat eine E-Mail mit dem Bewertungslink erhalten.
          </p>
          <button onClick={onClose} style={btnPrimary}>Schließen</button>
        </div>
      ) : (
        <>
          <ModalHeader title="✉️ Einladung senden" onClose={onClose} />
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24, marginTop: -8 }}>
            Sende deinem Kunden eine persönliche E-Mail mit einem direkten Bewertungslink.
          </p>
          {error && <ErrorBox message={error} />}
          <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Name des Kunden">
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="z.B. Maria Müller" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </Field>
            <Field label="E-Mail-Adresse des Kunden">
              <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required placeholder="kunde@email.com" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Plattform">
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Review-Link (optional)">
                <input value={reviewLink} onChange={(e) => setReviewLink(e.target.value)} placeholder="https://..." style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </Field>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button type="button" onClick={onClose} style={btnSecondary}>Abbrechen</button>
              <button type="submit" disabled={loading} style={{ ...btnPrimary, backgroundColor: loading ? "#a5b4fc" : "#22c55e", boxShadow: "0 2px 8px rgba(34,197,94,0.25)" }}>
                {loading ? "Sende..." : "✉️ Jetzt senden"}
              </button>
            </div>
          </form>
        </>
      )}
    </ModalWrapper>
  );
}

/* ─── QR MODAL ─── */
function QrModal({ businessName, onClose }: { businessName: string; onClose: () => void }) {
  const [platform, setPlatform] = useState("Google");
  const [reviewLink, setReviewLink] = useState("");

  const qrUrl = reviewLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(reviewLink)}&bgcolor=ffffff&color=000000&margin=10`
    : null;

  const whatsappText = encodeURIComponent(
    `Hallo! Wir würden uns sehr über deine Bewertung auf ${platform} freuen 🌟\n\n${reviewLink || "[Link einfügen]"}\n\nVielen Dank! 🙏`
  );

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader title="📱 QR-Code & Links" onClose={onClose} />
      <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24, marginTop: -8 }}>
        Generiere einen QR-Code oder WhatsApp-Link für deine Kunden.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <Field label="Plattform">
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Dein Review-Link">
          <input value={reviewLink} onChange={(e) => setReviewLink(e.target.value)} placeholder="https://g.page/r/..." style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
        </Field>
      </div>

      {qrUrl ? (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {/* QR Code */}
          <div style={{ flex: 1, minWidth: 200, backgroundColor: "#f8fafc", borderRadius: 12, padding: 20, textAlign: "center", border: "1.5px solid #e2e8f0" }}>
            <img src={qrUrl} alt="QR Code" style={{ width: 180, height: 180, borderRadius: 8 }} />
            <p style={{ fontSize: 12, color: "#64748b", margin: "10px 0 12px" }}>Zum Ausdrucken speichern</p>
            <a href={qrUrl} download="bewertungs-qr.png" style={{ ...btnPrimary, textDecoration: "none", display: "inline-block", fontSize: 12 }}>
              ⬇️ QR speichern
            </a>
          </div>

          {/* Share options */}
          <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ backgroundColor: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d", margin: "0 0 10px" }}>📱 WhatsApp-Link</p>
              <a href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", padding: "10px 16px", backgroundColor: "#22c55e", color: "#fff", textDecoration: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: "center" }}>
                WhatsApp öffnen
              </a>
            </div>
            <div style={{ backgroundColor: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: "0 0 10px" }}>🔗 Link kopieren</p>
              <button
                onClick={() => navigator.clipboard.writeText(reviewLink)}
                style={{ width: "100%", padding: "10px", backgroundColor: "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Link kopieren
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "32px", backgroundColor: "#f8fafc", borderRadius: 12, border: "2px dashed #e2e8f0" }}>
          <p style={{ fontSize: 32, margin: "0 0 8px" }}>🔗</p>
          <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>Trage deinen Review-Link ein, um den QR-Code zu generieren.</p>
        </div>
      )}
    </ModalWrapper>
  );
}

/* ─── ADD REVIEW MODAL ─── */
function AddReviewModal({ userId, onClose, onAdded }: { userId: string; onClose: () => void; onAdded: (r: Review) => void }) {
  const [authorName, setAuthorName] = useState("");
  const [platform, setPlatform] = useState("Google");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.from("reviews").insert({ user_id: userId, author_name: authorName, platform, rating, content, responded: false }).select().single();
    if (error) { setError("Fehler beim Speichern."); setLoading(false); }
    else { onAdded(data as Review); }
  }

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader title="Bewertung hinzufügen" onClose={onClose} />
      {error && <ErrorBox message={error} />}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Name des Rezensenten">
          <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} required placeholder="z.B. Maria K." style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Plattform">
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Bewertung">
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ ...inputStyle, cursor: "pointer" }}>
              {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{"★".repeat(r)} ({r}/5)</option>)}
            </select>
          </Field>
        </div>
        <Field label="Bewertungstext">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required placeholder="Was hat der Kunde geschrieben?" rows={4} style={{ ...inputStyle, resize: "vertical", minHeight: 100 }} onFocus={focusStyle} onBlur={blurStyle} />
        </Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={btnSecondary}>Abbrechen</button>
          <button type="submit" disabled={loading} style={{ ...btnPrimary, backgroundColor: loading ? "#a5b4fc" : "#6366f1" }}>
            {loading ? "Speichern..." : "Speichern"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

/* ─── SHARED COMPONENTS ─── */
function ModalWrapper({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "24px", backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: "36px", width: "100%", maxWidth: 520, boxShadow: "0 24px 80px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>{title}</h2>
      <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#dc2626", fontSize: 14 }}>{message}</div>;
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 13px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#0f172a", backgroundColor: "#f8fafc", transition: "border-color 0.15s" };
const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#6366f1");
const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#e2e8f0");
const btnPrimary: React.CSSProperties = { padding: "11px 22px", borderRadius: 10, border: "none", backgroundColor: "#6366f1", color: "#ffffff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
const btnSecondary: React.CSSProperties = { padding: "11px 18px", borderRadius: 10, border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
