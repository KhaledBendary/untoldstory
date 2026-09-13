import { redirect } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { getServices } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

/** The services list: every service, its Arabic name, and whether it needs work. */
export default async function ServicesList() {
  if (!(await currentSession())) redirect("/admin/login");
  const services = await getServices();

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "var(--muted)" }}>← اللوحة</Link>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>الخدمات</h1>
        <span style={{ fontSize: 13, color: "var(--faint)" }}>{services.length}</span>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {services.map((s) => {
          const en = s.data.title?.en || s.slug;
          const ar = s.data.title?.ar || "";
          const arMissing = !s.data.title?.ar;
          return (
            <Link key={s.slug} href={`/admin/services/${s.slug}`}
              style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--panel)",
                border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px", color: "var(--ink)" }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{s.icon || "•"}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 600, fontSize: 15,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ar || en}</span>
                <span dir="ltr" style={{ display: "block", fontSize: 12, color: "var(--faint)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{en}</span>
              </span>
              {arMissing && (
                <span style={{ fontSize: 11, color: "var(--warn)", border: "1px solid var(--warn)",
                  borderRadius: 20, padding: "2px 8px", whiteSpace: "nowrap" }}>ناقص عربي</span>
              )}
              <span style={{ color: "var(--faint)" }}>‹</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
