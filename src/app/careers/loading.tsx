import { Container } from "@/components/ui/container";

/**
 * Route-level fallback for the careers segment.
 *
 * A skeleton rather than a spinner: it reserves the same vertical space
 * the real content occupies, so the swap does not shift the page. The
 * site's performance budget targets a CLS of 0, and an unsized loading
 * state is the easiest way to lose it.
 *
 * `animate-pulse` is the one motion here, and it stops as soon as the
 * content arrives.
 */
export default function CareersLoading() {
  return (
    <div className="bg-[#070B14] pb-24 pt-14" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>

      <Container size="default">
        <div className="animate-pulse motion-reduce:animate-none">
          <div className="h-3 w-40 rounded-full bg-white/10" />
          <div className="mt-8 h-12 w-full max-w-[18ch] rounded-lg bg-white/[0.08] sm:h-16" />
          <div className="mt-4 h-12 w-full max-w-[14ch] rounded-lg bg-white/[0.08] sm:h-16" />
          <div className="mt-8 h-4 w-full max-w-[52ch] rounded-full bg-white/[0.06]" />
          <div className="mt-3 h-4 w-full max-w-[44ch] rounded-full bg-white/[0.06]" />
          <div className="mt-10 h-12 w-48 rounded-full bg-white/[0.08]" />

          <div className="mt-20 border-t border-white/10">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="border-b border-white/10 py-8">
                <div className="h-7 w-full max-w-[26ch] rounded-lg bg-white/[0.07]" />
                <div className="mt-3 h-3.5 w-full max-w-[38ch] rounded-full bg-white/[0.05]" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
