"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AnalyticsSection from "./AnalyticsSection";
import FunnelSection from "./FunnelSection";
import TemplatesSection from "./TemplatesSection";
import WidgetSection from "./WidgetSection";
import SettingsSection from "./SettingsSection";
import StrategieSection from "./StrategieSection";
import KampagnenSection from "./KampagnenSection";
import PrintAssetsSection from "./PrintAssetsSection";
import ReviewManagementSection from "./ReviewManagementSection";
import QRStudioSection from "./QRStudioSection";
import KonkurrenzRadarSection from "./KonkurrenzRadarSection";

/* ─── TYPES ─── */
type Review = {
  id: string; user_id: string; author_name: string; platform: string;
  rating: number; content: string; created_at: string; responded: boolean;
};
type User = { id: string; email: string; name: string };
type BusinessProfile = {
  name: string;
  logoUrl: string | null;
  brandColor: string | null;
  googleReviewUrl: string | null;
  address: string | null;
  phone: string | null;
  category: string | null;
};
export type Business = {
  id: string;
  name: string;
  logoUrl: string | null;
  brandColor: string | null;
  googleReviewUrl: string | null;
  address: string | null;
  phone: string | null;
  category: string | null;
};
type Section = "home" | "reviews" | "akquise" | "markt" | "settings";
type EmailTemplate = "freundlich" | "professionell" | "gastro";

type DeliveryRating = {
  platform: string;
  rating: number | null;
  reviewCount: number | null;
  name: string | null;
  error: string | null;
};

/* ─── DESIGN TOKENS ─── */
const PLATFORMS = ["Google", "Tripadvisor", "Booking.com", "Facebook", "Lieferando", "Foodora"] as const;
const PLATFORM_COLORS: Record<string, { bg: string; color: string; border: string; accent: string }> = {
  Google: { bg: "#fef3c7", color: "#b45309", border: "#fde68a", accent: "#f59e0b" },
  Tripadvisor: { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0", accent: "#22c55e" },
  "Booking.com": { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe", accent: "#3b82f6" },
  Facebook: { bg: "#ede9fe", color: "#6d28d9", border: "#ddd6fe", accent: "#8b5cf6" },
  Lieferando: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", accent: "#f97316" },
  Foodora: { bg: "#fce4ec", color: "#c2185b", border: "#f8bbd0", accent: "#e91e63" },
};
const card: React.CSSProperties = {
  backgroundColor: "#ffffff", borderRadius: 16, padding: 28,
  border: "1px solid #e8edf3", boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
};

/* ─── NAV STRUCTURE (5 items) ─── */
type NavItem = { id: Section; icon: string; label: string };
const NAV_ITEMS: NavItem[] = [
  { id: "home", icon: "🏠", label: "Übersicht" },
  { id: "reviews", icon: "⭐", label: "Bewertungen" },
  { id: "akquise", icon: "📱", label: "Akquise" },
  { id: "markt", icon: "🔍", label: "Markt-Check" },
  { id: "settings", icon: "⚙️", label: "Einstellungen" },
];

const SECTION_META: Record<Section, { title: string; subtitle: string }> = {
  home: { title: "Übersicht", subtitle: "Offene Bewertungen & deine Metriken — was muss ich jetzt tun?" },
  reviews: { title: "Bewertungen", subtitle: "Alle Bewertungen managen, filtern & antworten" },
  akquise: { title: "Akquise", subtitle: "QR-Codes, Einladungen, Funnel & Print-Assets — Bewertungen generieren" },
  markt: { title: "Markt-Vergleich", subtitle: "Konkurrenz checken, deine Trends, Lieferplattformen" },
  settings: { title: "Einstellungen", subtitle: "Betriebsprofil, Templates, Widget-Integration" },
};

/* ─── HELPERS ─── */
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("de-AT", { day: "2-digit", month: "short", year: "numeric" });
}
const AVATAR_COLORS = [
  { bg: "#ede9fe", color: "#7c3aed" }, { bg: "#fce7f3", color: "#be185d" },
  { bg: "#dcfce7", color: "#15803d" }, { bg: "#dbeafe", color: "#1d4ed8" },
  { bg: "#fef3c7", color: "#b45309" }, { bg: "#fee2e2", color: "#b91c1c" },
];
function getAvatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }

/* ─── SMALL COMPONENTS ─── */
function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const c = getAvatarColor(name);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", backgroundColor: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: c.color, flexShrink: 0 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span style={{ fontSize: size, letterSpacing: 1 }}>
      {[1,2,3,4,5].map((s) => <span key={s} style={{ color: s <= rating ? "#f59e0b" : "#e2e8f0" }}>★</span>)}
    </span>
  );
}

