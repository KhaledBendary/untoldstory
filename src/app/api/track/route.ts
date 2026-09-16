import { NextResponse, type NextRequest } from "next/server";
import { addVisit } from "@/lib/db/repo";

export const runtime = "nodejs";

/**
 * Record one anonymous page view. No personal data is stored: no raw IP, no
 * cookies — only the path, where the visit came from (referrer + UTM), a coarse
 * country/city from the edge, the device class, and an ephemeral per-tab session
 * id the client generates. Always answers ok; a failure never disturbs the visitor.
 */
const s = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

// Known crawlers/automation. Tracking is client-side so most bots never reach
// here, but headless/JS-capable ones can — drop them so the numbers are humans.
const BOT_RE = /bot|crawl|spider|slurp|bing|yandex|baidu|duckduck|facebookexternal|embedly|quora|pinterest|semrush|ahrefs|mj12|dotbot|petal|bytespider|headless|phantom|puppeteer|playwright|lighthouse|gtmetrix|pingdom|uptime|monitor|curl|wget|python-requests|node-fetch|axios|go-http/i;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.path !== "string") return NextResponse.json({ ok: false }, { status: 400 });

  const h = request.headers;
  const ua = h.get("user-agent") || "";
  // Exclude bots and our own dashboard visits so analytics reflects real visitors.
  if (!ua || BOT_RE.test(ua)) return NextResponse.json({ ok: true, skipped: "bot" });
  if (/^\/(?:[a-z]{2}\/)?admin(?:\/|$)/i.test(body.path)) return NextResponse.json({ ok: true, skipped: "admin" });

  const device = /Mobi|Android|iPhone|iPad|Windows Phone/i.test(ua) ? "mobile" : "desktop";
  const city = h.get("x-vercel-ip-city");

  try {
    await addVisit({
      session: s(body.session, 64),
      path: s(body.path, 300) ?? "/",
      referrer: s(body.referrer, 400),
      utm_source: s(body.utm_source, 100),
      utm_medium: s(body.utm_medium, 100),
      utm_campaign: s(body.utm_campaign, 150),
      country: h.get("x-vercel-ip-country"),
      city: city ? decodeURIComponent(city) : null,
      device,
      locale: s(body.locale, 8),
    });
  } catch (e) {
    console.error("track failed:", e);
  }
  return NextResponse.json({ ok: true });
}
