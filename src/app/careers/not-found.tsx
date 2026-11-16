import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";
import { Container } from "@/components/ui/container";

/**
 * Careers 404.
 *
 * The global `src/app/not-found.tsx` now provides a stable generic 404.
 * A closed or unpublished role benefits from more specific guidance,
 * so this segment keeps its careers-focused message and destination.
 *
 * A segment-level `not-found.tsx` takes precedence for any `notFound()`
 * raised inside `/careers`, so this one wins without touching the
 * global presentation.
 */

export default function CareersNotFound() {
  return (
    <section data-hide-site-header className="flex min-h-[58svh] items-center bg-[#070B14] py-20 sm:py-24">
      <Container size="default">
        <div className="mx-auto max-w-[52ch] text-center">
          <span
            className="mx-auto mb-7 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-[#FB923C]"
            aria-hidden="true"
          >
            <SearchX className="h-6 w-6" strokeWidth={1.75} />
          </span>

          <h1 className="text-balance font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.035em] text-white sm:text-[38px]">
            This role is no longer listed
          </h1>

          <p className="mt-4 text-pretty text-[16.5px] leading-[1.65] text-slate-400">
            It may have been filled, closed, or moved. The roles we are hiring for right now are
            all on the careers page.
          </p>

          <Link
            href="/careers#open-roles"
            className="group mt-9 inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-[#EA580C] px-6 text-[14px] font-bold text-white shadow-[0_12px_32px_rgba(234,88,12,0.25)] transition-[background-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#C2410C] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B14]"
          >
            See open roles
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </Container>
    </section>
  );
}
