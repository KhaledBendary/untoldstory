"use client";

import { useState } from "react";
import Link from "next/link";

type Dict = Record<string, string>;
type Initial = {
  icon: string; image_url: string; price: string; is_featured: boolean;
  title: Dict; shortDesc: Dict; fullDesc: Dict;
};
type Issue = { field: string; locale?: string; message: string; level: "error" | "warning" };

const LANGS = [
  { code: "en", label: "إنجليزي", dir: "ltr" as const },
  { code: "ar", label: "عربي", dir: "rtl" as const },
];

/**
 * The service editor. Two language tabs — English and Arabic, the two you
 * write; the rest are generated. Save runs server-side validation and shows
 * exactly what is wrong, in Arabic, before anything is written.
 */
export default function ServiceEditor({ slug, initial }: { slug: string; initial: Initial }) {
  const [lang, setLang] = useState("en");
  const [icon, setIcon] = useState(initial.icon);
  const [imageUrl, setImageUrl] = useState(initial.image_url);
  const [price, setPrice] = useState(initial.price);
  const [featured, setFeatured] = useState(initial.is_featured);
  const [title, setTitle] = useState<Dict>(initial.title);
  const [shortDesc, setShortDesc] = useState<Dict>(initial.shortDesc);
  const [fullDesc, setFullDesc] = useState<Dict>(initial.fullDesc);

  const [saving, setSaving] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [saved, setSaved] = useState(false);

  const set = (setter: (v: Dict) => void, current: Dict) => (v: string) =>
    setter({ ...current, [lang]: v });

  async function save() {
    setSaving(true); setSaved(false); setIssues([]);
    try {
      const res = await fetch(`/api/admin/services/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icon, image_url: imageUrl, price, is_featured: featured, title, shortDesc, fullDesc }),
      });
      const data = await res.json();
      if (!res.ok) { setIssues(data.issues || [{ field: "", message: data.error || "خطأ", level: "error" }]); return; }
      setIssues(data.issues || []);
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
  const fieldStyle = { display: "grid", gap: 6, marginBottom: 16 } as const;
  const lblStyle = { fontSize: 13, color: "var(--muted)" } as const;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Link href="/admin/services" style={{ fontSize: 13, color: "var(--muted)" }}>← الخدمات</Link>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, flex: 1 }}>
          {title.ar || title.en || slug}
        </h1>
      </div>

      {/* language tabs */}
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

      {/* translatable fields for the active language */}
      <div style={fieldStyle}>
        <span style={lblStyle}>العنوان</span>
        <input dir={dir} value={title[lang] || ""} onChange={(e) => set(setTitle, title)(e.target.value)} />
      </div>
      <div style={fieldStyle}>
        <span style={lblStyle}>الوصف المختصر</span>
        <textarea dir={dir} rows={2} value={shortDesc[lang] || ""} onChange={(e) => set(setShortDesc, shortDesc)(e.target.value)} />
      </div>
      <div style={fieldStyle}>
        <span style={lblStyle}>الوصف الكامل (HTML)</span>
        <textarea dir={dir} rows={12} style={{ fontFamily: "ui-monospace, monospace", fontSize: 13 }}
          value={fullDesc[lang] || ""} onChange={(e) => set(setFullDesc, fullDesc)(e.target.value)} />
      </div>

      {/* fixed fields, shared across languages */}
      <div style={{ borderTop: "1px solid var(--line)", marginTop: 8, paddingTop: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <span style={lblStyle}>الأيقونة</span>
            <input value={icon} onChange={(e) => setIcon(e.target.value)} style={{ textAlign: "center" }} />
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <span style={lblStyle}>السعر</span>
            <input dir="ltr" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>
        <div style={fieldStyle}>
          <span style={lblStyle}>رابط الصورة</span>
          <input dir="ltr" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} style={{ width: 18, height: 18 }} />
          خدمة مميّزة
        </label>
      </div>

      {/* validation feedback */}
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
        <button className="primary" onClick={save} disabled={saving}>
          {saving ? "بيتحفظ…" : "حفظ"}
        </button>
        {saved && errors.length === 0 && (
          <span style={{ color: "var(--ok)", fontSize: 14 }}>✓ اتحفظ</span>
        )}
      </div>
    </div>
  );
}
