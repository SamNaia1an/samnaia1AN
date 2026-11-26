import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { grant } from "@/lib/gift-access";

export const dynamic = "force-dynamic";

function sameSecret(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

export async function POST(request: Request) {
  try {
    const { key } = (await request.json()) as { key?: string };
    const expected = process.env.SAM_OWNER_KEY;
    const previewKey = process.env.SAM_PREVIEW_LINK_KEY;

    if (!expected && !previewKey) {
      return NextResponse.json(
        { ok: false, reason: "missing-server-key" },
        { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const ok = typeof key === "string" && key.length > 0 && Boolean((expected && sameSecret(key, expected)) || (previewKey && sameSecret(key, previewKey)));

    const response = NextResponse.json(
      { ok },
      { status: ok ? 200 : 401, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
    return ok ? grant(response) : response;
  } catch {
    return NextResponse.json(
      { ok: false },
      { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
