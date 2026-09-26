/**
 * What each content type is made of — the single description the dashboard
 * builds every list, editor, and validation from. Adding a field is a line
 * here, not a new screen.
 *
 * `fixed` fields are the same across languages (an image, a flag) and map to
 * real columns. `i18n` fields are written per language ({ en, ar, … }) and live
 * in the JSONB `data` column. `required` means English is mandatory — it is the
 * source the other languages translate from.
 */

export type FixedType = "text" | "image" | "bool" | "number" | "date" | "emoji";
export type I18nType = "text" | "textarea" | "html";

export type FixedField = { key: string; label: string; type: FixedType };
export type I18nField = { key: string; label: string; type: I18nType; required?: boolean; noTranslate?: boolean };

/**
 * The full per-item SEO field set, shared by every content type. Stored nested
 * in data.seo.<locale>. metaTitle/metaDescription and the social overrides are
 * machine-translated; the focus keyword, canonical URL and robots flag are not.
 */
export const SEO_I18N: I18nField[] = [
  { key: "seo.metaTitle", label: "عنوان محرّكات البحث (SEO)", type: "text" },
  { key: "seo.metaDescription", label: "وصف محرّكات البحث (SEO)", type: "textarea" },
  { key: "seo.ogTitle", label: "عنوان المشاركة (Open Graph)", type: "text" },
  { key: "seo.ogDescription", label: "وصف المشاركة (Open Graph)", type: "textarea" },
  { key: "seo.twitterTitle", label: "عنوان تويتر", type: "text" },
  { key: "seo.twitterDescription", label: "وصف تويتر", type: "textarea" },
  { key: "seo.focusKeyword", label: "الكلمة المفتاحية", type: "text", noTranslate: true },
  { key: "seo.canonical", label: "الرابط الأساسي (Canonical)", type: "text", noTranslate: true },
  { key: "seo.nofollow", label: "منع تتبّع الروابط (nofollow)", type: "text", noTranslate: true },
];

export type ContentType = {
  key: string;          // url + api segment
  table: "services" | "projects" | "posts";
  labelAr: string;      // "الخدمات"
  singularAr: string;   // "خدمة"
  titleField: string;   // which i18n field is the row's name
  orderable: boolean;   // whether the site orders this type by sort_order (posts go by date)
  seo: boolean;         // whether the detail page reads metaTitle/metaDescription
  fixed: FixedField[];
  i18n: I18nField[];
};

export const CONTENT_TYPES: Record<string, ContentType> = {
  services: {
    key: "services", table: "services", labelAr: "الخدمات", singularAr: "خدمة",
    titleField: "title", orderable: true, seo: true,
    fixed: [
      { key: "icon", label: "الأيقونة", type: "emoji" },
      { key: "price", label: "السعر", type: "text" },
      { key: "image_url", label: "رابط الصورة", type: "image" },
      { key: "is_featured", label: "خدمة مميّزة", type: "bool" },
      { key: "og_image", label: "صورة المشاركة (OG)", type: "image" },
      { key: "noindex", label: "إخفاء من محركات البحث", type: "bool" },
      { key: "scheduled_at", label: "موعد النشر (اختياري)", type: "date" },
    ],
    i18n: [
      { key: "title", label: "العنوان", type: "text", required: true },
      { key: "shortDesc", label: "الوصف المختصر", type: "textarea" },
      { key: "fullDesc", label: "الوصف الكامل", type: "html" },
      // Optional, up to 5 pairs — empty ones are simply not shown on the
      // page. Fills in for src/data/service-faqs.ts's hardcoded English-only
      // FAQs, which had no way to translate since they lived in source code,
      // not the database (see ServiceDetail.tsx / services/[slug]/page.tsx).
      { key: "faq1_q", label: "سؤال شائع 1", type: "text" },
      { key: "faq1_a", label: "إجابة السؤال 1", type: "textarea" },
      { key: "faq2_q", label: "سؤال شائع 2", type: "text" },
      { key: "faq2_a", label: "إجابة السؤال 2", type: "textarea" },
      { key: "faq3_q", label: "سؤال شائع 3", type: "text" },
      { key: "faq3_a", label: "إجابة السؤال 3", type: "textarea" },
      { key: "faq4_q", label: "سؤال شائع 4", type: "text" },
      { key: "faq4_a", label: "إجابة السؤال 4", type: "textarea" },
      { key: "faq5_q", label: "سؤال شائع 5", type: "text" },
      { key: "faq5_a", label: "إجابة السؤال 5", type: "textarea" },
      ...SEO_I18N,
    ],
  },
  projects: {
    key: "projects", table: "projects", labelAr: "الأعمال", singularAr: "مشروع",
    titleField: "title", orderable: true, seo: true,
    fixed: [
      { key: "image", label: "الصورة", type: "image" },
      { key: "video", label: "رابط الفيديو", type: "text" },
      { key: "category_slug", label: "تصنيف (بالإنجليزي)", type: "text" },
      { key: "is_featured", label: "مشروع مميّز", type: "bool" },
      { key: "og_image", label: "صورة المشاركة (OG)", type: "image" },
      { key: "noindex", label: "إخفاء من محركات البحث", type: "bool" },
      { key: "scheduled_at", label: "موعد النشر (اختياري)", type: "date" },
    ],
    i18n: [
      { key: "title", label: "العنوان", type: "text", required: true },
      { key: "client", label: "العميل", type: "text" },
      { key: "category", label: "التصنيف", type: "text" },
      { key: "shortDescription", label: "وصف مختصر", type: "textarea" },
      { key: "description", label: "الوصف الكامل", type: "html" },
      { key: "results", label: "النتائج", type: "textarea" },
      { key: "metric", label: "المؤشر", type: "text" },
      ...SEO_I18N,
    ],
  },
  posts: {
    key: "posts", table: "posts", labelAr: "المقالات", singularAr: "مقالة",
    titleField: "title", orderable: false, seo: true,
    fixed: [
      { key: "featured_image", label: "الصورة", type: "image" },
      { key: "author_name", label: "الكاتب", type: "text" },
      { key: "category_slug", label: "تصنيف (بالإنجليزي)", type: "text" },
      { key: "read_minutes", label: "دقائق القراءة", type: "number" },
      { key: "is_featured", label: "مقالة مميّزة", type: "bool" },
      { key: "og_image", label: "صورة المشاركة (OG)", type: "image" },
      { key: "noindex", label: "إخفاء من محركات البحث", type: "bool" },
      { key: "scheduled_at", label: "موعد النشر (اختياري)", type: "date" },
    ],
    i18n: [
      { key: "title", label: "العنوان", type: "text", required: true },
      { key: "excerpt", label: "المقتطف", type: "textarea" },
      { key: "body", label: "نص المقالة", type: "html" },
      ...SEO_I18N,
    ],
  },
};

export const contentType = (key: string): ContentType | null => CONTENT_TYPES[key] ?? null;
