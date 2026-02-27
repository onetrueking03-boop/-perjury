"use client";

import BoosterGate from "@/components/BoosterGate";
import Shell from "@/components/Shell";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import GIF from "gif.js.optimized";

/* ---------------------------------- DATA --------------------------------- */

type RemoteEffect = {
  id: string;
  name: string;
  videoUrl: string;
  overlayScale?: number;
  category?: string;
};

const REMOTE_EFFECTS: RemoteEffect[] = [
  { id: "nitro_shine", name: "Nitro Shine", videoUrl: "/effects/nitro_shine.webm", overlayScale: 1.00, category: "All" },

  { id: "dragon_ballz", name: "Dragon Ballz", videoUrl: "/effects/Dragon_Ballz.webm", overlayScale: 1.00, category: "Dragon Ball" },
  { id: "dragon", name: "Dragon", videoUrl: "/effects/Dragon.webm", overlayScale: 1.00, category: "Dragon Ball" },

  { id: "mystic", name: "Mystic", videoUrl: "/effects/Mystic.webm", overlayScale: 1.05, category: "Magic" },
  { id: "mystic2", name: "Mystic 2", videoUrl: "/effects/Mystic2.webm", overlayScale: 1.00, category: "Magic" },
  { id: "mystic3", name: "Mystic 3", videoUrl: "/effects/Mystic3.webm", overlayScale: 1.00, category: "Magic" },
  { id: "magic_the_gathering", name: "Magic: The Gathering", videoUrl: "/effects/Magic_the_gathering.webm", overlayScale: 1.00, category: "Magic" },

  { id: "anime1", name: "Anime Aura 1", videoUrl: "/effects/Anime1.webm", overlayScale: 1.00, category: "Anime" },
  { id: "anime2", name: "Anime Aura 2", videoUrl: "/effects/Anime2.webm", overlayScale: 1.00, category: "Anime" },
  { id: "anime3", name: "Anime Aura 3", videoUrl: "/effects/Anime3.webm", overlayScale: 1.00, category: "Anime" },
  { id: "anime4", name: "Anime Aura 4", videoUrl: "/effects/Anime4.webm", overlayScale: 1.00, category: "Anime" },
  { id: "zen", name: "Zen", videoUrl: "/effects/Zen.webm", overlayScale: 1.00, category: "Anime" },
  { id: "zen_protocol", name: "Zen_Protocol", videoUrl: "/effects/Zen_Protocol.webm", overlayScale: 1.00, category: "Anime" },

  { id: "fish", name: "Fish", videoUrl: "/effects/Fish.webm", overlayScale: 1.00, category: "Fantasy" },
  { id: "rockworm", name: "Rockworm", videoUrl: "/effects/Rockworm.webm", overlayScale: 1.00, category: "Fantasy" },
  { id: "duck", name: "Duck", videoUrl: "/effects/Duck.webm", overlayScale: 1.00, category: "Funny" },

  { id: "fire_ice", name: "Fire & Ice", videoUrl: "/effects/Fire_ice.webm", overlayScale: 1.00, category: "Elements" },

  { id: "skibidi_toilet", name: "Skibidi Toilet", videoUrl: "/effects/Skibidi_toilet.webm", overlayScale: 1.00, category: "Meme" },
  { id: "skibidi_toilet2", name: "Skibidi Toilet 2", videoUrl: "/effects/Skibidi_toilet2.webm", overlayScale: 1.00, category: "Meme" },
];

const CATEGORIES = ["All", "Dragon Ball", "Anime", "Magic", "Fantasy", "Elements", "Funny", "Meme"];

/* -------------------------------- UTIL ---------------------------------- */

