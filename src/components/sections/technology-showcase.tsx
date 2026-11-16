"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { BackgroundShader } from "@/components/ui/background-shader";
import { Container } from "@/components/ui/container";
import { SERVICES } from "@/lib/services-data";

type ShowcaseMedia = {
  src: string;
  alt: string;
  position: string;
};

const SHOWCASE_MEDIA = {
  "managed-it-services": {
    src: "/images/capabilities/managed-it-resilience-recovery.webp",
    alt: "Engineers managing resilient cloud-connected server infrastructure",
    position: "center",
  },
  "it-consultancy-services": {
    src: "/images/capabilities/consultancy-story.webp",
    alt: "Technology consultants discussing an enterprise systems plan",
    position: "center",
  },
  "sap-consultancy-services": {
    src: "/images/capabilities/sap-consultancy.jpg",
    alt: "Enterprise technology professionals working in a modern operations office",
    position: "center 44%",
  },
  "enterprise-solutions": {
    src: "/images/catalog/enterprise-operations.jpg",
    alt: "Teams working across connected systems in an enterprise operations environment",
    position: "center 62%",
  },
  "application-services": {
    src: "/images/capabilities/application-story.webp",
    alt: "Software developer working across application code on multiple displays",
    position: "center",
  },
  "cloud-solutions": {
    src: "/images/capabilities/cloud-infrastructure-services.webp",
    alt: "Cloud infrastructure connecting digital services across a city",
    position: "center",
  },
  "staffing-solutions": {
    src: "/images/capabilities/technical-staffing.jpg",
    alt: "Technology professionals collaborating around a conference table",
    position: "center 46%",
  },
  "software-licensing-compliance": {
    src: "/images/catalog/telemetry.jpg",
    alt: "Enterprise software inventory and usage information displayed on operational screens",
    position: "center",
  },
} satisfies Record<string, ShowcaseMedia>;

