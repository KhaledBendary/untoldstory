// Minimal ambient declarations for packages with no published types, used only
// for romanizing non-Latin slugs (translate/apply.ts) — never on a hot path,
// so "any" here costs nothing at the call site, which wraps every call anyway.

declare module "kuroshiro" {
  export default class Kuroshiro {
    init(analyzer: unknown): Promise<void>;
    convert(text: string, options?: Record<string, unknown>): Promise<string>;
  }
}

declare module "kuroshiro-analyzer-kuromoji" {
  export default class KuromojiAnalyzer {
    constructor(options?: Record<string, unknown>);
  }
}

declare module "hangul-romanization" {
  export function convert(text: string): string;
}
