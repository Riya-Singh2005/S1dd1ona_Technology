import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SolutionsHeroShader } from "@/components/ui/solutions-hero-shader";

export function SolutionsPageHero() {
  return (
    <section
      className="relative flex items-end overflow-hidden bg-[#0B0911] pb-12 pt-28 text-white sm:min-h-[780px] sm:pb-20 sm:pt-40 lg:min-h-[100svh] lg:pb-24"
      aria-label="Solutions overview"
    >
      <SolutionsHeroShader />

      <Container className="relative z-10">
        <div className="solutions-hero-copy max-w-[920px]">
          <nav aria-label="Breadcrumb" className="mb-8 sm:mb-10">
            <ol className="flex items-center gap-2 text-sm text-white/72">
              <li>
                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} strokeWidth={1.75} />
              </li>
              <li aria-current="page" className="font-semibold text-white">
                Solutions
              </li>
            </ol>
          </nav>

          <h1 className="font-reference pb-2 text-[clamp(4.5rem,13vw,10.5rem)] font-normal italic leading-[0.86] tracking-[-0.055em] text-white">
            Solutions
          </h1>
          <p className="mt-7 max-w-[650px] font-display text-[clamp(1.05rem,2vw,1.45rem)] font-medium leading-[1.55] tracking-[-0.018em] text-white/82 sm:mt-9">
            Four focused enterprise solutions designed around resilience, infrastructure change, connected learning, and dependable operations.
          </p>
        </div>
      </Container>
    </section>
  );
}
