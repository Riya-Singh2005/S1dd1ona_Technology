"use client";

import React from "react";
import { ArrowDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { InPageLink } from "@/components/ui/in-page-link";
import { TextEffect } from "@/components/ui/text-effect";
import { usePageReveal } from "@/lib/use-page-reveal";
import { CareerOrbitalVisual } from "./career-orbital-visual";

/**
 * Careers hero.
 *
 * Shares the homepage's exact word-reveal mechanism: the `.hero-headline-word` keyframes in
 * `globals.css`, driven by a `--hero-word-delay` custom property, plus
 * the `.hero-forward` shimmer for the final word.
 * No new hero CSS is introduced.
 *
 * The composition is asymmetric rather than centred, which distinguishes
 * it from the homepage without leaving the language.
 *
 * The hero is dark because the site's navbar is a fixed dark-glass pill
 * with white text that overlays page content. A light hero here would
 * make the navigation unreadable.
 *
 * `usePageReveal` holds the entrance until the branded loader hands off,
 * so the animation is seen rather than played behind a full-screen
 * overlay.
 */

const HEADLINE = ["Start", "Your", "Journey.", "Grow", "with", "Siddiona"] as const;

export function CareersHero({ openRoleCount }: { openRoleCount: number }) {
  const ready = usePageReveal();

  return (
    <section
      id="careers-hero"
      aria-labelledby="careers-hero-title"
      className="relative flex items-center overflow-hidden bg-[#070B14] pb-14 pt-20 sm:pb-16"
    >
      {/*
        A single soft wash anchored to the convergence point on the right.
        DESIGN.md rules out persistent glow and floating blobs, so this is
        static, low-contrast, and does the one job of separating the
        diagram from the page edge.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_78%_45%,rgba(234,88,12,0.10)_0%,transparent_62%)]"
      />

      <Container size="default" className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 xl:gap-20">
          {/* `data-hero-exit` opts this text into the site's route exit
              drift, matching every other hero on the site. */}
          <div data-hero-exit>
            <h1
              id="careers-hero-title"
              data-ready={ready}
              className="hero-title max-w-[16ch] text-balance font-display text-[40px] font-extrabold leading-[0.98] tracking-[-0.04em] text-white sm:text-[52px] lg:text-[58px] xl:text-[66px]"
            >
              {HEADLINE.map((word, index) => (
                <React.Fragment key={word}>
                  <span
                    className={`hero-headline-word ${
                      word === "Siddiona" ? "hero-forward inline-block overflow-visible px-1" : ""
                    }`}
                    style={{ "--hero-word-delay": `${180 + index * 65}ms` } as React.CSSProperties}
                  >
                    {word}
                  </span>
                  {index < HEADLINE.length - 1 && " "}
                </React.Fragment>
              ))}
            </h1>

            <TextEffect
              as="p"
              per="word"
              trigger={ready}
              delay={0.42}
              staggerDuration={0.045}
              duration={0.5}
              className="mt-6 max-w-[54ch] text-pretty text-[17px] leading-[1.65] text-slate-300 sm:text-[18.5px]"
            >
              Siddiona sits where people, business thinking and technology meet. The work is
              integration: making all three hold together for organisations that depend on it.
            </TextEffect>

            <div
              className={`mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 ${
                ready ? "hero-enter-4" : "opacity-0"
              }`}
            >
              <InPageLink
                targetId="open-roles"
                className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-[#EA580C] px-6 text-[14px] font-bold text-white shadow-[0_12px_32px_rgba(234,88,12,0.25)] transition-[background-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#C2410C] hover:shadow-[0_16px_38px_rgba(234,88,12,0.3)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B14]"
              >
                Explore open roles
                <ArrowDown
                  className="h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
              </InPageLink>

              <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                {openRoleCount} {openRoleCount === 1 ? "Position" : "Positions"} Open
              </span>
            </div>
          </div>

          {/* Static by default; the visual owns its readiness-gated orbital motion. */}
          <div className={ready ? "hero-enter-3" : ""}>
            <CareerOrbitalVisual ready={ready} />
          </div>
        </div>
      </Container>
    </section>
  );
}

export default CareersHero;
