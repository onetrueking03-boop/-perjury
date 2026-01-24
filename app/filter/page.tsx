"use client";

import BoosterGate from "@/components/BoosterGate";
import Shell from "@/components/Shell";
import { useMemo, useRef, useState } from "react";
import { Toast, useToast } from "@/components/Toast";

type Controls = {
  brightness: number; // %
  contrast: number; // %
  saturation: number; // %
  hue: number; // deg
  blur: number; // px
};

export default function FilterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [controls, setControls] = useState<Controls>({
    brightness: 105,
    contrast: 110,
    saturation: 120,
    hue: 0,
    blur: 0,
  });

  // Before/After compare
  const [compareMode, setCompareMode] = useState(true);
  const [split, setSplit] = useState(50); // 0-100
  const draggingRef = useRef(false);

  const toast = useToast();
  const imgRef = useRef<HTMLImageElement | null>(null);

  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const cssFilter = useMemo(() => {
    return `brightness(${controls.brightness}%) contrast(${controls.contrast}%) saturate(${controls.saturation}%) hue-rotate(${controls.hue}deg) blur(${controls.blur}px)`;
  }, [controls]);

  function reset() {
    setControls({ brightness: 105, contrast: 110, saturation: 120, hue: 0, blur: 0 });
    toast.show("Reset ✨");
  }

  async function exportPNG() {
    if (!imgRef.current) return;
    await new Promise((r) => requestAnimationFrame(r)); // ensure image is ready

    const img = imgRef.current;

    // Use natural image size for best quality
    const w = img.naturalWidth;
    const h = img.naturalHeight;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Apply same filters as preview
    ctx.filter = cssFilter;

    // Draw image with filters applied
    ctx.drawImage(img, 0, 0, w, h);

    // Convert to blob + download
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png")
    );

    if (!blob) return;

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "filtered.png";
    a.click();

    toast.show("Exported PNG ✅");
  }

  return (
    <Shell>
      <BoosterGate>
        <div className="grid gap-6">
          <div className="glass neon-ring rounded-3xl p-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">Filter</h1>
                <p className="text-white/60 mt-1">Neon-style image tweaks. Export as PNG.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 transition"
                  type="button"
                >
                  Reset
                </button>
                <button
                  onClick={exportPNG}
                  disabled={!url}
                  className="px-4 py-2 rounded-2xl bg-fuchsia-500/90 hover:bg-fuchsia-400 disabled:opacity-50 transition neon-btn font-semibold"
                  type="button"
                >
                  Export PNG
                </button>
              </div>
            </div>

            <div className="mt-4">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-2xl bg-white/5 border border-white/10 p-3"
              />
            </div>
          </div>

          {url ? (
            <div className="grid md:grid-cols-2 gap-4 items-start">
              {/* Preview (Before/After) */}
              <div className="glass rounded-3xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold">Preview</div>

                  <button
                    type="button"
                    onClick={() => setCompareMode((v) => !v)}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition text-xs"
                  >
                    {compareMode ? "Single View" : "Before/After"}
                  </button>
                </div>

                <div
                  className="relative overflow-hidden rounded-2xl border border-white/10 select-none"
                  onPointerDown={(e) => {
                    if (!compareMode) return;
                    draggingRef.current = true;
                    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);

                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
                    setSplit(Math.round((x / rect.width) * 100));
                  }}
                  onPointerUp={() => (draggingRef.current = false)}
                  onPointerCancel={() => (draggingRef.current = false)}
                  onPointerMove={(e) => {
                    if (!compareMode || !draggingRef.current) return;
                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
                    setSplit(Math.round((x / rect.width) * 100));
                  }}
                >
                  {/* SINGLE VIEW */}
                  {!compareMode && (
                    <>
                      <img
                        ref={imgRef}
                        src={url}
                        alt="Preview"
                        style={{ filter: cssFilter }}
                        className="w-full h-auto block"
                      />
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                    </>
                  )}

                  {/* BEFORE/AFTER COMPARE */}
                  {compareMode && (
                    <div className="relative">
                      {/* Hidden original image for export (natural size) */}
                      <img ref={imgRef} src={url} alt="Hidden original for export" className="hidden" />

                      {/* Base layer: ORIGINAL */}
                      <img src={url} alt="Before" className="w-full h-auto block" />

                      {/* Top layer: FILTERED (clipped to split %) */}
                      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
                        <img
                          src={url}
                          alt="After"
                          style={{ filter: cssFilter }}
                          className="w-full h-auto block"
                        />
                      </div>

                      {/* Divider + handle */}
                      <div className="absolute inset-y-0" style={{ left: `${split}%` }}>
                        <div className="w-[2px] h-full bg-white/70 shadow-[0_0_20px_rgba(255,255,255,0.35)]" />
                        <div className="absolute top-1/2 -translate-y-1/2 -left-4">
                          <div className="glass-strong neon-ring rounded-2xl px-3 py-2 text-xs flex items-center gap-2">
                            <span className="text-white/70">Before</span>
                            <span className="text-white/35">|</span>
                            <span className="text-white">After</span>
                          </div>
                        </div>
                      </div>

                      {/* Labels */}
                      <div className="absolute left-3 bottom-3 text-[11px] px-2 py-1 rounded-lg glass-strong">
                        Before
                      </div>
                      <div className="absolute right-3 bottom-3 text-[11px] px-2 py-1 rounded-lg glass-strong">
                        After
                      </div>

                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    </div>
                  )}
                </div>

                {compareMode ? (
                  <div className="mt-3 text-xs text-white/55 flex items-center justify-between">
                    <span>Drag on the image to move the slider</span>
                    <span className="tabular-nums">{split}%</span>
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-white/50">
                    Tip: Export uses the image’s original resolution for best quality.
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="glass rounded-3xl p-6 grid gap-5">
                <Slider
                  label="Brightness"
                  value={controls.brightness}
                  min={0}
                  max={200}
                  onChange={(v) => setControls((c) => ({ ...c, brightness: v }))}
                />
                <Slider
                  label="Contrast"
                  value={controls.contrast}
                  min={0}
                  max={200}
                  onChange={(v) => setControls((c) => ({ ...c, contrast: v }))}
                />
                <Slider
                  label="Saturation"
                  value={controls.saturation}
                  min={0}
                  max={300}
                  onChange={(v) => setControls((c) => ({ ...c, saturation: v }))}
                />
                <Slider
                  label="Hue"
                  value={controls.hue}
                  min={-180}
                  max={180}
                  onChange={(v) => setControls((c) => ({ ...c, hue: v }))}
                />
                <Slider
                  label="Blur"
                  value={controls.blur}
                  min={0}
                  max={12}
                  onChange={(v) => setControls((c) => ({ ...c, blur: v }))}
                />

                <div className="glass-strong rounded-2xl p-4 text-sm text-white/70">
                  <div className="font-semibold text-white mb-1">Preset vibe</div>
                  <div className="flex flex-wrap gap-2">
                    <PresetButton
                      label="Neon Pop"
                      onClick={() =>
                        setControls({ brightness: 110, contrast: 130, saturation: 155, hue: 0, blur: 0 })
                      }
                    />
                    <PresetButton
                      label="Soft Glow"
                      onClick={() =>
                        setControls({ brightness: 108, contrast: 115, saturation: 120, hue: 0, blur: 1 })
                      }
                    />
                    <PresetButton
                      label="Cyber Pink"
                      onClick={() =>
                        setControls({ brightness: 108, contrast: 125, saturation: 150, hue: 15, blur: 0 })
                      }
                    />
                    <PresetButton
                      label="Icy Blue"
                      onClick={() =>
                        setControls({ brightness: 110, contrast: 120, saturation: 140, hue: -20, blur: 0 })
                      }
                    />
                  </div>
                </div>

                <div className="text-xs text-white/50">
                  Want saved presets next? We can store them in your browser (localStorage).
                </div>
              </div>
            </div>
          ) : (
            <div className="glass rounded-3xl p-10 text-center text-white/60">
              Upload an image to start filtering.
            </div>
          )}

          {toast.msg && <Toast message={toast.msg} />}
        </div>
      </BoosterGate>
    </Shell>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="text-sm text-white/75">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-white">{label}</span>
        <span className="text-white/60 tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-2"
      />
    </label>
  );
}

function PresetButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition text-xs"
      type="button"
    >
      {label}
    </button>
  );
}
