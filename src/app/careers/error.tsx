"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, TriangleAlert } from "lucide-react";
import { Container } from "@/components/ui/container";

/**
 * Error boundary for the careers segment.
 *
 * Scoped here rather than global, so it cannot change how the rest of
 * the marketing site behaves. Careers depends on a database, storage
 * and a mail provider, which is three more things that can be having a
 * bad day than a static page has.
 *
 * `retry()` is the Next.js 16 replacement for `reset()`. It re-runs the
 * failed render on the server, so a transient database blip genuinely
 * recovers instead of re-rendering the same broken client tree.
 *
 * The message deliberately says nothing about what failed. `error.digest`
 * is the server-side correlation id; the exception text stays in the
 * logs, where it belongs.
 */

export default function CareersError({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  retry?: () => void;
}) {
  useEffect(() => {
    console.error("[careers] route error", error.digest ?? "", error.message);
  }, [error]);

  const recover = retry ?? reset;

  return (
    <section className="flex min-h-[58svh] items-center bg-[#070B14] py-20 sm:py-24">
      <Container size="default">
        <div className="mx-auto max-w-[52ch] text-center">
          <span
            className="mx-auto mb-7 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-[#FB923C]"
            aria-hidden="true"
          >
            <TriangleAlert className="h-6 w-6" strokeWidth={1.75} />
          </span>

          <h1 className="text-balance font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.035em] text-white sm:text-[36px]">
            Something went wrong at our end
          </h1>

          <p className="mt-4 text-pretty text-[16.5px] leading-[1.65] text-slate-400">
            This is not something you did. Try again in a moment, and if it keeps happening,
            write to us and we will sort it out.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={recover}
              className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-[#EA580C] px-6 text-[14px] font-bold text-white shadow-[0_12px_32px_rgba(234,88,12,0.25)] transition-[background-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#C2410C] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B14]"
            >
              <RotateCw
                className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:rotate-90"
                aria-hidden="true"
              />
              Try again
            </button>

            <Link
              href="/careers"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-6 text-[14px] font-bold text-white/85 transition-[border-color,background-color,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-white/35 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B14]"
            >
              Back to careers
            </Link>
          </div>

          {error.digest && (
            <p className="mt-8 font-mono text-[11px] tracking-[0.08em] text-white/25">
              Reference {error.digest}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
