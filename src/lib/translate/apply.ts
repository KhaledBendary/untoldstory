import "server-only";
import { MACHINE_LOCALES, PartialTranslateError, translateFields, translatePair, translationConfigured, type FieldToTranslate, type MachineLocale } from "@/lib/translate";
import type { ContentType } from "@/lib/admin/content-types";
import type { Dict } from "@/lib/content-validate";
import { getPath, type SingletonField } from "@/lib/admin/singleton-fields";
import type { Singleton } from "@/lib/db/repo";

const HTML_TAG_RE = /<[a-z][^>]*>/i;

/**
 * Fill in whichever of English/Arabic is missing from the other, in place.
 * Either language may be the one a person actually wrote — if only English was
 * filled in, Arabic is machine-translated from it, and vice versa, so Arabic is
 * never silently left as an English copy (the old behavior when it was assumed
 * a person would always write both by hand). Runs before the machine-locale
 * pass, which needs English filled in to work from.
 */
async function syncEnglishArabic(def: ContentType, data: Record<string, Dict>): Promise<{ warning?: string }> {
  const toAr: FieldToTranslate[] = [];
  const toEn: FieldToTranslate[] = [];
  for (const field of def.i18n) {
    if (field.noTranslate) continue; // keywords, canonical URLs, flags — never translate
    const en = data[field.key]?.en?.trim();
    const ar = data[field.key]?.ar?.trim();
    const isHtml = field.type === "html";
    const format = isHtml ? "html" : "text";
    // Same fallback-detection gap the machine-locale pass had: a language
    // whose saved value is just a leftover copy of the other one (from before
    // translation was configured) looked "already filled" forever and was
    // never revisited, since the old check only asked whether it was empty —
    // plus the same "structurally not a real translation" case (an HTML field
    // whose stale value has no tags at all, unrelated to either language).
    const arLooksStale = !ar || ar === en || (isHtml && HTML_TAG_RE.test(en || "") && !HTML_TAG_RE.test(ar));
    const enLooksStale = !en || en === ar || (isHtml && HTML_TAG_RE.test(ar || "") && !HTML_TAG_RE.test(en));
    if (en && arLooksStale) toAr.push({ key: field.key, format, text: en });
    else if (ar && enLooksStale) toEn.push({ key: field.key, format, text: ar });
  }
  if (!toAr.length && !toEn.length) return {};
  // Each direction is caught on its own, and a PartialTranslateError's
  // partial results are still applied — one bad field (e.g. a large HTML
  // body the model truncated into malformed JSON) used to throw away every
  // OTHER field's already-successful translation from the same call, which
  // is why a title/excerpt could translate fine while the body silently
  // stayed in the source language on the exact same save.
  const warnings: string[] = [];
  if (toAr.length) {
    try {
      const filled = await translatePair(toAr, "en", "ar");
      for (const [key, text] of Object.entries(filled)) data[key] = { ...data[key], ar: text };
    } catch (e) {
      if (e instanceof PartialTranslateError) {
        for (const [key, text] of Object.entries(e.partial as Record<string, string>)) data[key] = { ...data[key], ar: text };
      }
      console.error("English/Arabic sync (en->ar) failed:", e);
      warnings.push(`فشلت ترجمة بعض الحقول للعربي — ${((e as Error).message || "").slice(0, 250)}`);
    }
  }
  if (toEn.length) {
    try {
      const filled = await translatePair(toEn, "ar", "en");
      for (const [key, text] of Object.entries(filled)) data[key] = { ...data[key], en: text };
    } catch (e) {
      if (e instanceof PartialTranslateError) {
        for (const [key, text] of Object.entries(e.partial as Record<string, string>)) data[key] = { ...data[key], en: text };
      }
      console.error("English/Arabic sync (ar->en) failed:", e);
      warnings.push(`فشلت ترجمة بعض الحقول للإنجليزي — ${((e as Error).message || "").slice(0, 250)}`);
    }
  }
  return warnings.length ? { warning: warnings.join(" | ") } : {};
}

