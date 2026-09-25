"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FixedField, I18nField } from "@/lib/admin/content-types";
import ImagePicker from "@/app/admin/ImagePicker";
import RichTextEditor from "@/app/admin/RichTextEditor";
import SeoPanel from "./SeoPanel";
import { LOCALE_CODES, localeDir } from "@/lib/i18n";

type Dict = Record<string, string>;
type Issue = { field: string; locale?: string; message: string; level: "error" | "warning" };

// en/ar are hand-authored; the rest are machine-translated but still viewable
// and editable here so every language can be inspected and corrected.
const LANG_LABEL: Record<string, string> = {
  en: "إنجليزي", ar: "عربي", fr: "فرنسي", de: "ألماني", es: "إسباني", it: "إيطالي",
  pt: "برتغالي", ru: "روسي", tr: "تركي", zh: "صيني", ja: "ياباني", ko: "كوري", pl: "بولندي", sw: "سواحيلي",
};
const LANGS = LOCALE_CODES.map((code) => ({ code, label: LANG_LABEL[code] || code.toUpperCase(), dir: localeDir(code) }));

// Content types that have a public detail page (and therefore an SEO panel).
const PUBLIC_SEO: Record<string, true> = { services: true, projects: true, posts: true };

/** Turn the server's deploy result into a friendly line for the editor. */
export function deployMessage(deploy?: { triggered?: boolean; reason?: string }): string {
  if (!deploy) return "";
  if (deploy.triggered) return "🚀 بدأ نشر الموقع — التعديلات هتظهر خلال دقيقة–دقيقتين";
  if (deploy.reason === "cooldown") return "⏳ فيه نشر شغّال — تعديلاتك هتلحق البناء الحالي، أو اضغط «نشر الموقع» من اللوحة";
  if (deploy.reason === "not-configured") return "";
  return "⚠️ اتحفظ، بس النشر التلقائي ما اشتغلش — اضغط «نشر الموقع» من اللوحة";
}

