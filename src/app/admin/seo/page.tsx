import { redirect } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { getServices, getProjects, getPosts } from "@/lib/db/repo";
import { LOCALE_CODES, INDEXABLE_LOCALES } from "@/lib/i18n";

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

  // Each item is published in every language, but only the indexable locales are
  // meant to appear in Google — the rest are English shells kept out on purpose.
  // This is the main reason Google reports many "not indexed" URLs.
  const shellLocales = LOCALE_CODES.filter((l) => !INDEXABLE_LOCALES.includes(l));
  const indexablePages = indexable * INDEXABLE_LOCALES.length;
  const shellPages = indexable * shellLocales.length;

  // ---- SEO issues & recommendations (checked on the English metadata of the
  // pages Google actually indexes) ----
  type Typed = Row & { _type: string; _base: string };
  const typed: Typed[] = [
    ...services.map((r) => ({ ...r, _type: "الخدمات", _base: "services" })),
    ...projects.map((r) => ({ ...r, _type: "الأعمال", _base: "projects" })),
    ...posts.map((r) => ({ ...r, _type: "المقالات", _base: "posts" })),
  ] as unknown as Typed[];
  const live = typed.filter((r) => stateOf(r).indexed);

  const titleCounts = new Map<string, number>();
  for (const r of live) {
    const t = ((r.data.seo as Record<string, Record<string, string>> | undefined)?.en?.metaTitle || "").trim().toLowerCase();
    if (t) titleCounts.set(t, (titleCounts.get(t) ?? 0) + 1);
  }
  const seoIssues = (r: Typed): string[] => {
    const seoEn = (r.data.seo as Record<string, Record<string, string>> | undefined)?.en ?? {};
    const title = (seoEn.metaTitle || "").trim();
    const desc = (seoEn.metaDescription || "").trim();
    const out: string[] = [];
    if (!title) out.push("عنوان SEO ناقص");
    else if (title.length > 60) out.push(`عنوان SEO طويل (${title.length})`);
    else if (title.length < 25) out.push(`عنوان SEO قصير (${title.length})`);
    if (!desc) out.push("وصف SEO ناقص");
    else if (desc.length > 160) out.push(`وصف SEO طويل (${desc.length})`);
    else if (desc.length < 70) out.push(`وصف SEO قصير (${desc.length})`);
    if (title && (titleCounts.get(title.toLowerCase()) ?? 0) > 1) out.push("عنوان SEO مكرّر");
    return out;
  };
  const withIssues = live.map((r) => ({ r, issues: seoIssues(r) })).filter((x) => x.issues.length > 0);
  const clean = live.length - withIssues.length;
  const seoScore = live.length ? Math.round((clean / live.length) * 100) : 100;
  const scoreColor = seoScore >= 80 ? "var(--ok)" : seoScore >= 50 ? "var(--warn)" : "var(--danger)";
  const nameOf = (r: Typed) => (r.data.title as Record<string, string> | undefined)?.ar || (r.data.title as Record<string, string> | undefined)?.en || r.slug;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "22px 24px 56px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, flex: 1 }}>السيو والفهرسة</h1>
        <Link href="/admin/seo-settings" style={{ fontSize: 12.5 }}>إعدادات SEO/GEO ⚙</Link>
        <a href="https://globaluntoldstory.com/sitemap.xml" target="_blank" dir="ltr" style={{ fontSize: 12.5 }}>sitemap.xml ↗</a>
        <a href="https://search.google.com/search-console" target="_blank" style={{ fontSize: 12.5 }}>Search Console ↗</a>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--faint)", margin: "0 0 18px" }}>
        الحالة دي حسب إعدادات الموقع (منشور/مخفي/مجدول). حالة الفهرسة الفعلية في جوجل بتتشاف من Search Console.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 22 }}>
        <div className="card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "ui-monospace, monospace", color: scoreColor }}>{seoScore}%</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>درجة السيو العامة</div>
        </div>
        {cards.map((c) => (
          <div key={c.l} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{c.n}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>{c.l}</div>
          </div>
        ))}
      </div>

      <section style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px" }}>
          مشاكل وتوصيات <span style={{ color: withIssues.length ? "var(--warn)" : "var(--ok)", fontWeight: 400, fontSize: 13 }}>
            {withIssues.length ? `${withIssues.length} عنصر محتاج تحسين` : "كل العناصر المفهرسة سليمة ✓"}
          </span>
        </h2>
        {withIssues.length > 0 && (
          <div className="card" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ color: "var(--faint)" }}>
                {["العنصر", "النوع", "المشاكل"].map((h) => (
                  <th key={h} style={{ textAlign: "start", padding: "9px 12px", fontWeight: 500, borderBottom: "1px solid var(--line)" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {withIssues.map(({ r, issues }) => (
                  <tr key={`${r._base}-${r.slug}`}>
                    <td style={{ padding: "8px 12px", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <Link href={`/admin/${r._base}/${r.slug}`} style={{ color: "var(--ink)" }}>{nameOf(r)}</Link>
                    </td>
                    <td style={{ padding: "8px 12px", color: "var(--muted)" }}>{r._type}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {issues.map((iss, n) => (
                          <span key={n} style={{ fontSize: 11.5, padding: "2px 8px", borderRadius: 20, background: "color-mix(in srgb, var(--warn) 16%, transparent)", color: "var(--warn)" }}>{iss}</span>
                        ))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="card" style={{ padding: "14px 16px", marginBottom: 22 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px" }}>الفهرسة حسب اللغة</h2>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 8px", lineHeight: 1.7 }}>
          كل عنصر منشور موجود بكل الـ{LOCALE_CODES.length} لغة، بس <strong>{INDEXABLE_LOCALES.length} لغات بس هي المسموح لجوجل يفهرسها</strong>
          {" "}({INDEXABLE_LOCALES.join("، ")}). الباقي ({shellLocales.join("، ")}) نسخ إنجليزية متعلّمة <code>noindex</code> عمداً لحد ما تتترجم فعلاً.
        </p>
        <p style={{ fontSize: 12.5, color: "var(--faint)", margin: 0 }}>
          يعني المفروض جوجل يفهرس ≈ <strong>{indexablePages}</strong> رابط، و≈ <strong>{shellPages}</strong> رابط بيظهروا في GSC كـ
          «Excluded by noindex» — وده <strong>طبيعي ومقصود</strong>، مش خطأ. لما نترجم الـ{shellLocales.length} لغات دي هنفتح فهرستها.
        </p>
      </div>

      <Section label="الخدمات" base="services" rows={services as unknown as Row[]} />
      <Section label="الأعمال" base="projects" rows={projects as unknown as Row[]} />
      <Section label="المقالات" base="posts" rows={posts as unknown as Row[]} />
    </div>
  );
}
