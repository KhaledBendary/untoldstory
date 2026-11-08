import type { CSSProperties } from "react";

/*
 * Page titles are sized to their own text.
 *
 * A fixed size per template gave short titles one tidy line and long ones six
 * or seven lines of one or two words each. Instead every title gets a font size
 * computed from its own length, so it fills about two full-width lines on a
 * desktop screen (more on a phone), never larger than the template's cap.
 *
 * titleEm() estimates how wide the text is at a font size of 1em; the
 * .fit-title rule in globals.css turns that into a font size for the space
 * available. Widths are the display font's real advances (Archivo 900 for Latin,
 * the browser's fallback for Cyrillic, Alexandria for Arabic), measured in the
 * browser on 8 Nov 2026. Kerning moves a real title by about 1%.
 */
const GROUPS: [number, string][] = [
  [0.18, " \u00a0"], // space, no-break space (French puts one before ":")
  [0.278, "'’"],
  [0.282, "|"],
  [0.306, "/"],
  [0.316, "j"],
  [0.319, "ilìíîïłı"],
  [0.333, "-:;,.!·"],
  [0.36, "г"],
  [0.369, "IÌÍÎÏİ"],
  [0.389, "f()"],
  [0.432, "к"],
  [0.444, "rt"],
  [0.452, "т"],
  [0.453, "з"],
  [0.494, "сух"],
  [0.497, '"'],
  [0.5, "–"],
  [0.504, "э"],
  [0.508, "“”„"],
  [0.514, "чь"],
  [0.524, "в"],
  [0.534, "Гпя"],
  [0.545, "н"],
  [0.549, "аеёор"],
  [0.551, "ий"],
  [0.556, "zźż"],
  [0.565, "бц"],
  [0.575, "К"],
  [0.576, "дл"],
  [0.595, "«»"],
  [0.596, "З"],
  [0.603, "Т"],
  [0.611, "svyýÿśş?"],
  [0.617, "ъ"],
  [0.627, "У"],
  [0.648, "БЛЬ"],
  [0.658, "АВЕРХЧ"],
  [0.659, "Ё"],
  [0.66, "ж+"],
  [0.666, "gğ"],
  [0.667, "0123456789FJLabcdehknopquxàáâãäåçèéêëñòóôõöøùúûüąćęŁńß"],
  [0.669, "Д"],
  [0.679, "м"],
  [0.709, "ИЙПЭы"],
  [0.713, "НСЯ"],
  [0.722, "EPSTZÈÉÊËĘŚŹŻŞ"],
  [0.73, "Ц"],
  [0.74, "ю"],
  [0.75, "Ф"],
  [0.768, "О"],
  [0.778, "ABCDRVXYÀÁÂÃÄÅÇÝĄĆ"],
  [0.781, "Ъ"],
  [0.792, "ш"],
  [0.812, "фщ"],
  [0.822, "М"],
  [0.833, "GHKNOQUÑÒÓÔÕÖØÙÚÛÜŃĞ"],
  [0.874, "Ы"],
  [0.889, "&"],
  [0.905, "Ш"],
  [0.911, "Ж"],
  [0.925, "Щ"],
  [0.944, "w"],
  [0.972, "M"],
  [0.997, "Ю"],
  [1, "Wm—%…"],
  [1.008, "æ"],
  [1.017, "œ"],
  [1.02, "Æ"],
  [1.207, "Œ"],
];

const WIDTH = new Map<string, number>();
for (const [w, chars] of GROUPS) for (const ch of chars) WIDTH.set(ch, w);

const UNKNOWN = 0.65; // an average capital, for anything not in the table
const ARABIC_CHAR = 0.6; // Alexandria, average over real titles (0.54–0.65)
const ARABIC_SPACE = 0.27;
const TRACKING = -0.025; // tracking-tight; Arabic is forced to 0 in globals.css

const isArabic = (cp: number) => (cp >= 0x0600 && cp <= 0x06ff) || (cp >= 0x0750 && cp <= 0x077f) || (cp >= 0xfb50 && cp <= 0xfdff) || (cp >= 0xfe70 && cp <= 0xfeff);
const isWide = (cp: number) =>
  (cp >= 0x1100 && cp <= 0x11ff) || // Hangul jamo
  (cp >= 0x2e80 && cp <= 0x9fff) || // CJK radicals … unified ideographs, kana, CJK punctuation
  (cp >= 0xac00 && cp <= 0xd7af) || // Hangul syllables
  (cp >= 0xf900 && cp <= 0xfaff) || // CJK compatibility ideographs
  (cp >= 0xff00 && cp <= 0xffef); // full-width forms

/** Width of `text` in em at the title's style (uppercase unless told otherwise). */
export function titleEm(text: string, opts: { uppercase?: boolean; locale?: string } = {}): number {
  const rtl = opts.locale === "ar";
  const upper = opts.uppercase !== false;
  const s = upper ? text.toUpperCase() : text;
  let em = 0;
  let tracked = 0;
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0;
    if (isWide(cp)) {
      em += 1;
      tracked++;
    } else if (isArabic(cp)) {
      em += ARABIC_CHAR;
    } else if (ch === " " && rtl) {
      em += ARABIC_SPACE;
    } else {
      em += WIDTH.get(ch) ?? UNKNOWN;
      tracked++;
    }
  }
  if (!rtl) em += tracked * TRACKING;
  return Math.max(em, 1);
}

/** Inline style that hands a title's own width to the .fit-title rule. */
export function fitTitleStyle(text: string | null | undefined, opts: { uppercase?: boolean; locale?: string } = {}): CSSProperties {
  const value = (text || "").trim();
  return { ["--t-em" as string]: titleEm(value, opts).toFixed(2) } as CSSProperties;
}
