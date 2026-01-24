"use client";

import Shell from "@/components/Shell";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type GuildInfo = {
  ok: boolean;
  id?: string;
  name?: string;
  iconUrl?: string | null;
};

export default function ProPage() {
  const { status } = useSession();

  const [booster, setBooster] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const [guild, setGuild] = useState<GuildInfo | null>(null);

  // glow burst trigger
  const [burst, setBurst] = useState(false);
  const prevBoosterRef = useRef<boolean | null>(null);

  // Fetch guild info (server name + icon)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/discord/guild", { cache: "no-store" });
        const j = (await r.json()) as GuildInfo;
        setGuild(j);
      } catch {
        setGuild({ ok: false });
      }
    })();
  }, []);

  // Check booster status
  useEffect(() => {
    if (status !== "authenticated") {
      setBooster(null);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/me/booster", { cache: "no-store" });
        const j = await r.json();
        setBooster(!!j.booster);
      } catch {
        setBooster(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  // Fire burst when booster becomes true
  useEffect(() => {
    const prev = prevBoosterRef.current;
    if (prev !== true && booster === true) {
      setBurst(true);
      const t = setTimeout(() => setBurst(false), 1300);
      return () => clearTimeout(t);
    }
    prevBoosterRef.current = booster;
  }, [booster]);

  const serverName = guild?.ok ? guild?.name : "Discord Server";

  return (
    <Shell>
      <div className="max-w-2xl mx-auto relative">
        {/* Glow burst overlay */}
        {burst && <div className="glow-burst" />}

        <div className="glass neon-ring rounded-3xl p-8 relative overflow-hidden">
          {/* Server header */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center">
              {guild?.ok && guild.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={guild.iconUrl} alt="Server icon" className="h-full w-full object-cover" />
              ) : (
                <span className="text-white/70 font-black">D</span>
              )}
            </div>

            <div className="leading-tight">
              <div className="text-sm text-white/60">Pro / Boosters</div>
              <h1 className="text-2xl md:text-3xl font-black">{serverName}</h1>
            </div>
          </div>

          <p className="text-white/65 mt-4 leading-relaxed">
            Boost the Discord server to unlock premium tools, full-quality drops, and exclusive features.
          </p>

          {/* STATUS CARD */}
          <div className="mt-6 glass-strong rounded-2xl p-5 relative overflow-hidden">
            {status !== "authenticated" ? (
              <>
                <div className="text-lg font-semibold text-white">Not logged in</div>
                <p className="text-white/60 mt-1">
                  Log in with Discord so we can verify your booster status.
                </p>

                <button
                  onClick={() => signIn("discord")}
                  className="mt-4 px-5 py-3 rounded-2xl bg-fuchsia-500/90 hover:bg-fuchsia-400 font-semibold transition neon-btn"
                  type="button"
                >
                  Login with Discord
                </button>
              </>
            ) : loading ? (
              <>
                <div className="text-lg font-semibold text-white">Checking status…</div>
                <p className="text-white/60 mt-1">Verifying your Discord booster perks.</p>
              </>
            ) : booster ? (
              <>
                <div className="text-lg font-semibold text-emerald-400">✅ Booster unlocked</div>
                <p className="text-white/60 mt-1">
                  You have full access to all tools and full-quality drops.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/search"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition"
                  >
                    Search
                  </Link>
                  <Link
                    href="/convert"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition"
                  >
                    Convert
                  </Link>
                  <Link
                    href="/filter"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition"
                  >
                    Filter
                  </Link>
                </div>

                <button
                  onClick={() => signOut()}
                  className="mt-5 text-sm text-white/50 hover:text-white transition"
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="text-lg font-semibold text-red-400">🔒 Not a booster</div>
                <p className="text-white/60 mt-1">
                  Boost the Discord server to unlock the full toolkit.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/"
                    className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 transition"
                  >
                    Back to Home
                  </Link>

                  <button
                    onClick={() => signOut()}
                    className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition"
                    type="button"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* PERKS */}
          <div className="mt-6 grid gap-3 text-sm text-white/65">
            <div className="glass rounded-xl p-3">✨ Full-quality Discord drops</div>
            <div className="glass rounded-xl p-3">✨ GIF search & trending</div>
            <div className="glass rounded-xl p-3">✨ Video → GIF converter</div>
            <div className="glass rounded-xl p-3">✨ Advanced image filters</div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
