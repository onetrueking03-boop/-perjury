"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BoosterGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/me/booster");
      if (r.ok) {
        const j = await r.json();
        setState(j.booster ? "allowed" : "denied");
      } else {
        setState("denied");
      }
    })();
  }, []);

  if (state === "loading") {
    return <div className="glass rounded-3xl p-10 text-white/70">Checking access…</div>;
  }

  if (state === "denied") {
    return (
      <div className="glass neon-ring rounded-3xl p-10 text-center">
        <div className="text-2xl font-black">Booster-only</div>
        <div className="mt-2 text-white/65">
          This tool is locked. Boost the server to unlock everything.
        </div>
        <div className="mt-6 flex gap-3 justify-center">
          <Link className="px-5 py-3 rounded-2xl bg-fuchsia-500/90 hover:bg-fuchsia-400 font-semibold transition neon-btn" href="/pro">
            View Booster Perks
          </Link>
          <Link className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition" href="/">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
