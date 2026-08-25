import schemaJson from "./seo-command-schema.json";

export type SeoCommandSchemaStore = {
  organization?: Record<string, unknown> | null;
  faq?: Record<string, unknown> | null;
  extra?: Record<string, unknown>[];
};

/** Written by SEO Command Center — merged into layout StructuredData. */
export const SEO_COMMAND_SCHEMA = schemaJson as SeoCommandSchemaStore;

export function getCommandCenterSchemas(): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  if (SEO_COMMAND_SCHEMA.organization) out.push(SEO_COMMAND_SCHEMA.organization);
  if (SEO_COMMAND_SCHEMA.faq) out.push(SEO_COMMAND_SCHEMA.faq);
  if (Array.isArray(SEO_COMMAND_SCHEMA.extra)) out.push(...SEO_COMMAND_SCHEMA.extra);
  return out;
}
