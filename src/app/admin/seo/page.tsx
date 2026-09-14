import { redirect } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { getServices, getProjects, getPosts } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

type Row = { slug: string; status: string; noindex: boolean; scheduled_at: Date | null; data: Record<string, unknown> };

function stateOf(r: Row): { label: string; color: string; indexed: boolean } {
  if (r.status !== "published") return { label: "مسودّة", color: "var(--warn)", indexed: false };
  if (r.scheduled_at && new Date(r.scheduled_at).getTime() > Date.now()) return { label: "مجدول", color: "var(--muted)", indexed: false };
  if (r.noindex) return { label: "مخفي (noindex)", color: "var(--danger)", indexed: false };
  return { label: "مفهرس", color: "var(--ok)", indexed: true };
}
const hasSeo = (r: Row) => {
  const seo = (r.data.seo as Record<string, Record<string, string>> | undefined)?.en;
  return Boolean(seo?.metaTitle && seo?.metaDescription);
};

function Section({ label, base, rows }: { label: string; base: string; rows: Row[] }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px" }}>{label}</h2>
      <div className="card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ color: "var(--faint)" }}>
            {["العنصر", "الحالة", "وصف SEO", "الرابط"].map((h) => (
              <th key={h} style={{ textAlign: "start", padding: "9px 12px", fontWeight: 500, borderBottom: "1px solid var(--line)" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {rows.map((r) => {
              const s = stateOf(r);
              const title = (r.data.title as Record<string, string> | undefined);
              return (
                <tr key={r.slug}>
                  <td style={{ padding: "8px 12px", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <Link href={`/admin/${base}/${r.slug}`} style={{ color: "var(--ink)" }}>{title?.ar || title?.en || r.slug}</Link>
                  </td>
                  <td style={{ padding: "8px 12px" }}><span style={{ color: s.color, fontWeight: 600 }}>{s.label}</span></td>
                  <td style={{ padding: "8px 12px" }}>{hasSeo(r) ? <span style={{ color: "var(--ok)" }}>✓</span> : <span style={{ color: "var(--warn)" }}>ناقص</span>}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <a href={`https://globaluntoldstory.com/${base === "posts" ? "insights" : base === "projects" ? "work" : "services"}/${r.slug}`} target="_blank" dir="ltr" style={{ fontSize: 12 }}>فتح ↗</a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function SeoPage() {
  if (!(await currentSession())) redirect("/admin/login");
  const [services, projects, posts] = await Promise.all([getServices(), getProjects(), getPosts()]);
  const all = [...services, ...projects, ...posts] as unknown as Row[];
  const indexable = all.filter((r) => stateOf(r).indexed).length;
  const noindex = all.filter((r) => r.noindex).length;
  const draft = all.filter((r) => r.status !== "published").length;
  const missingSeo = all.filter((r) => stateOf(r).indexed && !hasSeo(r)).length;

  const cards = [
    { n: indexable, l: "مفهرس" }, { n: draft, l: "مسودّة" },
    { n: noindex, l: "مخفي (noindex)" }, { n: missingSeo, l: "ناقص وصف SEO" },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "22px 24px 56px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, flex: 1 }}>السيو والفهرسة</h1>
        <a href="https://globaluntoldstory.com/sitemap.xml" target="_blank" dir="ltr" style={{ fontSize: 12.5 }}>sitemap.xml ↗</a>
        <a href="https://search.google.com/search-console" target="_blank" style={{ fontSize: 12.5 }}>Search Console ↗</a>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--faint)", margin: "0 0 18px" }}>
        الحالة دي حسب إعدادات الموقع (منشور/مخفي/مجدول). حالة الفهرسة الفعلية في جوجل بتتشاف من Search Console.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 22 }}>
        {cards.map((c) => (
          <div key={c.l} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{c.n}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>{c.l}</div>
          </div>
        ))}
      </div>

      <Section label="الخدمات" base="services" rows={services as unknown as Row[]} />
      <Section label="الأعمال" base="projects" rows={projects as unknown as Row[]} />
      <Section label="المقالات" base="posts" rows={posts as unknown as Row[]} />
    </div>
  );
}