/**
 * A URL-safe slug from a title.
 *
 * Folds accented Latin letters to plain ASCII (é → e, ñ → n, ç → c, ü → u...)
 * via foldLatinDiacritics below. This used to be deliberately skipped, on the
 * theory that decompose-and-strip also corrupts Japanese voicing (ジ vs シ,
 * encoded as a base character plus combining mark, same mechanism as a Latin
 * accent) — true, but preserving accents turned out to be the wrong fix for
 * the wrong problem: confirmed empirically against production tonight, ANY
 * non-ASCII character in a [locale]/[slug] segment 404s live on this
 * Next.js/Vercel setup regardless of script (French, Spanish, Portuguese,
 * Turkish and Polish accented slugs all failed, alongside Russian and
 * Japanese native-script ones) — Vercel's own x-matched-path header for a
 * failing request comes back mojibake'd, pointing to a platform-level
 * Latin-1/UTF-8 mismatch, not something this app's routing controls. Since
 * every slug has to end up ASCII-safe anyway (see isSlugSafe in
 * db/localize.ts, which now rejects non-ASCII outright and falls back to the
 * canonical slug), folding Latin diacritics here means French/Spanish/
 * Portuguese/Italian/German/Turkish/Polish still get real, readable slugs
 * instead of silently degrading to the English canonical one. Cyrillic and
 * CJK have no such fold without real script-aware romanization, so those
 * still degrade to canonical for now — a follow-up, not fixable by stripping
 * combining marks.
 */
function foldLatinDiacritics(input: string): string {
  const EXTRA: Record<string, string> = { ß: "ss", ø: "o", Ø: "O", ł: "l", Ł: "L", đ: "d", Đ: "D", ı: "i", İ: "I", œ: "oe", Œ: "OE", æ: "ae", Æ: "AE" };
  let out = "";
  for (const ch of input.normalize("NFD")) {
    if (/[̀-ͯ]/.test(ch)) {
      const prev = out[out.length - 1];
      if (prev && /[A-Za-z]/.test(prev)) continue; // drop: a plain Latin letter's own accent
      out += ch; // keep: base wasn't plain ASCII (e.g. Japanese kana) — leave that script alone
    } else {
      out += EXTRA[ch] ?? ch;
    }
  }
  return out;
}

// Cap by UTF-8 BYTE length, not character count: a build writes one output
// file per generated path on a filesystem that limits a path segment to 255
// bytes, and CJK/Arabic-script characters are multiple bytes each in UTF-8 —
// an 80-*character* Japanese phrase can be 240+ bytes and crash the whole
// build with ENAMETOOLONG (see the matching guard in db/localize.ts, which
// also protects slugs already stored before this cap existed).
const MAX_SLUG_BYTES = 80;
function slugify(input: string): string {
  const cleaned = foldLatinDiacritics(input)
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{M}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  let s = cleaned;
  while (Buffer.byteLength(s, "utf8") > MAX_SLUG_BYTES && s.length) s = s.slice(0, -1);
  return s.replace(/-+$/g, "");
}

// Letter-by-letter Arabic → Latin, good enough for a readable slug (not
// meant to be a precise transliteration standard).
const ARABIC_LATIN: Record<string, string> = {
  ا: "a", أ: "a", إ: "a", آ: "a", ء: "a", ؤ: "w", ئ: "y", ى: "a", ة: "a",
  ب: "b", ت: "t", ث: "th", ج: "j", ح: "h", خ: "kh", د: "d", ذ: "dh",
  ر: "r", ز: "z", س: "s", ش: "sh", ص: "s", ض: "d", ط: "t", ظ: "z",
  ع: "a", غ: "gh", ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n",
  ه: "h", و: "w", ي: "y",
};
// Tashkeel (diacritics) and tatweel carry no sound of their own — drop them
// rather than let them survive transliteration as orphaned combining marks.
const ARABIC_DIACRITIC = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭـ]/;

function transliterateArabic(text: string): string {
  return [...text].map((ch) => (ARABIC_DIACRITIC.test(ch) ? "" : ARABIC_LATIN[ch] ?? ch)).join("");
}

/**
 * Regenerate data.slugs — a per-locale slug machine-translated from the
 * record's own canonical slug text (the "المعرّف" field the admin types),
 * not from the title: the slug is translated the same way any other field
 * is, so "video-production-egypt" becomes its own real phrase per language,
 * not a slugified copy of that language's (often much longer) title.
 *
 * Arabic is transliterated to Latin rather than kept in its own script: tested
 * directly against this site's [locale]/[slug] routes (dynamicParams = false),
 * a native-script Arabic slug fails to match its own generateStaticParams
 * entry and 404s — apparently a Next.js bug in matching non-Latin, right-to-left
 * segments specifically, since Russian, Chinese, Japanese and Korean slugs (all
 * non-Latin, none right-to-left) were confirmed working there in the same test.
 *
 * Re-translates only what's missing, unless the canonical slug itself changed
 * since the last pass — tracked via slugs.en, which exists purely as that
 * change marker: English itself never reads from data.slugs (see pickSlug in
 * db/localize.ts), so this key has no other use.
 */
