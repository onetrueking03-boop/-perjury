"use client";

import Shell from "@/components/Shell";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

function ToolCard({
  title,
  desc,
  href,
  tag,
}: {
  title: string;
  desc: string;
  href: string;
  tag: string;
}) {
  return (
    <Link
      href={href}
      className="glass rounded-3xl p-6 hover:bg-white/10 transition hover:-translate-y-[2px]
                 hover:shadow-[0_20px_80px_rgba(168,85,247,0.18)] group"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-lg font-black tracking-tight">{title}</div>
        <span className="text-[11px] px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/60">
          {tag}
        </span>
      </div>
      <div className="mt-2 text-sm text-white/65 leading-relaxed">{desc}</div>
      <div className="mt-4 text-sm font-semibold text-white/80 group-hover:text-white transition">
        Open tool →
      </div>
    </Link>
  );
}

export default function Home() {
  const { status } = useSession();

  const [booster, setBooster] = useState<boolean | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    // Check booster status (optional for home, but needed for lock/blur)
    (async () => {
      const r = await fetch("/api/me/booster", { cache: "no-store" });
      if (!r.ok) {
        setBooster(false);
        return;
      }
      const j = await r.json();
      setBooster(!!j.booster);
    })();
  }, [status]);

  useEffect(() => {
    (async () => {
      setLoadingImages(true);
      try {
        const r = await fetch("/api/discord/media", { cache: "no-store" });
        const j = await r.json();
        setImages(j.images || []);
      } finally {
        setLoadingImages(false);
      }
    })();
  }, []);

  const locked = useMemo(() => booster !== true, [booster]);

  return (
    <Shell>
      <div className="grid gap-10">
        {/* HERO */}
        <section className="glass neon-ring rounded-[32px] p-7 md:p-10 overflow-hidden relative">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative z-10 grid md:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Pill>Discord channel drops</Pill>
                <Pill>Booster locked tools</Pill>
                <Pill>Neon filters + convert</Pill>
              </div>

              <h1 className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tight">
                Take your Profile to the next level and mark your presence 
                <br />
                on <span className="text-fuchsia-400">Discord</span>.
              </h1>

              <p className="mt-4 text-white/65 max-w-xl leading-relaxed">
                The homepage pulls from our Discord drop channel. Boosters unlock the full toolkit:
                Search, Convert, Filters, and more.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/search"
                  className="px-6 py-3 rounded-2xl bg-fuchsia-500/90 hover:bg-fuchsia-400 font-semibold transition neon-btn"
                >
                  Open Search
                </Link>

                {status !== "authenticated" ? (
                  <button
                    onClick={() => signIn("discord")}
                    className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition"
                    type="button"
                  >
                    Login with Discord
                  </button>
                ) : (
                  <Link
                    href="/pro"
                    className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition"
                  >
                    Booster Status
                  </Link>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/55">
                <span className="glass rounded-full px-3 py-1">Live drops</span>
                <span className="glass rounded-full px-3 py-1">Clean UI</span>
                <span className="glass rounded-full px-3 py-1">Packs</span>
                <span className="glass rounded-full px-3 py-1">Booster perks</span>
              </div>
            </div>

            {/* Right status card */}
            <div className="glass rounded-[28px] p-5 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white/85">Access</div>
                <div className="text-[11px] text-white/50">live</div>
              </div>

              <div className="mt-4 glass-strong rounded-2xl p-4">
                <div className="text-xs text-white/60">Account</div>
                <div className="mt-1 text-sm font-semibold">
                  {status !== "authenticated"
                    ? "Not logged in"
                    : booster === null
                    ? "Checking booster…"
                    : booster
                    ? "✅ Booster unlocked"
                    : "❌ Not a booster"}
                </div>
                <div className="mt-3 text-xs text-white/55">
                  {status !== "authenticated"
                    ? "Login to verify booster perks."
                    : booster
                    ? "You can use all tools."
                    : "Boost the server to unlock tools."}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="glass rounded-xl p-3 text-white/70">Search</div>
                <div className="glass rounded-xl p-3 text-white/70">Convert</div>
                <div className="glass rounded-xl p-3 text-white/70">Filter</div>
              </div>
            </div>
          </div>
        </section>

        {/* TOOL CARDS */}
        <section className="grid md:grid-cols-3 gap-4">
          <ToolCard
            title="Search GIFs"
            tag="Booster"
            desc="Trending + search with quick open + copy link."
            href="/search"
          />
          <ToolCard
            title="GIF Converter"
            tag="Booster"
            desc="Upload a clip, pick start/end, export a clean GIF."
            href="/convert"
          />
          <ToolCard
            title="Filters"
            tag="Booster"
            desc="Neon filters with before/after slider and PNG export."
            href="/filter"
          />
        </section>

        {/* DISCORD DROPS PREVIEW */}
        <section className="glass neon-ring rounded-[28px] p-7 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_18%_20%,rgba(168,85,247,0.28),transparent_55%),radial-gradient(circle_at_82%_30%,rgba(236,72,153,0.22),transparent_55%),radial-gradient(circle_at_55%_95%,rgba(168,85,247,0.16),transparent_60%)]" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-black/40 to-black/60" />

          <div className="relative z-10 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm text-white/60">Latest Drops</div>
              <div className="text-2xl md:text-3xl font-black mt-1">From our Discord channel</div>
              <div className="text-white/65 mt-2">
                {locked
                  ? "Preview is locked — boost to see full quality and unlock tools."
                  : "Full quality unlocked. Click an image to open."}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  // simple refresh
                  setLoadingImages(true);
                  fetch("/api/discord/media", { cache: "no-store" })
                    .then((r) => r.json())
                    .then((j) => setImages(j.images || []))
                    .finally(() => setLoadingImages(false));
                }}
                className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition text-sm"
                type="button"
              >
                Refresh
              </button>

              {locked ? (
                <Link
                  href="/pro"
                  className="px-4 py-2 rounded-2xl bg-fuchsia-500/90 hover:bg-fuchsia-400 font-semibold transition neon-btn text-sm"
                >
                  Unlock (Boost)
                </Link>
              ) : (
                <Link
                  href="/search"
                  className="px-4 py-2 rounded-2xl bg-fuchsia-500/90 hover:bg-fuchsia-400 font-semibold transition neon-btn text-sm"
                >
                  Use Tools
                </Link>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-6">
            {loadingImages ? (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden border border-white/10 bg-white/5"
                  >
                    <div className="h-28 bg-white/5 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : images.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
                No images found in the channel yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {images.slice(0, 18).map((src, i) => {
                  const featured = i === 0; // first tile is featured
                  const tileHeights = ["h-28", "h-32", "h-36", "h-28", "h-40", "h-32"];
                  const h = featured ? "h-64 md:h-72" : tileHeights[i % tileHeights.length];

                  return (
                    <a
                      key={i}
                      href={locked ? "/pro" : src}
                      target={locked ? undefined : "_blank"}
                      className={[
                        "group relative overflow-hidden rounded-2xl border border-white/10",
                        "bg-white/5 hover:bg-white/10 transition",
                        "hover:-translate-y-[2px]",
                        "hover:shadow-[0_20px_90px_rgba(168,85,247,0.18)]",
                        featured ? "col-span-2 md:col-span-3 row-span-2" : "",
                      ].join(" ")}
                    >
                      {/* image */}
                      <img
                        src={src}
                        alt="Drop"
                        className={[
                          "w-full object-cover block transition duration-300",
                          h,
                          locked ? "blur-[10px] scale-[1.08]" : "group-hover:scale-[1.05]",
                        ].join(" ")}
                        loading="lazy"
                      />

                      {/* glossy hover shine */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                        <div className="absolute -inset-10 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.10),transparent)] translate-x-[-60%] group-hover:translate-x-[60%] transition duration-700" />
                      </div>

                      {/* gradient overlay */}
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                      {/* top-left tag */}
                      <div className="absolute left-3 top-3 text-[11px] px-2 py-1 rounded-lg border border-white/10 bg-black/30 backdrop-blur">
                        {featured ? "Featured Drop" : "Drop"}
                      </div>

                      {/* lock overlay */}
                      {locked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="glass-strong neon-ring rounded-2xl px-3 py-2 text-xs font-semibold">
                            🔒 Booster Only
                          </div>
                        </div>
                      )}

                      {/* subtle neon border on hover */}
                      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition
                                      shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10),0_0_40px_rgba(236,72,153,0.15),0_0_60px_rgba(168,85,247,0.18)]" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </section>


        {/* CTA */}
        <section className="text-center glass rounded-[28px] p-10">
          <div className="text-3xl md:text-4xl font-black tracking-tight">Want full access?</div>
          <div className="mt-2 text-white/65">
            Boost the Discord server to unlock the toolkit and full-quality drops.
          </div>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Link
              href="/pro"
              className="px-6 py-3 rounded-2xl bg-fuchsia-500/90 hover:bg-fuchsia-400 font-semibold transition neon-btn"
            >
              View Booster Perks
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition"
            >
              Back to top
            </Link>
          </div>
        </section>
      </div>
    </Shell>
  );
}
