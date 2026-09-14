"use client";

import { useState } from "react";
import Link from "next/link";

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
  const [rows, setRows] = useState<Row[]>(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
      <div style={{ display: "grid", gap: 8 }}>
        {rows.map((r, i) => (
          <div key={r.slug} style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
            {orderable && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button onClick={() => move(i, -1)} disabled={i === 0} title="لأعلى"
                  style={{ flex: 1, fontSize: 12, padding: "0 8px" }}>↑</button>
                <button onClick={() => move(i, 1)} disabled={i === rows.length - 1} title="لأسفل"
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
              <span style={{ color: "var(--faint)" }}>‹</span>
            </Link>
          </div>
        ))}
      </div>

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
