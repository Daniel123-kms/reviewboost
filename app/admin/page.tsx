import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "danielkalbus@web.de";

type CustomerRow = {
  user_id: string;
  email: string;
  business_names: string;
  business_count: number;
  review_count: number;
  last_review: string | null;
  created_at: string;
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("de-AT", { day: "2-digit", month: "short", year: "numeric" });
}

function daysSince(d: string | null) {
  if (!d) return null;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  // Fetch platform-wide overview via SECURITY DEFINER function
  const { data: customers, error } = await supabase.rpc("get_admin_overview");

  const rows: CustomerRow[] = customers || [];

  const totalCustomers = rows.length;
  const totalBusinesses = rows.reduce((s, r) => s + Number(r.business_count), 0);
  const totalReviews = rows.reduce((s, r) => s + Number(r.review_count), 0);
  const activeThisWeek = rows.filter((r) => r.last_review && daysSince(r.last_review)! <= 7).length;

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#0f172a",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#e2e8f0",
    }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>
            Review<span style={{ color: "#6366f1" }}>Boost</span>
          </span>
          <span style={{ padding: "2px 8px", backgroundColor: "#6366f1", borderRadius: 6, fontSize: 10, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px" }}>Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#64748b" }}>{user.email}</span>
          <a href="/dashboard" style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #334155", color: "#94a3b8", fontSize: 12, textDecoration: "none", fontWeight: 500 }}>
            → Mein Dashboard
          </a>
        </div>
      </div>

      <div style={{ padding: "32px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>Platform Overview</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px" }}>Alle aktiven Kunden auf ReviewBoost — Echtzeit-Daten</p>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Kunden gesamt", value: totalCustomers, icon: "👥", color: "#6366f1", bg: "#1e1b4b" },
            { label: "Betriebe", value: totalBusinesses, icon: "🏪", color: "#22c55e", bg: "#052e16" },
            { label: "Bewertungen", value: totalReviews, icon: "⭐", color: "#f59e0b", bg: "#1c1400" },
            { label: "Aktiv (7 Tage)", value: activeThisWeek, icon: "🟢", color: "#34d399", bg: "#022c22" },
          ].map((kpi) => (
            <div key={kpi.label} style={{ backgroundColor: kpi.bg, borderRadius: 14, padding: "20px 22px", border: `1px solid ${kpi.color}22` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{kpi.icon} {kpi.label}</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: kpi.color, letterSpacing: "-1px" }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding: "12px 16px", backgroundColor: "#450a0a", border: "1px solid #dc2626", borderRadius: 10, marginBottom: 20, fontSize: 13, color: "#fca5a5" }}>
            ⚠️ Fehler beim Laden: {error.message} — Bitte SQL-Funktion ausführen.
          </div>
        )}

        {/* Customer Table */}
        <div style={{ backgroundColor: "#1e293b", borderRadius: 16, border: "1px solid #334155", overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>Alle Kunden</h2>
            <span style={{ fontSize: 12, color: "#64748b" }}>{rows.length} Einträge</span>
          </div>

          {rows.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#64748b" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <p style={{ fontSize: 14, margin: 0 }}>Noch keine Kunden registriert oder SQL-Funktion fehlt.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#0f172a" }}>
                  {["E-Mail", "Betrieb(e)", "Standorte", "Bewertungen", "Letzter Review", "Dabei seit", "Status"].map((h) => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const days = daysSince(r.last_review);
                  const isActive = days !== null && days <= 7;
                  const isNew = daysSince(r.created_at) !== null && daysSince(r.created_at)! <= 14;
                  return (
                    <tr key={r.user_id} style={{ borderTop: "1px solid #1e293b", backgroundColor: i % 2 === 0 ? "transparent" : "#0f172a22" }}>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#312e81", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#a5b4fc", flexShrink: 0 }}>
                            {(r.email || "?").charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{r.email || "—"}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#cbd5e1", maxWidth: 200 }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.business_names}>
                          {r.business_names || "—"}
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: Number(r.business_count) > 1 ? "#a5b4fc" : "#94a3b8" }}>
                          {r.business_count}
                          {Number(r.business_count) > 1 && <span style={{ fontSize: 10, marginLeft: 4, color: "#6366f1" }}>Kette</span>}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: Number(r.review_count) > 10 ? "#22c55e" : Number(r.review_count) > 0 ? "#f59e0b" : "#64748b" }}>
                          {r.review_count}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 12, color: "#94a3b8" }}>
                        {r.last_review ? (
                          <span style={{ color: days !== null && days <= 3 ? "#34d399" : days !== null && days <= 14 ? "#f59e0b" : "#64748b" }}>
                            {formatDate(r.last_review)}
                          </span>
                        ) : "—"}
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 12, color: "#64748b" }}>
                        {formatDate(r.created_at)}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {isActive && (
                            <span style={{ padding: "2px 8px", borderRadius: 999, backgroundColor: "#052e16", border: "1px solid #15803d", fontSize: 10, fontWeight: 700, color: "#22c55e" }}>Aktiv</span>
                          )}
                          {isNew && (
                            <span style={{ padding: "2px 8px", borderRadius: 999, backgroundColor: "#1e1b4b", border: "1px solid #6366f1", fontSize: 10, fontWeight: 700, color: "#a5b4fc" }}>Neu</span>
                          )}
                          {!isActive && !isNew && Number(r.review_count) === 0 && (
                            <span style={{ padding: "2px 8px", borderRadius: 999, backgroundColor: "#1c1400", border: "1px solid #78350f", fontSize: 10, fontWeight: 700, color: "#f59e0b" }}>Setup</span>
                          )}
                          {!isActive && !isNew && Number(r.review_count) > 0 && (
                            <span style={{ padding: "2px 8px", borderRadius: 999, backgroundColor: "#1e293b", border: "1px solid #475569", fontSize: 10, fontWeight: 700, color: "#64748b" }}>Inaktiv</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
