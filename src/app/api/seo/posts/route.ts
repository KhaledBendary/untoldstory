import { NextResponse, after, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { CONTENT_TYPES } from "@/lib/admin/content-types";
import { createByType, getByType, saveByType, logActivity } from "@/lib/db/repo";
import { assembleSeo } from "@/lib/admin/seo-fields";
import { translationConfigured } from "@/lib/translate";
import { translateOne, type Dict, type Row } from "@/lib/translate/translate-item";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Where the SEO Command Center publishes an article.
 *
 * It used to commit the article into src/data/seo-generated-posts.ts — a static
 * file merged into the site's content. That page went live, but the CMS (which
 * reads only the database) never knew it existed, so it was missing from the
 * dashboard's article list and never went through machine translation (every
 * /xx/insights/<slug> served the English text). Publishing into the posts table
 * fixes both: it shows up in the admin, is editable there, and is translated by
 * the same pipeline as everything else.
 *
 * Machine-to-machine, so no admin session: a shared secret (SEO_TOOL_SECRET)
 * set on both projects. Without it configured here, the endpoint refuses and the
 * SEO tool falls back to the legacy file path.
 */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function authorized(request: NextRequest, secret: string): boolean {
  const given = Buffer.from((request.headers.get("authorization") || "").replace(/^Bearer\s+/i, ""));
  const want = Buffer.from(secret);
  return given.length === want.length && timingSafeEqual(given, want);
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function fixedFromRow(row: Row): Record<string, string | boolean | number | null> {
  const def = CONTENT_TYPES.posts;
  const fixed: Record<string, string | boolean | number | null> = {};
  for (const f of def.fixed) {
    const v = row[f.key];
    if (f.type === "bool") fixed[f.key] = Boolean(v);
    else if (f.type === "date") fixed[f.key] = v ? new Date(v as string).toISOString().slice(0, 10) : "";
    else fixed[f.key] = (v as string | number | null) ?? "";
  }
  return fixed;
}

export async function POST(request: NextRequest) {
  const secret = process.env.SEO_TOOL_SECRET;
  if (!secret) return NextResponse.json({ error: "not-configured" }, { status: 503 });
  if (!authorized(request, secret)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid-body" }, { status: 400 });

  const slug = str(body.slug, 120).toLowerCase();
  const title = str(body.title, 200);
  const excerpt = str(body.excerpt, 500);
  const bodyHtml = typeof body.bodyHtml === "string" ? body.bodyHtml.trim() : "";
  if (!SLUG_RE.test(slug)) return NextResponse.json({ error: "invalid-slug" }, { status: 422 });
  if (title.length < 3) return NextResponse.json({ error: "title-required" }, { status: 422 });
  if (bodyHtml.length < 80 || bodyHtml.length > 400_000) return NextResponse.json({ error: "invalid-body-length" }, { status: 422 });

  const def = CONTENT_TYPES.posts;
  const existing = (await getByType("posts", slug)) as unknown as Row | null;
  if (existing && body.overwrite !== true) return NextResponse.json({ error: "exists", slug }, { status: 409 });

  const data: Record<string, Dict> = {
    title: { en: title },
    excerpt: { en: excerpt || title },
    body: { en: bodyHtml },
    "seo.metaTitle": { en: str(body.metaTitle, 120) || title },
    "seo.metaDescription": { en: str(body.metaDescription, 320) || excerpt },
    "seo.focusKeyword": { en: str(body.focusKeyword, 120) },
  };

  // Validate-and-report without touching the database — lets the SEO tool (and
  // a deploy check) prove the connection and secret work before a real publish.
  if (body.dryRun === true) {
    return NextResponse.json({ ok: true, dryRun: true, slug, wouldCreate: !existing, translationConfigured: translationConfigured() });
  }

  if (existing) {
    // Re-publishing: replace only the English text; keep every fixed column
    // (image, category, flags) and every other locale as the admin left them.
    const seoDoc = (existing.data as { seo?: Record<string, Record<string, string>> })?.seo;
    assembleSeo(data, seoDoc as never);
    await saveByType("posts", slug, fixedFromRow(existing), data);
  } else {
    const fixed: Record<string, string | boolean | number | null> = {
      featured_image: str(body.featuredImage, 300) || "/images/film-crew-pyramids-production.jpg",
      author_name: str(body.author, 120) || "Global Untold Story",
      category_slug: str(body.category, 80) || "Production",
      read_minutes: Math.max(1, Math.min(60, Math.round(Number(body.readMinutes) || bodyHtml.replace(/<[^>]+>/g, " ").split(/\s+/).length / 220))),
      is_featured: false,
      og_image: null,
      noindex: false,
      scheduled_at: null,
    };
    assembleSeo(data, undefined);
    await createByType("posts", slug, fixed, data, "published");
  }

  await logActivity({
    actor: "seo-system",
    action: existing ? "update" : "create",
    entity: "posts",
    ref: slug,
    detail: "نُشرت من نظام السيو",
  });

  // Translate after the response goes out — twelve languages of a full article
  // takes longer than the SEO tool's own request is allowed to wait.
  const translating = translationConfigured();
  if (translating) {
    after(async () => {
      try {
        const row = (await getByType("posts", slug)) as unknown as Row | null;
        if (row) await translateOne("posts", def, row, undefined, Boolean(existing));
      } catch (error) {
        console.error(`SEO publish: translation of posts/${slug} failed:`, error);
      }
    });
  }

  return NextResponse.json({
    ok: true,
    slug,
    created: !existing,
    translating,
    url: `/insights/${slug}`,
    adminUrl: `/admin/posts/${slug}`,
  });
}
