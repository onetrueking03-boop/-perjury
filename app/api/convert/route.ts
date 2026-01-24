import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import ffmpeg from "fluent-ffmpeg";

export const runtime = "nodejs"; // IMPORTANT (ffmpeg cannot run on Edge)

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || "ffmpeg");

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const start = Number(form.get("start") || "0");
  const end = Number(form.get("end") || "3");

  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  if (end <= start) return NextResponse.json({ error: "End must be > start" }, { status: 400 });

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gif-"));
  const inPath = path.join(tmpDir, `in-${Date.now()}-${file.name}`);
  const outPath = path.join(tmpDir, `out-${Date.now()}.gif`);

  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(inPath, buf);

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inPath)
      .setStartTime(start)
      .setDuration(end - start)
      .outputOptions([
        "-vf", "fps=12,scale=480:-1:flags=lanczos",
        "-gifflags", "+transdiff",
        "-y",
      ])
      .toFormat("gif")
      .save(outPath)
      .on("end", () => resolve())
      .on("error", (e) => reject(e));
  });

  const gif = fs.readFileSync(outPath);
  fs.rmSync(tmpDir, { recursive: true, force: true });

  return new NextResponse(gif, {
    headers: {
      "Content-Type": "image/gif",
      "Content-Disposition": 'inline; filename="converted.gif"',
    },
  });
}
