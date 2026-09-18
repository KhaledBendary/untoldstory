import { redirect } from "next/navigation";
import { currentSession } from "@/lib/admin-session";
import { getActivity } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

const ACTION: Record<string, { label: string; color: string }> = {
  create: { label: "إنشاء", color: "var(--ok)" },
  update: { label: "تعديل", color: "var(--accent)" },
  delete: { label: "حذف", color: "var(--danger)" },
  publish: { label: "نشر", color: "var(--ok)" },
  unpublish: { label: "إلغاء نشر", color: "var(--warn)" },
  reorder: { label: "ترتيب", color: "var(--muted)" },
  duplicate: { label: "نسخ", color: "var(--muted)" },
};
const ENTITY: Record<string, string> = {
  services: "خدمة", projects: "مشروع", posts: "مقالة", pages: "صفحة",
  blocks: "قسم", site: "الموقع", message: "رسالة",
};

/** Who changed / published / deleted what, and when. */
export default async function ActivityPage() {
  if (!(await currentSession())) redirect("/admin/login");
  const rows = await getActivity(150);
  const fmt = (d: Date) => new Date(d).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "22px 24px 56px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 16px" }}>سجل النشاط</h1>
      {rows.length === 0 ? (
        <p style={{ color: "var(--faint)", fontSize: 14 }}>لسه مفيش نشاط مسجّل. أي تعديل أو نشر هيظهر هنا.</p>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: "var(--faint)" }}>
                {["الوقت", "المستخدم", "الإجراء", "العنصر", "التفاصيل"].map((h) => (
                  <th key={h} style={{ textAlign: "start", padding: "10px 12px", fontWeight: 500, borderBottom: "1px solid var(--line)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const a = ACTION[r.action] ?? { label: r.action, color: "var(--muted)" };
                return (
                  <tr key={r.id}>
                    <td style={{ padding: "9px 12px", color: "var(--muted)", whiteSpace: "nowrap" }}>{fmt(r.created_at)}</td>
                    <td dir="ltr" style={{ padding: "9px 12px", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.actor || "—"}</td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{ color: a.color, fontWeight: 600 }}>{a.label}</span>
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      {ENTITY[r.entity] ?? r.entity}{r.ref ? <span dir="ltr" style={{ color: "var(--faint)" }}> · {r.ref}</span> : null}
                    </td>
                    <td style={{ padding: "9px 12px", color: "var(--muted)" }}>{r.detail || ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
