"use client";

import { useState } from "react";
import Link from "next/link";
import type { BlockField } from "@/lib/admin/blocks";
import ImagePicker from "@/app/admin/ImagePicker";

export type Item = Record<string, string | number | { en: string; ar: string }>;
type Issue = { field: string; message: string; level: "error" | "warning" };

const LANGS = [
  { code: "en", label: "إنجليزي", dir: "ltr" as const },
  { code: "ar", label: "عربي", dir: "rtl" as const },
];

/**
 * Editor for one repeating block: a list of items with the same fields. Add,
 * remove and reorder items; translatable fields switch with the language tab,
 * fixed fields (image, colour, emoji, number) are shared across languages. Save
 * rewrites all 14 languages — the seven machine ones translated from English.
 */
export default function BlockEditor({
  block, labelAr, itemLabelAr, titleField, fields, initialItems, embedded = false,
}: {
  block: string; labelAr: string; itemLabelAr: string; titleField: string;
  fields: BlockField[]; initialItems: Item[]; embedded?: boolean;
}) {
  const [lang, setLang] = useState("en");
  const [items, setItems] = useState<Item[]>(initialItems);
  const [saving, setSaving] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [saved, setSaved] = useState(false);
  const [transWarn, setTransWarn] = useState("");

  const dir = LANGS.find((l) => l.code === lang)!.dir;
  const errors = issues.filter((i) => i.level === "error");

  const blank = (): Item => {
    const o: Item = {};
    for (const f of fields) o[f.key] = f.i18n ? { en: "", ar: "" } : (f.type === "number" ? 0 : "");
    return o;
  };

  const update = (idx: number, key: string, value: string | number) =>
    setItems((prev) => prev.map((it, i) => {
      if (i !== idx) return it;
      const field = fields.find((f) => f.key === key)!;
      if (field.i18n) {
        const pair = (it[key] ?? { en: "", ar: "" }) as { en: string; ar: string };
        return { ...it, [key]: { ...pair, [lang]: String(value) } };
      }
      return { ...it, [key]: value };
    }));

  const move = (idx: number, dir: -1 | 1) =>
    setItems((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });

  const remove = (idx: number) => {
    if (!confirm(`متأكد إنك عايز تمسح ${itemLabelAr} رقم ${idx + 1}؟`)) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const add = () => setItems((prev) => [...prev, blank()]);

  const heading = (it: Item, idx: number) => {
    const f = fields.find((x) => x.key === titleField);
    const v = it[titleField];
    const text = f?.i18n ? (v as { en: string; ar: string })?.[lang as "en" | "ar"] || (v as { en: string })?.en : String(v ?? "");
    return text || `${itemLabelAr} ${idx + 1}`;
  };

  async function save() {
    setSaving(true); setSaved(false); setIssues([]); setTransWarn("");
    try {
      const res = await fetch(`/api/admin/blocks/${block}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const out = await res.json();
      if (!res.ok) { setIssues(out.issues || [{ field: "", message: out.error || "خطأ", level: "error" }]); return; }
      setTransWarn(out.translationWarning || ""); setSaved(true);
    } catch {
      setIssues([{ field: "", message: "تعذّر الاتصال بالخادم", level: "error" }]);
    } finally { setSaving(false); }
  }

  const val = (it: Item, f: BlockField): string =>
    f.i18n ? ((it[f.key] as { en: string; ar: string })?.[lang as "en" | "ar"] ?? "") : String(it[f.key] ?? "");

  return (
    <div style={embedded
      ? { background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: "18px 18px 20px" }
      : { maxWidth: 760, margin: "0 auto", padding: "24px 20px 90px" }}>
      {embedded ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, flex: 1 }}>{labelAr}</h2>
          <span style={{ fontSize: 12, color: "var(--faint)" }}>{items.length} عنصر</span>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <Link href="/admin/pages" style={{ fontSize: 13, color: "var(--muted)" }}>← الصفحات</Link>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, flex: 1 }}>{labelAr}</h1>
          <span style={{ fontSize: 13, color: "var(--faint)" }}>{items.length}</span>
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

      <div style={{ display: "grid", gap: 14 }}>
        {items.map((it, idx) => (
          <div key={idx} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: "var(--faint)", fontFamily: "ui-monospace, monospace" }}>#{idx + 1}</span>
              <strong style={{ flex: 1, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{heading(it, idx)}</strong>
              <button onClick={() => move(idx, -1)} disabled={idx === 0} title="لأعلى" style={{ padding: "4px 10px", fontSize: 13 }}>↑</button>
              <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} title="لأسفل" style={{ padding: "4px 10px", fontSize: 13 }}>↓</button>
              <button onClick={() => remove(idx)} title="حذف" style={{ padding: "4px 10px", fontSize: 13, color: "var(--danger)", borderColor: "var(--line)" }}>حذف</button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {fields.map((f) => {
                const shared = !f.i18n;
                return (
                  <div key={f.key} style={{ display: "grid", gap: 5 }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      {f.label}{shared && <span style={{ color: "var(--faint)" }}> · مشترك لكل اللغات</span>}
                    </span>
                    {f.type === "image" ? (
                      <ImagePicker value={val(it, f)} onChange={(url) => update(idx, f.key, url)} />
                    ) : f.type === "textarea" ? (
                      <textarea dir={shared ? "ltr" : dir} rows={3} value={val(it, f)}
                        onChange={(e) => update(idx, f.key, e.target.value)} />
                    ) : f.type === "color" ? (
                      <input type="text" dir="ltr" placeholder="#RRGGBB أو اسم اللون" value={val(it, f)}
                        onChange={(e) => update(idx, f.key, e.target.value)} />
                    ) : (
                      <input
                        dir={shared && f.type !== "text" ? "ltr" : (shared ? "ltr" : dir)}
                        type={f.type === "number" ? "number" : "text"}
                        style={f.type === "emoji" ? { textAlign: "center", maxWidth: 90 } : undefined}
                        value={val(it, f)}
                        onChange={(e) => update(idx, f.key, f.type === "number" ? Number(e.target.value) : e.target.value)} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button onClick={add} style={{ marginTop: 14, width: "100%", padding: "12px", fontSize: 14, borderStyle: "dashed" }}>
        + إضافة {itemLabelAr}
      </button>

      {errors.length > 0 && (
        <div style={{ marginTop: 16, background: "color-mix(in srgb, var(--danger) 15%, transparent)",
          border: "1px solid var(--danger)", borderRadius: 8, padding: "12px 14px" }}>
          <ul style={{ margin: 0, paddingInlineStart: 20, fontSize: 13 }}>
            {errors.map((i, n) => <li key={n} style={{ color: "var(--danger)" }}>{i.message}</li>)}
          </ul>
        </div>
      )}
      {saved && transWarn && (
        <div style={{ marginTop: 12, background: "color-mix(in srgb, var(--warn) 14%, transparent)",
          border: "1px solid var(--warn)", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "var(--warn)" }}>
          {transWarn}
        </div>
      )}

      <div style={{ position: embedded ? "static" : "sticky", bottom: 0, marginTop: 20, paddingTop: 14,
        display: "flex", alignItems: "center", gap: 14, background: embedded ? "transparent" : "var(--bg)" }}>
        <button className="primary" onClick={save} disabled={saving}>{saving ? "بيتحفظ ويترجم…" : "حفظ"}</button>
        {saved && errors.length === 0 && (
          <span style={{ color: "var(--ok)", fontSize: 14 }}>
            {transWarn ? "✓ اتحفظ" : "✓ اتحفظ واتترجم للـ12 لغة"}
          </span>
        )}
      </div>
    </div>
  );
}
