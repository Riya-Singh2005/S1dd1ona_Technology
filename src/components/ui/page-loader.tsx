"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isAppRoute } from "@/lib/navigation";

const MIN_DISPLAY_MS = 300;
const MAX_DISPLAY_MS = 1_200;
const EXIT_MS = 220;
const DOTS = [
  { color: "#6D28D9", glow: "rgba(109,40,217,0.6)", delay: "0s" },
  { color: "#8B5CF6", glow: "rgba(139,92,246,0.6)", delay: "0.15s" },
  { color: "#EA580C", glow: "rgba(234,88,12,0.6)", delay: "0.30s" },
  { color: "#FB923C", glow: "rgba(251,146,60,0.6)", delay: "0.45s" },
] as const;

export function KineticDotsUI() {
  return (
    <div className="flex select-none flex-col items-center justify-center px-4">
      <style>{`
        @keyframes kLogoEntrance {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes kDotBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          38% { transform: translateY(-22px) scale(1); }
          78% { transform: translateY(0) scale(1.25, 0.75); }
        }
        @keyframes kShadowPulse {
          0%, 100% { transform: scale(1); opacity: 0.65; }
          38% { transform: scale(0.35); opacity: 0.1; }
          78% { transform: scale(1.35); opacity: 0.75; }
        }
        @keyframes kRipplePulse {
          0%, 72% { transform: scale(0.5); opacity: 0; }
          78% { transform: scale(0.85); opacity: 0.55; }
          100% { transform: scale(2); opacity: 0; }
        }
        .k-logo-anim { animation: kLogoEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .k-dot-anim { animation: kDotBounce 1.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite; }
        .k-shadow-anim { animation: kShadowPulse 1.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite; }
        .k-ripple-anim { animation: kRipplePulse 1.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .k-logo-anim { animation: none; }
          .k-dot-anim, .k-shadow-anim, .k-ripple-anim { animation: none; }
          .k-ripple-anim { display: none; }
        }
      `}</style>

      <div className="k-logo-anim mb-8 flex items-center justify-center sm:mb-10">
        <Image
          src="/brand/Siddionalogo-orange-white.png"
          alt="Siddiona Technologies"
          width={1450}
          height={520}
          className="h-auto w-[230px] object-contain sm:w-[290px] md:w-[340px]"
          priority
          unoptimized
        />
      </div>

      <div className="flex h-12 items-center justify-center gap-4 sm:gap-5" aria-hidden="true">
        {DOTS.map((dot) => (
          <div key={dot.color} className="relative flex h-12 w-3.5 flex-col items-center justify-end pb-1.5">
            <span
              className="k-dot-anim inline-block h-3 w-3 rounded-full"
              style={{
                animationDelay: dot.delay,
                backgroundColor: dot.color,
                boxShadow: `0 0 12px ${dot.glow}`,
              }}
            />
            <span
              className="k-shadow-anim absolute bottom-0.5 h-1.5 w-3.5 rounded-full bg-black/85 blur-[1px]"
              style={{ animationDelay: dot.delay }}
            />
            <span
              className="k-ripple-anim pointer-events-none absolute bottom-0 h-4.5 w-4.5 rounded-full border"
              style={{ animationDelay: dot.delay, borderColor: dot.color }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** A brief first-load brand transition; never a timer-gated splash screen. */
export function PageLoader() {
  const pathname = usePathname();
  const [skip] = useState(() => isAppRoute(pathname));
  const [mounted, setMounted] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (skip) return;

    const startedAt = performance.now();
    let exitTimer: number | undefined;
    let readyTimer: number | undefined;
    let firstFrame = 0;
    let secondFrame = 0;
    let exiting = false;

    document.documentElement.classList.add("siddiona-page-loading");

    const beginExit = () => {
      if (exiting) return;
      exiting = true;
      setIsExiting(true);
      document.documentElement.classList.remove("siddiona-page-loading");
      window.dispatchEvent(new CustomEvent("siddiona-hero-reveal"));
      exitTimer = window.setTimeout(() => setMounted(false), EXIT_MS);
    };

    const releaseWhenMinimumElapsed = () => {
      const remaining = Math.max(0, MIN_DISPLAY_MS - (performance.now() - startedAt));
      readyTimer = window.setTimeout(beginExit, remaining);
    };

    // Two frames ensure the hydrated page has reached the compositor before fading.
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(releaseWhenMinimumElapsed);
    });
    const safetyTimer = window.setTimeout(beginExit, MAX_DISPLAY_MS);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(safetyTimer);
      if (readyTimer !== undefined) window.clearTimeout(readyTimer);
      if (exitTimer !== undefined) window.clearTimeout(exitTimer);
      document.documentElement.classList.remove("siddiona-page-loading");
    };
  }, [skip]);

  if (skip || !mounted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Siddiona Technologies"
      className={`siddiona-page-loader fixed inset-0 z-[99999] flex min-h-[100svh] select-none flex-col items-center justify-center bg-[#0A0C14] transition-opacity ease-out ${
        isExiting ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
      }`}
      style={{ transitionDuration: `${EXIT_MS}ms` }}
    >
      <span className="sr-only">Loading Siddiona Technologies</span>
      <KineticDotsUI />
    </div>
  );
}
