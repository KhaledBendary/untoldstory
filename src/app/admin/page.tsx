import { redirect } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { counts } from "@/lib/db/repo";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic"; // always reflects the live database

/**
 * The dashboard home: a guard, then a map of everything you can manage with a
 * live count on each, read straight from the new database. Anything that isn't
 * signed in never gets here — it is bounced to the login page first.
 */
export default async function AdminHome() {
  const session = await currentSession();
  if (!session) redirect("/admin/login");

  const c = await counts();

  const sections = [
    { href: "/admin/services", label: "الخدمات", count: c.services, desc: "خدمات الإنتاج" },
    { href: "/admin/projects", label: "الأعمال", count: c.projects, desc: "معرض المشاريع" },
    { href: "/admin/posts", label: "المقالات", count: c.posts, desc: "مدوّنة الرؤى" },
    { href: "/admin/pages", label: "الصفحات", count: 3, desc: "الرئيسية · الفوتر · من نحن" },
    { href: "/admin/media", label: "الصور", count: null, desc: "مكتبة الوسائط" },
  ];

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 20px 64px" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--line)", paddingBottom: 18, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: ".25em", color: "var(--accent)" }}>لوحة التحكم</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: "4px 0 0" }}>Global Untold Story</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 13, color: "var(--faint)" }} dir="ltr">{session.email}</span>
          <LogoutButton />
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
        {sections.map((s) => (
          <Link key={s.href} href={s.href}
            style={{ display: "block", background: "var(--panel)", border: "1px solid var(--line)",
              borderRadius: 12, padding: "18px 18px 16px", color: "var(--ink)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: 17, fontWeight: 600 }}>{s.label}</span>
              {s.count !== null && (
                <span style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)",
                  fontFamily: "ui-monospace, monospace" }}>{s.count}</span>
              )}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{s.desc}</div>
          </Link>
        ))}
      </div>

      <p style={{ marginTop: 32, fontSize: 13, color: "var(--faint)", lineHeight: 1.9 }}>
        كل المحتوى بيتقرأ من قاعدة البيانات الجديدة. التعديلات بتظهر على الموقع بعد النشر.
        <br />
        اللغات: بتحرّر الإنجليزي والعربي، والباقي بيتترجم آلياً.
      </p>
    </div>
  );
}
