"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, TriangleAlert } from "lucide-react";

/**
 * Error boundary for the admin console.
 *
 * Separate from the careers boundary because the audience is different.
 * A recruiter needs the error reference in front of them so they can
 * quote it, and a direct route back to the dashboard. No reassurance
 * copy, no brand voice.
 *
 * `retry()` re-runs the failed server render; `reset()` is the older
 * client-only fallback, kept for the case where a runtime does not
 * supply the newer prop.
 */

export default function AdminError({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  retry?: () => void;
}) {
  useEffect(() => {
    console.error("[admin] route error", error.digest ?? "", error.message);
  }, [error]);

  const recover = retry ?? reset;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px] rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.05)] sm:p-8">
        <span
          className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600"
          aria-hidden="true"
        >
          <TriangleAlert className="h-5 w-5" strokeWidth={2} />
        </span>

        <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900">
          This page could not load
        </h1>

        <p className="mt-2 text-[14.5px] leading-[1.6] text-slate-600">
          The request failed on the server. Retrying usually resolves it. If it does not, the
          reference below identifies this failure in the logs.
        </p>

        {error.digest && (
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[12px] text-slate-700">
            {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={recover}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-[13.5px] font-semibold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-slate-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
          >
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>

          <Link
            href="/admin"
            className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-[13.5px] font-semibold text-slate-800 transition-[border-color,background-color] duration-150 ease-out hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