function cx(...s: Array<string | false | undefined>) {
  return s.filter(Boolean).join(" ");
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function forceDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---- Fix TS red squiggles: extend gif.js options type ---- */
type GifOptionsExtra = ConstructorParameters<typeof GIF>[0] & {
  background?: number;
  transparent?: number;
  dither?: any;
  globalPalette?: boolean;
};

export default function EffectsPage() {
  const { data: session, status } = useSession();

  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<RemoteEffect>(REMOTE_EFFECTS[0]);
  const [category, setCategory] = useState("All");

  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const exportVideoRef = useRef<HTMLVideoElement>(null);

  const avatarSrc = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return session?.user?.image ?? null;
  }, [file, session?.user?.image]);

  useEffect(() => {
    return () => {
      if (file && avatarSrc) URL.revokeObjectURL(avatarSrc);
    };
  }, [file, avatarSrc]);

  /* ----------------------------- GIF EXPORT ------------------------------ */

  async function exportCompositeGif() {
    if (!avatarSrc || !exportCanvasRef.current || !exportVideoRef.current) return;

    setExporting(true);
    setProgress(0);

    const size = 384;

    const KEY_HEX = 0xff00ff;
    const KEY_R = 255, KEY_G = 0, KEY_B = 255;

    const MATTE_R = 34, MATTE_G = 36, MATTE_B = 41;
    const ALPHA_CUTOFF = 140;

    const avatarImg = await loadImage(avatarSrc);

    const avatarCanvas = document.createElement("canvas");
    avatarCanvas.width = size;
    avatarCanvas.height = size;
    const actx = avatarCanvas.getContext("2d")!;
    actx.imageSmoothingEnabled = true;
    actx.imageSmoothingQuality = "high";
    actx.clearRect(0, 0, size, size);
    actx.drawImage(avatarImg, 0, 0, size, size);

    const r = size / 2 - 1;
    const cx0 = size / 2;
    const cy0 = size / 2;
    const avatarData = actx.getImageData(0, 0, size, size);
    const ad = avatarData.data;

    for (let y = 0; y < size; y++) {
      const dy = y - cy0;
      for (let x = 0; x < size; x++) {
        const dx = x - cx0;
        if (dx * dx + dy * dy > r * r) {
          const idx = (y * size + x) * 4;
          ad[idx + 3] = 0;
        }
      }
    }
    actx.putImageData(avatarData, 0, 0);

    const video = exportVideoRef.current;
    video.src = selected.videoUrl;
    video.loop = false;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    await new Promise((res) => (video.onloadedmetadata = () => res(null)));

    const canvas = exportCanvasRef.current;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const fps = 18;
    const frameDuration = 1 / fps;
    const delayMs = Math.round(1000 / fps);

    const duration =
      Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 2.5;

    const totalFrames = Math.max(1, Math.floor(duration * fps));

    const scale = selected.overlayScale ?? 0.92;
    const pad = ((1 - scale) * size) / 2;

    const opts: GifOptionsExtra = {
      workers: 2,
      quality: 10,
      width: size,
      height: size,
      workerScript: "/gif.worker.js",
      background: KEY_HEX,
      transparent: KEY_HEX,
    };

    const gif = new GIF(opts);

    for (let i = 0; i < totalFrames; i++) {
      const t = i * frameDuration;
      video.currentTime = t;
      await new Promise((res) => (video.onseeked = () => res(null)));

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, size, size);

      ctx.drawImage(avatarCanvas, 0, 0);
      ctx.drawImage(video, pad, pad, size * scale, size * scale);

      const frame = ctx.getImageData(0, 0, size, size);
      const d = frame.data;

      for (let p = 0; p < d.length; p += 4) {
        const r0 = d[p + 0];
        const g0 = d[p + 1];
        const b0 = d[p + 2];
        const a0 = d[p + 3];

        if (a0 < ALPHA_CUTOFF) {
          d[p + 0] = KEY_R;
          d[p + 1] = KEY_G;
          d[p + 2] = KEY_B;
          d[p + 3] = 255;
        } else {
          const a = a0 / 255;
          d[p + 0] = Math.round(r0 * a + MATTE_R * (1 - a));
          d[p + 1] = Math.round(g0 * a + MATTE_G * (1 - a));
          d[p + 2] = Math.round(b0 * a + MATTE_B * (1 - a));
          d[p + 3] = 255;
        }
      }

      ctx.putImageData(frame, 0, 0);

      gif.addFrame(canvas, { copy: true, delay: delayMs });
      setProgress((i + 1) / totalFrames);
    }

    gif.on("finished", (blob: Blob) => {
      forceDownload(blob, "profile-effect.gif");
      setExporting(false);
    });

    gif.render();
  }

  const filteredEffects =
    category === "All"
      ? REMOTE_EFFECTS
      : REMOTE_EFFECTS.filter((e) => e.category === category);

  /* --------------------------------- UI ---------------------------------- */

  return (
    <Shell>
      <BoosterGate>
        <div className="grid xl:grid-cols-[340px_1fr] gap-6">
          {/* LEFT PANEL */}
          <div className="glass rounded-3xl p-6 border border-white/10 sticky top-6">
            <div className="text-lg font-black mb-4">Your Avatar</div>

            <div className="flex justify-center mb-4">
              {/* ✅ FIXED PREVIEW: avatar is clipped, overlay is NOT */}
              <div className="relative w-48 h-48 overflow-visible">
                {/* Avatar circle (clipped) */}
                <div className="absolute inset-0 rounded-full overflow-hidden border border-white/15 bg-black/40">
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarSrc}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-white/50">
                      No avatar selected
                    </div>
                  )}
                </div>

                {/* Overlay (NOT clipped) */}
                <video
                  key={selected.id}
                  src={selected.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{
                    transform: `scale(${selected.overlayScale ?? 0.92})`,
                    zIndex: 10,
                  }}
                />
              </div>
            </div>

            {status !== "authenticated" && (
              <button
                onClick={() => signIn("discord")}
                className="w-full mb-3 px-4 py-3 rounded-xl bg-yellow-500/90 hover:bg-yellow-400 text-black font-semibold"
              >
                Use Discord Avatar
              </button>
            )}

            <label className="block mb-4 border-2 border-dashed border-white/15 rounded-xl p-4 text-center text-sm text-white/60 cursor-pointer hover:bg-white/5">
              Upload Custom Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>

            <button
              disabled={!avatarSrc || exporting}
              onClick={exportCompositeGif}
              className="w-full px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 font-bold disabled:opacity-50"
            >
              {exporting ? `Exporting ${Math.round(progress * 100)}%` : "Download GIF"}
            </button>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <div className="glass rounded-3xl p-5 border border-white/10">
              <div className="text-sm font-semibold mb-3">Categories</div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={cx(
                      "px-3 py-1.5 rounded-full text-xs border transition",
                      category === c
                        ? "bg-yellow-500/20 border-yellow-400 text-yellow-200"
                        : "border-white/10 bg-white/5 hover:bg-white/10 text-white/70"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-3xl p-5 border border-white/10">
              <div className="text-sm font-semibold mb-4">Available Effects</div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredEffects.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className={cx(
                      "rounded-2xl p-3 border transition",
                      selected.id === e.id
                        ? "border-yellow-400 bg-yellow-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40">
                      <video
                        src={e.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2 text-xs font-semibold truncate">{e.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Offscreen export elements (NOT display:none) */}
        <canvas ref={exportCanvasRef} style={{ position: "fixed", left: -9999, opacity: 0 }} />
        <video ref={exportVideoRef} style={{ position: "fixed", left: -9999, opacity: 0 }} />
      </BoosterGate>
    </Shell>
  );
}