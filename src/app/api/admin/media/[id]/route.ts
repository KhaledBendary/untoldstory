import { NextResponse, type NextRequest } from "next/server";
import { del } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-guard";
import { deleteMedia, updateMediaAlt } from "@/lib/db/repo";
import { translateFields, translatePair, translationConfigured } from "@/lib/translate";

/** Set an image's alt text (English, hand-written) and machine-fill every other language from it. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const en = typeof body?.alt?.en === "string" ? body.alt.en.trim() : undefined;
  if (en === undefined) return NextResponse.json({ error: "لازم نص إنجليزي" }, { status: 400 });

  let alt: Record<string, string> = { en };
  let warning: string | undefined;
  if (!en) {
    // Cleared — leave every language empty too, rather than translating "".
  } else if (!translationConfigured()) {
    warning = "الترجمة الآلية مش متظبطة — اتحفظ الإنجليزي بس";
  } else {
    try {
      const ar = await translatePair([{ key: "alt", format: "text", text: en }], "en", "ar");
      if (ar.alt) alt.ar = ar.alt;
      const rest = await translateFields([{ key: "alt", format: "text", text: en }]);
      if (rest.alt) alt = { ...alt, ...rest.alt };
    } catch (e) {
      warning = `فشلت ترجمة الوصف — ${((e as Error).message || "").slice(0, 200)}`;
    }
  }

  await updateMediaAlt(Number(id), alt);
  return NextResponse.json({ ok: true, alt, warning });
}

/** Remove an image: drop the row, then delete the blob it pointed at. */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const { id } = await params;
  const pathname = await deleteMedia(Number(id));
  if (!pathname) return NextResponse.json({ error: "غير موجودة" }, { status: 404 });

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) await del(pathname);
  } catch {
    // The row is gone; a leftover blob is harmless and can be swept later.
  }
  return NextResponse.json({ ok: true });
}
