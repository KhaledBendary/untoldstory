import { redirect } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { SINGLETONS } from "@/lib/admin/singleton-fields";

export const dynamic = "force-dynamic";

const DESC: Record<string, string> = {
  layout: "بيانات الاتصال · السوشيال · الفوتر · المكاتب",
  home: "الواجهة · الإحصائيات · خطوات الإنتاج · الجوائز",
  about: "رأس الصفحة · الفريق · الشركاء",
};

/** The one-off pages, each opening its own field editor. */
export default async function PagesList() {
  if (!(await currentSession())) redirect("/admin/login");

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "var(--muted)" }}>← اللوحة</Link>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>الصفحات</h1>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {Object.values(SINGLETONS).map((s) => (
          <Link key={s.key} href={`/admin/pages/${s.key}`}
            style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--panel)",
              border: "1px solid var(--line)", borderRadius: 10, padding: "14px", color: "var(--ink)" }}>
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontWeight: 600, fontSize: 15 }}>{s.labelAr}</span>
              <span style={{ display: "block", fontSize: 12, color: "var(--faint)" }}>{DESC[s.key]}</span>
            </span>
            <span style={{ color: "var(--faint)" }}>‹</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
