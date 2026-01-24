"use client";

import BoosterGate from "@/components/BoosterGate";
import Shell from "@/components/Shell";
import { useState } from "react";

export default function ConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(3);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function convert() {
    if (!file) return;
    setLoading(true);
    setGifUrl(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("start", String(start));
    fd.append("end", String(end));

    const res = await fetch("/api/convert", { method: "POST", body: fd });
    if (!res.ok) {
    let msg = "Conversion is unavailable right now.";
    try {
      const j = await res.json();
      if (j?.message) msg = j.message;
    } catch {}
    setLoading(false);
    alert(msg);
    return;
  }

    const blob = await res.blob();
    setGifUrl(URL.createObjectURL(blob));
    setLoading(false);
  }

  return (
    <Shell>
      <BoosterGate>
        <div className="grid gap-4 max-w-xl">
          <h1 className="text-3xl font-black">GIF Converter</h1>

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
                onChange={(e) => setEnd(Number(e.target.value))}
                className="mt-1 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
              />
            </label>
          </div>

          <button
            onClick={convert}
            disabled={!file || loading}
            className="px-5 py-3 rounded-2xl bg-fuchsia-500 hover:bg-fuchsia-400 disabled:opacity-50 font-semibold"
          >
            {loading ? "Converting..." : "Convert to GIF"}
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