/** English title → URL-safe slug (lowercase, ascii, dash-separated). */
function slugify(input: string): string {
  return input
    .normalize("NFKD").replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
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
  type, slug, fixedFields, i18nFields, labelAr, initialFixed, initialI18n, create = false, initialStatus = "published", aiEnabled = false, slugs = {},
}: {
  type: string; slug: string;
  fixedFields: FixedField[]; i18nFields: I18nField[]; labelAr: string;
  initialFixed: Record<string, unknown>;
  initialI18n: Record<string, Dict>;
  create?: boolean;
  initialStatus?: string;
  aiEnabled?: boolean;
  // Auto-generated per-locale slug (see translate/apply.ts) — read-only here,
  // shown so the editor can see it's actually working, not editable per
  // language: the field above always edits the real (English/canonical) slug.
  slugs?: Record<string, string>;
}) {
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const [newSlug, setNewSlug] = useState(slug);
  // Once the person edits the slug by hand, stop overwriting it as they keep typing the title.
  const [slugTouched, setSlugTouched] = useState(false);
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
  const [aiBusy, setAiBusy] = useState<string>("");   // "<action>:<key>" while running
  const [aiError, setAiError] = useState<string>("");

  // The main long-form field (for SEO/summary context) and the title field.
  const bodyKey = i18nFields.find((f) => f.type === "html")?.key
    ?? i18nFields.find((f) => f.type === "textarea")?.key ?? "";
  const titleKey = i18nFields.find((f) => f.key === "title")?.key
    ?? i18nFields.find((f) => f.type === "text")?.key ?? "";
  // The short-form field (excerpt / short description) for SEO description fallback.
  const shortKey = i18nFields.find((f) => /excerpt|short/i.test(f.key))?.key ?? "";
  // SEO fields are edited in the dedicated SeoPanel, not the generic loop.
  const contentFields = i18nFields.filter((f) => !f.key.startsWith("seo."));

  // New items only: suggest the slug from the English title as it's typed,
  // until the person edits the slug field themselves. Existing items keep
  // their slug independent of title edits — changing it there is deliberate.
  useEffect(() => {
    if (!create || slugTouched || !titleKey) return;
    setNewSlug(slugify(i18n[titleKey]?.en || ""));
  }, [create, slugTouched, titleKey, i18n]);

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

  /** Call the writing assistant; returns the JSON payload or null on failure. */
  async function callAi(payload: Record<string, unknown>): Promise<Record<string, string> | null> {
    setAiError("");
    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, lang }),
      });
      const out = await res.json();
      if (!res.ok) { setAiError(out.error || "خطأ في مساعد الكتابة"); return null; }
      return out;
    } catch {
      setAiError("تعذّر الاتصال بمساعد الكتابة");
      return null;
    }
  }

  // Draft both SEO fields from the title + main body, for the current language.
  async function aiGenerateSeo() {
    setAiBusy("seo");
    const out = await callAi({ action: "seo", title: i18n[titleKey]?.[lang] || "", body: i18n[bodyKey]?.[lang] || "" });
    setAiBusy("");
    if (!out) return;
    setDirty(true);
    setI18n((prev) => ({
      ...prev,
      "seo.metaTitle": { ...prev["seo.metaTitle"], [lang]: out.title || prev["seo.metaTitle"]?.[lang] || "" },
      "seo.metaDescription": { ...prev["seo.metaDescription"], [lang]: out.description || prev["seo.metaDescription"]?.[lang] || "" },
    }));
  }

  // Improve (polish) one field's own text in place.
  async function aiImprove(key: string) {
    const cur = i18n[key]?.[lang] || "";
    if (!cur.trim()) { setAiError("اكتب نص الأول عشان أحسّنه"); return; }
    setAiBusy(`improve:${key}`);
    const out = await callAi({ action: "improve", text: cur });
    setAiBusy("");
    if (out?.text) setText(key, out.text);
  }

  // Summarize the main body into a shorter field (excerpt / short description).
  async function aiSummarizeInto(key: string) {
    const src = i18n[bodyKey]?.[lang] || "";
    if (!src.trim()) { setAiError("اكتب المحتوى الأساسي الأول عشان ألخّصه"); return; }
    setAiBusy(`summarize:${key}`);
    const out = await callAi({ action: "summarize", text: src });
    setAiBusy("");
    if (out?.text) setText(key, out.text);
  }

  const aiBtn = { fontSize: 11, padding: "3px 9px", borderRadius: 6, borderColor: "var(--line)", color: "var(--accent)", cursor: "pointer" } as const;

  async function save() {
    setSaving(true); setSaved(false); setIssues([]); setTransWarn(""); setDeployNote("");
    try {
      const res = await fetch(
        create ? `/api/admin/content/${type}` : `/api/admin/content/${type}/${slug}`,
        {
          method: create ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(create ? { slug: newSlug, fixed, data: i18n, status } : { newSlug, fixed, data: i18n, status }),
        },
      );
      const out = await res.json();
      if (!res.ok) { setIssues(out.issues || [{ field: "", message: out.error || "خطأ", level: "error" }]); return; }
      setDirty(false);
      if (create) { router.push(`/admin/${type}/${out.slug}`); return; }
      if (out.slug && out.slug !== slug) { router.push(`/admin/${type}/${out.slug}`); return; }
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

      <div style={{ display: "grid", gap: 6, marginBottom: 18 }}>
        <span style={lbl}>المعرّف (slug) *</span>
        <input dir="ltr" placeholder="my-new-service" value={newSlug}
          onChange={(e) => { setDirty(true); setSlugTouched(true); setNewSlug(e.target.value.toLowerCase()); }} />
        {!create && newSlug !== slug && (
          <span style={{ fontSize: 12, color: "var(--warn)" }}>
            هيتغيّر رابط الصفحة — هيتعمل تحويل (301) تلقائي من الرابط القديم بعد النشر الجاي.
          </span>
        )}
        {!create && lang !== "en" && (
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            رابط هذه اللغة:{" "}
            <span dir="ltr" style={{ color: slugs[lang] ? "var(--ok)" : "var(--faint)" }}>
              {slugs[lang] || "لسه متترجمش — هياخد سلج الإنجليزي مؤقتاً"}
            </span>
            <span style={{ color: "var(--faint)" }}> (بيتولّد تلقائياً من العنوان، مش قابل للتعديل هنا)</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
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
      {contentFields.map((f) => {
        const isBody = f.type === "html" || f.type === "textarea";
        const isExcerpt = /excerpt|short|summary/i.test(f.key);
        return (
        <div key={f.key} style={{ display: "grid", gap: 6, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={lbl}>{f.label}{f.required && lang === "en" ? " *" : ""}</span>
            {aiEnabled && (
              <span style={{ marginInlineStart: "auto", display: "flex", gap: 6 }}>
                {f.key === "seo.metaTitle" && (
                  <button type="button" onClick={aiGenerateSeo} disabled={!!aiBusy} style={aiBtn}>
                    {aiBusy === "seo" ? "…بيكتب" : "✨ توليد السيو"}
                  </button>
                )}
                {isBody && (
                  <button type="button" onClick={() => aiImprove(f.key)} disabled={!!aiBusy} style={aiBtn}>
                    {aiBusy === `improve:${f.key}` ? "…بيحسّن" : "✨ تحسين"}
                  </button>
                )}
                {isExcerpt && bodyKey && bodyKey !== f.key && (
                  <button type="button" onClick={() => aiSummarizeInto(f.key)} disabled={!!aiBusy} style={aiBtn}>
                    {aiBusy === `summarize:${f.key}` ? "…بيلخّص" : "✨ تلخيص"}
                  </button>
                )}
              </span>
            )}
          </div>
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
        );
      })}

      {aiEnabled && aiError && (
        <p style={{ color: "var(--danger)", fontSize: 12, margin: "-6px 2px 14px" }}>{aiError}</p>
      )}

      {/* fixed fields — og_image & noindex live in the SEO panel below */}
      <div style={{ borderTop: "1px solid var(--line)", marginTop: 8, paddingTop: 18, display: "grid", gap: 16 }}>
        {fixedFields.filter((f) => f.key !== "og_image" && f.key !== "noindex").map((f) => (
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
          ) : f.type === "date" ? (
            <div key={f.key} style={{ display: "grid", gap: 6 }}>
              <span style={lbl}>{f.label}</span>
              <input type="date" dir="ltr" style={{ maxWidth: 200 }}
                value={String(fixed[f.key] ?? "")} onChange={(e) => setFixedVal(f.key, e.target.value)} />
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

      {/* Full SEO workbench: analysis, previews, and all SEO fields */}
      {PUBLIC_SEO[type] && (
        <SeoPanel
          type={type}
          slug={(create ? newSlug : slug) || ""}
          lang={lang}
          dir={dir}
          i18n={i18n}
          fixed={fixed}
          titleKey={titleKey}
          bodyKey={bodyKey}
          shortKey={shortKey}
          setText={setText}
          setFixedVal={setFixedVal}
        />
      )}

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