async function updateSlugs(canonicalSlug: string, data: Record<string, Dict>, only?: readonly string[], force = false): Promise<{ warning?: string }> {
  if (!canonicalSlug) return {};
  const existing = (data.slugs as Dict | undefined) ?? {};
  const changed = force || existing.en !== canonicalSlug;
  const slugs: Dict = changed ? { en: canonicalSlug } : { ...existing };

  const targets = (only && only.length ? MACHINE_LOCALES.filter((l) => only.includes(l)) : [...MACHINE_LOCALES])
    .filter((loc) => changed || !slugs[loc]);
  const wantsAr = (!only || only.includes("ar")) && (changed || !slugs.ar);
  if (!targets.length && !wantsAr) { data.slugs = slugs; return {}; }
  if (!translationConfigured()) { data.slugs = slugs; return {}; }

  const words = canonicalSlug.replace(/-/g, " ").trim();
  if (!words) { data.slugs = slugs; return {}; }

  try {
    if (targets.length) {
      try {
        const results = await translateFields([{ key: "slug", format: "text", text: words }], targets);
        for (const loc of targets) {
          const t = results.slug?.[loc];
          if (t) slugs[loc] = slugify(t);
        }
      } catch (e) {
        if (e instanceof PartialTranslateError) {
          const partial = e.partial as Record<string, Record<string, string>>;
          for (const loc of targets) {
            const t = partial.slug?.[loc];
            if (t) slugs[loc] = slugify(t);
          }
        }
        throw e;
      }
    }
    if (wantsAr) {
      try {
        const ar = await translatePair([{ key: "slug", format: "text", text: words }], "en", "ar");
        if (ar.slug) slugs.ar = slugify(transliterateArabic(ar.slug));
      } catch (e) {
        if (e instanceof PartialTranslateError && typeof e.partial.slug === "string") {
          slugs.ar = slugify(transliterateArabic(e.partial.slug));
        }
        throw e;
      }
    }
    data.slugs = slugs;
    return {};
  } catch (e) {
    data.slugs = slugs; // keep whatever succeeded so far (partial or not) rather than lose it
    return { warning: `فشلت ترجمة السلج — ${((e as Error).message || "").slice(0, 300)}` };
  }
}

/**
 * Force a fresh translation of one item's slug right now, independent of a
 * full save — the "ترجم السلج دلوقتي" button next to the slug field. Ignores
 * the slugs.en change-marker (a normal save already skips retranslating an
 * unchanged slug) so the admin can redo it on demand, e.g. to pick up a fix
 * to the translation without re-saving the whole item.
 */
export async function retranslateSlug(canonicalSlug: string, existingSlugs?: Dict): Promise<{ slugs: Dict; warning?: string }> {
  const data: Record<string, Dict> = { slugs: { ...(existingSlugs ?? {}) } };
  const { warning } = await updateSlugs(canonicalSlug, data, undefined, true);
  return { slugs: (data.slugs as Dict) ?? {}, warning };
}

/**
 * Fill the twelve machine languages of a content record from its English, in
 * place. Only fields whose English actually changed (or that are missing a
 * translation) are sent, so an unchanged save costs nothing and a body isn't
 * re-translated on every edit of a title.
 *
 * Best-effort: returns a human warning instead of throwing, so the caller still
 * saves whatever the editor wrote when translation is unconfigured or fails.
 */
function combineWarnings(...parts: (string | undefined)[]): string | undefined {
  const real = parts.filter((p): p is string => Boolean(p));
  return real.length ? real.join(" | ") : undefined;
}

