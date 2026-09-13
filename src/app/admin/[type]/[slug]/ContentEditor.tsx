"use client";

import { useState } from "react";
import Link from "next/link";
import type { FixedField, I18nField } from "@/lib/admin/content-types";

type Dict = Record<string, string>;
type Issue = { field: string; locale?: string; message: string; level: "error" | "warning" };

const LANGS = [
  { code: "en", label: "إنجليزي", dir: "ltr" as const },
  { code: "ar", label: "عربي", dir: "rtl" as const },
];

/**
 * One editor for every content type, drawn from the type's field definition.
 * Two language tabs for the text you write; the fixed fields (images, flags)
 * sit below, shared across languages. Save validates server-side and shows the
 * reasons, in Arabic, before anything is written.
 */
export default function ContentEditor({
  type, slug, fixedFields, i18nFields, labelAr, initialFixed, initialI18n,
}: {
  type: string; slug: string;
  fixedFields: FixedField[]; i18nFields: I18nField[]; labelAr: string;
  initialFixed: Record<string, unknown>;
  initialI18n: Record<string, Dict>;
}) {
  const [lang, setLang] = useState("en");
  const [fixed, setFixed] = useState<Record<string, unknown>>(initialFixed);
  const [i18n, setI18n] = useState<Record<string, Dict>>(initialI18n);
  const [saving, setSaving] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [saved, setSaved] = useState(false);

  const setText = (key: string, v: string) =>
    setI18n((prev) => ({ ...prev, [key]: { ...prev[key], [lang]: v } }));
  const setFixedVal = (key: string, v: unknown) =>
    setFixed((prev) => ({ ...prev, [key]: v }));

  async function save() {
    setSaving(true); setSaved(false); setIssues([]);
    try {
      const res = await fetch(`/api/admin/content/${type}/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fixed, data: i18n }),
      });
      const out = await res.json();
      if (!res.ok) { setIssues(out.issues || [{ field: "", message: out.error || "خطأ", level: "error" }]); return; }
      setIssues(out.issues || []);
      setSaved(true);
    } catch {
      setIssues([{ field: "", message: "تعذّر الاتصال بالخادم", level: "error" }]);
    } finally {
      setSaving(false);
    }
  }

  const dir = LANGS.find((l) => l.code === lang)!.dir;
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const lbl = { fontSize: 13, color: "var(--muted)" } as const;
  const title = i18n.title?.ar || i18n.title?.en || slug;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Link href={`/admin/${type}`} style={{ fontSize: 13, color: "var(--muted)" }}>← {labelAr}</Link>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, flex: 1,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</h1>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {LANGS.map((l) => (
          <button key={l.code} onClick={() => setLang(l.code)}
            style={{ padding: "7px 18px", fontSize: 14,
              background: lang === l.code ? "var(--accent)" : "var(--panel)",
              color: lang === l.code ? "var(--accent-ink)" : "var(--ink)",
              borderColor: lang === l.code ? "var(--accent)" : "var(--line)" }}>
            {l.label}
          </button>
        ))}
        <span style={{ marginInlineStart: "auto", alignSelf: "center", fontSize: 12, color: "var(--faint)" }}>
          باقي اللغات بتترجم آلياً من الإنجليزي
        </span>
      </div>

      {/* translatable fields */}
      {i18nFields.map((f) => (
        <div key={f.key} style={{ display: "grid", gap: 6, marginBottom: 16 }}>
          <span style={lbl}>{f.label}{f.required && lang === "en" ? " *" : ""}</span>
          {f.type === "text" ? (
            <input dir={dir} value={i18n[f.key]?.[lang] || ""} onChange={(e) => setText(f.key, e.target.value)} />
          ) : (
            <textarea dir={dir} rows={f.type === "html" ? 12 : 3}
              style={f.type === "html" ? { fontFamily: "ui-monospace, monospace", fontSize: 13 } : undefined}
              value={i18n[f.key]?.[lang] || ""} onChange={(e) => setText(f.key, e.target.value)} />
          )}
        </div>
      ))}

      {/* fixed fields */}
      <div style={{ borderTop: "1px solid var(--line)", marginTop: 8, paddingTop: 18, display: "grid", gap: 16 }}>
        {fixedFields.map((f) => (
          f.type === "bool" ? (
            <label key={f.key} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
              <input type="checkbox" checked={Boolean(fixed[f.key])}
                onChange={(e) => setFixedVal(f.key, e.target.checked)} style={{ width: 18, height: 18 }} />
              {f.label}
            </label>
          ) : (
            <div key={f.key} style={{ display: "grid", gap: 6 }}>
              <span style={lbl}>{f.label}</span>
              <input dir={f.type === "text" && f.key.includes("category") ? undefined : "ltr"}
                type={f.type === "number" ? "number" : "text"}
                style={f.type === "emoji" ? { textAlign: "center", maxWidth: 90 } : undefined}
                value={String(fixed[f.key] ?? "")} onChange={(e) => setFixedVal(f.key, e.target.value)} />
            </div>
          )
        ))}
      </div>

      {errors.length > 0 && (
        <div style={{ marginTop: 18, background: "color-mix(in srgb, var(--danger) 15%, transparent)",
          border: "1px solid var(--danger)", borderRadius: 8, padding: "12px 14px" }}>
          <strong style={{ color: "var(--danger)", fontSize: 14 }}>لازم تتصلح قبل الحفظ:</strong>
          <ul style={{ margin: "8px 0 0", paddingInlineStart: 20, fontSize: 13 }}>
            {errors.map((i, n) => <li key={n} style={{ color: "var(--danger)" }}>{i.message}</li>)}
          </ul>
        </div>
      )}
      {warnings.length > 0 && (
        <div style={{ marginTop: 12, background: "color-mix(in srgb, var(--warn) 14%, transparent)",
          border: "1px solid var(--warn)", borderRadius: 8, padding: "12px 14px" }}>
          <ul style={{ margin: 0, paddingInlineStart: 20, fontSize: 13 }}>
            {warnings.map((i, n) => <li key={n} style={{ color: "var(--warn)" }}>{i.message}</li>)}
          </ul>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22 }}>
        <button className="primary" onClick={save} disabled={saving}>{saving ? "بيتحفظ…" : "حفظ"}</button>
        {saved && errors.length === 0 && <span style={{ color: "var(--ok)", fontSize: 14 }}>✓ اتحفظ</span>}
      </div>
    </div>
  );
}
