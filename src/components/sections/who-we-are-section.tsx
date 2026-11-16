"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePageReveal } from "@/lib/use-page-reveal";
import { InPageLink } from "@/components/ui/in-page-link";

const STORY =
  "Technology should move your business forward, not hold it back. At Siddiona, we bring people, business insight, and engineering discipline together to turn complex challenges into practical progress. Established in 2021 and guided by Unique Ideas. More Values., we connect IT consultancy, managed services, cloud solutions, application development, and enterprise systems around what your business needs next. From simplifying everyday operations to supporting your next stage of growth, we combine technical expertise with an understanding of your industry and priorities. We look beyond implementation: building trust, taking ownership of delivery, and nurturing long-term partnerships. Clear thinking. Connected technology. Lasting value.";

export function WhoWeAreSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  // Hold the headline until the branded loader starts dissolving, matching the homepage hero.
  const heroReady = usePageReveal();

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      const heroTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".about-cinematic",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });

      // Camera pulls BACK across the whole chapter: the frame starts pushed in at 1.16
      // and settles to its true 1.0 scale while drifting down a little. The stage is
      // overfilled by 10vh top and bottom, so even at scale 1 the 4vh drift keeps a 6vh
      // margin and never exposes an edge.
      heroTimeline.fromTo(
        ".about-city-stage",
        { transform: "translate3d(0, -3vh, 0) scale(1.16)" },
        {
          transform: "translate3d(0, 4vh, 0) scale(1)",
          duration: 1,
          ease: "none",
        },
        0,
      );

      // The headline travels downward and dissolves into blur across most of the scrub,
      // rather than snapping out near the end. Fully gone by 88% so the handoff into the
      // story surface is already clean when the sticky scene releases.
      heroTimeline.to(
        ".about-hero-copy",
        {
          opacity: 0,
          filter: "blur(12px)",
          transform: "translate3d(0, 26vh, 0)",
          // Extended from 0.7 to 0.76 so the exit completes at scrub position 0.94
          // (47svh of scroll). The second section enters at 50svh, leaving only a
          // ~3svh gap — both surfaces share #1c1213, making the join seamless.
          duration: 0.76,
          ease: "power1.in",
        },
        0.18,
      );

      heroTimeline.to(
        ".about-hero-meta",
        {
          opacity: 0,
          filter: "blur(6px)",
          transform: "translate3d(0, 6vh, 0)",
          duration: 0.42,
          ease: "power1.in",
        },
        0.3,
      );

      // The veil rises with the headline's exit so the two read as one movement, and
      // resolves fully into the story background before the scene unpins.
      heroTimeline.to(
        ".about-transition-veil",
        { opacity: 1, duration: 0.62, ease: "none" },
        0.32,
      );

      // The story chapter enters in the same language as the hero: a light blur and a
      // short lift, resolving completely crisp. Opacity is left alone here because the
      // scrubbed word illumination below already owns it.
      gsap.fromTo(
        ".about-story-copy",
        { filter: "blur(6px)", transform: "translate3d(0, 20px, 0)" },
        {
          filter: "blur(0px)",
          transform: "translate3d(0, 0, 0)",
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-story-copy",
            // Fire the moment the section enters the viewport so the blur resolves
            // immediately rather than after an 8% scroll-into-view delay.
            start: "top 100%",
            toggleActions: "play none none reverse",
          },
        },
      );

      gsap.fromTo(
        ".about-story-meta > *",
        { opacity: 0, transform: "translate3d(0, 12px, 0)", filter: "blur(4px)" },
        {
          opacity: 1,
          transform: "translate3d(0, 0, 0)",
          filter: "blur(0px)",
          duration: 0.55,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-story-meta",
            // Fire immediately on section entry so the meta labels greet the user
            // the moment the second section scrolls into the viewport.
            start: "top 100%",
            toggleActions: "play none none reverse",
          },
        },
      );

      gsap.fromTo(".about-story-word", { opacity: 0.16 }, {
          opacity: 1,
          stagger: 0.038,
          ease: "none",
          scrollTrigger: { trigger: ".about-story-copy", start: "top 74%", end: "bottom 82%", scrub: 0.8 },
      });

      gsap.fromTo(
        ".about-story-action",
        { opacity: 0, transform: "translate3d(0, 18px, 0)" },
        {
          opacity: 1,
          transform: "translate3d(0, 0, 0)",
          duration: 0.7,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".about-story-action",
            start: "top 94%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, rootRef);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="overflow-clip bg-[#1c1213]">
      <section id="who-we-are" className="about-cinematic relative min-h-[150svh]" aria-labelledby="who-we-are-heading">
        <div className="sticky top-0 isolate min-h-[100svh] overflow-hidden bg-[#7EB6DC]">
          <div className="about-city-stage absolute inset-x-0 -inset-y-[10vh] origin-center will-change-transform">
            <Image src="/images/about/siddiona-workspace-hero.jpg" alt="A quiet enterprise workspace with a monitor, desk and office chair beside a daylit window" fill priority sizes="100vw" className="object-cover object-center" />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0B1020]/62 via-[#0B1020]/46 to-[#11152c]/82" aria-hidden="true" />
          <div className="about-transition-veil pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[58vh] bg-gradient-to-b from-transparent via-[#1c1213]/80 to-[#1c1213] opacity-0 backdrop-blur-[2px] [mask-image:linear-gradient(to_bottom,transparent,black_42%)]" aria-hidden="true" />

          <div className="about-hero-copy relative z-10 flex min-h-[100svh] items-center justify-center px-4 pb-16 pt-28 text-center sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
            <h1 id="who-we-are-heading" data-hero-exit data-ready={heroReady} className="about-hero-title font-display text-[clamp(3rem,8vw,6rem)] font-extrabold leading-[0.94] tracking-[-0.04em] text-white [text-shadow:0_2px_24px_rgba(15,23,42,0.2)]">
              <span className="about-hero-title-line block pb-[0.12em]">Unique Ideas.</span>
              <span className="about-hero-title-line block pb-[0.12em]">More Values.</span>
            </h1>
          </div>

          <div className="about-hero-meta absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 px-5 pb-5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/85 sm:px-8 sm:pb-7 sm:text-[11px] lg:px-12">
            <span>Established 2021</span>
            <span className="text-right">Scroll to unfold our story ↓</span>
          </div>
        </div>
      </section>

      {/* No top border and no forced viewport height: the veil above already resolves
          into this exact surface, so any seam or centred dead band would break the
          continuity the scroll choreography just built. Height follows the content. */}
      <section id="about-siddiona" className="relative isolate flex items-center overflow-hidden bg-[#1c1213] px-5 pb-20 pt-12 text-white sm:px-8 sm:pb-24 sm:pt-16 lg:px-12 lg:pb-28 lg:pt-20" aria-labelledby="foundation-heading">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.28)_1px,transparent_1px)] [background-size:72px_72px]" aria-hidden="true" />
        <div className="mx-auto w-full max-w-[1320px] text-center">
          <div className="about-story-meta flex flex-wrap items-center justify-center gap-x-5 gap-y-3 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-stone-100 sm:gap-x-8 sm:text-xs">
            <span>Established 2021</span><span className="size-1.5 bg-[#EA580C]" aria-hidden="true" />
            <span>New Delhi, India</span><span className="size-1.5 bg-[#EA580C]" aria-hidden="true" />
            <span>Enterprise Technology</span>
          </div>

          <h2 id="foundation-heading" className="mt-10 font-heading text-[34px] font-normal uppercase leading-[0.96] tracking-[-0.025em] text-white sm:mt-14 sm:text-[40px] lg:text-[44px]">About Siddiona</h2>
          <div className="mt-9 grid items-center gap-8 text-left lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900">
            <Image src="/images/about-siddiona-building.jpeg" alt="Glass-fronted contemporary office building at dusk" fill sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" />
          </div>
          <p className="about-story-copy editorial-copy max-w-[680px] font-medium text-left">
            {STORY.split(" ").map((word, index) => (
              <span key={`${word}-${index}`} className="about-story-word text-white">{word}{" "}</span>
            ))}
          </p>
          </div>

          <div className="about-story-action mt-12 sm:mt-16">
            <InPageLink targetId="technology-capabilities" className="inline-flex min-h-14 items-center justify-center bg-[#EA580C] px-8 font-jakarta text-base font-extrabold text-white transition-[background-color,transform] duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] hover:bg-[#C2410C] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#1c1213]">
              Explore our capabilities&nbsp; →
            </InPageLink>
          </div>
        </div>
      </section>
    </div>
  );
}

export default WhoWeAreSection;
