/**
 * CMS dates arrive as `date`, `publishedAt`, or snake_case `published_at`.
 * Any missing/unparseable value must render as nothing — never "Invalid Date".
 */

type DateSource = {
  date?: string | null;
  publishedAt?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

export function parsePostDate(source?: DateSource | string | null): Date | null {
  if (!source) return null;
  const raw =
    typeof source === "string"
      ? source
      : source.date || source.publishedAt || source.published_at || source.created_at || "";
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isoPostDate(source?: DateSource | string | null): string {
  const date = parsePostDate(source);
  return date ? date.toISOString() : "";
}

export function formatPostDate(source: DateSource | string | null | undefined, locale: string): string {
  const date = parsePostDate(source);
  if (!date) return "";
  try {
    return date.toLocaleDateString(locale === "ar" ? "ar-EG" : locale || "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}
