"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const EXITING_CLASS = "siddiona-route-exiting";
/** Longer than the CSS exit transition, so a cancelled navigation cannot strand the state. */
const SAFETY_RELEASE_MS = 1200;

/**
 * Hero exit motion for internal route changes.
 *
 * The App Router unmounts the outgoing tree as soon as the new route commits, so there is
 * no exit phase to hook into. Instead this listens for navigation intent — a click on an
 * internal link — and flags `<html>`. A CSS rule then transitions any `[data-hero-exit]`
 * element: the hero's primary text drifts down, fades, and picks up a light blur.
 *
 * Deliberately event-based rather than a Link wrapper or an `AnimatePresence` shell:
 * - navigation is never delayed or blocked; the flag and the route change run in parallel
 * - the navbar, footer, hero media, and page chrome are untouched because they carry no
 *   `data-hero-exit` attribute
 * - no existing Link, header, or footer source file has to change
 * - transform/opacity/filter only, so nothing reflows
 *
 * The flag is cleared when the new pathname commits, and by a safety timer if a click is
 * intercepted downstream and the navigation never happens.
 */
export function RouteExitMotion() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.remove(EXITING_CLASS);
  }, [pathname]);

  useEffect(() => {
    let releaseTimer: number | undefined;

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      let destination: URL;
      try {
        destination = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (destination.origin !== window.location.origin) return;
      // Same-document links (in-page anchors, the active route) must not animate away.
      if (destination.pathname === window.location.pathname) return;

      document.documentElement.classList.add(EXITING_CLASS);

      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => {
        document.documentElement.classList.remove(EXITING_CLASS);
      }, SAFETY_RELEASE_MS);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.clearTimeout(releaseTimer);
      document.documentElement.classList.remove(EXITING_CLASS);
    };
  }, []);

  return null;
}

export default RouteExitMotion;
