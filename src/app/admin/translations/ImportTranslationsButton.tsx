"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** Upload a "*-locales-import.json" translation file and apply it to an item. */
export default function ImportTranslationsButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setBusy(true); setMsg(null);
    try {
      const text = await file.text();
      let json: unknown;
      try { json = JSON.parse(text); } catch { setMsg({ kind: "err", text: "الملف مش JSON صالح" }); return; }
      const res = await fetch("/api/admin/import-translations", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(json),
      });
      const out = await res.json();
      if (!res.ok) { setMsg({ kind: "err", text: out.error || "فشل الاستيراد" }); return; }
      setMsg({ kind: "ok", text: `تم استيراد ${out.applied} حقل لـ "${out.slug}" (لغات: ${out.locales.join("، ")})${out.deploy?.triggered ? " — وبدأ نشر الموقع" : ""}` });
      router.refresh();
    } catch {
      setMsg({ kind: "err", text: "تعذّر رفع الملف" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={onFile} />
      <button onClick={() => inputRef.current?.click()} disabled={busy}
        style={{ fontSize: 13, padding: "9px 18px", borderColor: "var(--line)", opacity: busy ? 0.6 : 1 }}>
        {busy ? "بيرفع…" : "⬆️ استيراد ملف ترجمة (JSON)"}
      </button>
      {msg && <span style={{ fontSize: 13, color: msg.kind === "ok" ? "var(--ok)" : "var(--danger)" }}>{msg.text}</span>}
    </div>
  );
}
