"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Business = { id: string; name: string; google_review_url: string | null; address: string | null; logo_url: string | null; brand_color: string | null };

export default function SettingsSection({ userId, userEmail, userName }: { userId: string; userEmail: string; userName: string }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingBiz, setLoadingBiz] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);
  const [logoUploaded, setLogoUploaded] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ inserted: number; skipped: number; totalOnGoogle: number; businessName: string; businessRating: number; note?: string | null } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(userName);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [deletingBiz, setDeletingBiz] = useState<string | null>(null);
  const [editingBiz, setEditingBiz] = useState<Business | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [savingBiz, setSavingBiz] = useState(false);
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("businesses").select("id,name,google_review_url,address,logo_url,brand_color").eq("user_id", userId).order("created_at");
      setBusinesses(data || []);
      setLoadingBiz(false);

      // Load Google API Key from localStorage
      const saved = localStorage.getItem(`google_api_key_${userId}`);
      if (saved) setGoogleApiKey(saved);
    }
    load();
  }, [userId]);

  async function handleLogoUpload(bizId: string, file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) { alert("Logo darf maximal 2 MB groß sein."); return; }
    setUploadingLogo(bizId);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/${bizId}.${ext}`;
    const { error: upErr } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    if (upErr) { alert("Upload fehlgeschlagen: " + upErr.message); setUploadingLogo(null); return; }
    const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
    const logoUrl = urlData.publicUrl;
    await supabase.from("businesses").update({ logo_url: logoUrl }).eq("id", bizId);
    setBusinesses((prev) => prev.map((b) => b.id === bizId ? { ...b, logo_url: logoUrl } : b));
    setLogoUploaded(bizId);
    setTimeout(() => setLogoUploaded(null), 3000);
    setUploadingLogo(null);
  }

  async function handleRemoveLogo(bizId: string) {
    const supabase = createClient();
    await supabase.from("businesses").update({ logo_url: null }).eq("id", bizId);
    setBusinesses((prev) => prev.map((b) => b.id === bizId ? { ...b, logo_url: null } : b));
  }

  async function handleBrandColor(bizId: string, color: string) {
    const supabase = createClient();
    await supabase.from("businesses").update({ brand_color: color }).eq("id", bizId);
    setBusinesses((prev) => prev.map((b) => b.id === bizId ? { ...b, brand_color: color } : b));
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSavingProfile(true);
    const supabase = createClient();
    await supabase.from("users").update({ name: displayName.trim() }).eq("id", userId);
    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    if (newPw.length < 8) { setPwError("Passwort muss mindestens 8 Zeichen haben."); return; }
    if (newPw !== confirmPw) { setPwError("Passwörter stimmen nicht überein."); return; }
    setSavingPw(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { setPwError(error.message); }
    else { setPwSuccess(true); setCurrentPw(""); setNewPw(""); setConfirmPw(""); setTimeout(() => setPwSuccess(false), 3000); }
    setSavingPw(false);
  }

  async function handleDeleteBusiness(id: string) {
    if (!confirm("Betrieb wirklich löschen? Alle zugehörigen Daten werden entfernt.")) return;
    setDeletingBiz(id);
    const supabase = createClient();
    await supabase.from("businesses").delete().eq("id", id);
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
    setDeletingBiz(null);
  }

  function openEditBiz(b: Business) {
    setEditingBiz(b);
    setEditName(b.name);
    setEditUrl(b.google_review_url || "");
  }

  async function handleSaveBiz(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBiz || !editName.trim()) return;
    setSavingBiz(true);
    const supabase = createClient();
    await supabase.from("businesses").update({ name: editName.trim(), google_review_url: editUrl.trim() || null }).eq("id", editingBiz.id);
    setBusinesses((prev) => prev.map((b) => b.id === editingBiz.id ? { ...b, name: editName.trim(), google_review_url: editUrl.trim() || null } : b));
    setEditingBiz(null);
    setSavingBiz(false);
  }

  async function handleSaveApiKey(e: React.FormEvent) {
    e.preventDefault();
    setSavingApiKey(true);
    localStorage.setItem(`google_api_key_${userId}`, googleApiKey.trim());
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2500);
    setSavingApiKey(false);
  }

  return (
    <div style={{ maxWidth: 780, display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>⚙️ Einstellungen</h2>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Verwalte dein Profil, deine Betriebe und Sicherheitseinstellungen.</p>
      </div>

      {/* Profile */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 28, border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 18px" }}>👤 Profil</h3>
        <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Anzeigename</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#f8fafc", color: "#0f172a" }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>E-Mail-Adresse</label>
            <input
              value={userEmail}
              disabled
              style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#f1f5f9", color: "#94a3b8" }}
            />
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>E-Mail-Adresse kann nicht geändert werden.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="submit" disabled={savingProfile} style={{ padding: "10px 22px", borderRadius: 10, border: "none", backgroundColor: savingProfile ? "#a5b4fc" : "#6366f1", color: "#fff", fontSize: 14, fontWeight: 700, cursor: savingProfile ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {savingProfile ? "Speichert..." : "Speichern"}
            </button>
            {profileSaved && <span style={{ fontSize: 13, color: "#15803d", fontWeight: 600 }}>✓ Gespeichert</span>}
          </div>
        </form>
      </div>

      {/* Password */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 28, border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 18px" }}>🔒 Passwort ändern</h3>
        {pwSuccess && (
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", marginBottom: 14, color: "#15803d", fontSize: 14, fontWeight: 600 }}>
            ✓ Passwort erfolgreich geändert.
          </div>
        )}
        {pwError && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 14, color: "#dc2626", fontSize: 14 }}>
            {pwError}
          </div>
        )}
        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Neues Passwort", value: newPw, setter: setNewPw, placeholder: "Mindestens 8 Zeichen" },
            { label: "Passwort bestätigen", value: confirmPw, setter: setConfirmPw, placeholder: "Passwort wiederholen" },
          ].map((f) => (
            <div key={f.label}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{f.label}</label>
              <input
                type="password"
                value={f.value}
                onChange={(e) => f.setter(e.target.value)}
                required
                placeholder={f.placeholder}
                style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#f8fafc", color: "#0f172a" }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>
          ))}
          <div>
            <button type="submit" disabled={savingPw} style={{ padding: "10px 22px", borderRadius: 10, border: "none", backgroundColor: savingPw ? "#a5b4fc" : "#6366f1", color: "#fff", fontSize: 14, fontWeight: 700, cursor: savingPw ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {savingPw ? "Ändert..." : "Passwort ändern"}
            </button>
          </div>
        </form>
      </div>

      {/* Businesses */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 28, border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>🏪 Meine Betriebe</h3>
          <a href="/onboarding" style={{ padding: "8px 16px", backgroundColor: "#6366f1", color: "#fff", textDecoration: "none", borderRadius: 9, fontSize: 13, fontWeight: 700 }}>+ Betrieb hinzufügen</a>
        </div>

        {loadingBiz ? (
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Lade...</p>
        ) : businesses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 24px", backgroundColor: "#f8fafc", borderRadius: 12, border: "2px dashed #e2e8f0" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#475569", margin: "0 0 8px" }}>Noch kein Betrieb eingerichtet</p>
            <a href="/onboarding" style={{ fontSize: 14, color: "#6366f1", fontWeight: 700 }}>Jetzt einrichten →</a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {businesses.map((b) => (
              <div key={b.id}>
                {editingBiz?.id === b.id ? (
                  <form onSubmit={handleSaveBiz} style={{ backgroundColor: "#f8fafc", borderRadius: 12, padding: 18, border: "2px solid #6366f1", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Betriebsname</label>
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} required style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#fff" }} onFocus={(e) => (e.target.style.borderColor = "#6366f1")} onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Google Review-Link</label>
                      <input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} placeholder="https://g.page/r/..." style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#fff" }} onFocus={(e) => (e.target.style.borderColor = "#6366f1")} onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="submit" disabled={savingBiz} style={{ padding: "8px 18px", borderRadius: 9, border: "none", backgroundColor: "#6366f1", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{savingBiz ? "..." : "Speichern"}</button>
                      <button type="button" onClick={() => setEditingBiz(null)} style={{ padding: "8px 14px", borderRadius: 9, border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Abbrechen</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ backgroundColor: "#f8fafc", borderRadius: 14, border: "1px solid #e8edf3", overflow: "hidden" }}>
                    {/* Top row: logo + info + actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px" }}>
                      {/* Logo preview */}
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        {b.logo_url ? (
                          <img src={b.logo_url} alt={b.name} style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", border: "2px solid #e0e7ff", display: "block" }} />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 12, background: b.brand_color ? `linear-gradient(135deg, ${b.brand_color}, ${b.brand_color}99)` : "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff" }}>
                            {b.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</p>
                        {b.address && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {b.address}</p>}
                        {logoUploaded === b.id && <p style={{ fontSize: 12, color: "#15803d", fontWeight: 600, margin: "3px 0 0" }}>✓ Logo gespeichert!</p>}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button onClick={() => openEditBiz(b)} style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e0e7ff", backgroundColor: "#eef2ff", color: "#4338ca", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>✏️</button>
                        <button onClick={() => handleDeleteBusiness(b.id)} disabled={deletingBiz === b.id} style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid #fecaca", backgroundColor: "#fef2f2", color: "#dc2626", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                          {deletingBiz === b.id ? "..." : "✕"}
                        </button>
                      </div>
                    </div>

                    {/* Logo + Farbe Upload Row */}
                    <div style={{ borderTop: "1px solid #e8edf3", padding: "14px 18px", backgroundColor: "#fff", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
                      {/* Logo Upload */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <label htmlFor={`logo-${b.id}`} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", backgroundColor: uploadingLogo === b.id ? "#f1f5f9" : "#f8fafc", color: "#374151", fontSize: 12, fontWeight: 600, cursor: uploadingLogo === b.id ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                          {uploadingLogo === b.id ? "⏳ Lädt hoch..." : "🖼️ Logo hochladen"}
                        </label>
                        <input id={`logo-${b.id}`} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(b.id, f); }} />
                        {b.logo_url && (
                          <button onClick={() => handleRemoveLogo(b.id)} style={{ fontSize: 11, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>Logo entfernen</button>
                        )}
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>PNG, JPG · max 2 MB</span>
                      </div>

                      {/* Brand Color */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>🎨 Akzentfarbe:</span>
                        <input
                          type="color"
                          value={b.brand_color || "#6366f1"}
                          onChange={(e) => handleBrandColor(b.id, e.target.value)}
                          style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e2e8f0", cursor: "pointer", padding: 2, backgroundColor: "#fff" }}
                          title="Akzentfarbe für dein Dashboard"
                        />
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{b.brand_color || "#6366f1"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Google Import */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 28, border: "1px solid #e8edf3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
          📥 Google-Bewertungen importieren
        </h3>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 18px", lineHeight: 1.6 }}>
          Google Maps Link deines Betriebs einfügen — wir holen deine Bewertungen automatisch rein.
        </p>

        {importResult && (
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#15803d", margin: "0 0 4px" }}>
              ✓ {importResult.inserted} Bewertungen importiert von „{importResult.businessName}"
            </p>
            <p style={{ fontSize: 12, color: "#166534", margin: "0 0 4px" }}>
              ★ {importResult.businessRating} Schnitt · {importResult.totalOnGoogle} Bewertungen gesamt auf Google
              {importResult.skipped > 0 && ` · ${importResult.skipped} bereits vorhanden`}
            </p>
            {importResult.note && (
              <p style={{ fontSize: 12, color: "#b45309", margin: "8px 0 0", backgroundColor: "#fffbeb", padding: "8px 10px", borderRadius: 7, border: "1px solid #fde68a" }}>
                ⚠ {importResult.note}
              </p>
            )}
          </div>
        )}

        {importError && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 14px", marginBottom: 14, fontSize: 13, color: "#dc2626" }}>
            {importError}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={importUrl}
            onChange={(e) => { setImportUrl(e.target.value); setImportError(null); setImportResult(null); }}
            placeholder="https://www.google.com/maps/place/..."
            style={{ flex: 1, padding: "11px 13px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", backgroundColor: "#f8fafc", outline: "none", color: "#0f172a" }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
          <button
            disabled={importing || !(importUrl.includes("google.com/maps") || importUrl.includes("maps.google.com") || importUrl.includes("goo.gl"))}
            onClick={async () => {
              setImporting(true); setImportError(null); setImportResult(null);
              const res = await fetch("/api/import-google-reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mapsUrl: importUrl }),
              });
              const data = await res.json();
              if (data.success) setImportResult(data);
              else setImportError(data.error || "Import fehlgeschlagen.");
              setImporting(false);
            }}
            style={{ padding: "11px 20px", borderRadius: 10, border: "none", backgroundColor: importing ? "#a5b4fc" : "#6366f1", color: "#fff", fontSize: 14, fontWeight: 700, cursor: importing ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
          >
            {importing ? "Importiere..." : "📥 Importieren"}
          </button>
        </div>
        <p style={{ fontSize: 11, color: "#94a3b8", margin: "8px 0 0" }}>
          💡 Aktuell werden bis zu 5 aktuelle Bewertungen importiert. Vollständiger Import via Google Business Profile kommt bald.
        </p>
      </div>

      {/* Demo Data */}
      <div style={{ backgroundColor: "#fafaf9", borderRadius: 16, padding: 24, border: "1.5px dashed #d1d5db" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>🧪 Testdaten laden</h3>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px", lineHeight: 1.5 }}>
          Lädt 20 realistische Bewertungen für <strong>Marco's Fresh Greek, Wien</strong> — nur für interne Tests. Bestehende Bewertungen werden ersetzt.
        </p>
        {seedDone && (
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 9, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#15803d", fontWeight: 600 }}>
            ✓ 20 Testbewertungen geladen — Dashboard neu laden um sie zu sehen.
          </div>
        )}
        {seedError && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#dc2626" }}>
            {seedError}
          </div>
        )}
        <button
          disabled={seeding}
          onClick={async () => {
            if (!confirm("Achtung: Alle bestehenden Bewertungen werden gelöscht und durch Testdaten ersetzt. Fortfahren?")) return;
            setSeeding(true); setSeedError(null); setSeedDone(false);
            const res = await fetch("/api/seed-demo", { method: "POST" });
            const data = await res.json();
            if (data.success) { setSeedDone(true); }
            else { setSeedError(data.error || "Fehler beim Laden der Testdaten."); }
            setSeeding(false);
          }}
          style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid #d1d5db", backgroundColor: seeding ? "#f3f4f6" : "#ffffff", color: "#374151", fontSize: 13, fontWeight: 700, cursor: seeding ? "not-allowed" : "pointer", fontFamily: "inherit" }}
        >
          {seeding ? "Lädt..." : "🍽 Marco's Fresh Greek laden"}
        </button>
      </div>

      {/* Danger Zone */}
      <div style={{ backgroundColor: "#fff5f5", borderRadius: 16, padding: 24, border: "1.5px solid #fecaca" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#991b1b", margin: "0 0 8px" }}>⚠️ Gefahrenzone</h3>
        <p style={{ fontSize: 13, color: "#b91c1c", margin: "0 0 14px", lineHeight: 1.5 }}>
          Das Löschen deines Kontos entfernt alle Daten dauerhaft und kann nicht rückgängig gemacht werden.
        </p>
        <button
          onClick={() => {
            if (confirm("Möchtest du dein Konto wirklich dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) {
              alert("Bitte wende dich an den Support: support@reviewboost.at");
            }
          }}
          style={{ padding: "9px 18px", borderRadius: 9, border: "1.5px solid #fecaca", backgroundColor: "#fff", color: "#dc2626", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
        >
          Konto löschen
        </button>
      </div>
    </div>
  );
}
