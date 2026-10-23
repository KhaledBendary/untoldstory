import schemaJson from "./seo-command-schema.json";

export type SeoFaqItem = { q: string; a: string };

export type SeoCommandSchemaStore = {
  organization?: Record<string, unknown> | null;
  /** Legacy site-wide FAQPage. No longer emitted — see faqByPath and components/SeoFaq. */
  faq?: Record<string, unknown> | null;
  /** FAQs per page path, e.g. "/insights/my-post". Rendered visibly with matching FAQPage schema. */
  faqByPath?: Record<string, SeoFaqItem[]>;
  extra?: Record<string, unknown>[];
};

/** Written by SEO Command Center — merged into layout StructuredData. */
export const SEO_COMMAND_SCHEMA = schemaJson as SeoCommandSchemaStore;

export function getCommandCenterSchemas(): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  if (SEO_COMMAND_SCHEMA.organization) out.push(SEO_COMMAND_SCHEMA.organization);
  if (Array.isArray(SEO_COMMAND_SCHEMA.extra)) out.push(...SEO_COMMAND_SCHEMA.extra);
  return out;
}
