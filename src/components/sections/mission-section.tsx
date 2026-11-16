import Image from "next/image";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { BackgroundGradientGlow } from "@/components/ui/background-gradient-glow";
import { AboutEditorialReveal } from "@/components/sections/about-editorial-reveal";

export function MissionSection() {
  return (
    <section
      id="mission"
      aria-labelledby="mission-heading"
      className="relative flex min-h-[72svh] scroll-mt-[112px] flex-col justify-center overflow-hidden border-b border-slate-200/80 py-14 sm:scroll-mt-[128px] sm:py-16 lg:py-20"
    >
      <BackgroundGradientGlow variant="pastel" />
      <Container className="relative z-10 w-full">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <AboutEditorialReveal className="lg:col-span-5" delay={0.08}>
            <div className="editorial-media-card relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200">
              <Image
                src="/images/capabilities/it-consultancy.jpg"
                alt="Technology consultants reviewing an enterprise delivery plan"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="editorial-media-image object-cover"
              />
            </div>
          </AboutEditorialReveal>
          <div className="lg:col-span-7">
            <SectionHeading
              id="mission-heading"
              title="Our Mission"
              description="Your growth is our mission. We identify operational bottlenecks and deliver integrated enterprise solutions that make everyday work clearer, more reliable, and easier to scale."
            />
            <AboutEditorialReveal className="mt-6" delay={0.16}>
              <p className="editorial-copy max-w-[680px] border-t border-slate-200/90 pt-6 text-slate-700">
                From strategy through implementation and ongoing support, we focus on
                practical outcomes, accountable delivery, and technology decisions that
                serve the needs of each organization.
              </p>
            </AboutEditorialReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
