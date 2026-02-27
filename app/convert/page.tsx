"use client";

import BoosterGate from "@/components/BoosterGate";
import Shell from "@/components/Shell";
import { useEffect, useMemo, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export default function ConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(3);

  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [ffmpegReady, setFfmpegReady] = useState(false);

  // ✅ revoke previous gif url whenever it changes/unmounts
  useEffect(() => {
    return () => {
      if (gifUrl) URL.revokeObjectURL(gifUrl);
    };
  }, [gifUrl]);

  const clipDuration = useMemo(() => {
    const d = Math.max(0, end - start);
    return Number.isFinite(d) ? d : 0;
  }, [start, end]);

  async function ensureFfmpeg() {
    if (ffmpegRef.current && ffmpegReady) return ffmpegRef.current;

    const ffmpeg = new FFmpeg();

    ffmpeg.on("progress", ({ progress }) => {
      setProgress(Math.max(0, Math.min(1, progress)));
    });

    // ✅ Load core/wasm from CDN as blob URLs (works on Vercel)
    const base = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const coreURL = await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript");
    const wasmURL = await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm");

    await ffmpeg.load({ coreURL, wasmURL });

    ffmpegRef.current = ffmpeg;
    setFfmpegReady(true);
    return ffmpeg;
  }

  function safeDelete(ffmpeg: FFmpeg, name: string) {
    try {
      // @ts-ignore
      ffmpeg.deleteFile(name);
    } catch {}
  }

  async function convert() {
    if (!file) return;

    if (end <= start) {
      alert("End time must be greater than Start time.");
      return;
    }

    const duration = end - start;
    if (duration > 10) {
      alert("Please keep clips under 10 seconds for GIF export.");
      return;
    }

    setLoading(true);
    setProgress(0);
    setGifUrl(null);

    try {
      const ffmpeg = await ensureFfmpeg();

      const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
      const inputName = `input.${ext}`;
      const paletteName = "palette.png";
      const outputName = "out.gif";

      // ✅ cleanup old files (correct filenames)
      safeDelete(ffmpeg, inputName);
      safeDelete(ffmpeg, paletteName);
      safeDelete(ffmpeg, outputName);

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // ✅ quality/size balance
      const fps = 15;
      const scaleW = 480;

      // 1) palette
      await ffmpeg.exec([
        "-ss",
        String(start),
        "-t",
        String(duration),
        "-i",
        inputName,
        "-vf",
        `fps=${fps},scale=${scaleW}:-1:flags=lanczos,palettegen`,
        "-y",
        paletteName,
      ]);

      // 2) gif using palette
      await ffmpeg.exec([
        "-ss",
        String(start),
        "-t",
        String(duration),
        "-i",
        inputName,
        "-i",
        paletteName,
        "-lavfi",
        `fps=${fps},scale=${scaleW}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
        "-y",
        outputName,
      ]);

      // ✅ Force correct type for TS
      const data = await ffmpeg.readFile(outputName);

      // ✅ force to Uint8Array regardless of ffmpeg typing
      const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as any);

      // ✅ no .buffer (fixes your red underline)
      const blob = new Blob([bytes], { type: "image/gif" });


      setGifUrl(URL.createObjectURL(blob));

      // ✅ optional: clean up files after success to save memory
      safeDelete(ffmpeg, inputName);
      safeDelete(ffmpeg, paletteName);
      safeDelete(ffmpeg, outputName);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Conversion failed.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  return (
    <Shell>
      <BoosterGate>
        <div className="grid gap-4 max-w-xl">
          <h1 className="text-3xl font-black">GIF Converter</h1>

          <div className="text-white/60 text-sm">
            {ffmpegReady ? "Converter ready (runs in your browser)." : "Converter will load when you convert."}
          </div>

          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="rounded-2xl bg-white/5 border border-white/10 p-3"
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-white/70">
              Start (sec)
              <input
                type="number"
                value={start}
                min={0}
                step={0.1}
                onChange={(e) => setStart(Number(e.target.value))}
                className="mt-1 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
              />
            </label>

            <label className="text-sm text-white/70">
              End (sec)
              <input
                type="number"
                value={end}
                min={0}
                step={0.1}
                onChange={(e) => setEnd(Number(e.target.value))}
                className="mt-1 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
              />
            </label>
          </div>

          <div className="text-xs text-white/50">
            Clip length: <span className="text-white/70">{clipDuration.toFixed(2)}s</span> (recommended ≤ 10s)
          </div>

          <button
            onClick={convert}
            disabled={!file || loading}
            className="px-5 py-3 rounded-2xl bg-fuchsia-500 hover:bg-fuchsia-400 disabled:opacity-50 font-semibold"
          >
            {loading ? `Converting… ${Math.round(progress * 100)}%` : "Convert to GIF"}
          </button>

          {gifUrl && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <img src={gifUrl} alt="Converted GIF" className="w-full rounded-2xl" />
              <a
                href={gifUrl}
                download="converted.gif"
                className="mt-3 inline-block text-sm px-4 py-2 rounded-xl border border-white/15 hover:bg-white/5"
              >
                Download GIF
              </a>
            </div>
          )}
        </div>
      </BoosterGate>
    </Shell>
  );
}
