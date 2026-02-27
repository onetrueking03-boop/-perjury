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

  // Only fetch drops if booster is true (keeps gate strong, avoids leaking URLs)
  useEffect(() => {
    if (booster !== true) {
      setLoadingImages(false);
      setImages([]);
      return;
    }

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
  }, [booster]);

  const locked = useMemo(() => booster !== true, [booster]);

  // Use a few images for the hero preview boxes (so they aren't empty)
  const preview = useMemo(() => {
    const fallback: string[] = [
      // If you have local images, replace these with /images/...
      // Keeping these as gradients via CSS is also fine, but you asked for images in boxes.
      // If images array is empty, these will not be used; we show placeholder blocks.
    ];
    const list = images.length ? images : fallback;
    return list.slice(0, 3);
  }, [images]);

  return (
    <Shell>
      <div className="grid gap-10">
        {/* HERO (Landing style + subtle motion) */}
        <section className="relative overflow-hidden rounded-[32px] glass neon-ring">
          {/* animated background glows */}
          <div className="hero-glow hero-glow-a absolute -top-28 -right-28 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="hero-glow hero-glow-b absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />

          {/* dotted line across */}
          <div className="hero-dots pointer-events-none absolute left-0 right-0 top-[430px] hidden md:block" />

          <div className="relative z-10 p-7 md:p-10">
            {/* top pills */}
            <div className="flex flex-wrap gap-2">
              <Pill>Discord channel drops</Pill>
              <Pill>Booster locked tools</Pill>
              <Pill>Converter</Pill>
              <Pill>Resize + Filters</Pill>
            </div>

            <div className="mt-8 grid md:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
              {/* LEFT */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm glass border border-white/10">
                  🔥 Over 5,000 users upgraded
                </div>

                <div className="mt-3 text-sm text-white/55">
                  ✨ Premium drops + tools unlocked for boosters
                </div>

                <h1 className="mt-6 text-5xl md:text-6xl font-black leading-[1.03] tracking-tight">
                  Take your <span className="text-white">Discord</span>{" "}
                  <span className="text-fuchsia-400">to</span>
                  <br />
                  another level <span className="text-fuchsia-400">and</span> mark
                  <br />
                  presence
                </h1>

                <p className="mt-5 text-white/65 max-w-xl leading-relaxed">
                  Boosters unlock the full toolkit: Search, Converter, Filters, Resizer, and
                  full-quality Discord drops.
                </p>

                {/* feature tiles */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="glass rounded-2xl px-4 py-3 text-sm text-white/80 border border-white/10">
                    🎞️ Premium GIFs
                  </span>
                  <span className="glass rounded-2xl px-4 py-3 text-sm text-white/80 border border-white/10">
                    🧩 Tools + presets
                  </span>
                  <span className="glass rounded-2xl px-4 py-3 text-sm text-white/80 border border-white/10">
                    🔒 Booster gated
                  </span>
                </div>

                {/* CTAs (removed Effects link) */}
                <div className="mt-8 flex flex-wrap gap-3">
                  {status !== "authenticated" ? (
                    <button
                      onClick={() => signIn("discord")}
                      className="px-7 py-3 rounded-full bg-fuchsia-500/90 hover:bg-fuchsia-400 font-semibold transition neon-btn"
                      type="button"
                    >
                      Login with Discord
                    </button>
                  ) : (
                    <Link
                      href="/pro"
                      className="px-7 py-3 rounded-full bg-fuchsia-500/90 hover:bg-fuchsia-400 font-semibold transition neon-btn"
                    >
                      {booster === null
                        ? "Checking booster…"
                        : booster
                        ? "Booster Active ✅"
                        : "Boost to Unlock"}
                    </Link>
                  )}

                  <Link
                    href="#drops"
                    className="px-7 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 transition font-semibold"
                  >
                    See Drops
                  </Link>

                  <Link
                    href="/resize"
                    className="px-7 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 transition font-semibold"
                  >
                    Resize Tool
                  </Link>
                </div>

                <div className="mt-10 text-white/45 text-sm">
                  Discover more <span className="ml-2">⌄</span>
                </div>
              </div>

              {/* RIGHT (discord-like preview card) */}
              <div className="relative">
                <div className="mock-glow hero-float rounded-[28px] p-7">
                  <div className="glass-strong rounded-3xl p-5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-white/10 border border-white/10" />
                        <div>
                          <div className="text-sm font-semibold">your profile</div>
                          <div className="text-xs text-emerald-400">● Online</div>
                        </div>
                      </div>

                      <div className="text-xs px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-400/25 text-white/80">
                        {locked ? "Locked" : "Unlocked"}
                      </div>
                    </div>

                    {/* image boxes (no longer empty) */}
                    <div className="mt-4 glass rounded-2xl p-4 border border-white/10">
                      <div className="text-xs text-white/60 mb-3">🎞️ Featured Drops</div>

                      <div className="grid grid-cols-3 gap-3">
                        {Array.from({ length: 3 }).map((_, idx) => {
                          const src = preview[idx];
                          const lockedStyle = locked ? "blur-[10px] scale-[1.06]" : "group-hover:scale-[1.03]";

                          return (
                            <div
                              key={idx}
                              className="relative overflow-hidden rounded-xl border border-white/10 bg-white/10"
                            >
                              {src ? (
                                <img
                                  src={src}
                                  alt="Preview"
                                  className={`h-24 w-full object-cover transition duration-500 ${lockedStyle}`}
                                  loading="lazy"
                                />
                              ) : (
                                <div className="h-24 w-full shimmer" />
                              )}

                              {/* glossy sweep */}
                              <div className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition">
                                <div className="absolute -inset-10 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.10),transparent)] translate-x-[-60%] hover:translate-x-[60%] transition duration-700" />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {locked && (
                        <div className="mt-3 text-xs text-white/55">
                          Preview is blurred until you boost.
                        </div>
                      )}
                    </div>

                    <div className="mt-4 glass rounded-2xl p-4 border border-white/10">
                      <div className="text-xs text-white/60">Access</div>
                      <div className="mt-1 text-sm font-semibold">
                        {status !== "authenticated"
                          ? "Login required"
                          : booster === null
                          ? "Checking booster…"
                          : booster
                          ? "✅ Booster unlocked"
                          : "❌ Not a booster"}
                      </div>
                      <div className="mt-2 text-xs text-white/55">
                        {status !== "authenticated"
                          ? "Login to verify booster perks."
                          : booster
                          ? "All tools + full drops enabled."
                          : "Boost the server to unlock tools."}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                      <div className="glass rounded-xl p-3 text-white/70 border border-white/10">
                        Search
                      </div>
                      <div className="glass rounded-xl p-3 text-white/70 border border-white/10">
                        Resize
                      </div>
                      <div className="glass rounded-xl p-3 text-white/70 border border-white/10">
                        Convert
                      </div>
                    </div>
                  </div>
                </div>

                {/* sparkles with subtle twinkle */}
                <div className="hero-twinkle absolute -left-5 top-24 h-2 w-2 rounded-full bg-purple-400/80 blur-[1px]" />
                <div className="hero-twinkle absolute -right-3 top-44 h-2 w-2 rounded-full bg-fuchsia-400/70 blur-[1px]" />
                <div className="hero-twinkle absolute right-10 bottom-10 h-1.5 w-1.5 rounded-full bg-white/40 blur-[0.5px]" />
              </div>
            </div>
          </div>
        </section>

        {/* TOOL CARDS (removed Effects) */}
        <section className="grid md:grid-cols-3 gap-4">
          <ToolCard
            title="Resizer"
            tag="Booster"
            desc="Resize any image or GIF for Discord PFP, emojis, or stickers."
            href="/resize"
          />
          <ToolCard
            title="GIF Converter"
            tag="Booster"
            desc="Upload a clip, pick start/end, export a clean GIF."
            href="/convert"
          />
          <ToolCard
            title="Search GIFs"
            tag="Booster"
            desc="Trending + search with quick open + copy link."
            href="/search"
          />
          <ToolCard
            title="Filters"
            tag="Booster"
            desc="Neon filters with before/after slider and PNG export."
            href="/filter"
          />
          <ToolCard
            title="Booster Perks"
            tag="Info"
            desc="See what boosting unlocks and verify your status."
            href="/pro"
          />
          <ToolCard
            title="FAQ"
            tag="Info"
            desc="How the booster gate works and what you unlock."
            href="/pro"
          />
        </section>

        {/* DISCORD DROPS PREVIEW */}
        <section
          id="drops"
          className="glass neon-ring rounded-[28px] p-7 md:p-8 relative overflow-hidden"
        >
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
                  if (locked) return;
                  setLoadingImages(true);
                  fetch("/api/discord/media", { cache: "no-store" })
                    .then((r) => r.json())
                    .then((j) => setImages(j.images || []))
                    .finally(() => setLoadingImages(false));
                }}
                className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                disabled={locked}
                title={locked ? "Boost to unlock" : "Refresh drops"}
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
                  href="/resize"
                  className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition text-sm"
                >
                  Resize
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
                {locked
                  ? "Drops are locked — boost to unlock previews."
                  : "No images found in the channel yet."}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {images.slice(0, 18).map((src, i) => {
                  const featured = i === 0;
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
                      <img
                        src={src}
                        alt="Drop"
                        className={[
                          "w-full object-cover block transition duration-500",
                          h,
                          locked ? "blur-[10px] scale-[1.08]" : "group-hover:scale-[1.05]",
                        ].join(" ")}
                        loading="lazy"
                      />

                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                        <div className="absolute -inset-10 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.10),transparent)] translate-x-[-60%] group-hover:translate-x-[60%] transition duration-700" />
                      </div>

                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                      <div className="absolute left-3 top-3 text-[11px] px-2 py-1 rounded-lg border border-white/10 bg-black/30 backdrop-blur">
                        {featured ? "Featured Drop" : "Drop"}
                      </div>

                      {locked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="glass-strong neon-ring rounded-2xl px-3 py-2 text-xs font-semibold">
                            🔒 Booster Only
                          </div>
                        </div>
                      )}

                      <div
                        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition
                                      shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10),0_0_40px_rgba(236,72,153,0.15),0_0_60px_rgba(168,85,247,0.18)]"
                      />
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