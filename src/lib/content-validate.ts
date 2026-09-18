/**
 * The gate that stops broken content from ever being saved.
 *
 * Every problem the old CMS let through — because it accepted whatever was
 * pasted — is caught here instead, at the point of entry, in the language it
 * happened in. This is the whole reason the new dashboard exists: not to fix
 * broken data after it shows on the site, but to refuse it at the door.
 *
 * Errors block the save. Warnings are shown but allow it (an editor may
 * genuinely be mid-translation).
 */

export type Dict = Record<string, string>;
export type Issue = { field: string; locale?: string; message: string; level: "error" | "warning" };

const LOST_ENCODING = /\?{3,}/;                       // "??????" — Arabic that lost its charset
const TRANSLATOR_NOTE =
  /^\s*(?:\(|\[)?\s*(?:nota|note|hinweis)?\s*:?\s*(?:voici|ecco|hier ist|aqu[íi]|here is|this is)\b[\s\S]{0,120}?(?:traduction|traduzione|[üu]?bersetzung|traducci[óo]n|translation|traduzione)\b/i;
const EDITOR_WRAPPER = /model-response-message-content|markdown-main-panel|data-path-to-node/i;

/** Check one translatable field across the languages the editor controls. */
export function validateField(field: string, label: string, dict: Dict | undefined, opts: { required?: boolean } = {}): Issue[] {
  const issues: Issue[] = [];
  const value = dict ?? {};

  // English is the source the other languages translate from — it must be there.
  if (opts.required && !(value.en || "").trim()) {
    issues.push({ field, locale: "en", level: "error", message: `${label}: النص الإنجليزي مطلوب` });
  }

  for (const [locale, text] of Object.entries(value)) {
    if (typeof text !== "string" || !text) continue;
    if (LOST_ENCODING.test(text)) {
      issues.push({ field, locale, level: "error",
        message: `${label} (${locale}): النص فيه ترميز مكسور (؟؟؟). الصقه من جديد.` });
    }
    if (EDITOR_WRAPPER.test(text)) {
      issues.push({ field, locale, level: "error",
        message: `${label} (${locale}): النص ملزوق من أداة ذكاء اصطناعي مع أكواد شكلها. انسخ النص النظيف بس.` });
    }
    if (TRANSLATOR_NOTE.test(text)) {
      issues.push({ field, locale, level: "warning",
        message: `${label} (${locale}): يبدو إن فيه جملة "هذه الترجمة" في أول النص — اتأكد إنها اتشالت.` });
    }
    // Arabic field that is actually Latin text, or vice-versa — a common mixup.
    if (locale === "ar" && text.length > 20 && !/[؀-ۿ]/.test(text)) {
      issues.push({ field, locale, level: "warning",
        message: `${label} (ar): النص محطوط في خانة العربي بس مفيهوش حروف عربية.` });
    }
  }
  return issues;
}

export function hasErrors(issues: Issue[]): boolean {
  return issues.some((i) => i.level === "error");
}