export async function applyMachineTranslations(
  def: ContentType,
  data: Record<string, Dict>, // { fieldKey: { en, ar, ... } } — mutated in place
  existing: Record<string, Dict> | undefined,
  only?: readonly string[], // limit to these locales (e.g. one language at a time)
  canonicalSlug?: string, // the record's real slug — translated into data.slugs per locale
): Promise<{ warning?: string }> {
  const checkLocales = only && only.length ? only : MACHINE_LOCALES;

  // Single-locale calls (the per-language "translate" button) target one
  // machine locale at a time and shouldn't re-run this on every call.
  let arWarning: string | undefined;
  if ((!only || only.includes("ar") || only.includes("en")) && translationConfigured()) {
    arWarning = (await syncEnglishArabic(def, data)).warning;
  }

  const toTranslate: FieldToTranslate[] = [];
  for (const field of def.i18n) {
    if (field.noTranslate) continue; // keywords, canonical URLs, flags — never translate
    const en = data[field.key]?.en?.trim();
    if (!en) continue;
    const prevEn = existing?.[field.key]?.en;
    // A locale with no value, OR one that's just a leftover copy of English
    // (from before translation was configured, or from this exact skip once
    // treating that copy as "already translated" and never revisiting it) —
    // both need a real translation, not just a genuinely absent key.
    const isHtml = field.type === "html";
    const missing = checkLocales.some((loc) => {
      const val = existing?.[field.key]?.[loc];
      if (!val || val === en) return true;
      // A leftover value from well before this translation system existed —
      // e.g. a generic one-line summary seeded into every locale of an HTML
      // body field, unrelated to the current English text and structurally
      // nothing like it (no tags where the source has them). Equal-to-English
      // doesn't catch this: the stale text differs from English too, just not
      // by being a real translation of it.
      if (isHtml && HTML_TAG_RE.test(en) && !HTML_TAG_RE.test(val)) return true;
      return false;
    });
    if (en === prevEn && !missing) continue; // unchanged and already translated
    toTranslate.push({ key: field.key, format: isHtml ? "html" : "text", text: data[field.key].en });
  }
  const slugWarning = canonicalSlug ? (await updateSlugs(canonicalSlug, data, only)).warning : undefined;

  if (!toTranslate.length) return { warning: combineWarnings(arWarning, slugWarning) };
  if (!translationConfigured()) {
    return { warning: combineWarnings(arWarning, slugWarning) || "الترجمة الآلية مش متظبطة — اتحفظ زي ما اتكتب بس" };
  }
  try {
    const results = await translateFields(toTranslate, only);
    for (const [key, dict] of Object.entries(results)) data[key] = { ...data[key], ...dict };
    return { warning: combineWarnings(arWarning, slugWarning) };
  } catch (e) {
    // A PartialTranslateError still carries whatever locales/fields DID
    // translate — apply those instead of discarding the whole batch over one
    // failed locale or an oversized field.
    if (e instanceof PartialTranslateError) {
      for (const [key, dict] of Object.entries(e.partial as Record<string, Record<string, string>>)) {
        data[key] = { ...data[key], ...dict };
      }
    }
    const detail = (e as Error).message || "";
    console.error("Machine translation failed:", e);
    return { warning: combineWarnings(arWarning, slugWarning, `فشلت الترجمة الآلية لبعض اللغات — ${detail.slice(0, 300)}`) };
  }
}

/**
 * Translate the translatable fields of a list of block items into all seven
 * machine languages at once. `itemsEn[i]` holds the English text of each
 * translatable field for item i. Returns perLocale[locale][i] = { field: text },
 * falling back to the English text for any field the provider left empty. On a
 * missing key or failure it returns a warning and no translations, so the caller
 * copies the English across (never blocking the save).
 */
export async function translateBlockItems(
  itemsEn: Record<string, string>[],
  fields: { key: string; format: "text" | "html" }[],
): Promise<{ perLocale: Record<MachineLocale, Record<string, string>[]>; warning?: string }> {
  const empty = {} as Record<MachineLocale, Record<string, string>[]>;
  if (!itemsEn.length || !fields.length) return { perLocale: empty };
  if (!translationConfigured()) {
    return { perLocale: empty, warning: "الترجمة الآلية مش متظبطة — اللغات التلقائية بتاخد نسخة الإنجليزي" };
  }
  const toTranslate: FieldToTranslate[] = [];
  itemsEn.forEach((item, i) => {
    for (const f of fields) {
      const text = item[f.key];
      if (text && text.trim()) toTranslate.push({ key: `${i}::${f.key}`, format: f.format, text });
    }
  });
  let results: Record<string, Record<MachineLocale, string>> = {};
  let warning: string | undefined;
  try {
    results = await translateFields(toTranslate);
  } catch (e) {
    // Keep whatever locales/items DID translate instead of falling every item
    // back to English just because one locale or one item failed.
    if (e instanceof PartialTranslateError) results = e.partial as typeof results;
    console.error("Machine translation (block) failed:", e);
    warning = "فشلت ترجمة بعض اللغات — اللي فشل هياخد نسخة الإنجليزي مؤقتاً";
  }
  const perLocale = {} as Record<MachineLocale, Record<string, string>[]>;
  for (const loc of MACHINE_LOCALES) {
    perLocale[loc] = itemsEn.map((item, i) => {
      const out: Record<string, string> = {};
      for (const f of fields) out[f.key] = results[`${i}::${f.key}`]?.[loc] ?? item[f.key] ?? "";
      return out;
    });
  }
  return { perLocale, warning };
}

