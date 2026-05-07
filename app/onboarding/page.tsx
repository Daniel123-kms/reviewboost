"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Place = {
  place_id: string;
  name: string;
  address: string;
  rating?: number;
  total_ratings?: number;
  photo_url?: string;
  google_maps_url: string;
  google_review_url: string;
  types: string[];
};

type SavedBusiness = Place & { chain_name?: string };

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"mode" | "search" | "confirm" | "chain-add" | "done">("mode");
  const [mode, setMode] = useState<"single" | "chain" | null>(null);
  const [chainName, setChainName] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [selected, setSelected] = useState<Place | null>(null);
  const [businesses, setBusinesses] = useState<SavedBusiness[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search-places?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      }
      setSearching(false);
    }, 500);
  }, [query]);

  async function saveBusiness(place: SavedBusiness) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase.from("businesses").insert({
      user_id: user.id,
      name: place.name,
      address: place.address,
      place_id: place.place_id,
      google_maps_url: place.google_maps_url,
      google_review_url: place.google_review_url,
      rating: place.rating,
      total_ratings: place.total_ratings,
      photo_url: place.photo_url,
      chain_name: place.chain_name || null,
      is_chain_member: !!place.chain_name,
    });
    return !error;
  }

  async function handleConfirm() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    const toSave: SavedBusiness = { ...selected, chain_name: mode === "chain" ? chainName : undefined };
    const ok = await saveBusiness(toSave);
    if (!ok) { setError("Fehler beim Speichern. Bitte versuche es erneut."); setSaving(false); return; }
    setBusinesses((prev) => [...prev, toSave]);
    setSaving(false);

    if (mode === "chain") {
      setStep("chain-add");
      setSelected(null);
      setQuery("");
      setResults([]);
    } else {
      setStep("done");
    }
  }

  async function handleAddAnother() {
    setStep("search");
    setSelected(null);
    setQuery("");
    setResults([]);
  }

  async function handleFinish() {
    router.push("/dashboard");
    router.refresh();
  }

  // ── STEP: MODE ──
  if (step === "mode") return (
    <PageShell progress={25}>
      <h1 style={headingStyle}>Willkommen! Lass uns starten 🚀</h1>
      <p style={subStyle}>Was möchtest du bei ReviewBoost registrieren?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 32 }}>
        <ModeCard
          emoji="🏪"
          title="Einzelnes Restaurant / Geschäft"
          desc="Du hast einen Standort und möchtest diesen verwalten."
          onClick={() => { setMode("single"); setStep("search"); }}
        />
        <ModeCard
          emoji="🏢"
          title="Kette / Mehrere Standorte"
          desc="Du betreibst mehrere Filialen unter einem gemeinsamen Namen."
          onClick={() => { setMode("chain"); setStep("search"); }}
          highlight
        />
      </div>
    </PageShell>
  );

  // ── STEP: CHAIN NAME (first time) ──
  if (step === "search" && mode === "chain" && !chainName) return (
    <PageShell progress={35}>
      <button onClick={() => setStep("mode")} style={backBtn}>← Zurück</button>
      <h1 style={headingStyle}>Wie heißt deine Kette?</h1>
      <p style={subStyle}>Der Name unter dem alle Filialen zusammengefasst werden.</p>
      <input
        value={chainName}
        onChange={(e) => setChainName(e.target.value)}
        placeholder="z.B. Burger Palace, Pizza Express..."
        style={{ ...inputStyle, marginTop: 24, fontSize: 16 }}
        autoFocus
      />
      <button
        disabled={chainName.trim().length < 2}
        onClick={() => setStep("search")}
        style={{ ...primaryBtn, marginTop: 16, width: "100%", opacity: chainName.trim().length < 2 ? 0.5 : 1 }}
      >
        Weiter → Standort suchen
      </button>
    </PageShell>
  );

  // ── STEP: SEARCH ──
  if (step === "search") return (
    <PageShell progress={50}>
      <button onClick={() => { if (mode === "chain" && businesses.length === 0) { setChainName(""); } else { setStep("mode"); } }} style={backBtn}>← Zurück</button>
      <h1 style={headingStyle}>
        {mode === "chain" ? `Standort suchen — ${chainName}` : "Finde dein Restaurant / Geschäft"}
      </h1>
      <p style={subStyle}>Gib den Namen und die Stadt ein. Wir zeigen dir die echten Einträge aus Google Maps.</p>

      <div style={{ position: "relative", marginTop: 24 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="z.B. Mario's Pizza Wien, Café Hawelka..."
          style={{ ...inputStyle, fontSize: 15, paddingLeft: 44 }}
          autoFocus
        />
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
      </div>

      {searching && (
        <div style={{ textAlign: "center", padding: "24px", color: "#94a3b8", fontSize: 14 }}>Suche läuft...</div>
      )}

      {!searching && results.length > 0 && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 4px" }}>
            {results.length} Ergebnisse gefunden — klick auf das richtige:
          </p>
          {results.map((place) => (
            <PlaceCard key={place.place_id} place={place} onSelect={() => { setSelected(place); setStep("confirm"); }} />
          ))}
        </div>
      )}

      {!searching && query.length >= 2 && results.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px", marginTop: 16, backgroundColor: "#f8fafc", borderRadius: 12, border: "2px dashed #e2e8f0" }}>
          <p style={{ fontSize: 32, margin: "0 0 8px" }}>😕</p>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Keine Ergebnisse gefunden.<br />Versuch es mit einem anderen Namen oder der genauen Adresse.</p>
        </div>
      )}

      {mode === "chain" && businesses.length > 0 && (
        <div style={{ marginTop: 20, padding: "16px", backgroundColor: "#f0fdf4", borderRadius: 12, border: "1.5px solid #bbf7d0" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d", margin: "0 0 8px" }}>✅ Bereits hinzugefügt ({businesses.length}):</p>
          {businesses.map((b, i) => <p key={i} style={{ fontSize: 13, color: "#374151", margin: "2px 0" }}>• {b.name} — {b.address}</p>)}
        </div>
      )}
    </PageShell>
  );

  // ── STEP: CONFIRM ──
  if (step === "confirm" && selected) return (
    <PageShell progress={75}>
      <button onClick={() => setStep("search")} style={backBtn}>← Zurück zur Suche</button>
      <h1 style={headingStyle}>Ist das dein Betrieb?</h1>
      <p style={subStyle}>Bitte bestätige, dass du der Inhaber oder Verantwortliche für diesen Eintrag bist.</p>

      <div style={{ marginTop: 24, backgroundColor: "#f8fafc", borderRadius: 16, border: "2px solid #6366f1", padding: 24, boxShadow: "0 4px 20px rgba(99,102,241,0.1)" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          {selected.photo_url ? (
            <img src={selected.photo_url} alt={selected.name} style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: 10, backgroundColor: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>🏪</div>
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>{selected.name}</h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 10px", lineHeight: 1.5 }}>📍 {selected.address}</p>
            {selected.rating && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, color: "#f59e0b", fontWeight: 700 }}>{"★".repeat(Math.round(selected.rating))}</span>
                <span style={{ fontSize: 13, color: "#64748b" }}>{selected.rating} ({selected.total_ratings?.toLocaleString("de")} Bewertungen)</span>
              </div>
            )}
          </div>
        </div>
        {mode === "chain" && chainName && (
          <div style={{ marginTop: 14, padding: "10px 14px", backgroundColor: "#ede9fe", borderRadius: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed" }}>🏢 Kette: {chainName}</span>
          </div>
        )}
      </div>

      {error && <div style={{ marginTop: 16, padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, color: "#dc2626", fontSize: 14 }}>{error}</div>}

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button onClick={() => setStep("search")} style={{ ...secondaryBtn, flex: 1 }}>
          ← Das ist nicht meins
        </button>
        <button onClick={handleConfirm} disabled={saving} style={{ ...primaryBtn, flex: 2, opacity: saving ? 0.7 : 1 }}>
          {saving ? "Speichere..." : "✅ Ja, das ist mein Betrieb!"}
        </button>
      </div>
    </PageShell>
  );

  // ── STEP: CHAIN ADD MORE ──
  if (step === "chain-add") return (
    <PageShell progress={85}>
      <h1 style={headingStyle}>Standort hinzugefügt! 🎉</h1>
      <p style={subStyle}>Möchtest du weitere Standorte deiner Kette <strong>{chainName}</strong> registrieren?</p>

      <div style={{ marginTop: 20, padding: "16px", backgroundColor: "#f0fdf4", borderRadius: 12, border: "1.5px solid #bbf7d0", marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d", margin: "0 0 8px" }}>✅ Registrierte Standorte ({businesses.length}):</p>
        {businesses.map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < businesses.length - 1 ? "1px solid #dcfce7" : "none" }}>
            <span style={{ fontSize: 12, color: "#16a34a" }}>✓</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0 }}>{b.name}</p>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{b.address}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={handleAddAnother} style={{ ...primaryBtn, width: "100%" }}>
          + Weiteren Standort hinzufügen
        </button>
        <button onClick={handleFinish} style={{ ...secondaryBtn, width: "100%" }}>
          Fertig — zum Dashboard →
        </button>
      </div>
    </PageShell>
  );

  // ── STEP: DONE ──
  if (step === "done") return (
    <PageShell progress={100}>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
        <h1 style={{ ...headingStyle, textAlign: "center" }}>Alles bereit!</h1>
        <p style={{ ...subStyle, textAlign: "center", marginBottom: 32 }}>
          Dein Betrieb ist registriert. Du kannst jetzt Bewertungen sammeln und verwalten.
        </p>
        {businesses[0] && (
          <div style={{ backgroundColor: "#f5f3ff", border: "1.5px solid #e0e7ff", borderRadius: 14, padding: 20, marginBottom: 28, textAlign: "left" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#6366f1", margin: "0 0 6px" }}>✅ Registriert:</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{businesses[0].name}</p>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>📍 {businesses[0].address}</p>
          </div>
        )}
        <button onClick={handleFinish} style={{ ...primaryBtn, width: "100%", fontSize: 16, padding: "16px" }}>
          Zum Dashboard → Bewertungen sammeln
        </button>
      </div>
    </PageShell>
  );

  return null;
}

// ── PLACE CARD ──
function PlaceCard({ place, onSelect }: { place: Place; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 16px",
        backgroundColor: hovered ? "#f5f3ff" : "#ffffff",
        border: hovered ? "2px solid #6366f1" : "2px solid #e2e8f0",
        borderRadius: 12, cursor: "pointer", textAlign: "left", width: "100%",
        transition: "all 0.15s", fontFamily: "inherit",
      }}
    >
      {place.photo_url ? (
        <img src={place.photo_url} alt={place.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
      ) : (
        <div style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🏪</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 3px" }}>{place.name}</p>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 6px", lineHeight: 1.4 }}>📍 {place.address}</p>
        {place.rating && (
          <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>
            {"★".repeat(Math.round(place.rating))} {place.rating} ({place.total_ratings?.toLocaleString("de")})
          </span>
        )}
      </div>
      <span style={{ fontSize: 20, color: hovered ? "#6366f1" : "#e2e8f0", flexShrink: 0, alignSelf: "center" }}>→</span>
    </button>
  );
}

// ── MODE CARD ──
function ModeCard({ emoji, title, desc, onClick, highlight }: { emoji: string; title: string; desc: string; onClick: () => void; highlight?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", gap: 16, alignItems: "center", padding: "20px 24px",
        backgroundColor: highlight ? (hovered ? "#f5f3ff" : "#faf5ff") : (hovered ? "#f8fafc" : "#ffffff"),
        border: `2px solid ${highlight ? (hovered ? "#6366f1" : "#c4b5fd") : (hovered ? "#6366f1" : "#e2e8f0")}`,
        borderRadius: 14, cursor: "pointer", textAlign: "left", width: "100%",
        transition: "all 0.15s", fontFamily: "inherit",
        boxShadow: hovered ? "0 4px 16px rgba(99,102,241,0.12)" : "none",
      }}
    >
      <span style={{ fontSize: 36, flexShrink: 0 }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>{title}</p>
        <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{desc}</p>
      </div>
      <span style={{ fontSize: 20, color: hovered ? "#6366f1" : "#cbd5e1" }}>→</span>
    </button>
  );
}

// ── PAGE SHELL ──
function PageShell({ children, progress }: { children: React.ReactNode; progress: number }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px" }}>
      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px" }}>
          Review<span style={{ color: "#6366f1" }}>Boost</span>
        </span>
        {/* Progress Bar */}
        <div style={{ width: 200, height: 4, backgroundColor: "#e2e8f0", borderRadius: 999, marginTop: 16, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "#6366f1", borderRadius: 999, transition: "width 0.4s ease" }} />
        </div>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 560, backgroundColor: "#ffffff", borderRadius: 20, padding: "40px 36px", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9" }}>
        {children}
      </div>
    </div>
  );
}

const headingStyle: React.CSSProperties = { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.5px" };
const subStyle: React.CSSProperties = { fontSize: 15, color: "#64748b", margin: 0, lineHeight: 1.6 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#0f172a", backgroundColor: "#f8fafc" };
const primaryBtn: React.CSSProperties = { padding: "13px 24px", backgroundColor: "#6366f1", color: "#ffffff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" };
const secondaryBtn: React.CSSProperties = { padding: "13px 20px", backgroundColor: "#ffffff", color: "#475569", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const backBtn: React.CSSProperties = { background: "none", border: "none", color: "#6366f1", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: "0 0 16px", display: "block" };
