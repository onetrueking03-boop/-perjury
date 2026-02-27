"use client";

import BoosterGate from "@/components/BoosterGate";
import Shell from "@/components/Shell";
import { useEffect, useMemo, useRef, useState } from "react";
import GIF from "gif.js.optimized";
import { parseGIF, decompressFrames } from "gifuct-js";

type ResizeMode = "exact" | "fit";
type OutputFormat = "png" | "webp" | "jpeg" | "gif";

const MAX_SIDE_DEFAULT = 512;

function loadImageFromBlob(blob: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function drawCoverOrContain(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  sw: number,
  sh: number,
  dw: number,
  dh: number,
  mode: ResizeMode
) {
  // mode="fit" => contain (no crop), mode="exact" => cover (fills, may crop)
  const srcAR = sw / sh;
  const dstAR = dw / dh;

  let sx = 0,
    sy = 0,
    sWidth = sw,
    sHeight = sh;

  let dx = 0,
    dy = 0,
    dWidth = dw,
    dHeight = dh;

  if (mode === "fit") {
    // contain
    if (srcAR > dstAR) {
      // fit width
      dWidth = dw;
      dHeight = dw / srcAR;
      dy = (dh - dHeight) / 2;
    } else {
      // fit height
      dHeight = dh;
      dWidth = dh * srcAR;
      dx = (dw - dWidth) / 2;
    }
    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  } else {
    // exact/cover
    if (srcAR > dstAR) {
      // crop width
      sWidth = sh * dstAR;
      sx = (sw - sWidth) / 2;
    } else {
      // crop height
      sHeight = sw / dstAR;
      sy = (sh - sHeight) / 2;
    }
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dw, dh);
  }
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export default function ResizePage() {
  const [file, setFile] = useState<File | null>(null);

  const [mode, setMode] = useState<ResizeMode>("fit");
  const [keepAspect, setKeepAspect] = useState(true);

  const [width, setWidth] = useState<number>(MAX_SIDE_DEFAULT);
  const [height, setHeight] = useState<number>(MAX_SIDE_DEFAULT);

  const [format, setFormat] = useState<OutputFormat>("webp");
  const [quality, setQuality] = useState<number>(0.9); // for webp/jpeg
  const [gifQuality, setGifQuality] = useState<number>(15); // gif.js: higher => smaller, more artifacts

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [outUrl, setOutUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isGif = useMemo(() => file?.type === "image/gif" || file?.name.toLowerCase().endsWith(".gif"), [file]);

  // cleanup output URL
  useEffect(() => {
    return () => {
      if (outUrl) URL.revokeObjectURL(outUrl);
    };
  }, [outUrl]);

  // auto-populate width/height on file select
  useEffect(() => {
    (async () => {
      if (!file) return;
      try {
        // For GIF: grab first frame by decoding as image blob (browser can load)
        const img = await loadImageFromBlob(file);
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;

        // default to fit within 512
        const maxSide = MAX_SIDE_DEFAULT;
        const scale = Math.min(1, maxSide / Math.max(w, h));
        setWidth(Math.max(1, Math.round(w * scale)));
        setHeight(Math.max(1, Math.round(h * scale)));
      } catch {
        // ignore
      }
    })();
  }, [file]);

  function updateWidth(v: number) {
    const nextW = clampInt(v, 1, 4096);
    if (!keepAspect || !file) {
      setWidth(nextW);
      return;
    }
    // keep aspect based on current width/height ratio
    const ratio = height / width || 1;
    setWidth(nextW);
    setHeight(Math.max(1, Math.round(nextW * ratio)));
  }

  function updateHeight(v: number) {
    const nextH = clampInt(v, 1, 4096);
    if (!keepAspect || !file) {
      setHeight(nextH);
      return;
    }
    const ratio = width / height || 1;
    setHeight(nextH);
    setWidth(Math.max(1, Math.round(nextH * ratio)));
  }

  async function resizeStaticImage(): Promise<Blob> {
    if (!file) throw new Error("No file selected");
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Missing canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Missing 2D context");

    const img = await loadImageFromBlob(file);
    const sw = img.naturalWidth || img.width;
    const sh = img.naturalHeight || img.height;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    drawCoverOrContain(ctx, img, sw, sh, width, height, mode);

    const type =
      format === "png" ? "image/png" : format === "webp" ? "image/webp" : "image/jpeg";

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Failed to export"))),
        type,
        type === "image/jpeg" || type === "image/webp" ? quality : undefined
      );
    });

    return blob;
  }

  async function resizeGif(): Promise<Blob> {
    if (!file) throw new Error("No file selected");
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Missing canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Missing 2D context");

    // Read GIF bytes
    const buf = await file.arrayBuffer();
    const gif = parseGIF(buf);
    const frames = decompressFrames(gif, true); // true => builds patch RGBA

    // If only one frame, treat as static if you want (but we can still encode as GIF)
    const total = frames.length;

    canvas.width = width;
    canvas.height = height;

    // A temp source canvas for original frame size
    const srcCanvas = document.createElement("canvas");
    const srcCtx = srcCanvas.getContext("2d");
    if (!srcCtx) throw new Error("Missing src context");

    // Setup encoder
    const encoder = new GIF({
      workers: 2,
      quality: gifQuality,
      width,
      height,
      workerScript: "/gif.worker.js",
      // @ts-ignore
      dither: false,
    });

    encoder.on("progress", (p: number) => {
      setProgress(0.2 + p * 0.8);
    });

    // Compose frames properly (gifuct gives patches)
    // We draw each full frame to srcCanvas, then scale into export canvas.
    let composed: ImageData | null = null;

    for (let i = 0; i < total; i++) {
      const f = frames[i];

      // Initialize composition canvas to GIF logical screen size
      if (!composed) {
        srcCanvas.width = f.dims.width;
        srcCanvas.height = f.dims.height;
        composed = srcCtx.createImageData(srcCanvas.width, srcCanvas.height);
        // start transparent
        composed.data.fill(0);
      }

      // Some GIFs use disposal methods; gifuct's "patch" is the already-applied full frame when buildImagePatches = true,
      // but dims can be partial. We'll safely draw the patch into srcCanvas.
      // Create ImageData from RGBA patch
      const patch = new ImageData(new Uint8ClampedArray(f.patch), f.dims.width, f.dims.height);

      // Draw patch at its position
      srcCtx.putImageData(patch, f.dims.left, f.dims.top);

      // Now resize into output canvas
      ctx.clearRect(0, 0, width, height);

      drawCoverOrContain(
        ctx,
        srcCanvas,
        srcCanvas.width,
        srcCanvas.height,
        width,
        height,
        mode
      );

      // Delay: gifuct delay is in hundredths of a second. Fallback to 6 (=60ms) if missing.
      const delayCs = typeof f.delay === "number" ? f.delay : 6;
      const delayMs = Math.max(20, Math.round(delayCs * 10));

      encoder.addFrame(canvas, { copy: true, delay: delayMs });

      setProgress((i + 1) / total * 0.2); // 0..0.2 during capture
      // Yield UI
      if (i % 4 === 0) await new Promise((r) => requestAnimationFrame(() => r(null)));
    }

    const out: Blob = await new Promise((resolve, reject) => {
      encoder.on("finished", (b: Blob) => resolve(b));
      // If worker path is wrong, this can fail silently. We'll still reject on error.
      // @ts-ignore
      encoder.on("error", (e: any) => reject(e || new Error("GIF encode error")));
      encoder.render();
    });

    setProgress(1);
    return out;
  }

  async function runResize() {
    if (!file) return;

    setLoading(true);
    setProgress(0);
    if (outUrl) {
      URL.revokeObjectURL(outUrl);
      setOutUrl(null);
    }

    try {
      let blob: Blob;

      if (isGif && format === "gif") {
        blob = await resizeGif();
      } else if (isGif && format !== "gif") {
        // Browser can only export one frame if you choose png/webp/jpeg.
        // We'll just treat it as static (first frame).
        blob = await resizeStaticImage();
      } else {
        blob = await resizeStaticImage();
      }

      setOutUrl(URL.createObjectURL(blob));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Resize failed.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  const outputAcceptsGif = format === "gif";

  return (
    <Shell>
      <BoosterGate>
        <div className="grid gap-4 max-w-2xl">
          <h1 className="text-3xl font-black">Resizer</h1>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 grid gap-3">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="rounded-2xl bg-white/5 border border-white/10 p-3"
            />

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-white/70">
                Width
                <input
                  type="number"
                  value={width}
                  min={1}
                  max={4096}
                  onChange={(e) => updateWidth(Number(e.target.value))}
                  className="mt-1 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
                />
              </label>

              <label className="text-sm text-white/70">
                Height
                <input
                  type="number"
                  value={height}
                  min={1}
                  max={4096}
                  onChange={(e) => updateHeight(Number(e.target.value))}
                  className="mt-1 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <label className="text-sm text-white/70 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={keepAspect}
                  onChange={(e) => setKeepAspect(e.target.checked)}
                />
                Keep aspect
              </label>

              <label className="text-sm text-white/70 flex items-center gap-2">
                Mode
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as ResizeMode)}
                  className="rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                >
                  <option value="fit">Fit (no crop)</option>
                  <option value="exact">Exact (cover/crop)</option>
                </select>
              </label>

              <label className="text-sm text-white/70 flex items-center gap-2">
                Output
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as OutputFormat)}
                  className="rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                >
                  <option value="webp">WebP</option>
                  <option value="png">PNG</option>
                  <option value="jpeg">JPG</option>
                  <option value="gif">GIF</option>
                </select>
              </label>
            </div>

            {(format === "webp" || format === "jpeg") && (
              <label className="text-sm text-white/70">
                Quality ({Math.round(quality * 100)}%)
                <input
                  type="range"
                  min={0.5}
                  max={1}
                  step={0.01}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full"
                />
              </label>
            )}

            {format === "gif" && (
              <label className="text-sm text-white/70">
                GIF Quality (higher = smaller, more artifacts): {gifQuality}
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={gifQuality}
                  onChange={(e) => setGifQuality(Number(e.target.value))}
                  className="w-full"
                />
              </label>
            )}

            <button
              onClick={runResize}
              disabled={!file || loading || (isGif && outputAcceptsGif && !file)}
              className="px-5 py-3 rounded-2xl bg-fuchsia-500 hover:bg-fuchsia-400 disabled:opacity-50 font-semibold"
            >
              {loading ? `Resizing… ${Math.round(progress * 100)}%` : "Resize"}
            </button>

            {isGif && format !== "gif" && (
              <div className="text-xs text-white/50">
                Note: exporting as PNG/WebP/JPG from a GIF will use the first frame only. Choose GIF to keep animation.
              </div>
            )}

            {format === "gif" && (
              <div className="text-xs text-white/50">
                Make sure <code>/public/gif.worker.js</code> exists, or GIF export will fail.
              </div>
            )}
          </div>

          {outUrl && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 grid gap-3">
              <div className="text-sm text-white/70">Preview</div>
              <img src={outUrl} alt="Resized output" className="w-full rounded-2xl" />
              <a
                href={outUrl}
                download={`resized.${format === "jpeg" ? "jpg" : format}`}
                className="inline-block text-sm px-4 py-2 rounded-xl border border-white/15 hover:bg-white/5 w-fit"
              >
                Download
              </a>
            </div>
          )}

          {/* hidden canvas used for resizing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </BoosterGate>
    </Shell>
  );
}
