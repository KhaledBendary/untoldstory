"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FixedField, I18nField } from "@/lib/admin/content-types";
import ImagePicker from "@/app/admin/ImagePicker";
import RichTextEditor from "@/app/admin/RichTextEditor";

type Dict = Record<string, string>;
type Issue = { field: string; locale?: string; message: string; level: "error" | "warning" };

const LANGS = [
  { code: "en", label: "إنجليزي", dir: "ltr" as const },
  { code: "ar", label: "عربي", dir: "rtl" as const },
];

/** Turn the server's deploy result into a friendly line for the editor. */
export function deployMessage(deploy?: { triggered?: boolean; reason?: string }): string {
  if (!deploy) return "";
  if (deploy.triggered) return "🚀 بدأ نشر الموقع — التعديلات هتظهر خلال دقيقة–دقيقتين";
  if (deploy.reason === "cooldown") return "⏳ فيه نشر شغّال — تعديلاتك هتلحق البناء الحالي، أو اضغط «نشر الموقع» من اللوحة";
  if (deploy.reason === "not-configured") return "";
  return "⚠️ اتحفظ، بس النشر التلقائي ما اشتغلش — اضغط «نشر الموقع» من اللوحة";
}

/** Recommended max length for the SEO fields, so the counter can flag overflow. */
function seoIdeal(key: string): number | null {
  if (key === "seo.metaTitle") return 60;
  if (key === "seo.metaDescription") return 160;
  return null;
}

/**
 * One editor for every content type, drawn from the type's field definition.
 * Two language tabs for the text you write; the fixed fields (images, flags)
 * sit below, shared across languages. Save validates server-side and shows the
 * reasons, in Arabic, before anything is written.
 */
