import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { contentType } from "@/lib/admin/content-types";
import { getByType } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

const LANGS = [{ code: "ar", label: "عربي" }, { code: "en", label: "إنجليزي" }];
const pick = (d: unknown, loc: string): string => {
  const dict = d as Record<string, string> | undefined;
  return dict?.[loc] ?? dict?.en ?? "";
};

/**
 * A read-only preview of a record — draft or published — showing how its content
 * reads before it goes live. It renders the record's own fields (heading, image,
 * article HTML) plus a search-result snippet, for the chosen language.
 */
export default async function PreviewPage({
  params, searchParams,
}: {
  params: Promise<{ type: string; slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  if (!(await currentSession())) redirect("/admin/login");
  const { type, slug } = await params;
  const { lang: langParam } = await searchParams;
  const lang = langParam === "en" ? "en" : "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";

  const def = contentType(type);
  if (!def) notFound();
  const row = (await getByType(def.table, slug)) as unknown as (Record<string, unknown> & { data?: Record<string, unknown>; status?: string }) | null;
  if (!row) notFound();

  const data = (row.data ?? {}) as Record<string, unknown>;
  const seo = (data.seo as Record<string, Record<string, string>> | undefined)?.[lang]
    ?? (data.seo as Record<string, Record<string, string>> | undefined)?.en;
  const title = pick(data.title, lang) || slug;
  const image = (row.image_url || row.image || row.featured_image || "") as string;
  const htmlField = def.i18n.find((f) => f.type === "html");
  const bodyHtml = htmlField ? pick(data[htmlField.key], lang) : "";
  const blurb = pick(data.shortDesc, lang) || pick(data.excerpt, lang) || pick(data.results, lang);

  const metaTitle = seo?.metaTitle || title;
  const metaDesc = seo?.metaDescription || blurb;

  return (
    <div dir={dir} style={{ maxWidth: 820, margin: "0 auto", padding: "20px 20px 80px" }}>
      <div dir="rtl" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Link href={`/admin/${type}/${slug}`} style={{ fontSize: 13, color: "var(--muted)" }}>← رجوع للتحرير</Link>
        <span style={{ fontSize: 12, fontWeight: 600, borderRadius: 20, padding: "3px 10px",
          color: row.status === "draft" ? "var(--warn)" : "var(--ok)",
          border: `1px solid ${row.status === "draft" ? "var(--warn)" : "var(--ok)"}` }}>
          {row.status === "draft" ? "مسودّة" : "منشور"}
        </span>
        <span style={{ marginInlineStart: "auto", display: "flex", gap: 6 }}>
          {LANGS.map((l) => (
            <Link key={l.code} href={`/admin/${type}/${slug}/preview?lang=${l.code}`}
              style={{ fontSize: 13, padding: "5px 12px", borderRadius: 8,
                border: `1px solid ${lang === l.code ? "var(--accent)" : "var(--line)"}`,
                background: lang === l.code ? "var(--accent)" : "var(--panel)",
                color: lang === l.code ? "var(--accent-ink)" : "var(--ink)" }}>{l.label}</Link>
          ))}
        </span>
      </div>
      <p dir="rtl" style={{ fontSize: 12, color: "var(--faint)", margin: "0 0 22px" }}>
        دي معاينة للمحتوى قبل النشر — مش التصميم النهائي للموقع بالظبط، لكن بتوريك النص والصورة زي ما هيظهروا.
      </p>

      {/* search-result snippet */}
      <div dir="ltr" style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px", marginBottom: 26 }}>
        <div style={{ fontSize: 11, color: "var(--faint)", marginBottom: 4 }}>نتيجة بحث Google (تقريبية)</div>
        <div style={{ color: "#1a0dab", fontSize: 18, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{metaTitle}</div>
        <div style={{ color: "#006621", fontSize: 13 }}>globaluntoldstory.com/{type}/{slug}</div>
        <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>{metaDesc}</div>
      </div>

      {/* the content */}
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="image — Global Untold Story" style={{ width: "100%", maxHeight: 380, objectFit: "cover", borderRadius: 12, marginBottom: 20 }} />
      )}
      <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.2, margin: "0 0 14px" }}>{title}</h1>
      {blurb && <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.7, margin: "0 0 22px" }}>{blurb}</p>}
      {bodyHtml
        ? <div style={{ fontSize: 16, lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        : <p style={{ color: "var(--faint)" }}>لا يوجد نص طويل لهذا العنصر.</p>}
    </div>
  );
}
