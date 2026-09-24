"use client";

import { useState } from "react";
import ImagePicker from "@/app/admin/ImagePicker";

type Dict = Record<string, string>;

const SITE = "globaluntoldstory.com";
const PUBLIC_BASE: Record<string, string> = { services: "/services", projects: "/work", posts: "/insights" };

const strip = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const norm = (s: string) => s.toLowerCase().trim();

type Check = { label: string; state: "ok" | "warn" | "bad" };

/**
 * The per-item SEO workbench: a live Google snippet, a social-share card, a
 * focus-keyword analysis with a score, and the full set of editable SEO fields
 * (meta, Open Graph, Twitter, canonical, robots). All fields are the same
 * per-locale seo.* fields the rest of the editor saves.
 */
export default function SeoPanel({
  type, slug, lang, dir, i18n, fixed, titleKey, bodyKey, shortKey,
  setText, setFixedVal,
}: {
  type: string; slug: string; lang: string; dir: "ltr" | "rtl";
  i18n: Record<string, Dict>; fixed: Record<string, unknown>;
  titleKey: string; bodyKey: string; shortKey: string;
  setText: (key: string, v: string) => void;
  setFixedVal: (key: string, v: unknown) => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const g = (key: string) => i18n[key]?.[lang] || "";

  const keyword = g("seo.focusKeyword");
  const metaTitle = g("seo.metaTitle") || g(titleKey);
  const metaDesc = g("seo.metaDescription") || g(shortKey) || strip(g(bodyKey)).slice(0, 160);
  const content = strip(g(bodyKey));
  const ogImage = String(fixed["og_image"] || fixed["image"] || fixed["image_url"] || fixed["featured_image"] || "");
  const base = PUBLIC_BASE[type] || "";
  const nofollow = norm(g("seo.nofollow")) === "true";
  const noindex = Boolean(fixed["noindex"]);

  // ---- SEO analysis ----
  const kw = norm(keyword);
  const has = (hay: string) => kw && norm(hay).includes(kw);
  const checks: Check[] = [
    { label: "حدّدت كلمة مفتاحية", state: kw ? "ok" : "warn" },
    { label: "الكلمة المفتاحية في عنوان السيو", state: !kw ? "warn" : has(metaTitle) ? "ok" : "bad" },
    { label: "الكلمة المفتاحية في وصف السيو", state: !kw ? "warn" : has(metaDesc) ? "ok" : "bad" },
    { label: "الكلمة المفتاحية في الرابط (slug)", state: !kw ? "warn" : has(slug.replace(/-/g, " ")) ? "ok" : "warn" },
    { label: "الكلمة المفتاحية في المحتوى", state: !kw ? "warn" : has(content) ? "ok" : "bad" },
    { label: `طول عنوان السيو مناسب (${metaTitle.length}/60)`, state: metaTitle.length === 0 ? "bad" : metaTitle.length <= 60 && metaTitle.length >= 25 ? "ok" : "warn" },
    { label: `طول وصف السيو مناسب (${metaDesc.length}/160)`, state: metaDesc.length === 0 ? "bad" : metaDesc.length <= 160 && metaDesc.length >= 70 ? "ok" : "warn" },
    { label: "فيه صورة مشاركة (OG)", state: ogImage ? "ok" : "warn" },
    { label: `طول المحتوى كافٍ (${content.length} حرف)`, state: content.length >= 300 ? "ok" : content.length > 0 ? "warn" : "bad" },
  ];
  const okCount = checks.filter((c) => c.state === "ok").length;
  const score = Math.round((okCount / checks.length) * 100);
  const scoreColor = score >= 80 ? "var(--ok)" : score >= 50 ? "var(--warn)" : "var(--danger)";
  const dotColor = (s: Check["state"]) => (s === "ok" ? "var(--ok)" : s === "warn" ? "var(--warn)" : "var(--danger)");

  const previewUrl = `${SITE} › ${base.replace("/", "")} › ${slug || "…"}`;
  const lbl = { fontSize: 12.5, color: "var(--muted)", display: "block", marginBottom: 4 } as const;
  const inp = { width: "100%", fontSize: 14, padding: "8px 10px" } as const;
  const counter = (len: number, max: number) => (
    <span style={{ fontSize: 11, color: len > max ? "var(--warn)" : len > 0 ? "var(--ok)" : "var(--faint)" }}>{len}/{max}</span>
  );

  return (
    <section style={{ marginTop: 24, border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ background: "var(--panel)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <strong style={{ fontSize: 15 }}>تحسين محركات البحث (SEO)</strong>
        <span style={{ marginInlineStart: "auto", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--faint)" }}>درجة السيو</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: scoreColor, fontFamily: "ui-monospace, monospace" }}>{score}%</span>
        </span>
      </div>

      <div style={{ padding: 16, display: "grid", gap: 20 }}>
        {/* Google preview */}
        <div>
          <span style={lbl}>معاينة نتيجة جوجل</span>
          <div style={{ background: "#fff", borderRadius: 8, padding: "12px 14px", border: "1px solid var(--line)" }}>
            <div dir="ltr" style={{ fontSize: 12, color: "#4d5156", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{previewUrl}</div>
            <div dir={dir} style={{ color: "#1a0dab", fontSize: 18, lineHeight: 1.3, margin: "2px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{metaTitle || "عنوان الصفحة"}</div>
            <div dir={dir} style={{ color: "#4d5156", fontSize: 13, lineHeight: 1.5 }}>{metaDesc || "وصف الصفحة اللي هيظهر في نتائج البحث…"}</div>
          </div>
        </div>

        {/* Focus keyword */}
        <label>
          <span style={lbl}>الكلمة المفتاحية (للتحليل)</span>
          <input dir={dir} style={inp} value={g("seo.focusKeyword")} onChange={(e) => setText("seo.focusKeyword", e.target.value)} placeholder="مثال: إنتاج فيديو في مصر" />
        </label>

        {/* Meta title + description */}
        <label>
          <span style={lbl}>عنوان محركات البحث {counter(g("seo.metaTitle").length, 60)}</span>
          <input dir={dir} style={inp} value={g("seo.metaTitle")} onChange={(e) => setText("seo.metaTitle", e.target.value)} placeholder={g(titleKey)} />
        </label>
        <label>
          <span style={lbl}>وصف محركات البحث {counter(g("seo.metaDescription").length, 160)}</span>
          <textarea dir={dir} rows={3} style={inp} value={g("seo.metaDescription")} onChange={(e) => setText("seo.metaDescription", e.target.value)} />
        </label>

        {/* SEO checklist */}
        <div>
          <span style={lbl}>فحوصات السيو</span>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
            {checks.map((c, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <span style={{ width: 8, height: 8, borderRadius: 8, background: dotColor(c.state), flexShrink: 0 }} />
                <span style={{ color: c.state === "ok" ? "var(--ink)" : "var(--muted)" }}>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Social card preview */}
        <div>
          <span style={lbl}>معاينة بطاقة المشاركة (فيسبوك / واتساب / تويتر)</span>
          <div style={{ maxWidth: 480, border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden", background: "var(--panel)" }}>
            <div style={{ aspectRatio: "1200 / 630", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {ogImage
                ? <img src={ogImage} alt="image — Global Untold Story" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 12, color: "var(--faint)" }}>مفيش صورة مشاركة</span>}
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div dir="ltr" style={{ fontSize: 11, color: "var(--faint)", textTransform: "uppercase" }}>{SITE}</div>
              <div dir={dir} style={{ fontSize: 14, fontWeight: 700, margin: "2px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g("seo.ogTitle") || metaTitle || "عنوان المشاركة"}</div>
              <div dir={dir} style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{g("seo.ogDescription") || metaDesc}</div>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <ImagePicker value={String(fixed["og_image"] || "")} onChange={(url) => setFixedVal("og_image", url)} />
            <span style={{ fontSize: 11, color: "var(--faint)" }}>صورة المشاركة (لو فاضية بتتاخد الصورة الأساسية للعنصر)</span>
          </div>
        </div>

        {/* Advanced */}
        <div>
          <button type="button" onClick={() => setShowAdvanced((v) => !v)} style={{ fontSize: 13, padding: "6px 12px" }}>
            {showAdvanced ? "إخفاء الإعدادات المتقدمة ▲" : "إعدادات متقدمة (Open Graph / Twitter / Canonical) ▼"}
          </button>
          {showAdvanced && (
            <div style={{ marginTop: 12, display: "grid", gap: 14, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
              <label><span style={lbl}>عنوان Open Graph (اختياري)</span><input dir={dir} style={inp} value={g("seo.ogTitle")} onChange={(e) => setText("seo.ogTitle", e.target.value)} placeholder={metaTitle} /></label>
              <label><span style={lbl}>وصف Open Graph (اختياري)</span><textarea dir={dir} rows={2} style={inp} value={g("seo.ogDescription")} onChange={(e) => setText("seo.ogDescription", e.target.value)} placeholder={metaDesc} /></label>
              <label><span style={lbl}>عنوان تويتر (اختياري)</span><input dir={dir} style={inp} value={g("seo.twitterTitle")} onChange={(e) => setText("seo.twitterTitle", e.target.value)} /></label>
              <label><span style={lbl}>وصف تويتر (اختياري)</span><textarea dir={dir} rows={2} style={inp} value={g("seo.twitterDescription")} onChange={(e) => setText("seo.twitterDescription", e.target.value)} /></label>
              <label><span style={lbl}>الرابط الأساسي Canonical (اختياري — سيبه فاضي للتلقائي)</span><input dir="ltr" style={inp} value={g("seo.canonical")} onChange={(e) => setText("seo.canonical", e.target.value)} placeholder={`https://${SITE}${base}/${slug}`} /></label>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                  <input type="checkbox" checked={noindex} onChange={(e) => setFixedVal("noindex", e.target.checked)} style={{ width: 18, height: 18 }} />
                  إخفاء من محركات البحث (noindex)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                  <input type="checkbox" checked={nofollow} onChange={(e) => setText("seo.nofollow", e.target.checked ? "true" : "")} style={{ width: 18, height: 18 }} />
                  منع تتبّع الروابط (nofollow)
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
