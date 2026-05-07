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

type User = { id: string; email: string; name: string };
type Section = "reviews" | "invite" | "qr";
type EmailTemplate = "freundlich" | "professionell" | "gastro";

const PLATFORMS = ["Google", "Tripadvisor", "Booking.com", "Yelp", "Facebook"] as const;

const PLATFORM_COLORS: Record<string, { bg: string; color: string; border: string; accent: string }> = {
  Google: { bg: "#fef3c7", color: "#b45309", border: "#fde68a", accent: "#f59e0b" },
  Tripadvisor: { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0", accent: "#22c55e" },
  "Booking.com": { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe", accent: "#3b82f6" },
  Yelp: { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca", accent: "#ef4444" },
  Facebook: { bg: "#ede9fe", color: "#6d28d9", border: "#ddd6fe", accent: "#8b5cf6" },
};

const AVATAR_COLORS = [
  { bg: "#ede9fe", color: "#7c3aed" },
  { bg: "#fce7f3", color: "#be185d" },
  { bg: "#dcfce7", color: "#15803d" },
  { bg: "#dbeafe", color: "#1d4ed8" },
  { bg: "#fef3c7", color: "#b45309" },
  { bg: "#fee2e2", color: "#b91c1c" },
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function InitialAvatar({ name, size = 36 }: { name: string; size?: number }) {
  const c = getAvatarColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", backgroundColor: c.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: c.color, flexShrink: 0,
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function StarRating({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span style={{ fontSize: size, letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? "#f59e0b" : "#e2e8f0" }}>★</span>
      ))}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("de-AT", { day: "2-digit", month: "short", year: "numeric" });
}

/* ─── SIDEBAR NAV ITEM ─── */
function SidebarNavItem({
  icon, label, badge, isActive, onClick,
}: { icon: string; label: string; badge?: number; isActive: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
        borderRadius: 10, border: "none",
        backgroundColor: isActive ? "#4338ca" : hovered ? "rgba(255,255,255,0.07)" : "transparent",
        cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "inherit",
        transition: "background-color 0.15s",
      }}
    >
      <span style={{ fontSize: 18, width: 22, textAlign: "center", flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: isActive ? 700 : 500, color: isActive ? "#ffffff" : "rgba(255,255,255,0.65)", flex: 1 }}>
        {label}
      </span>
      {badge != null && badge > 0 && (
        <span style={{ backgroundColor: "#f97316", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999 }}>
          {badge}
        </span>
      )}
    </button>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function DashboardClient({ user, initialReviews }: { user: User; initialReviews: Review[] }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [activeSection, setActiveSection] = useState<Section>("reviews");
  const [activeTab, setActiveTab] = useState<"all" | "responded" | "pending">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [aiReply, setAiReply] = useState<{ reviewId: string; text: string; style: string } | null>(null);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  const pendingCount = reviews.filter((r) => !r.responded).length;
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;

  const filteredReviews = reviews.filter((r) => {
    if (activeTab === "responded") return r.responded;
    if (activeTab === "pending") return !r.responded;
    return true;
  });

  const platformData = (["Google", "Tripadvisor", "Booking.com", "Yelp", "Facebook"] as const)
    .map((p) => ({ name: p, count: reviews.filter((r) => r.platform === p).length, ...PLATFORM_COLORS[p] }))
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count);
  const maxPlatformCount = Math.max(...platformData.map((p) => p.count), 1);

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
    if (!confirm("Bewertung wirklich löschen?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (!error) setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleAiReply(review: Review, style: "personal" | "neutral") {
    setAiReply({ reviewId: review.id, text: "Generiere Antwort...", style });
    const res = await fetch("/api/ai-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewContent: review.content, authorName: review.author_name, rating: review.rating, platform: review.platform, style, businessName: user.name }),
    });
    const data = await res.json();
    setAiReply({ reviewId: review.id, text: data.reply || "Fehler beim Generieren.", style });
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 240, backgroundColor: "#1e1b4b", position: "fixed", top: 0, left: 0,
        height: "100vh", display: "flex", flexDirection: "column", zIndex: 100,
        boxShadow: "4px 0 32px rgba(0,0,0,0.15)",
      }}>
        {/* Logo */}
        <div style={{ padding: "28px 24px 20px" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px" }}>
            Review<span style={{ color: "#a5b4fc" }}>Boost</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4, fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>
            Bewertungsmanagement
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)", margin: "0 16px" }} />

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          <SidebarNavItem icon="⭐" label="Bewertungen" badge={pendingCount} isActive={activeSection === "reviews"} onClick={() => setActiveSection("reviews")} />
          <SidebarNavItem icon="✉️" label="Einladung senden" isActive={activeSection === "invite"} onClick={() => setActiveSection("invite")} />
          <SidebarNavItem icon="📱" label="QR & Links" isActive={activeSection === "qr"} onClick={() => setActiveSection("qr")} />

          <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.07)", margin: "12px 4px" }} />

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
              borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)",
              backgroundColor: "rgba(255,255,255,0.06)", cursor: "pointer",
              textAlign: "left", width: "100%", fontFamily: "inherit",
            }}
          >
            <span style={{ fontSize: 18, width: 22, textAlign: "center" }}>➕</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>Bewertung erfassen</span>
          </button>
        </nav>

        {/* User + Logout */}
        <div style={{ padding: "12px 14px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)", marginBottom: 10 }}>
            <InitialAvatar name={user.name} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: "100%", padding: "9px", borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "transparent",
              color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}
          >
            {loggingOut ? "..." : "🚪 Abmelden"}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, marginLeft: 240, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Page Header */}
        <div style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e8edf3", padding: "28px 36px 24px" }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
              Guten Tag, {user.name.split(" ")[0]}! 👋
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              {new Date().toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[
              { label: "Ø Bewertung", value: avgRating, sub: "Alle Plattformen", icon: "⭐", accent: "#f59e0b", bg: "#fffbeb" },
              { label: "Gesamt", value: reviews.length, sub: "Bewertungen erfasst", icon: "📊", accent: "#6366f1", bg: "#eef2ff" },
              { label: "Ausstehend", value: pendingCount, sub: "Warten auf Antwort", icon: "🔔", accent: "#f97316", bg: "#fff7ed" },
              {
                label: "5-Sterne", value: fiveStarCount,
                sub: reviews.length > 0 ? `${Math.round(fiveStarCount / reviews.length * 100)}% aller Bewertungen` : "0%",
                icon: "🏆", accent: "#22c55e", bg: "#f0fdf4",
              },
            ].map((stat) => (
              <div key={stat.label} style={{
                backgroundColor: "#f8fafc", borderRadius: 14, padding: "16px 18px",
                border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, backgroundColor: stat.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Platform Distribution */}
          {platformData.length > 0 && (
            <div style={{ marginTop: 18, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>Plattformen:</span>
              {platformData.map((p) => (
                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    height: 6, borderRadius: 999,
                    width: Math.max(32, Math.round((p.count / maxPlatformCount) * 80)) + "px",
                    backgroundColor: p.accent,
                  }} />
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{p.name} <span style={{ color: "#94a3b8" }}>({p.count})</span></span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Content */}
        <div style={{ flex: 1, padding: "28px 36px" }}>
          {activeSection === "reviews" && (
            <ReviewsSection
              reviews={reviews}
              filteredReviews={filteredReviews}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              pendingCount={pendingCount}
              aiReply={aiReply}
              setAiReply={setAiReply}
              onMarkResponded={handleMarkResponded}
              onDelete={handleDeleteReview}
              onAiReply={handleAiReply}
            />
          )}
          {activeSection === "invite" && <InviteSection businessName={user.name} />}
          {activeSection === "qr" && <QRSection businessName={user.name} />}
        </div>
      </div>

      {showAddModal && (
        <AddReviewModal userId={user.id} onClose={() => setShowAddModal(false)} onAdded={(r) => { setReviews((prev) => [r, ...prev]); setShowAddModal(false); }} />
      )}
    </div>
  );
}

/* ─── REVIEWS SECTION ─── */
function ReviewsSection({
  reviews, filteredReviews, activeTab, setActiveTab, pendingCount, aiReply, setAiReply, onMarkResponded, onDelete, onAiReply,
}: {
  reviews: Review[]; filteredReviews: Review[]; activeTab: "all" | "responded" | "pending";
  setActiveTab: (t: "all" | "responded" | "pending") => void; pendingCount: number;
  aiReply: { reviewId: string; text: string; style: string } | null;
  setAiReply: (v: { reviewId: string; text: string; style: string } | null) => void;
  onMarkResponded: (id: string) => void; onDelete: (id: string) => void;
  onAiReply: (review: Review, style: "personal" | "neutral") => void;
}) {
  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e8edf3", boxShadow: "0 1px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", padding: "0 24px", gap: 4 }}>
        {(["all", "pending", "responded"] as const).map((tab) => {
          const labels = { all: `Alle (${reviews.length})`, pending: "Ausstehend", responded: "Beantwortet" };
          const isActive = activeTab === tab;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "16px 16px 14px", border: "none",
              borderBottom: isActive ? "2px solid #6366f1" : "2px solid transparent",
              backgroundColor: "transparent", color: isActive ? "#6366f1" : "#64748b",
              fontSize: 14, fontWeight: isActive ? 700 : 500, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {labels[tab]}
              {tab === "pending" && pendingCount > 0 && (
                <span style={{ backgroundColor: "#f97316", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 999 }}>
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div>
        {filteredReviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px", color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📭</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#475569", margin: "0 0 8px" }}>Keine Bewertungen</p>
            <p style={{ fontSize: 14, margin: 0 }}>
              {activeTab === "all" ? "Erfasse deine erste Bewertung über den Sidebar-Button." : "Keine Einträge in dieser Kategorie."}
            </p>
          </div>
        ) : (
          filteredReviews.map((review, idx) => {
            const platStyle = PLATFORM_COLORS[review.platform] ?? { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0", accent: "#94a3b8" };
            const isShowingAi = aiReply?.reviewId === review.id;
            return (
              <div key={review.id} style={{
                padding: "20px 24px",
                borderBottom: idx < filteredReviews.length - 1 ? "1px solid #f8fafc" : "none",
                borderLeft: `3px solid ${platStyle.accent}`,
              }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <InitialAvatar name={review.author_name} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{review.author_name}</span>
                      <StarRating rating={review.rating} />
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, backgroundColor: platStyle.bg, color: platStyle.color, border: `1px solid ${platStyle.border}` }}>
                        {review.platform}
                      </span>
                      {review.responded && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, backgroundColor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
                          ✓ Beantwortet
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 14, color: "#374151", margin: "0 0 8px", lineHeight: 1.65 }}>{review.content}</p>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{formatDate(review.created_at)}</div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <ActionBtn onClick={() => onAiReply(review, "personal")} color="#6366f1" bg="#eef2ff" border="#e0e7ff">💜 Persönlich</ActionBtn>
                    <ActionBtn onClick={() => onAiReply(review, "neutral")} color="#475569" bg="#f8fafc" border="#e2e8f0">📝 Neutral</ActionBtn>
                    {!review.responded && (
                      <ActionBtn onClick={() => onMarkResponded(review.id)} color="#15803d" bg="#f0fdf4" border="#bbf7d0">✓ Beantwortet</ActionBtn>
                    )}
                    <ActionBtn onClick={() => onDelete(review.id)} color="#dc2626" bg="#fef2f2" border="#fecaca">✕</ActionBtn>
                  </div>
                </div>

                {/* AI Reply */}
                {isShowingAi && (
                  <div style={{
                    marginTop: 16, marginLeft: 54,
                    backgroundColor: aiReply!.style === "personal" ? "#f5f3ff" : "#f8fafc",
                    border: `1.5px solid ${aiReply!.style === "personal" ? "#e0e7ff" : "#e2e8f0"}`,
                    borderRadius: 12, padding: 16,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: aiReply!.style === "personal" ? "#6366f1" : "#64748b" }}>
                        {aiReply!.style === "personal" ? "💜 Persönliche Antwort" : "📝 Neutrale Antwort"}
                      </span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => navigator.clipboard.writeText(aiReply!.text)} style={{ padding: "4px 10px", borderRadius: 6, border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff", color: "#475569", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          📋 Kopieren
                        </button>
                        <button onClick={() => setAiReply(null)} style={{ padding: "4px 8px", borderRadius: 6, border: "none", backgroundColor: "transparent", color: "#94a3b8", fontSize: 14, cursor: "pointer" }}>✕</button>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{aiReply!.text}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ActionBtn({ onClick, color, bg, border, children }: { onClick: () => void; color: string; bg: string; border: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ padding: "6px 10px", borderRadius: 7, border: `1.5px solid ${border}`, backgroundColor: bg, color, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}

/* ─── INVITE SECTION (inline) ─── */
function InviteSection({ businessName }: { businessName: string }) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [platform, setPlatform] = useState("Google");
  const [reviewLink, setReviewLink] = useState("");
  const [template, setTemplate] = useState<EmailTemplate>("freundlich");
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
      body: JSON.stringify({ customerName, customerEmail, platform, reviewLink, businessName, template }),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess(true);
    } else {
      setError(data.error || "Fehler beim Senden.");
    }
    setLoading(false);
  }

  function handleReset() {
    setSuccess(false);
    setCustomerName("");
    setCustomerEmail("");
    setReviewLink("");
    setPlatform("Google");
    setTemplate("freundlich");
  }

  const TEMPLATES: { id: EmailTemplate; label: string; desc: string; emoji: string }[] = [
    { id: "freundlich", label: "Freundlich", desc: "Persönlich, mit Du-Form und Emojis", emoji: "😊" },
    { id: "professionell", label: "Professionell", desc: "Formell, mit Sie-Form, seriös", emoji: "💼" },
    { id: "gastro", label: "Gastro", desc: "Speziell für Restaurants & Cafés", emoji: "🍽️" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, maxWidth: 960 }}>
      {/* Form */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 28, border: "1px solid #e8edf3", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        {success ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>Einladung gesendet!</h3>
            <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 28px" }}>
              {customerName} hat eine E-Mail mit dem Bewertungslink erhalten.
            </p>
            <button onClick={handleReset} style={btnPrimary}>Weitere Einladung senden</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>✉️ Einladung senden</h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>Sende deinem Kunden eine persönliche Bewertungseinladung per E-Mail.</p>

            {error && <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#dc2626", fontSize: 14 }}>{error}</div>}

            <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <InlineField label="Name des Kunden">
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="z.B. Maria Müller" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </InlineField>
              <InlineField label="E-Mail-Adresse">
                <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required placeholder="kunde@email.com" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </InlineField>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <InlineField label="Plattform">
                  <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </InlineField>
                <InlineField label="Review-Link (optional)">
                  <input value={reviewLink} onChange={(e) => setReviewLink(e.target.value)} placeholder="https://g.page/r/..." style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </InlineField>
              </div>

              {/* Template Picker */}
              <InlineField label="E-Mail-Stil">
                <div style={{ display: "flex", gap: 8 }}>
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplate(t.id)}
                      style={{
                        flex: 1, padding: "10px 8px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                        border: template === t.id ? "2px solid #6366f1" : "2px solid #e2e8f0",
                        backgroundColor: template === t.id ? "#eef2ff" : "#f8fafc",
                        textAlign: "center", transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{t.emoji}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: template === t.id ? "#4338ca" : "#374151" }}>{t.label}</div>
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "6px 0 0" }}>
                  {TEMPLATES.find((t) => t.id === template)?.desc}
                </p>
              </InlineField>

              <button type="submit" disabled={loading} style={{ ...btnPrimary, backgroundColor: loading ? "#a5b4fc" : "#22c55e", boxShadow: "0 2px 8px rgba(34,197,94,0.25)", marginTop: 4 }}>
                {loading ? "Sende..." : "✉️ Einladung senden"}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Tips Panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8edf3", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 14px" }}>💡 Tipps für mehr Bewertungen</h3>
          {[
            { emoji: "⏰", tip: "Sende die Einladung am selben Tag — wenn der Besuch noch frisch ist." },
            { emoji: "📝", tip: "Personalisierte E-Mails werden 3× häufiger geöffnet." },
            { emoji: "🎯", tip: "Google-Bewertungen haben den größten Einfluss auf das Ranking." },
            { emoji: "🔁", tip: "Regelmäßige Einladungen erhöhen den Bewertungsstrom konstant." },
          ].map((t) => (
            <div key={t.tip} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{t.emoji}</span>
              <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.5 }}>{t.tip}</p>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: "#f0fdf4", borderRadius: 16, padding: 20, border: "1px solid #bbf7d0" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d", margin: "0 0 6px" }}>📈 Dein Potenzial</p>
          <p style={{ fontSize: 13, color: "#166534", margin: 0, lineHeight: 1.6 }}>
            Betriebe die ReviewBoost nutzen sammeln im Schnitt <strong>3× mehr Bewertungen</strong> pro Monat.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── QR SECTION (inline) ─── */
function QRSection({ businessName }: { businessName: string }) {
  const [platform, setPlatform] = useState("Google");
  const [reviewLink, setReviewLink] = useState("");
  const [copied, setCopied] = useState(false);

  const qrUrl = reviewLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(reviewLink)}&bgcolor=ffffff&color=1e1b4b&margin=12`
    : null;

  const whatsappText = encodeURIComponent(
    `Hallo! Wir würden uns sehr über deine Bewertung auf ${platform} freuen 🌟\n\n${reviewLink || "[Link einfügen]"}\n\nVielen Dank! 🙏`
  );

  function handleCopy() {
    if (!reviewLink) return;
    navigator.clipboard.writeText(reviewLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 900 }}>
      {/* Config */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 28, border: "1px solid #e8edf3", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>📱 QR-Code & Links</h2>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>Generiere QR-Codes und Direktlinks für alle Plattformen.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <InlineField label="Plattform">
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </InlineField>
          <InlineField label="Dein Review-Link">
            <input value={reviewLink} onChange={(e) => setReviewLink(e.target.value)} placeholder="https://g.page/r/..." style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </InlineField>
        </div>

        {qrUrl && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href={qrUrl} download="bewertungs-qr.png" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", backgroundColor: "#6366f1", color: "#fff", textDecoration: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
                ⬇️ QR-Code herunterladen
              </a>
              <button onClick={handleCopy} style={{ padding: "11px", backgroundColor: copied ? "#22c55e" : "#f8fafc", color: copied ? "#fff" : "#374151", border: `1.5px solid ${copied ? "#22c55e" : "#e2e8f0"}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                {copied ? "✓ Kopiert!" : "🔗 Link kopieren"}
              </button>
              <a href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", backgroundColor: "#22c55e", color: "#fff", textDecoration: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
                📱 WhatsApp öffnen
              </a>
            </div>
          </div>
        )}

        {!qrUrl && (
          <div style={{ marginTop: 20, textAlign: "center", padding: "28px", backgroundColor: "#f8fafc", borderRadius: 12, border: "2px dashed #e2e8f0" }}>
            <p style={{ fontSize: 30, margin: "0 0 8px" }}>🔗</p>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Trage deinen Review-Link ein,<br />um den QR-Code zu generieren.</p>
          </div>
        )}
      </div>

      {/* QR Preview */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {qrUrl ? (
          <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 28, border: "1px solid #e8edf3", boxShadow: "0 1px 8px rgba(0,0,0,0.04)", textAlign: "center" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Vorschau</p>
            <img src={qrUrl} alt="QR Code" style={{ width: 180, height: 180, borderRadius: 12, border: "1px solid #e8edf3" }} />
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "12px 0 0" }}>Zum Scannen & Ausdrucken bereit</p>
          </div>
        ) : null}

        <div style={{ backgroundColor: "#eff6ff", borderRadius: 16, padding: 20, border: "1px solid #bfdbfe" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1d4ed8", margin: "0 0 12px" }}>💡 Verwendungstipps</h3>
          {[
            "QR-Code an der Kasse oder am Tisch aufstellen",
            "Auf Kassenbons oder Visitenkarten drucken",
            "WhatsApp-Link nach dem Besuch senden",
            "Im E-Mail-Footer einbinden",
          ].map((tip) => (
            <div key={tip} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
              <span style={{ color: "#3b82f6", fontWeight: 700, flexShrink: 0 }}>→</span>
              <p style={{ fontSize: 13, color: "#1e40af", margin: 0, lineHeight: 1.4 }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
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
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "24px", backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: "36px", width: "100%", maxWidth: 500, boxShadow: "0 24px 80px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Bewertung erfassen</h2>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        {error && <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#dc2626", fontSize: 14 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <InlineField label="Name des Rezensenten">
            <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} required placeholder="z.B. Maria K." style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </InlineField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InlineField label="Plattform">
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </InlineField>
            <InlineField label="Bewertung">
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ ...inputStyle, cursor: "pointer" }}>
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{"★".repeat(r)} ({r}/5)</option>)}
              </select>
            </InlineField>
          </div>
          <InlineField label="Bewertungstext">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} required placeholder="Was hat der Kunde geschrieben?" rows={4} style={{ ...inputStyle, resize: "vertical", minHeight: 100 }} onFocus={focusStyle} onBlur={blurStyle} />
          </InlineField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" onClick={onClose} style={btnSecondary}>Abbrechen</button>
            <button type="submit" disabled={loading} style={{ ...btnPrimary, backgroundColor: loading ? "#a5b4fc" : "#6366f1" }}>
              {loading ? "Speichern..." : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── SHARED ─── */
function InlineField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 13px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#0f172a", backgroundColor: "#f8fafc", transition: "border-color 0.15s" };
const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#6366f1");
const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#e2e8f0");
const btnPrimary: React.CSSProperties = { padding: "11px 22px", borderRadius: 10, border: "none", backgroundColor: "#6366f1", color: "#ffffff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
const btnSecondary: React.CSSProperties = { padding: "11px 18px", borderRadius: 10, border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
