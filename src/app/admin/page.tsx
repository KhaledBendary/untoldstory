import { redirect } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { counts, newMessageCount, getMessages, visitStats } from "@/lib/db/repo";
import { deployConfigured } from "@/lib/deploy";

export const dynamic = "force-dynamic"; // always reflects the live database

/** The dashboard home: a command center — live stats, latest leads, traffic, status. */
export default async function AdminHome() {
  const session = await currentSession();
  if (!session) redirect("/admin/login");

  const [c, newMessages, recentMessages, traffic] = await Promise.all([
    counts(),
    newMessageCount(),
    getMessages().then((m) => m.slice(0, 5)).catch(() => []),
    visitStats(7).catch(() => null),
  ]);

  const dbActive = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL) && process.env.CONTENT_SOURCE !== "laravel";
  const fmt = (d: Date) => new Date(d).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" });

  const stats = [
    { href: "/admin/services", label: "الخدمات", count: c.services },
    { href: "/admin/projects", label: "الأعمال", count: c.projects },
    { href: "/admin/posts", label: "المقالات", count: c.posts },
    { href: "/admin/messages", label: "رسائل جديدة", count: newMessages, highlight: newMessages > 0 },
  ];
  const sources = traffic?.sources ?? [];
  const maxSrc = Math.max(1, ...sources.map((s) => s.n));

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "22px 24px 56px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, letterSpacing: ".22em", color: "var(--accent)", marginBottom: 4 }}>أهلاً بعودتك</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>لوحة تحكم الموقع</h1>
      </div>

      {/* stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 22 }}>
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="card"
            style={{ padding: "16px 18px", color: "var(--ink)", display: "block",
              borderColor: s.highlight ? "var(--accent)" : "var(--line)" }}>
            <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1,
              color: s.highlight ? "var(--accent)" : "var(--ink)", fontFamily: "ui-monospace, monospace" }}>{s.count}</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 9 }}>{s.label}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 22 }}>
        {/* latest leads */}
        <div className="card" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>آخر الرسائل</span>
            <Link href="/admin/messages" style={{ fontSize: 12.5 }}>عرض الكل ‹</Link>
          </div>
          {recentMessages.length === 0 ? (
            <p style={{ color: "var(--faint)", fontSize: 13, margin: 0 }}>لسه مفيش رسائل.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {recentMessages.map((m) => (
                <Link key={m.id} href="/admin/messages" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink)" }}>
                  <span style={{ width: 7, height: 7, borderRadius: 7, flexShrink: 0,
                    background: m.status === "new" ? "var(--accent)" : "var(--line)" }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13.5, fontWeight: m.status === "new" ? 700 : 500,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
                    <span dir="ltr" style={{ display: "block", fontSize: 11.5, color: "var(--faint)",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.email}</span>
                  </span>
                  <span style={{ fontSize: 11, color: "var(--faint)", whiteSpace: "nowrap" }}>{fmt(m.created_at)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* traffic (7d) */}
        <div className="card" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>الزيارات (آخر ٧ أيام)</span>
            <Link href="/admin/visits" style={{ fontSize: 12.5 }}>التفاصيل ‹</Link>
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
            <div><div style={{ fontSize: 24, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{traffic?.totals?.views ?? 0}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>مشاهدة</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{traffic?.totals?.sessions ?? 0}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>جلسة</div></div>
          </div>
          {sources.length === 0 ? (
            <p style={{ color: "var(--faint)", fontSize: 12.5, margin: 0 }}>هتظهر المصادر بعد أول زيارات.</p>
          ) : (
            <div style={{ display: "grid", gap: 7 }}>
              {sources.slice(0, 4).map((s) => (
                <div key={s.source} style={{ display: "grid", gap: 3 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span>{s.source}</span><span style={{ color: "var(--muted)", fontFamily: "ui-monospace, monospace" }}>{s.n}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 5, background: "var(--bg-2)", overflow: "hidden" }}>
                    <div style={{ width: `${(s.n / maxSrc) * 100}%`, height: "100%", background: "var(--accent)" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* site status */}
      <div className="card" style={{ padding: "14px 18px", display: "flex", flexWrap: "wrap", gap: 22, alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>حالة الموقع:</span>
        <span style={{ fontSize: 13 }}>مصدر المحتوى:
          <b style={{ color: dbActive ? "var(--ok)" : "var(--warn)", marginInlineStart: 6 }}>{dbActive ? "قاعدة البيانات (Neon)" : "Laravel (احتياطي)"}</b>
        </span>
        <span style={{ fontSize: 13 }}>النشر التلقائي:
          <b style={{ color: deployConfigured() ? "var(--ok)" : "var(--faint)", marginInlineStart: 6 }}>{deployConfigured() ? "مفعّل" : "غير مفعّل"}</b>
        </span>
        <Link href="/admin/pages" style={{ marginInlineStart: "auto", fontSize: 12.5 }}>الصفحات ‹</Link>
      </div>
    </div>
  );
}
