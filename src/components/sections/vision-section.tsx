import Image from "next/image";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { BackgroundGradientGlow } from "@/components/ui/background-gradient-glow";
import { AboutEditorialReveal } from "@/components/sections/about-editorial-reveal";

export function VisionSection() {
  return (
    <section
      id="vision"
      aria-labelledby="vision-heading"
      className="relative flex min-h-[72svh] scroll-mt-[112px] flex-col justify-center overflow-hidden border-b border-slate-200/80 py-14 sm:scroll-mt-[128px] sm:py-16 lg:py-20"
    >
      <BackgroundGradientGlow variant="pastel" />
      <Container className="relative z-10 w-full">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7 lg:order-1">
            <SectionHeading
              id="vision-heading"
              title="Our Vision"
              description="We help businesses navigate change and streamline operations with adaptable technology foundations designed for an increasingly connected global economy."
              className="[&>p]:!max-w-[680px] [&>p]:!text-lg [&>p]:!font-medium [&>p]:!leading-[1.7] sm:[&>p]:!text-xl"
            />
            <AboutEditorialReveal className="mt-6" delay={0.16}>
              <p className="max-w-[680px] border-t border-slate-200/90 pt-6 text-[17px] font-medium leading-[1.75] text-slate-700 sm:text-lg lg:text-[19px]">
                As Siddiona grows, we aim to build enduring client relationships,
                strengthen our international reach, and create systems that remain useful
                as organizations, markets, and operating models evolve.
              </p>
            </AboutEditorialReveal>
          </div>
          <AboutEditorialReveal className="lg:col-span-5 lg:order-2" delay={0.08}>
            <div className="editorial-media-card relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200">
              <Image
                src="/images/capabilities/cloud-solutions.jpg"
                alt="Connected cloud infrastructure representing adaptable business systems"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="editorial-media-image object-cover"
              />
            </div>
          </AboutEditorialReveal>
        </div>
      </Container>
    </section>
  );
}
