import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import ffmpegPath from "ffmpeg-static";

export const runtime = "nodejs";
// If you're on Vercel Pro you can raise this; otherwise keep small.
export const maxDuration = 60;

function run(cmd: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });

    let stderr = "";
    p.stderr.on("data", (d) => (stderr += d.toString()));

    p.on("error", reject);
    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `ffmpeg exited with code ${code}`));
    });
  });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ message: "Missing file" }, { status: 400 });

    const fps = Number(form.get("fps") ?? 30);
    const crf = Number(form.get("crf") ?? 28); // lower=better quality/bigger
    const duration = Number(form.get("duration") ?? 2.5); // optional trim

    const tmpDir = os.tmpdir();
    const inPath = path.join(tmpDir, `in-${Date.now()}-${file.name}`);
    const outPath = path.join(tmpDir, `out-${Date.now()}.webm`);

    const buf = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(inPath, buf);

    if (!ffmpegPath) {
      return NextResponse.json({ message: "ffmpeg binary not found" }, { status: 500 });
    }

    // ✅ VP9 + alpha (yuva420p) WebM overlay
    // Notes:
    // - `-vf fps=...` forces smooth frame rate
    // - `-t` trims to duration so exports are consistent
    // - `-crf` controls quality/size, typical 24–34
    const args = [
      "-y",
      "-i",
      inPath,
      "-t",
      String(duration),
      "-vf",
      `fps=${fps}`,
      "-an",
      "-c:v",
      "libvpx-vp9",
      "-pix_fmt",
      "yuva420p",
      "-b:v",
      "0",
      "-crf",
      String(crf),
      "-row-mt",
      "1",
      "-deadline",
      "good",
      outPath,
    ];

    await run(ffmpegPath as string, args);

    const out = fs.readFileSync(outPath);

    // cleanup
    fs.unlinkSync(inPath);
    fs.unlinkSync(outPath);

    return new NextResponse(out, {
      headers: {
        "Content-Type": "video/webm",
        "Content-Disposition": 'attachment; filename="overlay.webm"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ message: e?.message || "Transcode failed" }, { status: 500 });
  }
}
