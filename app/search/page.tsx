"use client";

import BoosterGate from "@/components/BoosterGate";
import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { Toast, useToast } from "@/components/Toast";

type Gif = {
  id: string;
  images: {
    fixed_width: { url: string };
    original: { url: string };
  };
  title: string;
};

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function load(query?: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/giphy?q=${encodeURIComponent(query || "")}&limit=24`);
      const json = await res.json();
      setItems(json.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(""); // trending on load
  }, []);

  return (
    <Shell>
      <BoosterGate>
        <div className="grid gap-6">
          <div className="glass neon-ring rounded-3xl p-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">GIF Search</h1>
                <p className="text-white/60 mt-1">Trending + search. Copy links instantly.</p>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") load(q);
                  }}
                  placeholder="Search GIFs..."
                  className="flex-1 md:w-[420px] rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none
                             focus:border-white/20 focus:bg-white/10 transition"
                />
                <button
                  onClick={() => load(q)}
                  className="px-5 py-3 rounded-2xl bg-fuchsia-500/90 hover:bg-fuchsia-400 font-semibold transition neon-btn"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Loading skeletons */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl overflow-hidden">
                  <div className="h-36 bg-white/5 animate-pulse" />
                  <div className="p-3 flex gap-2">
                    <div className="h-9 w-16 rounded-xl bg-white/5 animate-pulse" />
                    <div className="h-9 w-20 rounded-xl bg-white/5 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {items.map((g) => (
                <div
                  key={g.id}
                  className="glass rounded-2xl overflow-hidden hover:bg-white/10 transition
                             hover:-translate-y-[2px] hover:shadow-[0_20px_80px_rgba(168,85,247,0.18)]"
                >
                  <div className="relative">
                    <img src={g.images.fixed_width.url} alt={g.title} className="w-full" />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                  <div className="p-3 flex gap-2">
                    <a
                      href={g.images.original.url}
                      target="_blank"
                      className="text-xs px-3 py-2 rounded-xl border border-white/15 hover:bg-white/5 transition"
                    >
                      Open
                    </a>

                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(g.images.original.url);
                        toast.show("Copied link ✨");
                      }}
                      className="text-xs px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Toast */}
          {toast.msg && <Toast message={toast.msg} />}
        </div>
      </BoosterGate>
    </Shell>
  );
}
