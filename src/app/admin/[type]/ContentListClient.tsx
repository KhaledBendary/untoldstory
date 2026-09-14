"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type Row = { slug: string; title: string; sub: string; icon?: string | null; arMissing: boolean; draft?: boolean };

/**
 * The content list. For orderable types (services, projects) each row has
 * up/down controls and a "save order" bar appears once the order changes —
 * writing sort_order, which is how the public site sequences them. Posts are
 * date-ordered, so they render as a plain list with no reordering.
 */
export default function ContentListClient({ type, orderable, initial }: {
  type: string; orderable: boolean; initial: Row[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [q, setQ] = useState("");
  const [dupBusy, setDupBusy] = useState<string | null>(null);

  const query = q.trim().toLowerCase();
  const shown = useMemo(
    () => (query ? rows.filter((r) => `${r.title} ${r.sub}`.toLowerCase().includes(query)) : rows),
    [rows, query],
  );
  const canReorder = orderable && !query; // reordering only makes sense on the full list

  async function duplicate(slug: string) {
    setDupBusy(slug);
    try {
      const res = await fetch(`/api/admin/content/${type}/${slug}/duplicate`, { method: "POST" });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.slug) router.push(`/admin/${type}/${out.slug}`);
    } finally { setDupBusy(null); }
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    setRows((prev) => { const n = [...prev]; [n[i], n[j]] = [n[j], n[i]]; return n; });
    setDirty(true); setSaved(false);
  };

  async function saveOrder() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/content/${type}/reorder`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: rows.map((r) => r.slug) }),
      });
      if (res.ok) { setDirty(false); setSaved(true); }
    } finally { setSaving(false); }
  }

  return (
    <>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث…"
        style={{ marginBottom: 12 }} />

      {shown.length === 0 ? (
        <p style={{ color: "var(--faint)", fontSize: 14 }}>مفيش نتائج.</p>
      ) : (
      <div style={{ display: "grid", gap: 8 }}>
        {shown.map((r, i) => (
          <div key={r.slug} style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
            {canReorder && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button onClick={() => move(i, -1)} disabled={i === 0} title="لأعلى"
                  style={{ flex: 1, fontSize: 12, padding: "0 8px" }}>↑</button>
                <button onClick={() => move(i, 1)} disabled={i === shown.length - 1} title="لأسفل"
                  style={{ flex: 1, fontSize: 12, padding: "0 8px" }}>↓</button>
              </div>
            )}
            <Link href={`/admin/${type}/${r.slug}`}
              style={{ flex: 1, display: "flex", alignItems: "center", gap: 14, background: "var(--panel)",
                border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px", color: "var(--ink)", minWidth: 0 }}>
              {r.icon && <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{r.icon}</span>}
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 600, fontSize: 15,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</span>
                <span dir="ltr" style={{ display: "block", fontSize: 12, color: "var(--faint)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.sub}</span>
              </span>
              {r.draft && (
                <span style={{ fontSize: 11, color: "var(--warn)", border: "1px solid var(--warn)",
                  borderRadius: 20, padding: "2px 8px", whiteSpace: "nowrap" }}>مسودّة</span>
              )}
              {r.arMissing && (
                <span style={{ fontSize: 11, color: "var(--faint)", border: "1px solid var(--line)",
                  borderRadius: 20, padding: "2px 8px", whiteSpace: "nowrap" }}>ناقص عربي</span>
              )}
            </Link>
            <button onClick={() => duplicate(r.slug)} disabled={dupBusy === r.slug} title="نسخ"
              style={{ fontSize: 12, padding: "0 12px" }}>{dupBusy === r.slug ? "…" : "نسخ"}</button>
          </div>
        ))}
      </div>
      )}

      {orderable && (dirty || saved) && (
        <div style={{ position: "sticky", bottom: 0, marginTop: 16, paddingTop: 12, background: "var(--bg)",
          display: "flex", alignItems: "center", gap: 12 }}>
          {dirty ? (
            <button className="primary" onClick={saveOrder} disabled={saving}
              style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
              {saving ? "بيتحفظ…" : "حفظ الترتيب"}
            </button>
          ) : (
            <span style={{ color: "var(--ok)", fontSize: 14 }}>✓ الترتيب اتحفظ</span>
          )}
        </div>
      )}
    </>
  );
}
