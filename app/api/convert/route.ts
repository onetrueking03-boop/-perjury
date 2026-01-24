import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      disabled: true,
      message:
        "GIF conversion is disabled on this deployment. (Requires a dedicated server with ffmpeg.)",
    },
    { status: 501 }
  );
}
