import { NextResponse } from "next/server";
import { issueFormToken } from "@/lib/form-token";

/**
 * Hand the contact form a freshly-minted submission token.
 *
 * The contact page is statically generated, so a token embedded at build time
 * carries the build's timestamp and expires 30 minutes later — which silently
 * broke the form for every visitor once a deploy was half an hour old. This
 * endpoint is dynamic and uncached, so the form can fetch a token tied to the
 * visitor's own page load instead.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { token: issueFormToken() },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