function SubTabBar({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 24, backgroundColor: "#f1f5f9", borderRadius: 12, padding: 4, flexWrap: "wrap" }}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: "8px 16px", borderRadius: 9, border: "none",
          backgroundColor: active === t.id ? "#ffffff" : "transparent",
          color: active === t.id ? "#0f172a" : "#64748b",
          fontSize: 13, fontWeight: active === t.id ? 700 : 500,
          cursor: "pointer", fontFamily: "inherit",
          boxShadow: active === t.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
          transition: "all 0.15s",
        }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ─── DELIVERY PLATFORM COLORS (Austria-relevant) ─── */
const DELIVERY_COLORS: Record<string, { bg: string; color: string; icon: string }> = {
  "Lieferando.at": { bg: "#fff3e0", color: "#e65100", icon: "🟠" },
  "Uber Eats": { bg: "#e8f5e9", color: "#1b5e20", icon: "🟢" },
  "Wolt": { bg: "#e3f2fd", color: "#0d47a1", icon: "🔵" },
  "Foodora": { bg: "#fce4ec", color: "#c2185b", icon: "🍕" },
};

/* ─── MAIN COMPONENT ─── */
export default function DashboardClient({ user, initialReviews, hasBusinesses = true, businessProfile, businesses = [] }: {
  user: User; initialReviews: Review[]; hasBusinesses?: boolean; businessProfile?: BusinessProfile | null; businesses?: Business[];
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [activeSection, setActiveSection] = useState<Section>("home");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [aiReply, setAiReply] = useState<{ reviewId: string; text: string; style: string } | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [demoLoading, setDemoLoading] = useState(false);
  const [activeBizIndex, setActiveBizIndex] = useState(0);

  // Derive active business profile from activeBizIndex when businesses array is available
  const activeBusiness: BusinessProfile | null =
    businesses.length > 0
      ? businesses[activeBizIndex] ?? businesses[0]
      : (businessProfile ?? null);

  // Sub-tab states
  const [akquiseTab, setAkquiseTab] = useState("qrstudio");
  const [marktTab, setMarktTab] = useState("lieferplattformen");
  const [settingsTab, setSettingsTab] = useState("settings");

  // Delivery platform auto-check
  const [deliveryRatings, setDeliveryRatings] = useState<DeliveryRating[]>([]);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryChecked, setDeliveryChecked] = useState(false);

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  const pendingCount = reviews.filter((r) => !r.responded).length;
  const responseRate = reviews.length ? Math.round((reviews.filter(r => r.responded).length / reviews.length) * 100) : 0;
  const thisMonthCount = reviews.filter((r) => {
    const d = new Date(r.created_at); const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Auto-check delivery platforms on mount (max 1x per 24h)
  useEffect(() => {
    if (activeBusiness?.name && !deliveryChecked) {
      const lastCheckKey = `delivery_check_${user.id}`;
      const lastCheck = localStorage.getItem(lastCheckKey);
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      // Only check if not checked in last 24 hours
      if (!lastCheck || now - parseInt(lastCheck) > oneDayMs) {
        setDeliveryLoading(true);
        setDeliveryChecked(true);
        fetch("/api/check-delivery-ratings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName: activeBusiness.name,
            city: activeBusiness.address || "",
            userId: user.id,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.results) {
              setDeliveryRatings(data.results);
              localStorage.setItem(lastCheckKey, String(now));
            }
          })
          .catch(() => {})
          .finally(() => setDeliveryLoading(false));
      } else {
        setDeliveryChecked(true);
      }
    }
  }, [activeBusiness?.name, activeBusiness?.address, user.id, deliveryChecked]);

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
    if (!error) setReviews((prev) => prev.map((r) => r.id === id ? { ...r, responded: true } : r));
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
      body: JSON.stringify({ reviewContent: review.content, authorName: review.author_name, rating: review.rating, platform: review.platform, style, businessName: activeBusiness?.name || user.name }),
    });
    const data = await res.json();
    setAiReply({ reviewId: review.id, text: data.reply || "Fehler beim Generieren.", style });
  }

  const [reportSending, setReportSending] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  async function handleSendWeeklyReport() {
    setReportSending(true);
    try {
      await fetch("/api/weekly-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: user.name, email: user.email }),
      });
      setReportSent(true);
      setTimeout(() => setReportSent(false), 4000);
    } finally {
      setReportSending(false);
    }
  }

  const meta = SECTION_META[activeSection];

  // Platform breakdown for home
  const platformBreakdown = reviews.reduce((acc, r) => {
    acc[r.platform] = (acc[r.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentReviews = [...reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  const lowRatingCount = reviews.filter(r => r.rating <= 2).length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif" }}>

      {/* ── SIDEBAR (kompakt) ── */}
      <aside style={{ width: 200, backgroundColor: "#1e1b4b", position: "fixed", top: 0, left: 0, height: "100vh", display: "flex", flexDirection: "column", zIndex: 100, boxShadow: "2px 0 20px rgba(0,0,0,0.12)" }}>
        {/* Logo / Betriebsprofil */}
        <div style={{ padding: "18px 14px 14px" }}>
          {activeBusiness?.logoUrl ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src={activeBusiness.logoUrl} alt={activeBusiness.name} style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", border: "2px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeBusiness.name}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>ReviewBoost</div>
              </div>
            </div>
          ) : activeBusiness ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: activeBusiness.brandColor ? `linear-gradient(135deg, ${activeBusiness.brandColor}, ${activeBusiness.brandColor}aa)` : "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff", border: "2px solid rgba(255,255,255,0.15)" }}>
                {activeBusiness.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeBusiness.name}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>ReviewBoost</div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px" }}>
              Review<span style={{ color: "#a5b4fc" }}>Boost</span>
            </div>
          )}
          {/* Location Switcher — shown only when user has multiple businesses */}
          {businesses.length > 1 && (
            <div style={{ marginTop: 10 }}>
              <select
                value={activeBizIndex}
                onChange={(e) => setActiveBizIndex(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "5px 8px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: "#e0e7ff",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              >
                {businesses.map((biz, idx) => (
                  <option key={biz.id} value={idx} style={{ backgroundColor: "#1e1b4b", color: "#fff" }}>
                    {biz.address ? `${biz.name} – ${biz.address}` : biz.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Nav — flat list */}
        <nav style={{ flex: 1, padding: "6px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <SidebarNavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={isActive}
                badge={item.id === "reviews" ? pendingCount : undefined}
                onClick={() => setActiveSection(item.id)}
              />
            );
          })}
        </nav>

        {/* User Footer */}
        <div style={{ padding: "10px 10px 14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 9px", borderRadius: 9, backgroundColor: "rgba(255,255,255,0.04)", marginBottom: 6 }}>
            <Avatar name={user.name} size={26} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} disabled={loggingOut} style={{ width: "100%", padding: "7px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
            {loggingOut ? "..." : "Abmelden"}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, marginLeft: 200, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Top Bar */}
        <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e8edf3", padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>{meta.title}</h1>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{meta.subtitle}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {[
              { label: `⭐ ${avgRating}`, color: "#b45309", bg: "#fef3c7" },
              { label: `${reviews.length} Bew.`, color: "#4338ca", bg: "#eef2ff" },
              { label: `${pendingCount} offen`, color: pendingCount > 0 ? "#dc2626" : "#15803d", bg: pendingCount > 0 ? "#fef2f2" : "#f0fdf4" },
            ].map((chip) => (
              <div key={chip.label} style={{ padding: "3px 9px", borderRadius: 999, backgroundColor: chip.bg, fontSize: 11, fontWeight: 600, color: chip.color, whiteSpace: "nowrap" }}>
                {chip.label}
              </div>
            ))}
            <button
              onClick={handleSendWeeklyReport}
              disabled={reportSending || reportSent}
              title="Wochenbericht per E-Mail senden"
              style={{
                padding: "5px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0",
                backgroundColor: reportSent ? "#f0fdf4" : "#ffffff",
                color: reportSent ? "#15803d" : "#64748b",
                fontSize: 11, fontWeight: 600, cursor: reportSending ? "wait" : "pointer",
                fontFamily: "inherit", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4,
              }}
            >
              {reportSent ? "✓ Gesendet" : reportSending ? "⏳..." : "📊 Bericht"}
            </button>
          </div>
        </header>

        {/* Alerts */}
        {reviews.filter((r) => {
          if (dismissedAlerts.has(r.id) || r.responded || r.rating > 2) return false;
          return (Date.now() - new Date(r.created_at).getTime()) / 86400000 <= 7;
        }).slice(0, 1).map((r) => (
          <div key={r.id} style={{ margin: "12px 28px 0", padding: "10px 16px", backgroundColor: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16 }}>🚨</span>
            <div style={{ flex: 1, minWidth: 140 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", margin: "0 0 1px" }}>{r.rating}★ von {r.author_name}</p>
              <p style={{ fontSize: 11, color: "#b91c1c", margin: 0 }}>{r.content.substring(0, 80)}{r.content.length > 80 ? "…" : ""}</p>
            </div>
            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
              <button onClick={() => setActiveSection("reviews")} style={{ padding: "5px 10px", borderRadius: 7, border: "none", backgroundColor: "#dc2626", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Antworten</button>
              <button onClick={() => setDismissedAlerts((p) => new Set([...p, r.id]))} style={{ padding: "5px 7px", borderRadius: 7, border: "1px solid #fecaca", backgroundColor: "#fff", color: "#dc2626", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>✕</button>
            </div>
          </div>
        ))}

        {!hasBusinesses && (
          <div style={{ margin: "12px 28px 0", padding: "14px 18px", backgroundColor: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 20 }}>🏪</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#92400e", margin: "0 0 2px" }}>Kein Betrieb registriert</p>
              <p style={{ fontSize: 12, color: "#b45309", margin: 0 }}>Füge deinen Betrieb hinzu um loszulegen.</p>
            </div>
            <a href="/onboarding" style={{ padding: "8px 16px", backgroundColor: "#f59e0b", color: "#fff", textDecoration: "none", borderRadius: 9, fontSize: 12, fontWeight: 700 }}>Betrieb einrichten →</a>
          </div>
        )}

        {hasBusinesses && initialReviews.length === 0 && (
          <div style={{ margin: "12px 28px 0", padding: "16px 20px", backgroundColor: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0369a1", margin: "0 0 4px" }}>Noch keine Bewertungen — so geht es los:</p>
                <p style={{ fontSize: 12, color: "#0284c7", margin: "0 0 10px", lineHeight: 1.6 }}>
                  Füge Bewertungen über <strong>Einstellungen → Google-Bewertungen importieren</strong> hinzu, oder trage sie manuell im Bereich <strong>Bewertungen</strong> ein.
                </p>
                <details style={{ fontSize: 12, color: "#0369a1" }}>
                  <summary style={{ cursor: "pointer", fontWeight: 600 }}>🧪 Nur zum Testen: Demo-Daten laden</summary>
                  <div style={{ marginTop: 10, padding: "10px 14px", backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8 }}>
                    <p style={{ fontSize: 12, color: "#c2410c", margin: "0 0 8px" }}>⚠️ Lädt Beispieldaten eines fiktiven Restaurants — nur für interne Tests, nicht für echte Betriebe gedacht.</p>
                    <button
                      disabled={demoLoading}
                      onClick={async () => {
                        setDemoLoading(true);
                        try {
                          await fetch("/api/seed-demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id }) });
                          window.location.reload();
                        } catch { setDemoLoading(false); }
                      }}
                      style={{ padding: "7px 14px", backgroundColor: "#f97316", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: demoLoading ? "wait" : "pointer", fontFamily: "inherit", opacity: demoLoading ? 0.7 : 1 }}
                    >
                      {demoLoading ? "Lädt..." : "Demo-Daten laden"}
                    </button>
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <main style={{ flex: 1, padding: "24px 28px" }}>

          {/* ══════ HOME / ÜBERSICHT: "Was muss ich JETZT tun?" ══════ */}
          {activeSection === "home" && (
            <div style={{ maxWidth: 1100 }}>
              {/* Action Priority: Offene Bewertungen top */}
              {pendingCount > 0 && (
                <div style={{ ...card, padding: 20, backgroundColor: "#fef2f2", border: "2px solid #fecaca", marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: "#991b1b", margin: "0 0 4px" }}>🔴 {pendingCount} {pendingCount === 1 ? "Bewertung wartet" : "Bewertungen warten"} auf Antwort</h3>
                      <p style={{ fontSize: 12, color: "#b91c1c", margin: 0 }}>Beantworte jetzt, um deine Response-Rate zu verbessern und Kunden zu binden.</p>
                    </div>
                    <button onClick={() => setActiveSection("reviews")} style={{ padding: "9px 18px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>→ Zur Inbox</button>
                  </div>
                </div>
              )}

              {/* Meine Metriken — 3 KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
                {[
                  { label: "Ø Bewertung", value: avgRating, icon: "⭐", bg: "#fef3c7", color: "#b45309", detail: "Von allen Plattformen" },
                  { label: "Antwortrate", value: `${responseRate}%`, icon: "✅", bg: responseRate >= 80 ? "#f0fdf4" : responseRate >= 50 ? "#fef3c7" : "#fef2f2", color: responseRate >= 80 ? "#15803d" : responseRate >= 50 ? "#b45309" : "#dc2626", detail: `${reviews.filter(r => r.responded).length} von ${reviews.length} beantwortet` },
                  { label: "Diesen Monat", value: String(thisMonthCount), icon: "📅", bg: "#eef2ff", color: "#4338ca", detail: `${reviews.length} gesamt` },
                ].map((kpi) => (
                  <div key={kpi.label} style={{ ...card, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{kpi.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: kpi.color, letterSpacing: "-0.5px" }}>{kpi.value}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{kpi.label}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>{kpi.detail}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                {/* Recent pending reviews — was zu tun ist */}
                <div style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>⏳ Letzte unbeantwortet</h3>
                    <button onClick={() => setActiveSection("reviews")} style={{ fontSize: 10, color: "#6366f1", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Alle</button>
                  </div>
                  {recentReviews.filter(r => !r.responded).length === 0 ? (
                    <p style={{ fontSize: 12, color: "#15803d", textAlign: "center", padding: 16, backgroundColor: "#f0fdf4", borderRadius: 8 }}>✓ Alle Bewertungen beantwortet!</p>
                  ) : recentReviews.filter(r => !r.responded).slice(0, 3).map((r) => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <Avatar name={r.author_name} size={28} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: r.rating <= 2 ? "#dc2626" : "#0f172a" }}>{r.author_name}</span>
                          <Stars rating={r.rating} size={9} />
                        </div>
                        <p style={{ fontSize: 10, color: "#64748b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.content.substring(0, 60)}</p>
                      </div>
                      <span style={{ fontSize: 9, color: "#94a3b8", flexShrink: 0 }}>{formatDate(r.created_at)}</span>
                    </div>
                  ))}
                </div>

                {/* Schnelle Aktionen */}
                <div style={card}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>⚡ Schnelle Aktionen</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {[
                      { emoji: "📱", label: "QR-Code erstellen", desc: "Für Tisch-Rezensionen", section: "akquise" as Section },
                      { emoji: "✉️", label: "Kunden einladen", desc: "Per Email/SMS", section: "akquise" as Section },
                      { emoji: "➕", label: "Bewertung eintragen", desc: "Manuell hinzufügen", section: null },
                    ].map((a) => (
                      <button
                        key={a.label}
                        onClick={() => a.section ? setActiveSection(a.section) : setShowAddModal(true)}
                        style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: 8, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 11, color: "#374151", fontWeight: 500, textAlign: "left", transition: "all 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#eef2ff"; e.currentTarget.style.borderColor = "#6366f1"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                      >
                        <span style={{ fontSize: 14 }}>{a.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 11 }}>{a.label}</div>
                          <div style={{ fontSize: 9, color: "#94a3b8" }}>{a.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Plattform-Verteilung (informativ) */}
              <div style={{ ...card, marginBottom: 14 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 14px" }}>📊 Wo kommen deine Bewertungen her?</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
                  {Object.entries(platformBreakdown).sort((a, b) => b[1] - a[1]).map(([p, count]) => {
                    const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                    const colors = PLATFORM_COLORS[p] || { bg: "#f1f5f9", color: "#475569", accent: "#94a3b8" };
                    return (
                      <div key={p} style={{ padding: 12, backgroundColor: colors.bg, borderRadius: 10, textAlign: "center" }}>
                        <div style={{ fontSize: 22, marginBottom: 4 }}>⭐</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: colors.color, marginBottom: 2 }}>{p}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: colors.color }}>{count}</div>
                        <div style={{ fontSize: 9, color: colors.color, opacity: 0.6 }}>{pct}%</div>
                      </div>
                    );
                  })}
                  {Object.keys(platformBreakdown).length === 0 && (
                    <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: 20, gridColumn: "1/-1" }}>Noch keine Bewertungen</p>
                  )}
                </div>
              </div>

              {/* Info: Go to Markt-Radar for competition */}
              <div style={{ ...card, backgroundColor: "#eef2ff", border: "1px solid #c7d2fe" }}>
                <p style={{ fontSize: 12, color: "#4338ca", margin: 0 }}>
                  <strong>💡 Markt-Radar:</strong> Wie schneidest du gegen die Konkurrenz ab? Schau in den Markt-Radar Tab, um Lieferplattformen zu checken und Konkurrenten zu vergleichen.
                </p>
              </div>
            </div>
          )}

          {/* ══════ BEWERTUNGEN ══════ */}
          {activeSection === "reviews" && (
            <ReviewManagementSection
              reviews={reviews}
              onMarkResponded={handleMarkResponded}
              onDelete={handleDeleteReview}
              onAiReply={handleAiReply}
              aiReply={aiReply}
              setAiReply={setAiReply}
            />
          )}

          {/* ══════ AKQUISE (sub-tabs) ══════ */}
          {activeSection === "akquise" && (
            <div style={{ maxWidth: 960 }}>
              <SubTabBar
                tabs={[
                  { id: "qrstudio", label: "📱 QR-Studio" },
                  { id: "einladen", label: "✉️ Einladen" },
                  { id: "funnel", label: "🛡️ Funnel" },
                  { id: "print", label: "🖨️ Print-Assets" },
                ]}
                active={akquiseTab}
                onChange={setAkquiseTab}
              />
              {akquiseTab === "qrstudio" && <QRStudioSection userId={user.id} businessName={activeBusiness?.name || user.name} businesses={businesses} />}
              {akquiseTab === "einladen" && <EinladenSubSection businessName={user.name} />}
              {akquiseTab === "funnel" && <FunnelSection userId={user.id} />}
              {akquiseTab === "print" && <PrintAssetsSection businessName={user.name} userId={user.id} />}
            </div>
          )}

          {/* ══════ MARKT-RADAR: "Wie sehe ich da aus?" (strategisch) ══════ */}
          {activeSection === "markt" && (
            <div style={{ maxWidth: 1100 }}>
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Automatische Lieferplattform-Überwachung, Konkurrenz-Vergleich & Trends.</p>
              </div>
              <SubTabBar
                tabs={[
                  { id: "lieferplattformen", label: "🚴 Lieferplattformen (Automatisch)" },
                  { id: "konkurrenz", label: "🔭 Konkurrenz-Vergleich" },
                  { id: "analytics", label: "📊 Deine Trends" },
                ]}
                active={marktTab}
                onChange={setMarktTab}
              />
              {marktTab === "lieferplattformen" && (
                <DeliveryPlatformsPanel
                  ratings={deliveryRatings}
                  loading={deliveryLoading}
                  businessName={activeBusiness?.name || user.name}
                  onRefresh={() => setDeliveryChecked(false)}
                />
              )}
              {marktTab === "konkurrenz" && (
                <KonkurrenzRadarSection
                  businessName={activeBusiness?.name || user.name}
                  myRating={reviews.length > 0 ? parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)) : 0}
                  myReviewCount={reviews.length}
                  defaultAddress={activeBusiness?.address || ""}
                  businessCategory={activeBusiness?.category ?? null}
                />
              )}
              {marktTab === "analytics" && <AnalyticsSection reviews={reviews} />}
            </div>
          )}

          {/* ══════ EINSTELLUNGEN (sub-tabs) ══════ */}
          {activeSection === "settings" && (
            <div style={{ maxWidth: 960 }}>
              <SubTabBar
                tabs={[
                  { id: "settings", label: "⚙️ Betrieb & Profil" },
                  { id: "vorlagen", label: "📝 Vorlagen" },
                  { id: "widget", label: "🌐 Widget" },
                  { id: "strategie", label: "🎯 Strategie" },
                ]}
                active={settingsTab}
                onChange={setSettingsTab}
              />
              {settingsTab === "settings" && <SettingsSection userId={user.id} userEmail={user.email} userName={user.name} />}
              {settingsTab === "vorlagen" && <TemplatesSection userId={user.id} />}
              {settingsTab === "widget" && <WidgetSection userId={user.id} businessName={user.name} />}
              {settingsTab === "strategie" && <StrategieSection reviews={reviews} businessName={user.name} />}
            </div>
          )}

        </main>
      </div>

      {showAddModal && (
        <AddReviewModal userId={user.id} userEmail={user.email} businessName={user.name} onClose={() => setShowAddModal(false)} onAdded={(r) => { setReviews((prev) => [r, ...prev]); setShowAddModal(false); }} />
      )}
    </div>
  );
}

/* ─── SIDEBAR NAV ITEM ─── */
function SidebarNavItem({ icon, label, badge, isActive, onClick }: { icon: string; label: string; badge?: number; isActive: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
        borderRadius: 10, border: "none", width: "100%", textAlign: "left", fontFamily: "inherit",
        backgroundColor: isActive ? "#4338ca" : hov ? "rgba(255,255,255,0.06)" : "transparent",
        cursor: "pointer", transition: "background-color 0.12s",
      }}
    >
      <span style={{ fontSize: 17, width: 22, textAlign: "center", flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "#fff" : "rgba(255,255,255,0.6)", flex: 1 }}>{label}</span>
      {badge != null && badge > 0 && (
        <span style={{ backgroundColor: "#f97316", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 999, flexShrink: 0 }}>{badge}</span>
      )}
    </button>
  );
}

/* ─── EINLADEN SUB-SECTION (combines invite+qr+kampagne) ─── */
function EinladenSubSection({ businessName }: { businessName: string }) {
  const [tab, setTab] = useState<"invite" | "qr" | "kampagne">("invite");
  return (
    <div>
      <SubTabBar
        tabs={[
          { id: "invite", label: "✉️ Einzeln" },
          { id: "qr", label: "📱 QR & Link" },
          { id: "kampagne", label: "📣 Kampagne" },
        ]}
        active={tab}
        onChange={(id) => setTab(id as typeof tab)}
      />
      {tab === "invite" && <InviteSection businessName={businessName} />}
      {tab === "qr" && <QRSection businessName={businessName} />}
      {tab === "kampagne" && <KampagnenSection businessName={businessName} />}
    </div>
  );
}

/* ─── DELIVERY PLATFORMS PANEL ─── */
function DeliveryPlatformsPanel({ ratings, loading, businessName, onRefresh }: { ratings: DeliveryRating[]; loading: boolean; businessName: string; onRefresh: () => void }) {
  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Lieferplattform-Bewertungen</h3>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Automatisch abgerufen für „{businessName}"</p>
        </div>
        <button onClick={onRefresh} disabled={loading} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#6366f1", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          {loading ? "⏳ Sucht..." : "🔄 Neu prüfen"}
        </button>
      </div>

      {loading ? (
        <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, gap: 12 }}>
          <div style={{ width: 20, height: 20, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: 14, color: "#64748b" }}>Durchsuche Lieferando, Uber Eats, Wolt, Mjam...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {ratings.map((dr) => {
            const dc = DELIVERY_COLORS[dr.platform] || { bg: "#f1f5f9", color: "#475569", icon: "⚪" };
            const found = dr.rating !== null;
            return (
              <div key={dr.platform} style={{ ...card, padding: 22, borderLeft: `4px solid ${dc.color}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{dc.icon}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: dc.color }}>{dr.platform}</div>
                    {dr.name && <div style={{ fontSize: 11, color: "#94a3b8" }}>{dr.name}</div>}
                  </div>
                </div>
                {found ? (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: dc.color }}>{dr.rating!.toFixed(1)}</span>
                    <span style={{ fontSize: 20, letterSpacing: 1 }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(dr.rating!) ? "#f59e0b" : "#e2e8f0" }}>★</span>)}
                    </span>
                    {dr.reviewCount && <span style={{ fontSize: 12, color: "#94a3b8" }}>({dr.reviewCount})</span>}
                  </div>
                ) : (
                  <div style={{ padding: "10px 0", color: "#94a3b8", fontSize: 13 }}>
                    ⚠️ {dr.error || "Nicht gefunden"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {ratings.length > 0 && !loading && (
        <div style={{ marginTop: 14, padding: "12px 16px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10 }}>
          <p style={{ fontSize: 12, color: "#15803d", margin: 0 }}>
            💡 <strong>Tipp:</strong> Bewertungen auf Lieferplattformen beeinflussen die Sichtbarkeit im Ranking. Antworte auch dort auf Bewertungen, um dein Profil zu stärken.
          </p>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ onClick, color, bg, border, children }: { onClick: () => void; color: string; bg: string; border: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ padding: "5px 9px", borderRadius: 7, border: `1.5px solid ${border}`, backgroundColor: bg, color, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}

/* ─── INVITE SECTION ─── */
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
    setLoading(true); setError(null);
    const res = await fetch("/api/send-invitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName, customerEmail, platform, reviewLink, businessName, template }),
    });
    const data = await res.json();
    if (data.success) setSuccess(true);
    else setError(data.error || "Fehler beim Senden.");
    setLoading(false);
  }

  if (success) {
    return (
      <div style={{ ...card, maxWidth: 480, textAlign: "center", padding: "48px 40px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Einladung gesendet!</h3>
        <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>{customerName} hat die Bewertungseinladung erhalten.</p>
        <button onClick={() => { setSuccess(false); setCustomerName(""); setCustomerEmail(""); setReviewLink(""); }} style={btnPrimary}>Weitere Einladung senden</button>
      </div>
    );
  }

  const TMPL_OPTIONS: { id: EmailTemplate; label: string; emoji: string; desc: string }[] = [
    { id: "freundlich", label: "Freundlich", emoji: "😊", desc: "Persönlich, Du-Form" },
    { id: "professionell", label: "Professionell", emoji: "💼", desc: "Formell, Sie-Form" },
    { id: "gastro", label: "Gastro", emoji: "🍽️", desc: "Für Restaurants" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18, maxWidth: 820 }}>
      <div style={card}>
        <h2 style={sectionTitle}>✉️ Einzelne Einladung senden</h2>
        {error && <div style={errorBox}>{error}</div>}
        <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Kundenname">
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="z.B. Maria Müller" style={input} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <Field label="E-Mail-Adresse">
            <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required placeholder="kunde@email.com" style={input} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Plattform">
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ ...input, cursor: "pointer" }}>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Review-Link (optional)">
              <input value={reviewLink} onChange={(e) => setReviewLink(e.target.value)} placeholder="https://g.page/r/..." style={input} onFocus={onFocus} onBlur={onBlur} />
            </Field>
          </div>
          <Field label="E-Mail-Stil">
            <div style={{ display: "flex", gap: 6 }}>
              {TMPL_OPTIONS.map((t) => (
                <button key={t.id} type="button" onClick={() => setTemplate(t.id)} style={{ flex: 1, padding: "9px 6px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", border: template === t.id ? "2px solid #6366f1" : "2px solid #e2e8f0", backgroundColor: template === t.id ? "#eef2ff" : "#f8fafc", textAlign: "center" }}>
                  <div style={{ fontSize: 16, marginBottom: 2 }}>{t.emoji}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: template === t.id ? "#4338ca" : "#374151" }}>{t.label}</div>
                </button>
              ))}
            </div>
          </Field>
          <button type="submit" disabled={loading} style={{ ...btnPrimary, backgroundColor: loading ? "#a5b4fc" : "#22c55e", boxShadow: "0 2px 8px rgba(34,197,94,0.25)" }}>
            {loading ? "Sendet..." : "✉️ Einladung senden"}
          </button>
        </form>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ ...card, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#15803d", margin: "0 0 8px" }}>💡 Tipps</p>
          {["Gleicher Tag → höhere Rücklaufquote", "Personalisiert → 3× mehr Klicks", "Google hat den höchsten SEO-Einfluss"].map((t) => (
            <p key={t} style={{ fontSize: 11, color: "#166534", margin: "0 0 5px", paddingLeft: 10, borderLeft: "2px solid #4ade80", lineHeight: 1.5 }}>{t}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── QR SECTION ─── */
function QRSection({ businessName }: { businessName: string }) {
  const [platform, setPlatform] = useState("Google");
  const [reviewLink, setReviewLink] = useState("");
  const [copied, setCopied] = useState(false);

  const qrUrl = reviewLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(reviewLink)}&bgcolor=ffffff&color=1e1b4b&margin=12`
    : null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, maxWidth: 720 }}>
      <div style={card}>
        <h2 style={sectionTitle}>📱 QR-Code & Direktlink</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Plattform">
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ ...input, cursor: "pointer" }}>
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Dein Review-Link">
            <input value={reviewLink} onChange={(e) => setReviewLink(e.target.value)} placeholder="https://g.page/r/..." style={input} onFocus={onFocus} onBlur={onBlur} />
          </Field>
        </div>
        {qrUrl && (
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 7 }}>
            <a href={qrUrl} download="qr.png" style={{ ...btnPrimary, textAlign: "center", textDecoration: "none", display: "block", fontSize: 12, padding: "9px 16px" }}>⬇️ QR herunterladen</a>
            <button onClick={() => { navigator.clipboard.writeText(reviewLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ ...btnSecondary, backgroundColor: copied ? "#f0fdf4" : "#f8fafc", color: copied ? "#15803d" : "#374151", fontSize: 12, padding: "9px 16px" }}>
              {copied ? "✓ Kopiert!" : "🔗 Link kopieren"}
            </button>
          </div>
        )}
        {!qrUrl && <div style={{ marginTop: 18, textAlign: "center", padding: 24, backgroundColor: "#f8fafc", borderRadius: 12, border: "2px dashed #e2e8f0", color: "#94a3b8", fontSize: 12 }}>Review-Link eintragen → QR erscheint</div>}
      </div>
      {qrUrl && (
        <div style={{ ...card, textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Vorschau</p>
          <img src={qrUrl} alt="QR" style={{ width: 160, height: 160, borderRadius: 12, border: "1px solid #e8edf3" }} />
          <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>{platform} · Scannen & bewerten</p>
        </div>
      )}
    </div>
  );
}

/* ─── ADD REVIEW MODAL ─── */
function AddReviewModal({ userId, userEmail, businessName, onClose, onAdded }: { userId: string; userEmail: string; businessName: string; onClose: () => void; onAdded: (r: Review) => void }) {
  const [authorName, setAuthorName] = useState("");
  const [platform, setPlatform] = useState("Google");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.from("reviews").insert({ user_id: userId, author_name: authorName, platform, rating, content, responded: false }).select().single();
    if (error) { setError("Fehler beim Speichern."); setLoading(false); return; }
    if (rating <= 2) {
      fetch("/api/alert-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail, businessName, authorName, rating, content, platform,
          reviewDate: new Date().toLocaleDateString("de-AT", { day: "2-digit", month: "short", year: "numeric" }),
        }),
      }).catch(() => {});
    }
    onAdded(data as Review);
  }

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24, backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 460, boxShadow: "0 24px 80px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>Bewertung erfassen</h2>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        {error && <div style={errorBox}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Name des Rezensenten">
            <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} required placeholder="z.B. Maria K." style={input} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Plattform">
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ ...input, cursor: "pointer" }}>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Bewertung">
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ ...input, cursor: "pointer" }}>
                {[5,4,3,2,1].map((r) => <option key={r} value={r}>{"★".repeat(r)} ({r}/5)</option>)}
              </select>
            </Field>
          </div>
          <Field label="Bewertungstext">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} required placeholder="Was hat der Kunde geschrieben?" rows={3} style={{ ...input, resize: "vertical", minHeight: 80 }} onFocus={onFocus} onBlur={onBlur} />
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={btnSecondary}>Abbrechen</button>
            <button type="submit" disabled={loading} style={{ ...btnPrimary, backgroundColor: loading ? "#a5b4fc" : "#6366f1" }}>
              {loading ? "Speichert..." : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── SHARED ─── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const input: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#0f172a", backgroundColor: "#f8fafc", transition: "border-color 0.15s" };
const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#6366f1");
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#e2e8f0");
const btnPrimary: React.CSSProperties = { padding: "10px 18px", borderRadius: 10, border: "none", backgroundColor: "#6366f1", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
const btnSecondary: React.CSSProperties = { padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const sectionTitle: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 18px" };
const errorBox: React.CSSProperties = { backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 13px", marginBottom: 14, color: "#dc2626", fontSize: 12 };