export function TechnologyShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const active = SERVICES[activeIndex];
  const media = SHOWCASE_MEDIA[active.slug as keyof typeof SHOWCASE_MEDIA];

  const select = useCallback((nextIndex: number) => {
    const normalized = (nextIndex + SERVICES.length) % SERVICES.length;
    if (normalized === activeIndex) return;
    setDirection(nextIndex > activeIndex ? 1 : -1);
    setActiveIndex(normalized);
  }, [activeIndex]);

  const previous = () => select(activeIndex - 1);
  const next = () => select(activeIndex + 1);
  const transition = { duration: reduceMotion ? 0.01 : 0.3, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] };
  const imageTransition = { ...transition, duration: reduceMotion ? 0.01 : 0.32 };
  const variants = {
    enter: (travel: number) => ({ opacity: 0, transform: reduceMotion ? "translate3d(0,0,0)" : `translate3d(${travel * 2}%,0,0)` }),
    center: { opacity: 1, transform: "translate3d(0,0,0)" },
    exit: (travel: number) => ({ opacity: 0, transform: reduceMotion ? "translate3d(0,0,0)" : `translate3d(${travel * -2}%,0,0)` }),
  };
  const imageVariants = {
    enter: { opacity: 0, scale: reduceMotion ? 1 : 1.015 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: reduceMotion ? 1 : 0.995 },
  };

  return (
    <section id="technology-capabilities" aria-labelledby="technology-capabilities-heading" tabIndex={0}
      onKeyDown={(event) => { if (event.key === "ArrowLeft") { event.preventDefault(); previous(); } if (event.key === "ArrowRight") { event.preventDefault(); next(); } }}
      className="relative isolate overflow-hidden py-9 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 sm:py-10 lg:flex lg:min-h-[100svh] lg:items-center lg:py-[clamp(1.5rem,3svh,2.5rem)]">
      <BackgroundShader />
      <Container size="full" className="relative z-10 w-full">
        <div className="mb-5 flex items-end justify-between gap-6 sm:mb-6 lg:mb-5">
          <h2 id="technology-capabilities-heading" className="max-w-2xl font-heading text-[34px] font-normal uppercase leading-[0.96] tracking-[-0.025em] sm:text-[40px] lg:text-[42px]">What we do</h2>
          <p className="hidden font-sans text-sm font-semibold tabular-nums text-white/75 sm:block" aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] lg:items-stretch lg:gap-7 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
          <article id="technology-service-panel" className="grid touch-pan-y overflow-hidden rounded-2xl bg-slate-950/82 shadow-[0_24px_60px_rgba(2,6,23,0.28)] sm:grid-cols-[minmax(0,1.15fr)_minmax(230px,0.85fr)] sm:grid-rows-[auto_1fr]"
            onTouchStart={(event) => { touchStartX.current = event.changedTouches[0]?.clientX ?? null; }}
            onTouchEnd={(event) => { const start = touchStartX.current; const end = event.changedTouches[0]?.clientX; touchStartX.current = null; if (start == null || end == null || Math.abs(end - start) < 48) return; if (end < start) next(); else previous(); }}>
            <div className="px-6 pb-5 pt-6 sm:col-start-2 sm:row-start-1 sm:px-0 sm:pb-3 sm:pr-6 sm:pt-7 lg:pr-7">
              <AnimatePresence initial={false} mode="wait" custom={direction}>
                <motion.div key={`${active.slug}-title`} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={transition}>
                  <p className="mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-orange-300">{active.label}</p>
                  <h3 className="max-w-3xl text-balance font-display text-[clamp(1.65rem,2.7vw,2.75rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-white">{active.title}</h3>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative mx-4 aspect-[7/5] overflow-hidden rounded-xl bg-slate-900 sm:col-start-1 sm:row-span-2 sm:row-start-1 sm:m-5 sm:self-center lg:m-6">
              <AnimatePresence initial={false} mode="sync">
                <motion.div key={media.src} variants={imageVariants} initial="enter" animate="center" exit="exit" transition={imageTransition} className="absolute inset-0">
                  <Image src={media.src} alt={media.alt} fill sizes="(min-width: 1440px) 540px, (min-width: 1024px) 34vw, (min-width: 640px) 52vw, calc(100vw - 64px)" className="object-cover" style={{ objectPosition: media.position }} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="px-6 pb-7 pt-5 sm:col-start-2 sm:row-start-2 sm:px-0 sm:pb-7 sm:pr-6 sm:pt-0 lg:pr-7">
              <AnimatePresence initial={false} mode="wait" custom={direction}>
                <motion.div key={`${active.slug}-copy`} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={transition} className="flex h-full flex-col gap-5">
                  <p className="max-w-[42ch] text-pretty font-sans text-[15px] font-medium leading-[1.6] text-white/75">{active.description}</p>
                  <Link href={`/services/${active.slug}`} className="group mt-auto inline-flex min-h-11 items-center gap-2 self-start rounded-full px-5 font-sans text-sm font-extrabold text-white transition-[background-color,color,transform] duration-150 hover:bg-[#EA580C] hover:text-white active:scale-[0.97] focus-visible:bg-[#EA580C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 motion-reduce:transition-none motion-reduce:active:scale-100">View service <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </article>

          <div className="flex flex-col" aria-label="Choose a service">
            <p className="mb-3 font-sans text-xs font-bold uppercase tracking-[0.14em] text-white/75">Services</p>
            <div className="divide-y divide-white/15 border-y border-white/15">
              {SERVICES.map((service, index) => {
                const selected = index === activeIndex;
                return (
                  <button key={service.slug} type="button" onClick={() => select(index)} aria-pressed={selected} aria-controls="technology-service-panel"
                    className="group relative flex min-h-16 w-full items-center gap-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 lg:min-h-14 lg:py-2.5">
                    <motion.span aria-hidden="true" animate={{ opacity: selected ? 1 : 0.35, transform: selected ? "scale(1)" : "scale(0.72)" }} transition={transition} className={`h-2 w-2 shrink-0 rounded-full ${selected ? "bg-orange-500" : "bg-white/55"}`} />
                    <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
                      <span className={`font-display text-[17px] font-extrabold leading-snug tracking-[-0.015em] transition-colors duration-150 sm:text-lg lg:text-[16px] xl:text-[17px] ${selected ? "text-white" : "text-white/60 group-hover:text-white"}`}>{service.title}</span>
                      <span className={`shrink-0 font-sans text-xs tabular-nums transition-colors duration-150 ${selected ? "text-orange-300" : "text-white/40"}`}>{String(index + 1).padStart(2, "0")}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="font-sans text-sm font-medium tabular-nums text-white/75 sm:hidden" aria-live="polite">{activeIndex + 1} / {SERVICES.length}</p>
              <div className="ml-auto flex gap-2">
                <button type="button" onClick={previous} aria-label="Previous service" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-slate-950/25 text-white transition-[background-color,transform] duration-150 hover:bg-white/65 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"><ArrowLeft className="h-5 w-5" aria-hidden="true" /></button>
                <button type="button" onClick={next} aria-label="Next service" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-orange-600 transition-[background-color,transform] duration-150 hover:bg-orange-500 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><ArrowRight className="h-5 w-5" aria-hidden="true" /></button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default TechnologyShowcase;
