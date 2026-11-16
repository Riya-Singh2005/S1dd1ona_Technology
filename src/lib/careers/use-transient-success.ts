"use client";

import { useEffect, useState } from "react";

/**
 * A "Saved" confirmation that clears itself.
 *
 * Written as derived state rather than `setState` inside an effect.
 * Setting state synchronously in an effect body schedules a second
 * render pass for something already knowable during the first, and the
 * React Compiler flags it for exactly that reason.
 *
 * Here the flag is computed from the action result, and the effect only
 * schedules the dismissal. The `setState` runs inside a timer callback,
 * which is a genuine external event rather than a cascading render.
 *
 * Comparing object identity is what makes this work: `useActionState`
 * returns a new object for every submission, so re-saving the same
 * values shows the confirmation again rather than staying dismissed.
 */
export function useTransientSuccess(
  result: { ok: boolean } | null,
  durationMs = 4000
): boolean {
  const [dismissed, setDismissed] = useState<{ ok: boolean } | null>(null);
  const visible = Boolean(result?.ok) && result !== dismissed;

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setDismissed(result), durationMs);
    return () => window.clearTimeout(timer);
  }, [visible, result, durationMs]);

  return visible;
}
