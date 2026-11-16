"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isAppRoute } from "@/lib/navigation";

/** Synchronizes entrance motion with the brief first-load brand transition. */
export function usePageReveal(immediateDelay = 0) {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isAppRoute(pathname)) {
      const frame = window.requestAnimationFrame(() => setReady(true));
      return () => window.cancelAnimationFrame(frame);
    }

    let revealTimer: number | undefined;
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      revealTimer = window.setTimeout(() => setReady(true), immediateDelay);
    };
    window.addEventListener("siddiona-hero-reveal", reveal, { once: true });
    const fallbackTimer = window.setTimeout(reveal, 1_450);

    return () => {
      window.removeEventListener("siddiona-hero-reveal", reveal);
      window.clearTimeout(fallbackTimer);
      if (revealTimer !== undefined) window.clearTimeout(revealTimer);
    };
  }, [immediateDelay, pathname]);

  return ready;
}
