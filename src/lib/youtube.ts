/**
 * YouTube links in the CMS.
 *
 * A project's "video" field (رابط الفيديو in the dashboard) may hold a direct
 * video file or one or more YouTube links. Several links are separated by
 * spaces, commas or new lines; the first is the project's main film.
 */

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/** The 11-character video id of a YouTube link, or null if it is not one. */
export function youTubeId(link: string): string | null {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.split("/")[1] ?? "";
    return VIDEO_ID.test(id) ? id : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (v && VIDEO_ID.test(v)) return v;
    const m = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})(?:[/?]|$)/);
    if (m) return m[1];
  }
  return null;
}

/** Every link written in the field, in order. */
export function videoLinks(field?: string | null): string[] {
  return (field ?? "").split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
}

/** The YouTube ids in the field, in order, without repeats. */
export function youTubeIds(field?: string | null): string[] {
  const ids = videoLinks(field).map(youTubeId).filter((id): id is string => id !== null);
  return [...new Set(ids)];
}

/**
 * A direct video file the browser can play itself (the old use of the field),
 * or null when the field holds YouTube links or nothing.
 */
export function videoFile(field?: string | null): string | null {
  const first = videoLinks(field)[0];
  return first && !youTubeId(first) ? first : null;
}

/** Privacy-enhanced player: YouTube sets no cookies until the visitor presses play. */
export const youTubeEmbedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`;

export const youTubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

export const youTubeThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
