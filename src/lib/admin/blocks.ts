/**
 * Repeating blocks inside the one-off pages — the lists whose every item has the
 * same shape (the homepage stats, the production steps, the about-page timeline,
 * the footer offices…). The single-value editor in singleton-fields.ts covers
 * the one-of-a-kind text; this covers the arrays, where an editor adds, removes,
 * reorders and edits items.
 *
 * Each field is either translatable (`i18n`, written per language) or fixed (an
 * emoji, a colour, a number, an image — the same in every language). A `noTranslate`
 * i18n field is authored per language but never machine-translated (a person's
 * name): its machine copies keep the English. Only the blocks that the public
 * site actually renders are listed.
 */

export type BlockFieldType = "text" | "textarea" | "emoji" | "number" | "color" | "image";
export type BlockField = {
  key: string;
  label: string;
  type: BlockFieldType;
  i18n?: boolean;        // written per language (default: fixed, shared across languages)
  noTranslate?: boolean; // i18n but never machine-translated (e.g. a name)
};

export type SingletonBlock = {
  key: string;                          // url + api segment, unique
  singleton: "home" | "layout" | "about";
  path: string;                         // dotted path to the array inside a locale doc
  labelAr: string;
  itemLabelAr: string;                  // "خطوة", "إحصائية"
  titleField: string;                   // field shown as each item's heading in the list
  fields: BlockField[];
  // When true the array holds plain translatable strings, not objects. The
  // editor still uses `fields` (one field named "value"); only the stored shape
  // differs — string[] per locale instead of object[].
  scalar?: boolean;
};

export const SINGLETON_BLOCKS: Record<string, SingletonBlock> = {
  "home-stats": {
    key: "home-stats", singleton: "home", path: "stats",
    labelAr: "الإحصائيات", itemLabelAr: "إحصائية", titleField: "label",
    fields: [
      { key: "value", label: "الرقم (مثلاً 50+ أو 90%)", type: "text" },
      { key: "label", label: "الوصف", type: "text", i18n: true },
      { key: "icon", label: "الأيقونة", type: "emoji" },
    ],
  },
  "home-process": {
    key: "home-process", singleton: "home", path: "process.steps",
    labelAr: "خطوات دورة الإنتاج", itemLabelAr: "خطوة", titleField: "title",
    fields: [
      { key: "step", label: "رقم الخطوة (مثلاً 01)", type: "text" },
      { key: "title", label: "العنوان", type: "text", i18n: true },
      { key: "desc", label: "الوصف", type: "textarea", i18n: true },
    ],
  },
  "home-awards": {
    key: "home-awards", singleton: "home", path: "awards",
    labelAr: "الجوائز", itemLabelAr: "جائزة", titleField: "title",
    fields: [
      { key: "icon", label: "الأيقونة", type: "emoji" },
      { key: "color", label: "اللون", type: "color" },
      { key: "title", label: "العنوان", type: "text", i18n: true },
      { key: "organization", label: "الجهة", type: "text", i18n: true },
      { key: "yearLabel", label: "السنة", type: "text" },
    ],
  },
  "about-team": {
    key: "about-team", singleton: "about", path: "team",
    labelAr: "الفريق", itemLabelAr: "عضو", titleField: "name",
    fields: [
      { key: "name", label: "الاسم", type: "text", i18n: true, noTranslate: true },
      { key: "role", label: "المنصب", type: "text", i18n: true },
      { key: "bio", label: "نبذة", type: "textarea", i18n: true },
      { key: "image", label: "الصورة", type: "image" },
      { key: "slug", label: "المعرّف (بالإنجليزي)", type: "text" },
    ],
  },
  "about-partners": {
    key: "about-partners", singleton: "about", path: "partnerLabels",
    labelAr: "أسماء الشركاء", itemLabelAr: "شريك", titleField: "value", scalar: true,
    fields: [
      { key: "value", label: "الاسم", type: "text", i18n: true },
    ],
  },
  "layout-about-links": {
    key: "layout-about-links", singleton: "layout", path: "footer.aboutLinks",
    labelAr: "روابط قائمة الفوتر", itemLabelAr: "رابط", titleField: "label",
    fields: [
      { key: "href", label: "الرابط (مثلاً /work)", type: "text" },
      { key: "label", label: "النص الظاهر", type: "text", i18n: true },
    ],
  },
  "layout-offices": {
    key: "layout-offices", singleton: "layout", path: "footer.offices",
    labelAr: "المكاتب", itemLabelAr: "مكتب", titleField: "region",
    fields: [
      { key: "region", label: "المنطقة", type: "text", i18n: true },
      { key: "address", label: "العنوان", type: "textarea", i18n: true },
      { key: "phone", label: "التليفون", type: "text" },
    ],
  },
};

export const singletonBlock = (key: string): SingletonBlock | null => SINGLETON_BLOCKS[key] ?? null;
