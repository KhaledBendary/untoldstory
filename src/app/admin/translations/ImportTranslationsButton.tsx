"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ItemResult = { slug: string; ok: boolean; applied?: number; locales?: string[]; error?: string };

/**
 * Upload one or many "*-locales-import.json" translation files (each may hold a
 * single item or an array of items) and apply them to content in one go.
 */
export default function ImportTranslationsButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<{ ok: number; fail: number } | null>(null);
  const [details, setDetails] = useState<ItemResult[]>([]);
  const [error, setError] = useState("");

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true); setError(""); setSummary(null); setDetails([]);

    // Merge every file into one array of items, so it's a single request/deploy.
    const items: unknown[] = [];
    for (const f of files) {
      try {
        const json = JSON.parse(await f.text());
        if (Array.isArray(json)) items.push(...json);
        else items.push(json);
      } catch {
        setError(`الملف "${f.name}" مش JSON صالح`);
        setBusy(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/admin/import-translations", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(items),
      });
      const out = await res.json();
      if (!res.ok && !out.results) { setError(out.error || "فشل الاستيراد"); return; }
      setSummary({ ok: out.succeeded, fail: out.failed });
      setDetails(out.results || []);
      router.refresh();
    } catch {
      setError("تعذّر رفع الملفات");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <input ref={inputRef} type="file" accept="application/json,.json" multiple hidden onChange={onFiles} />
        <button onClick={() => inputRef.current?.click()} disabled={busy}
          style={{ fontSize: 13, padding: "9px 18px", borderColor: "var(--line)", opacity: busy ? 0.6 : 1 }}>
          {busy ? "بيرفع…" : "⬆️ استيراد ملفات ترجمة (JSON)"}
        </button>
        {summary && (
          <span style={{ fontSize: 13, color: summary.fail ? "var(--warn)" : "var(--ok)" }}>
            تم استيراد {summary.ok} عنصر{summary.fail ? ` · فشل ${summary.fail}` : ""}
          </span>
        )}
        {error && <span style={{ fontSize: 13, color: "var(--danger)" }}>{error}</span>}
      </div>
      {details.length > 0 && (
        <div style={{ fontSize: 12.5, color: "var(--muted)", display: "grid", gap: 3, paddingInlineStart: 4 }}>
          {details.map((r, i) => (
            <span key={i} style={{ color: r.ok ? "var(--ok)" : "var(--danger)" }}>
              {r.ok ? "✓" : "✕"} {r.slug} {r.ok ? `(${r.applied} حقل · ${(r.locales || []).join("، ")})` : `— ${r.error}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
