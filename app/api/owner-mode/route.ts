import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

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

    if (!expected) {
      return NextResponse.json(
        { ok: false, reason: "missing-server-key" },
        { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const ok = typeof key === "string" && key.length > 0 && sameSecret(key, expected);

    return NextResponse.json(
      { ok },
      { status: ok ? 200 : 401, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false },
      { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
