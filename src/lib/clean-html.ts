/**
 * Clean-up for rich text pasted from AI chat windows and Word.
 *
 * Copying an answer out of an AI chat brings its page wrapper along
 * (<div id="model-response-message-content…" class="markdown-main-panel…">) and
 * per-node tracking attributes; copying from Word brings mso-* inline styles on
 * every paragraph. None of it means anything on the site, and it can make a
 * field several times its real size. Only the markup is touched — never the
 * text, and never styling that isn't Word/AI-chat residue.
 */

const CHAT_WRAPPER_OPEN = /<div\b[^>]*(?:model-response-message-content|markdown-main-panel)[^>]*>/gi;

export function cleanPastedHtml(html: string): string {
  let s = html;

  // The outermost chat wrapper(s): drop each opening tag and the same number of
  // closing </div>s from the end, where the wrappers' own closers sit.
  let wrappers = 0;
  s = s.replace(CHAT_WRAPPER_OPEN, () => {
    wrappers++;
    return "";
  });
  for (let i = 0; i < wrappers; i++) {
    const at = s.lastIndexOf("</div>");
    if (at < 0) break;
    s = s.slice(0, at) + s.slice(at + "</div>".length);
  }

  return s
    .replace(/\s(?:data-path-to-node|data-index-in-node|aria-busy|aria-live)="[^"]*"/gi, "")
    .replace(/\sclass="(?:|Default|Mso[^"]*)"/gi, "")
    .replace(/\sstyle="[^"]*\bmso-[^"]*"/gi, "")
    .trim();
}

/** True when the text carries the chat-window wrapper or tracking attributes. */
export const hasChatResidue = (s: string) => /model-response-message-content|markdown-main-panel|data-path-to-node/i.test(s);

/**
 * Split long HTML into pieces of at most ~`max` characters, cutting only after a
 * block-level closing tag so each piece is whole paragraphs/headings/lists.
 * Joining the pieces back gives the original text exactly.
 */
export function splitHtml(html: string, max: number): string[] {
  if (html.length <= max) return [html];
  const parts: string[] = [];
  let start = 0;
  while (html.length - start > max) {
    const window = html.slice(start, start + max);
    const boundary = /<\/(?:p|h[1-6]|ul|ol|table|blockquote)>\s*/gi;
    let cut = -1;
    for (let m = boundary.exec(window); m; m = boundary.exec(window)) cut = m.index + m[0].length;
    if (cut < max * 0.4) {
      const newline = window.lastIndexOf("\n");
      cut = newline > max * 0.4 ? newline + 1 : max;
    }
    parts.push(html.slice(start, start + cut));
    start += cut;
  }
  parts.push(html.slice(start));
  return parts;
}

/** A field's per-language texts with any chat-window/Word residue removed (other values untouched). */
export function cleanDictResidue(dict: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [loc, text] of Object.entries(dict)) out[loc] = typeof text === "string" && hasChatResidue(text) ? cleanPastedHtml(text) : text;
  return out;
}
