"use client";

import React, { useEffect } from "react";
import { Container } from "@/components/ui/container";
import { TextEffect } from "@/components/ui/text-effect";
import { HeroEyebrowSequence } from "@/components/ui/hero-eyebrow-sequence";
import { HeroVideoBackground } from "@/components/sections/hero-video-background";
import { usePageReveal } from "@/lib/use-page-reveal";

const HERO_HEADLINE = ["Technology", "that", "moves", "your", "business", "forward."] as const;

/**
 * Enterprise Editorial Hero Section
 * Uses a rotating video background with authoritative high-contrast
 * typography and progressive text motion.
 */
export function HeroSection() {
  const heroReady = usePageReveal();

  // Ensure homepage starts at top of Hero on initial load/reload
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      if (!window.location.hash || window.location.hash === "#hero" || window.location.hash === "#") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    }
  }, []);

  return (
    <section
      id="hero"
      aria-label="Enterprise Editorial Hero"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden border-b border-slate-800/80 bg-[#0B1020] px-0 pb-14 pt-32 sm:pb-16 sm:pt-36 lg:pb-20 lg:pt-32"
    >
      {/* Layer 1: three-video crossfade with a navy loading fallback */}
      <HeroVideoBackground />

      {/* Layer 2: stable enterprise contrast treatment */}
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/85 via-black/65 to-black/40"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.08)_48%,rgba(0,0,0,0.34)_100%)]"
        aria-hidden="true"
      />

      {/* Layer 3: editorial content */}
      <Container size="default" className="relative z-20 my-auto">
        <div className="mx-auto max-w-[1120px]">
          {/* `data-hero-exit` marks the hero's primary text for the route exit drift.
              The video layers, overlays and navbar are deliberately excluded. */}
          <div data-hero-exit className="flex flex-col items-center text-center">
            <HeroEyebrowSequence
              trigger={heroReady}
              className="mb-6 font-mono text-base font-extrabold uppercase tracking-[0.2em] text-[#EA580C] sm:text-lg lg:text-xl"
            />

            <h1 data-ready={heroReady} className="hero-title mx-auto mb-8 max-w-[1080px] text-balance text-center font-display text-[44px] font-extrabold leading-[0.96] tracking-[-0.04em] text-white sm:text-[58px] md:text-[72px] lg:text-[86px] xl:text-[98px]">
              {HERO_HEADLINE.map((word, index) => (
                <React.Fragment key={word}>
                  <span
                    className={`hero-headline-word ${word === "forward." ? "hero-forward inline-block overflow-visible px-1" : ""}`}
                    style={{ "--hero-word-delay": `${180 + index * 65}ms` } as React.CSSProperties}
                  >
                    {word}
                  </span>
                  {index < HERO_HEADLINE.length - 1 && " "}
                </React.Fragment>
              ))}
            </h1>

            <TextEffect
              as="p"
              per="word"
              separator={<span className="inline-block w-[0.28em]" />}
              trigger={heroReady}
              delay={0.38}
              staggerDuration={0.055}
              duration={0.52}
          className="hero-supporting-copy mx-auto max-w-[780px] text-pretty text-center text-[17px] font-semibold leading-[1.6] text-slate-200 sm:text-[18.5px] lg:text-[20px]"
              itemClassName="hero-copy-word"
            >
              We design, build, and scale secure digital and enterprise solutions that help businesses operate smarter, grow faster, and create lasting impact.
            </TextEffect>
          </div>
        </div>
      </Container>

    </section>
  );
}

export default HeroSection;
