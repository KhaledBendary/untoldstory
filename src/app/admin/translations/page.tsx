import { redirect } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { getServices, getProjects, getPosts } from "@/lib/db/repo";
import { LOCALE_CODES } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const LOCALES = LOCALE_CODES;
const LOCALE_LABEL: Record<string, string> = {
  en: "EN", ar: "AR", fr: "FR", de: "DE", es: "ES", it: "IT", pt: "PT",
  tr: "TR", ru: "RU", zh: "ZH", ja: "JA", ko: "KO", pl: "PL", sw: "SW",
};

type Dict = Record<string, string> | undefined;
type Item = { slug: string; title: string; present: Record<string, boolean>; done: number };

/** How complete each item is across the indexed languages — checked on the title. */
function analyze(rows: { slug: string; data: { title?: Dict } }[]): Item[] {
  return rows.map((r) => {
    const t = r.data.title ?? {};
    const present: Record<string, boolean> = {};
    let done = 0;
    for (const l of LOCALES) {
      const ok = Boolean((t[l] ?? "").trim());
      present[l] = ok;
      if (ok) done++;
    }
    return { slug: r.slug, title: (t.ar || t.en || r.slug), present, done };
  });
}

function Section({ label, type, items }: { label: string; type: string; items: Item[] }) {
  const total = items.length * LOCALES.length;
  const filled = items.reduce((a, i) => a + i.done, 0);
  const pct = total ? Math.round((filled / total) * 100) : 100;
  return (
    <section style={{ marginBottom: 26 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{label}</h2>
        <span style={{ fontSize: 12.5, color: pct === 100 ? "var(--ok)" : "var(--warn)" }}>{pct}% مكتمل</span>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "start", padding: "10px 12px", fontWeight: 500, color: "var(--faint)", borderBottom: "1px solid var(--line)" }}>العنصر</th>
              {LOCALES.map((l) => (
                <th key={l} style={{ padding: "10px 4px", fontWeight: 600, color: "var(--faint)", fontSize: 11, borderBottom: "1px solid var(--line)" }}>{LOCALE_LABEL[l] ?? l.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.slug}>
                <td style={{ padding: "8px 12px", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <Link href={`/admin/${type}/${it.slug}`} style={{ color: "var(--ink)" }}>{it.title}</Link>
                </td>
                {LOCALES.map((l) => (
                  <td key={l} style={{ textAlign: "center", padding: "8px 4px" }}>
                    <span title={it.present[l] ? "مترجم" : "ناقص"} style={{
                      display: "inline-block", width: 9, height: 9, borderRadius: 9,
                      background: it.present[l] ? "var(--ok)" : "color-mix(in srgb, var(--danger) 55%, transparent)" }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function TranslationsPage() {
  if (!(await currentSession())) redirect("/admin/login");
  const [services, projects, posts] = await Promise.all([getServices(), getProjects(), getPosts()]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "22px 24px 56px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>اكتمال الترجمة</h1>
      <p style={{ fontSize: 12.5, color: "var(--faint)", margin: "0 0 8px" }}>
        <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 9, background: "var(--ok)", marginInlineEnd: 5 }} /> مترجم
        <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 9, background: "color-mix(in srgb, var(--danger) 55%, transparent)", margin: "0 5px 0 14px" }} /> ناقص
      </p>
      <div style={{ marginBottom: 20 }} />
      <Section label="الخدمات" type="services" items={analyze(services)} />
      <Section label="الأعمال" type="projects" items={analyze(projects)} />
      <Section label="المقالات" type="posts" items={analyze(posts)} />
    </div>
  );
}