/**
 * Fill in whichever of English/Arabic is missing from the other, for edited
 * singleton paths — same idea as syncEnglishArabic above, but over the
 * {path, values} shape the singleton editor sends instead of a content record.
 */
async function syncEnglishArabicSingleton(
  edits: { path: string; values: Record<string, string> }[],
  fieldByPath: Map<string, SingletonField>,
): Promise<{ warning?: string }> {
  const toAr: FieldToTranslate[] = [];
  const toEn: FieldToTranslate[] = [];
  for (const e of edits) {
    const field = fieldByPath.get(e.path);
    if (!field || field.ltr) continue; // technical value — keep identical across languages
    const en = e.values.en?.trim();
    const ar = e.values.ar?.trim();
    if (en && (!ar || ar === en)) toAr.push({ key: e.path, format: "text", text: en });
    else if (ar && (!en || en === ar)) toEn.push({ key: e.path, format: "text", text: ar });
  }
  if (!toAr.length && !toEn.length) return {};
  const byPath = new Map(edits.map((e) => [e.path, e]));
  const applyFilled = (filled: Record<string, string>, locale: "ar" | "en") => {
    for (const [path, text] of Object.entries(filled)) {
      const edit = byPath.get(path);
      if (edit) edit.values[locale] = text;
    }
  };
  const warnings: string[] = [];
  if (toAr.length) {
    try {
      applyFilled(await translatePair(toAr, "en", "ar"), "ar");
    } catch (e) {
      if (e instanceof PartialTranslateError) applyFilled(e.partial as Record<string, string>, "ar");
      console.error("English/Arabic sync (singleton, en->ar) failed:", e);
      warnings.push(`فشلت ترجمة بعض الحقول للعربي — ${((e as Error).message || "").slice(0, 250)}`);
    }
  }
  if (toEn.length) {
    try {
      applyFilled(await translatePair(toEn, "ar", "en"), "en");
    } catch (e) {
      if (e instanceof PartialTranslateError) applyFilled(e.partial as Record<string, string>, "en");
      console.error("English/Arabic sync (singleton, ar->en) failed:", e);
      warnings.push(`فشلت ترجمة بعض الحقول للإنجليزي — ${((e as Error).message || "").slice(0, 250)}`);
    }
  }
  return warnings.length ? { warning: warnings.join(" | ") } : {};
}

/**
 * Generate the seven machine languages for edited singleton paths, in place.
 * Technical values (emails, phones, social URLs — the ltr fields) are never
 * translated. Each edit's `values` map gains fr…tr when its English changed or
 * a translation is missing. Best-effort, same as the collections path.
 */
export async function applySingletonTranslations(
  edits: { path: string; values: Record<string, string> }[],
  fieldByPath: Map<string, SingletonField>,
  existing: Singleton | null,
): Promise<{ warning?: string }> {
  let arWarning: string | undefined;
  if (translationConfigured()) {
    arWarning = (await syncEnglishArabicSingleton(edits, fieldByPath)).warning;
  }

  const toTranslate: FieldToTranslate[] = [];
  const byPath = new Map(edits.map((e) => [e.path, e]));
  for (const e of edits) {
    const field = fieldByPath.get(e.path);
    if (!field || field.ltr) continue; // technical value — keep identical across languages
    const en = e.values.en?.trim();
    if (!en) continue;
    const prevEn = getPath(existing?.en, e.path);
    const missing = MACHINE_LOCALES.some((loc) => !getPath(existing?.[loc], e.path));
    if (en === prevEn && !missing) continue;
    toTranslate.push({ key: e.path, format: "text", text: e.values.en });
  }
  if (!toTranslate.length) return { warning: arWarning };
  if (!translationConfigured()) {
    return { warning: arWarning || "الترجمة الآلية مش متظبطة — اتحفظ الإنجليزي والعربي بس" };
  }
  try {
    const results = await translateFields(toTranslate);
    for (const [path, dict] of Object.entries(results)) {
      const edit = byPath.get(path);
      if (edit) Object.assign(edit.values, dict);
    }
    return { warning: arWarning };
  } catch (e) {
    if (e instanceof PartialTranslateError) {
      for (const [path, dict] of Object.entries(e.partial as Record<string, Record<string, string>>)) {
        const edit = byPath.get(path);
        if (edit) Object.assign(edit.values, dict);
      }
    }
    console.error("Machine translation (singleton) failed:", e);
    const warning = "فشلت ترجمة بعض اللغات — اللي فشل هياخد نسخة الإنجليزي مؤقتاً، تقدر تحفظ تاني بعد شوية";
    return { warning: arWarning ? `${arWarning} | ${warning}` : warning };
  }
}
