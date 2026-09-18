"use client";

import { useState, useRef } from "react";

type Media = { id: number; url: string; filename: string };

/**
 * An image field that pastes, picks, or uploads. Shows the current image and
 * its URL (still editable by hand), opens the media library to choose one, or
 * uploads a new file that is selected the moment it finishes. Used everywhere a
 * content or block field is an image, so no one has to copy URLs around.
 */
export default function ImagePicker({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Media[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function openLibrary() {
    setOpen(true); setError("");
    if (items) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      setItems(res.ok ? data.items : []);
      if (!res.ok) setError(data.error || "تعذّر تحميل المكتبة");
    } catch { setError("تعذّر الاتصال بالخادم"); setItems([]); }
    finally { setLoading(false); }
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true); setError("");
    try {
      const body = new FormData(); body.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "فشل الرفع"); return; }
      const m: Media = { id: data.media.id, url: data.media.url, filename: data.media.filename };
      setItems((prev) => [m, ...(prev ?? [])]);
      onChange(m.url); setOpen(false);
    } catch { setError("تعذّر الاتصال بالخادم"); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8,
            border: "1px solid var(--line)", background: "var(--bg)", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: 8, border: "1px dashed var(--line)",
            display: "grid", placeItems: "center", color: "var(--faint)", fontSize: 11, flexShrink: 0 }}>مفيش صورة</div>
        )}
        <div style={{ flex: 1, display: "grid", gap: 6 }}>
          <input dir="ltr" placeholder="رابط الصورة" value={value} onChange={(e) => onChange(e.target.value)} />
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" onClick={openLibrary} style={{ fontSize: 12, padding: "6px 12px" }}>من المكتبة</button>
            {value && (
              <button type="button" onClick={() => onChange("")} style={{ fontSize: 12, padding: "6px 12px", color: "var(--danger)", borderColor: "var(--line)" }}>مسح</button>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 50,
            display: "grid", placeItems: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 14,
              width: "min(720px, 100%)", maxHeight: "80vh", overflow: "auto", padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <strong style={{ flex: 1, fontSize: 15 }}>اختر صورة</strong>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
                style={{ fontSize: 13, padding: "7px 14px" }}>{busy ? "بيترفع…" : "ارفع صورة"}</button>
              <button type="button" onClick={() => setOpen(false)} style={{ fontSize: 13, padding: "7px 12px" }}>إغلاق</button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
            </div>

            {error && <div style={{ marginBottom: 12, color: "var(--danger)", fontSize: 13 }}>{error}</div>}
            {loading ? (
              <p style={{ color: "var(--faint)", fontSize: 14 }}>بيحمّل…</p>
            ) : items && items.length === 0 ? (
              <p style={{ color: "var(--faint)", fontSize: 14 }}>المكتبة فاضية — ارفع صورة.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                {(items ?? []).map((m) => (
                  <button key={m.id} type="button" onClick={() => { onChange(m.url); setOpen(false); }}
                    style={{ padding: 0, border: value === m.url ? "2px solid var(--accent)" : "1px solid var(--line)",
                      borderRadius: 10, overflow: "hidden", cursor: "pointer", background: "var(--panel)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.filename} style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