export default function ContentEditor({
  type, slug, fixedFields, i18nFields, labelAr, initialFixed, initialI18n, create = false, initialStatus = "published",
}: {
  type: string; slug: string;
  fixedFields: FixedField[]; i18nFields: I18nField[]; labelAr: string;
  initialFixed: Record<string, unknown>;
  initialI18n: Record<string, Dict>;
  create?: boolean;
  initialStatus?: string;
}) {
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const [newSlug, setNewSlug] = useState("");
  const [fixed, setFixed] = useState<Record<string, unknown>>(initialFixed);
  const [i18n, setI18n] = useState<Record<string, Dict>>(initialI18n);
  const [status, setStatus] = useState<"published" | "draft">(create ? "draft" : (initialStatus === "draft" ? "draft" : "published"));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [saved, setSaved] = useState(false);
  const [transWarn, setTransWarn] = useState<string>("");
  const [deployNote, setDeployNote] = useState<string>("");
  const [dirty, setDirty] = useState(false);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const setText = (key: string, v: string) => {
    setDirty(true);
    setI18n((prev) => ({ ...prev, [key]: { ...prev[key], [lang]: v } }));
  };
  const setFixedVal = (key: string, v: unknown) => {
    setDirty(true);
    setFixed((prev) => ({ ...prev, [key]: v }));
  };

  async function save() {
    setSaving(true); setSaved(false); setIssues([]); setTransWarn(""); setDeployNote("");
    try {
      const res = await fetch(
        create ? `/api/admin/content/${type}` : `/api/admin/content/${type}/${slug}`,
        {
          method: create ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(create ? { slug: newSlug, fixed, data: i18n, status } : { fixed, data: i18n, status }),
        },
      );
      const out = await res.json();
      if (!res.ok) { setIssues(out.issues || [{ field: "", message: out.error || "خطأ", level: "error" }]); return; }
      setDirty(false);
      if (create) { router.push(`/admin/${type}/${out.slug}`); return; }
      setIssues(out.issues || []);
      setTransWarn(out.translationWarning || "");
      setDeployNote(deployMessage(out.deploy));
      setSaved(true);
    } catch {
      setIssues([{ field: "", message: "تعذّر الاتصال بالخادم", level: "error" }]);
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    if (!confirm(`متأكد إنك عايز تمسح "${title}" نهائياً؟ مش هينفع ترجع فيها.`)) return;
    setDeleting(true); setIssues([]);
    try {
      const res = await fetch(`/api/admin/content/${type}/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const out = await res.json().catch(() => ({}));
        setIssues([{ field: "", message: out.error || "فشل الحذف", level: "error" }]);
        return;
      }
      router.push(`/admin/${type}`);
    } catch {
      setIssues([{ field: "", message: "تعذّر الاتصال بالخادم", level: "error" }]);
    } finally {
      setDeleting(false);
    }
  }

  const dir = LANGS.find((l) => l.code === lang)!.dir;
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const lbl = { fontSize: 13, color: "var(--muted)" } as const;
  const title = create ? `${labelAr} — جديد` : (i18n.title?.ar || i18n.title?.en || slug);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Link href={`/admin/${type}`} style={{ fontSize: 13, color: "var(--muted)" }}>← {labelAr}</Link>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, flex: 1,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</h1>
        {!create && (
          <Link href={`/admin/${type}/${slug}/preview`} target="_blank"
            style={{ fontSize: 13, color: "var(--muted)", border: "1px solid var(--line)", borderRadius: 8, padding: "6px 12px" }}>
            معاينة ↗
          </Link>
        )}
      </div>

      {/* publish state */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18,
        background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px" }}>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>الحالة:</span>
        <span style={{ fontSize: 12, fontWeight: 600, borderRadius: 20, padding: "3px 10px",
          color: status === "published" ? "var(--ok)" : "var(--warn)",
          border: `1px solid ${status === "published" ? "var(--ok)" : "var(--warn)"}` }}>
          {status === "published" ? "منشور" : "مسودّة"}
        </span>
        <button onClick={() => { setDirty(true); setStatus((s) => (s === "published" ? "draft" : "published")); }}
          style={{ marginInlineStart: "auto", fontSize: 12, padding: "6px 12px" }}>
          {status === "published" ? "رجّعها مسودّة" : "علّمها للنشر"}
        </button>
      </div>

      {create && (
        <div style={{ display: "grid", gap: 6, marginBottom: 18 }}>
          <span style={lbl}>المعرّف (slug) *</span>
          <input dir="ltr" placeholder="my-new-service" value={newSlug}
            onChange={(e) => { setDirty(true); setNewSlug(e.target.value.toLowerCase()); }} />
        </div>
      )}

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
      </div>

      {/* translatable fields */}
      {i18nFields.map((f) => (
        <div key={f.key} style={{ display: "grid", gap: 6, marginBottom: 16 }}>
          <span style={lbl}>{f.label}{f.required && lang === "en" ? " *" : ""}</span>
          {f.type === "text" ? (
            <input dir={dir} value={i18n[f.key]?.[lang] || ""} onChange={(e) => setText(f.key, e.target.value)} />
          ) : f.type === "html" ? (
            <RichTextEditor dir={dir} value={i18n[f.key]?.[lang] || ""} onChange={(html) => setText(f.key, html)} />
          ) : (
            <textarea dir={dir} rows={3} value={i18n[f.key]?.[lang] || ""} onChange={(e) => setText(f.key, e.target.value)} />
          )}
          {seoIdeal(f.key) && (() => {
            const len = (i18n[f.key]?.[lang] || "").length;
            const max = seoIdeal(f.key)!;
            const ok = len > 0 && len <= max;
            return <span style={{ fontSize: 11, color: len > max ? "var(--warn)" : ok ? "var(--ok)" : "var(--faint)", textAlign: "start" }}>
              {len} / {max} حرف {len > max ? "· أطول من المفضّل" : ""}
            </span>;
          })()}
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
          ) : f.type === "image" ? (
            <div key={f.key} style={{ display: "grid", gap: 6 }}>
              <span style={lbl}>{f.label}</span>
              <ImagePicker value={String(fixed[f.key] ?? "")} onChange={(url) => setFixedVal(f.key, url)} />
            </div>
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

      {saved && transWarn && (
        <div style={{ marginTop: 12, background: "color-mix(in srgb, var(--warn) 14%, transparent)",
          border: "1px solid var(--warn)", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "var(--warn)" }}>
          {transWarn}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22 }}>
        <button className="primary" onClick={save} disabled={saving || deleting}>
          {saving ? (create ? "بيتنشئ ويترجم…" : "بيتحفظ ويترجم…") : (create ? "إنشاء" : "حفظ")}
        </button>
        {saved && errors.length === 0 && (
          <span style={{ color: "var(--ok)", fontSize: 14 }}>
            {transWarn ? "✓ اتحفظ" : "✓ اتحفظ واتترجم للغات السبعة"}
          </span>
        )}
        {saved && deployNote && (
          <span style={{ fontSize: 13, color: "var(--muted)", width: "100%", order: 9 }}>{deployNote}</span>
        )}
        {!create && (
          <button onClick={del} disabled={saving || deleting}
            style={{ marginInlineStart: "auto", color: "var(--danger)", borderColor: "var(--danger)" }}>
            {deleting ? "بيتمسح…" : "حذف"}
          </button>
        )}
      </div>
    </div>
  );
}
