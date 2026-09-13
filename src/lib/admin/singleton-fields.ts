/**
 * The editable fields inside the one-off pages (home / layout / about).
 *
 * These documents are large and deeply nested, and most of their keys are
 * structural. What an editor actually changes is a smaller set of text: contact
 * details, the hero lines, the announcement bar, the page's SEO. Each entry is
 * the path to a value inside the document, grouped for the screen. Repeating
 * blocks (stats, offices, team) are arrays and get their own editor later — this
 * covers the single-value text first.
 */

export type SingletonFieldType = "text" | "textarea";
export type SingletonField = { path: string; label: string; type: SingletonFieldType; ltr?: boolean };
export type SingletonGroup = { title: string; fields: SingletonField[] };

export type SingletonDef = { key: string; labelAr: string; groups: SingletonGroup[] };

export const SINGLETONS: Record<string, SingletonDef> = {
  layout: {
    key: "layout", labelAr: "الترويسة والفوتر",
    groups: [
      { title: "معلومات الموقع", fields: [
        { path: "site_config.name", label: "اسم الموقع", type: "text" },
        { path: "site_config.tagline", label: "الشعار النصّي", type: "text" },
        { path: "site_config.description", label: "الوصف", type: "textarea" },
        { path: "footer.brandDesc", label: "وصف الفوتر", type: "textarea" },
      ]},
      { title: "بيانات الاتصال", fields: [
        { path: "site_config.email", label: "البريد الإلكتروني", type: "text", ltr: true },
        { path: "site_config.phone", label: "التليفون", type: "text", ltr: true },
        { path: "site_config.address", label: "العنوان", type: "text" },
        { path: "site_config.workingHours", label: "مواعيد العمل", type: "text" },
      ]},
      { title: "السوشيال ميديا", fields: [
        { path: "site_config.socialLinks.instagram", label: "إنستجرام", type: "text", ltr: true },
        { path: "site_config.socialLinks.facebook", label: "فيسبوك", type: "text", ltr: true },
        { path: "site_config.socialLinks.linkedin", label: "لينكدإن", type: "text", ltr: true },
        { path: "site_config.socialLinks.vimeo", label: "فيميو", type: "text", ltr: true },
      ]},
      { title: "شريط الإعلان", fields: [
        { path: "announcement.text", label: "نص الإعلان", type: "text" },
      ]},
    ],
  },
  home: {
    key: "home", labelAr: "الصفحة الرئيسية",
    groups: [
      { title: "الواجهة (الهيرو)", fields: [
        { path: "hero.badge", label: "الشارة", type: "text" },
        { path: "hero.headline1", label: "العنوان الأول", type: "text" },
        { path: "hero.headline2", label: "العنوان الثاني", type: "text" },
        { path: "hero.headline3", label: "العنوان الثالث", type: "text" },
        { path: "hero.subtext", label: "النص التحتي", type: "textarea" },
      ]},
      { title: "بانر الدعوة للتواصل", fields: [
        { path: "cta_banner.title", label: "العنوان", type: "text" },
        { path: "cta_banner.text", label: "النص", type: "textarea" },
        { path: "cta_banner.cta_label", label: "زر الدعوة", type: "text" },
      ]},
      { title: "السيو (تحسين محركات البحث)", fields: [
        { path: "seo.metaTitle", label: "عنوان الصفحة", type: "text" },
        { path: "seo.metaDescription", label: "وصف الصفحة", type: "textarea" },
      ]},
    ],
  },
  about: {
    key: "about", labelAr: "صفحة من نحن",
    groups: [
      { title: "رأس الصفحة", fields: [
        { path: "page.badge", label: "الشارة", type: "text" },
        { path: "page.title", label: "العنوان", type: "text" },
        { path: "page.subtitle", label: "العنوان الفرعي", type: "textarea" },
      ]},
    ],
  },
};

export const singletonDef = (key: string): SingletonDef | null => SINGLETONS[key] ?? null;

// ---- nested get/set by dotted path ----

export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

export function setPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  const last = keys.pop()!;
  let o = obj;
  for (const k of keys) {
    if (typeof o[k] !== "object" || o[k] === null) o[k] = {};
    o = o[k] as Record<string, unknown>;
  }
  o[last] = value;
}
