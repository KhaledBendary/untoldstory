import { redirect } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { counts, newMessageCount } from "@/lib/db/repo";

export const dynamic = "force-dynamic"; // always reflects the live database

/** The dashboard home: a welcome, live stats, and quick jumps into each area. */
export default async function AdminHome() {
  const session = await currentSession();
  if (!session) redirect("/admin/login");

  const c = await counts();
  const newMessages = await newMessageCount();

  const stats = [
    { href: "/admin/services", label: "الخدمات", count: c.services, desc: "خدمات الإنتاج" },
    { href: "/admin/projects", label: "الأعمال", count: c.projects, desc: "معرض المشاريع" },
    { href: "/admin/posts", label: "المقالات", count: c.posts, desc: "مدوّنة الرؤى" },
    { href: "/admin/messages", label: "رسائل جديدة", count: newMessages, desc: "فورم التواصل", highlight: newMessages > 0 },
  ];
  const shortcuts = [
    { href: "/admin/pages", label: "الصفحات", desc: "الرئيسية · من نحن · إعدادات الموقع" },
    { href: "/admin/media", label: "الصور", desc: "مكتبة الوسائط" },
  ];

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "22px 24px 56px" }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 12, letterSpacing: ".22em", color: "var(--accent)", marginBottom: 4 }}>أهلاً بعودتك</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>لوحة تحكم الموقع</h1>
      </div>

      {/* stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 26 }}>
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="card"
            style={{ padding: "18px 18px 16px", color: "var(--ink)", display: "block",
              borderColor: s.highlight ? "var(--accent)" : "var(--line)" }}>
            <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1,
              color: s.highlight ? "var(--accent)" : "var(--ink)", fontFamily: "ui-monospace, monospace" }}>{s.count}</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 10 }}>{s.label}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{s.desc}</div>
          </Link>
        ))}
      </div>

      {/* shortcuts */}
      <div style={{ fontSize: 11, letterSpacing: ".18em", color: "var(--faint)", marginBottom: 10 }}>اختصارات</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12 }}>
        {shortcuts.map((s) => (
          <Link key={s.href} href={s.href} className="card"
            style={{ padding: "15px 16px", color: "var(--ink)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{s.label}</span>
              <span style={{ display: "block", fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{s.desc}</span>
            </span>
            <span style={{ color: "var(--faint)" }}>‹</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
