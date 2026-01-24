"use client";

import { useEffect, useState } from "react";

export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999]">
      <div className="glass-strong neon-ring rounded-2xl px-4 py-3 text-sm">
        {message}
      </div>
    </div>
  );
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);

  function show(message: string, ms = 1400) {
    setMsg(message);
    window.setTimeout(() => setMsg(null), ms);
  }

  return { msg, show };
}
