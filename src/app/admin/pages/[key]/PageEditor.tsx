"use client";

import { useState } from "react";
import Link from "next/link";
import type { SingletonGroup } from "@/lib/admin/singleton-fields";

type Val = { en: string; ar: string };
type Issue = { field: string; locale?: string; message: string; level: "error" | "warning" };

const LANGS = [
  { code: "en" as const, label: "إنجليزي", dir: "ltr" as const },
  { code: "ar" as const, label: "عربي", dir: "rtl" as const },
];

/**
 * Editor for a one-off page: the declared fields, grouped, each with English
 * and Arabic under the language tabs. Same save-and-validate contract as the
 * content editor, so broken text is refused here too.
 */
export default function PageEditor({
  keyName, labelAr, groups, initial,
}: {
  keyName: string; labelAr: string; groups: SingletonGroup[]; initial: Record<string, Val>;
}) {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [values, setValues] = useState<Record<string, Val>>(initial);
  const [saving, setSaving] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [saved, setSaved] = useState(false);

  const set = (path: string, v: string) =>
    setValues((prev) => ({ ...prev, [path]: { ...prev[path], [lang]: v } }));

  async function save() {
    setSaving(true); setSaved(false); setIssues([]);
    try {
      const res = await fetch(`/api/admin/pages/${keyName}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: values }),
      });
      const out = await res.json();
      if (!res.ok) { setIssues(out.issues || [{ field: "", message: out.error || "خطأ", level: "error" }]); return; }
      setIssues(out.issues || []); setSaved(true);
    } catch {
      setIssues([{ field: "", message: "تعذّر الاتصال بالخادم", level: "error" }]);
    } finally { setSaving(false); }
  }

  const dir = LANGS.find((l) => l.code === lang)!.dir;
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const lbl = { fontSize: 13, color: "var(--muted)" } as const;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Link href="/admin/pages" style={{ fontSize: 13, color: "var(--muted)" }}>← الصفحات</Link>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{labelAr}</h1>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {LANGS.map((l) => (
          <button key={l.code} onClick={() => setLang(l.code)}
            style={{ padding: "7px 18px", fontSize: 14,
              background: lang === l.code ? "var(--accent)" : "var(--panel)",
              color: lang === l.code ? "var(--accent-ink)" : "var(--ink)",
              borderColor: lang === l.code ? "var(--accent)" : "var(--line)" }}>{l.label}</button>
        ))}
        <span style={{ marginInlineStart: "auto", alignSelf: "center", fontSize: 12, color: "var(--faint)" }}>
          باقي اللغات بتترجم آلياً من الإنجليزي
        </span>
      </div>

      {groups.map((g) => (
        <section key={g.title} style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)", margin: "0 0 12px",
            borderBottom: "1px solid var(--line)", paddingBottom: 6 }}>{g.title}</h2>
          {g.fields.map((f) => (
            <div key={f.path} style={{ display: "grid", gap: 6, marginBottom: 14 }}>
              <span style={lbl}>{f.label}</span>
              {f.type === "text" ? (
                <input dir={f.ltr ? "ltr" : dir} value={values[f.path]?.[lang] || ""} onChange={(e) => set(f.path, e.target.value)} />
              ) : (
                <textarea dir={f.ltr ? "ltr" : dir} rows={3} value={values[f.path]?.[lang] || ""} onChange={(e) => set(f.path, e.target.value)} />
              )}
            </div>
          ))}
        </section>
      ))}

      {errors.length > 0 && (
        <div style={{ marginTop: 4, background: "color-mix(in srgb, var(--danger) 15%, transparent)",
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
