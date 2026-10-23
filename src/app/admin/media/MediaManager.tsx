"use client";

import { useState, useRef } from "react";

type Item = { id: number; url: string; filename: string; alt: Record<string, string> };
type AltState = "idle" | "saving" | "ok" | "err";

/**
 * Upload and manage site images. Drag onto the drop zone or pick a file; each
 * card copies its URL (to paste into an image field) or deletes the image.
 * Deletion asks first — an image may be in use on the site.
 */
export default function MediaManager({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [altState, setAltState] = useState<Record<number, AltState>>({});
  const [altMsg, setAltMsg] = useState<Record<number, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError(""); setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/media/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "فشل الرفع"); break; }
        setItems((prev) => [{ id: data.media.id, url: data.media.url, filename: data.media.filename, alt: {} }, ...prev]);
      }
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function remove(id: number) {
    if (!confirm("متأكد إنك عايز تمسح الصورة؟ ممكن تكون مستخدمة في الموقع.")) return;
    const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function copy(item: Item) {
    navigator.clipboard?.writeText(item.url).then(() => {
      setCopied(item.id);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  /** Save the English alt text; the server fills in every other language from it. */
  async function saveAlt(id: number, en: string) {
    setAltState((prev) => ({ ...prev, [id]: "saving" }));
    setAltMsg((prev) => ({ ...prev, [id]: "" }));
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt: { en } }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAltState((prev) => ({ ...prev, [id]: "err" }));
        setAltMsg((prev) => ({ ...prev, [id]: data.error || "فشل الحفظ" }));
        return;
      }
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, alt: data.alt || { en } } : m)));
      setAltState((prev) => ({ ...prev, [id]: data.warning ? "err" : "ok" }));
      setAltMsg((prev) => ({ ...prev, [id]: data.warning || "" }));
    } catch {
      setAltState((prev) => ({ ...prev, [id]: "err" }));
      setAltMsg((prev) => ({ ...prev, [id]: "تعذّر الاتصال بالخادم" }));
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        style={{ border: "2px dashed var(--line)", borderRadius: 12, padding: "28px 20px",
          textAlign: "center", cursor: "pointer", marginBottom: 22, background: "var(--panel)" }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{busy ? "بيترفع…" : "ارفع صورة"}</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
          اسحب الصورة هنا أو اضغط للاختيار · JPG / PNG / WebP / SVG · حتى 8 ميجا
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden
          onChange={(e) => upload(e.target.files)} />
      </div>

      {error && (
        <div style={{ marginBottom: 16, background: "color-mix(in srgb, var(--danger) 15%, transparent)",
          border: "1px solid var(--danger)", color: "var(--danger)", borderRadius: 8, padding: "10px 12px", fontSize: 13 }}>
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <p style={{ color: "var(--faint)", fontSize: 14 }}>لسه مفيش صور مرفوعة.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {items.map((m) => (
            <div key={m.id} style={{ background: "var(--panel)", border: "1px solid var(--line)",
              borderRadius: 10, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.alt.en || m.filename} style={{ width: "100%", height: 120, objectFit: "cover",
                display: "block", background: "var(--bg)" }} />
              <div style={{ padding: "8px 10px" }}>
                <div dir="ltr" style={{ fontSize: 11, color: "var(--faint)", whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis", marginBottom: 6 }}>{m.filename}</div>
                <input dir="ltr" defaultValue={m.alt.en || ""} placeholder="Alt text (English)"
                  onBlur={(e) => { const v = e.target.value.trim(); if (v !== (m.alt.en || "")) saveAlt(m.id, v); }}
                  onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                  style={{ width: "100%", fontSize: 11, padding: "5px 7px", marginBottom: 4, boxSizing: "border-box" }} />
                {altState[m.id] === "saving" && (
                  <div style={{ fontSize: 10, color: "var(--faint)", marginBottom: 6 }}>بيحفظ ويترجم…</div>
                )}
                {altState[m.id] === "ok" && (
                  <div style={{ fontSize: 10, color: "var(--ok)", marginBottom: 6 }}>✓ اتحفظ وترجم لكل اللغات</div>
                )}
                {altState[m.id] === "err" && (
                  <div style={{ fontSize: 10, color: "var(--danger)", marginBottom: 6 }}>{altMsg[m.id] || "فشل الحفظ"}</div>
                )}
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => copy(m)} style={{ flex: 1, fontSize: 12, padding: "6px 8px" }}>
                    {copied === m.id ? "✓ اتنسخ" : "نسخ الرابط"}
                  </button>
                  <button onClick={() => remove(m.id)} title="حذف"
                    style={{ fontSize: 12, padding: "6px 10px", color: "var(--danger)", borderColor: "var(--line)" }}>
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
