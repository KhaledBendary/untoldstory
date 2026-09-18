"use client";

import { useMemo, useState } from "react";

export type Message = {
  id: number; name: string; email: string; phone: string | null; service: string | null;
  message: string; locale: string | null; status: string; emailed: boolean; createdAt: string;
};

const FILTERS = [
  { key: "all", label: "الكل" },
  { key: "new", label: "جديد" },
  { key: "read", label: "مقروء" },
  { key: "replied", label: "تم الرد" },
  { key: "archived", label: "مؤرشف" },
];
const STATUS_LABEL: Record<string, string> = { new: "جديد", read: "مقروء", replied: "تم الرد", archived: "مؤرشف" };
const STATUS_COLOR: Record<string, string> = { new: "var(--accent)", read: "var(--muted)", replied: "var(--ok)", archived: "var(--faint)" };

/**
 * The inbox: filter by status, open a message, change its status, reply (opens
 * the mail app to the sender), or delete. A ✉︎ flag marks a submission whose
 * notification email did not send — the message is safe here regardless.
 */
export default function MessagesClient({ initial }: { initial: Message[] }) {
  const [items, setItems] = useState<Message[]>(initial);
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<number | null>(null);

  const shown = useMemo(
    () => (filter === "all" ? items : items.filter((m) => m.status === filter)),
    [items, filter],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const m of items) c[m.status] = (c[m.status] ?? 0) + 1;
    return c;
  }, [items]);

  async function setStatus(id: number, status: string) {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    }).catch(() => {});
  }

  async function remove(id: number) {
    if (!confirm("متأكد إنك عايز تمسح الرسالة دي نهائياً؟")) return;
    setItems((prev) => prev.filter((m) => m.id !== id));
    if (openId === id) setOpenId(null);
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" }).catch(() => {});
  }

  function open(m: Message) {
    setOpenId((cur) => (cur === m.id ? null : m.id));
    if (m.status === "new") setStatus(m.id, "read");
  }

  const fmt = (iso: string) => new Date(iso).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{ fontSize: 13, padding: "6px 14px",
              background: filter === f.key ? "var(--accent)" : "var(--panel)",
              color: filter === f.key ? "var(--accent-ink)" : "var(--ink)",
              borderColor: filter === f.key ? "var(--accent)" : "var(--line)" }}>
            {f.label}{f.key !== "all" && counts[f.key] ? ` (${counts[f.key]})` : ""}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p style={{ color: "var(--faint)", fontSize: 14 }}>مفيش رسائل في القسم ده.</p>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {shown.map((m) => (
            <div key={m.id} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
              <button onClick={() => open(m)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  background: "transparent", border: "none", color: "var(--ink)", textAlign: "start", cursor: "pointer" }}>
                <span style={{ width: 8, height: 8, borderRadius: 8, background: STATUS_COLOR[m.status] ?? "var(--faint)",
                  flexShrink: 0, opacity: m.status === "new" ? 1 : 0.5 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: m.status === "new" ? 700 : 600, fontSize: 14,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.name} {m.service ? <span style={{ color: "var(--faint)", fontWeight: 400 }}>· {m.service}</span> : null}
                  </span>
                  <span dir="ltr" style={{ display: "block", fontSize: 12, color: "var(--faint)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.email}</span>
                </span>
                {!m.emailed && <span title="الإيميل ما اتبعتش" style={{ fontSize: 11, color: "var(--warn)" }}>✉︎!</span>}
                <span style={{ fontSize: 11, color: "var(--faint)", whiteSpace: "nowrap" }}>{fmt(m.createdAt)}</span>
              </button>

              {openId === m.id && (
                <div style={{ borderTop: "1px solid var(--line)", padding: "14px 16px", display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 13, color: "var(--muted)" }}>
                    <span dir="ltr"><strong>البريد:</strong> {m.email}</span>
                    {m.phone && <span dir="ltr"><strong>التليفون:</strong> {m.phone}</span>}
                    {m.service && <span><strong>الخدمة:</strong> {m.service}</span>}
                    {m.locale && <span><strong>اللغة:</strong> {m.locale}</span>}
                  </div>
                  <p style={{ whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 1.7, margin: 0 }}>{m.message}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent("رد على رسالتك — Global Untold Story")}`}
                      onClick={() => setStatus(m.id, "replied")}
                      className="primary" style={{ fontSize: 13, padding: "7px 14px", borderRadius: 8, textDecoration: "none",
                        background: "var(--accent)", color: "var(--accent-ink)" }}>الرد بالبريد</a>
                    <select value={m.status} onChange={(e) => setStatus(m.id, e.target.value)}
                      style={{ fontSize: 13, padding: "7px 10px" }}>
                      {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <button onClick={() => remove(m.id)} style={{ marginInlineStart: "auto", fontSize: 13, padding: "7px 12px",
                      color: "var(--danger)", borderColor: "var(--line)" }}>حذف</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
