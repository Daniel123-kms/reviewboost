"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Template = { id: string; title: string; content: string; created_at: string };

export default function TemplatesSection({ userId }: { userId: string }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function loadTemplates() {
    const supabase = createClient();
    const { data } = await supabase.from("reply_templates").select("*").order("created_at", { ascending: false });
    setTemplates(data || []);
    setLoading(false);
  }

  useEffect(() => { loadTemplates(); }, []);

  function openNew() { setEditing(null); setTitle(""); setContent(""); setShowForm(true); }
  function openEdit(t: Template) { setEditing(t); setTitle(t.title); setContent(t.content); setShowForm(true); }
  function cancelForm() { setShowForm(false); setEditing(null); setTitle(""); setContent(""); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const supabase = createClient();
    if (editing) {
      await supabase.from("reply_templates").update({ title: title.trim(), content: content.trim() }).eq("id", editing.id);
    } else {
      await supabase.from("reply_templates").insert({ user_id: userId, title: title.trim(), content: content.trim() });
    }
    await loadTemplates();
    cancelForm();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Vorlage wirklich löschen?")) return;
    const supabase = createClient();
    await supabase.from("reply_templates").delete().eq("id", id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const VARIABLES = ["{Name}", "{Plattform}", "{Bewertung}", "{Betrieb}"];

  return (
    <div style={{ maxWidth: 820 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>📝 Antwortvorlagen</h2>
          <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0" }}>Speichere wiederkehrende Antworten und kopiere sie per Klick.</p>
        </div>
        <button onClick={openNew} style={{ padding: "11px 20px", backgroundColor: "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>
          + Neue Vorlage
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "2px solid #6366f1", boxShadow: "0 4px 20px rgba(99,102,241,0.1)", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>
            {editing ? "Vorlage bearbeiten" : "Neue Vorlage erstellen"}
          </h3>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 8px", fontWeight: 500 }}>
              Verfügbare Variablen (werden beim Einfügen ersetzt):
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {VARIABLES.map((v) => (
                <button key={v} type="button" onClick={() => setContent((prev) => prev + v)}
                  style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #e0e7ff", backgroundColor: "#eef2ff", color: "#4338ca", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Titel der Vorlage</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="z.B. Freundliche Dankes-Antwort 5 Sterne"
                style={{ width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#f8fafc" }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")} onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Vorlagentext</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={5}
                placeholder="Liebe/r {Name}, vielen Dank für Ihre {Bewertung}-Sterne-Bewertung auf {Plattform}! ..."
                style={{ width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#f8fafc", resize: "vertical", minHeight: 120 }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")} onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>{content.length} Zeichen</p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={cancelForm} style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Abbrechen</button>
              <button type="submit" disabled={saving} style={{ padding: "10px 22px", borderRadius: 10, border: "none", backgroundColor: saving ? "#a5b4fc" : "#6366f1", color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {saving ? "Speichert..." : editing ? "Speichern" : "Erstellen"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Lade Vorlagen...</div>
      ) : templates.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", backgroundColor: "#ffffff", borderRadius: 16, border: "2px dashed #e2e8f0" }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>📝</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#475569", margin: "0 0 8px" }}>Noch keine Vorlagen</p>
          <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 20px" }}>Erstelle wiederkehrende Antworten für 5-Sterne-Reviews, Entschuldigungen und mehr.</p>
          <button onClick={openNew} style={{ padding: "11px 22px", backgroundColor: "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Erste Vorlage erstellen
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {templates.map((t) => (
            <div key={t.id} style={{ backgroundColor: "#ffffff", borderRadius: 14, padding: "20px 22px", border: "1px solid #e8edf3", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 3px" }}>{t.title}</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                    {new Date(t.created_at).toLocaleDateString("de-AT", { day: "2-digit", month: "short", year: "numeric" })} · {t.content.length} Zeichen
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => handleCopy(t.id, t.content)} style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${copied === t.id ? "#22c55e" : "#e2e8f0"}`, backgroundColor: copied === t.id ? "#f0fdf4" : "#f8fafc", color: copied === t.id ? "#15803d" : "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                    {copied === t.id ? "✓ Kopiert" : "📋 Kopieren"}
                  </button>
                  <button onClick={() => openEdit(t)} style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e0e7ff", backgroundColor: "#eef2ff", color: "#4338ca", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    ✏️ Bearbeiten
                  </button>
                  <button onClick={() => handleDelete(t.id)} style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid #fecaca", backgroundColor: "#fef2f2", color: "#dc2626", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    ✕
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6, backgroundColor: "#f8fafc", padding: "10px 12px", borderRadius: 8, whiteSpace: "pre-wrap" }}>
                {t.content.length > 200 ? t.content.substring(0, 200) + "..." : t.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
