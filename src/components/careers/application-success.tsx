"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import styles from "./careers.module.css";

/**
 * The confirmation state after an application is submitted.
 *
 * This is the one place in the feature that spends a real motion
 * budget. Submitting an application is rare, it happens once per role,
 * and it carries more weight for the person doing it than anything else
 * on the site. A drawn check earns its 800ms here in a way it would not
 * on a control someone touches fifty times a day.
 *
 * The drawing uses `stroke-dashoffset`, the same technique
 * `globals.css` already uses for the site's capability diagrams.
 */

export interface ApplicationSuccessProps {
  reference: string;
  jobTitle: string;
  submittedAt: string;
  onClose?: () => void;
}

export function ApplicationSuccess({
  reference,
  jobTitle,
  submittedAt,
  onClose,
}: ApplicationSuccessProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="text-center">
      <svg
        viewBox="0 0 64 64"
        className="mx-auto h-16 w-16"
        role="img"
        aria-label="Application submitted"
      >
        <circle
          cx="32"
          cy="32"
          r="27"
          className={cn(styles.successMark, !reduceMotion && styles.successRing)}
        />
        <path
          d="M21 33.5 L28.5 41 L43 25"
          className={cn(styles.successMark, !reduceMotion && styles.successTick)}
        />
      </svg>

      <h3 className="mt-6 font-display text-2xl font-extrabold tracking-[-0.035em] text-slate-900">
        Application received.
      </h3>

      <p className="mx-auto mt-3 max-w-[46ch] text-[15px] leading-[1.65] text-slate-600">
        You have taken the first step toward building what moves businesses forward.
      </p>

      <dl className="mt-7 border-t border-slate-200 text-left">
        <SummaryRow label="Application ID" value={reference} mono />
        <SummaryRow label="Role" value={jobTitle} />
        <SummaryRow label="Submitted" value={submittedAt} />
        <SummaryRow label="Current status" value="Submitted" />
      </dl>

      <p className="mt-6 text-[13.5px] leading-[1.6] text-slate-500">
        A confirmation is on its way to your inbox. You can follow this application from your
        account at any time.
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/careers/applications"
          className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#EA580C] px-6 text-[14.5px] font-bold text-white shadow-[0_10px_26px_rgba(234,88,12,0.22)] transition-[background-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#C2410C] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
        >
          View your applications
        </Link>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-[14.5px] font-bold text-slate-800 transition-[border-color,background-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
          >
            Back to the role
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-200 py-3">
      <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </dt>
      <dd
        className={cn(
          "min-w-0 text-right text-[14px] font-semibold text-slate-900",
          mono && "font-mono tracking-[0.04em]"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export default ApplicationSuccess;
