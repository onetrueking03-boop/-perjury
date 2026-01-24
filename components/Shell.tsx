"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-xl text-sm text-white/75 hover:text-white hover:bg-white/5 transition"
    >
      {children}
    </Link>
  );
}

type GuildInfo = {
  ok: boolean;
  name?: string;
  iconUrl?: string | null;
};

type BoosterResp = { booster?: boolean };

const GUILD_CACHE_KEY = "bg_guild_cache_v1";
const GUILD_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export default function Shell({ children }: { children: React.ReactNode }) {
  const [guild, setGuild] = useState<GuildInfo | null>(null);
  const [booster, setBooster] = useState<boolean | null>(null); // null = checking

  // Load cached guild first, then refresh from API
  useEffect(() => {
    try {
      const raw = localStorage.getItem(GUILD_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { ts: number; data: GuildInfo };
        if (parsed?.data?.ok && Date.now() - parsed.ts < GUILD_CACHE_TTL_MS) {
          setGuild(parsed.data);
        }
      }
    } catch {}

    (async () => {
      try {
        const r = await fetch("/api/discord/guild", { cache: "no-store" });
        const j = (await r.json()) as GuildInfo;
        setGuild(j);
        try {
          localStorage.setItem(GUILD_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: j }));
        } catch {}
      } catch {
        setGuild((g) => g ?? { ok: false });
      }
    })();
  }, []);

  // Booster check for status dot
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/me/booster", { cache: "no-store" });
        if (!r.ok) {
          setBooster(false);
          return;
        }
        const j = (await r.json()) as BoosterResp;
        setBooster(!!j.booster);
      } catch {
        setBooster(false);
      }
    })();
  }, []);

  const serverName = guild?.ok && guild.name ? guild.name : "Discord Server";

  const dot = useMemo(() => {
    if (booster === null) {
      return {
        cls: "bg-purple-500 animate-pulse shadow-[0_0_14px_rgba(168,85,247,0.55)]",
        title: "Checking access…",
        lock: false,
      };
    }
    if (booster === true) {
      return {
        cls: "bg-emerald-400 shadow-[0_0_14px_rgba(16,220,140,0.55)]",
        title: "Online • Booster unlocked",
        lock: false,
      };
    }
    return {
      cls: "bg-pink-500 shadow-[0_0_16px_rgba(236,72,153,0.55)]",
      title: "Online • Booster required",
      lock: true,
    };
  }, [booster]);

  return (
    <div className="min-h-screen text-white">
      {/* Background (you already have animated glows in globals.css) */}
      <div className="fixed inset-0 -z-10 bg-black" />
      <div className="fixed inset-0 -z-10 vignette" />
      <div className="fixed inset-0 -z-10 grain pointer-events-none" />

      {/* Top bar */}
      <header className="sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <div className="glass neon-ring rounded-2xl px-3 py-2 flex items-center justify-between">
            {/* SERVER BRAND */}
            <Link
              href="/"
              className="group flex items-center gap-3 px-2 py-1 rounded-xl hover:bg-white/5 transition"
            >
              <div className="relative">
                {/* Icon badge with hover pulse/glow */}
                <div
                  className="
                    h-9 w-9 rounded-xl border border-white/10 bg-white/5 overflow-hidden
                    flex items-center justify-center
                    transition
                    group-hover:scale-105
                    group-hover:animate-pulse
                    group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_0_25px_rgba(168,85,247,0.35),0_0_45px_rgba(236,72,153,0.22)]
                  "
                >
                  {guild?.ok && guild.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={guild.iconUrl} alt="Server icon" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-black text-white/70">D</span>
                  )}
                </div>

                {/* Status dot */}
                <div
                  title={dot.title}
                  className={[
                    "absolute -right-[3px] -bottom-[3px]",
                    "h-4 w-4 rounded-full",
                    "border-2 border-black/80",
                    "grid place-items-center",
                    "shadow-[0_0_0_1px_rgba(255,255,255,0.10)]",
                    dot.cls,
                  ].join(" ")}
                >
                  {dot.lock ? <span className="text-[10px] leading-none">🔒</span> : null}
                </div>
              </div>

              <div className="leading-tight">
                {/* Use your existing gradient logo class if you have it; otherwise this is fine */}
                <div className="logo-text text-[18px] md:text-[20px] font-black tracking-wide">
                  {serverName}
                </div>
                <div className="text-[11px] text-white/55 -mt-1">
                  discord customization toolkit
                </div>
              </div>
            </Link>

            {/* NAV */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/search">Search</NavLink>
              <NavLink href="/convert">Convert</NavLink>
              <NavLink href="/filter">Filter</NavLink>
              <NavLink href="/pro">Pro</NavLink>
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-2">
              <Link
                href="/search"
                className="px-4 py-2 rounded-xl bg-fuchsia-500/90 hover:bg-fuchsia-400 text-sm font-semibold transition neon-btn"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-white/45">
        <div className="glass rounded-2xl p-4 flex items-center justify-between">
          <div>© {new Date().getFullYear()} {serverName}</div>
          <div className="text-white/35">Neon • Glass • Fast</div>
        </div>
      </footer>
    </div>
  );
}
