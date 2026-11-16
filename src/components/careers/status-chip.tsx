import { cn } from "@/lib/utils";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONE,
  type StatusTone,
} from "@/lib/careers/constants";
import type { ApplicationStatus } from "@/lib/supabase/database.types";

/**
 * Application status chip.
 *
 * No `use client`: this is pure rendering, so it stays on the server and
 * costs the browser nothing.
 *
 * The palette deliberately avoids `#EA580C`. `docs/design-system.md`
 * reserves that orange for primary conversion actions, and a page full
 * of orange chips would drain it of meaning by the time a candidate
 * reaches the one button that matters.
 *
 * Colour is never the only signal. The label is always present, so the
 * state is legible without relying on hue.
 */

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "border-slate-300 bg-slate-100 text-slate-700",
  progress: "border-indigo-200 bg-indigo-50 text-indigo-800",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-800",
  closed: "border-slate-200 bg-white text-slate-500",
};

const DARK_TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "border-white/15 bg-white/[0.07] text-slate-200",
  progress: "border-indigo-400/30 bg-indigo-400/10 text-indigo-200",
  positive: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  closed: "border-white/10 bg-transparent text-slate-400",
};

export interface StatusChipProps {
  status: ApplicationStatus;
  theme?: "light" | "dark";
  className?: string;
}

export function StatusChip({ status, theme = "light", className }: StatusChipProps) {
  const tone = APPLICATION_STATUS_TONE[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-semibold tracking-[0.01em] whitespace-nowrap",
        theme === "dark" ? DARK_TONE_CLASSES[tone] : TONE_CLASSES[tone],
        className
      )}
    >
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}

export default StatusChip;
