"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/ui/container";
import { InPageLink } from "@/components/ui/in-page-link";
import { ServiceSectionGlow } from "@/components/ui/service-section-glow";
import { getCatalogNavItems } from "@/lib/navigation";
import { SERVICES, type ServiceExperienceItem, type ServiceHeroMetric } from "@/lib/services-data";

const ease = [0.23, 1, 0.32, 1] as const;

interface ServiceDetailExperienceProps {
  service: ServiceExperienceItem;
  previous: ServiceExperienceItem;
  next: ServiceExperienceItem;
}

function RotatingHeroMetric({
  metrics,
}: {
  metrics: readonly ServiceHeroMetric[];
}) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || metrics.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % metrics.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [metrics.length, reduceMotion]);

  if (!metrics || metrics.length === 0) return null;
  const current = metrics[index] ?? metrics[0];

  const longest = metrics.reduce(
    (acc, m) =>
      `${m.label}: ${m.value}`.length > `${acc.label}: ${acc.value}`.length
        ? m
        : acc,
    metrics[0]
  );

  return (
    <div
      className="relative inline-flex min-h-[40px] items-center rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 backdrop-blur-md select-none overflow-hidden"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Invisible footprint of the longest string to keep container dimensions perfectly stable */}
      <div
        className="invisible pointer-events-none flex items-center text-xs whitespace-nowrap"
        aria-hidden="true"
      >
        <span className="font-medium">{longest.label}:&nbsp;</span>
        <span className="font-semibold">{longest.value}</span>
      </div>

      {/* Smoothly transitioning active metric */}
      <div className="absolute inset-0 flex items-center px-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${current.label}-${index}`}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -5 }}
            transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
            className="flex items-center text-xs whitespace-nowrap"
          >
            <span className="font-medium text-slate-400">
              {current.label}:&nbsp;
            </span>
            <span className="font-semibold text-white">
              {current.value}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ServiceDetailExperience({
  service,
  previous,
  next,
}: ServiceDetailExperienceProps) {
  const [activeCapability, setActiveCapability] = useState(0);
  const reduceMotion = useReducedMotion();
  const articleRef = useRef<HTMLElement>(null);
  const active = service.capabilities[activeCapability];
  const related = getCatalogNavItems(service.related);

  useLayoutEffect(() => {
    if (
      !articleRef.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      // Hero entrance
      const hero = gsap.timeline({ defaults: { ease: "power4.out" } });
      hero
        .fromTo(
          "[data-service-hero-image]",
          { scale: 1.08 },
          { scale: 1, duration: 1.4 }
        )
        .fromTo(
          "[data-service-title-word]",
          { yPercent: 115, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.75, stagger: 0.05 },
          0.1
        )
        .fromTo(
          "[data-service-hero-copy]",
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, stagger: 0.08 },
          0.35
        )
        .fromTo(
          "[data-hero-metric]",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.07 },
          0.55
        );

      // Story image scrub
      gsap.fromTo(
        "[data-story-image]",
        { scale: 1.06, clipPath: "inset(12% 0 12% 0 round 16px)" },
        {
          scale: 1,
          clipPath: "inset(0% 0 0% 0 round 16px)",
          ease: "none",
          scrollTrigger: {
            trigger: "[data-story-image]",
            start: "top 88%",
            end: "bottom 35%",
            scrub: 0.8,
          },
        }
      );

      // Delivery stage rows entrance
      gsap.fromTo(
        "[data-delivery-stage-row]",
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-delivery-section]",
            start: "top 80%",
          },
        }
      );
    }, articleRef);

    return () => context.revert();
  }, [service.slug]);

  return (
    <article
      ref={articleRef}
      style={{ "--service-accent": service.accent } as React.CSSProperties}
      className="bg-[#070B12] text-white selection:bg-[#EA580C] selection:text-white"
    >
      {/* ─────────────────── 01. SERVICE HERO ─────────────────── */}
      <section
        className="relative min-h-[94svh] overflow-hidden bg-[#070B12] text-white"
        aria-label={`${service.title} Overview`}
      >
        <div
          data-service-hero-image
          className="absolute inset-0 will-change-transform"
        >
          <Image
            src={service.image}
            alt={service.imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-45"
            style={{ objectPosition: service.imagePosition ?? "center 38%" }}
          />
        </div>

        {/* Cinematic dark gradients */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#070B12] via-[#070B12]/85 to-[#070B12]/40"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#070B12] via-transparent to-[#070B12]/60"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 75% 25%, ${service.accent} 0%, transparent 70%)`,
          }}
          aria-hidden="true"
        />

        <Container className="relative z-10 flex min-h-[94svh] flex-col justify-end pb-12 pt-28 sm:pb-20 sm:pt-40 lg:pb-24">
          <div className="max-w-[1020px]">
            {/* Display Title */}
            <h1
              aria-label={service.title}
              data-hero-exit
              className="flex max-w-[980px] flex-wrap gap-x-[0.24em] overflow-hidden font-display text-[36px] font-extrabold leading-[0.96] tracking-[-0.04em] sm:text-[clamp(2.75rem,6.8vw,5.75rem)]"
            >
              {service.title.split(" ").map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className="overflow-hidden pb-[0.08em]"
                >
                  <span
                    data-service-title-word
                    className="inline-block"
                  >
                    {word}
                  </span>
                </span>
              ))}
            </h1>

            {/* Headline & Description */}
            <p
              data-service-hero-copy
              className="mt-5 max-w-[760px] text-lg font-medium leading-[1.5] text-white sm:mt-6 sm:text-2xl"
            >
              {service.headline}
            </p>
            <p
              data-service-hero-copy
              className="mt-4 max-w-[680px] text-base leading-[1.7] text-slate-300 sm:text-lg"
            >
              {service.description}
            </p>
          </div>

          {/* Bottom Row: Single Rotating Info Element on Left, Explore Capabilities on Bottom-Right */}
          <div className="mt-8 flex flex-col items-start gap-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div data-hero-metric>
              <RotatingHeroMetric metrics={service.heroMetrics} />
            </div>

            <div data-service-hero-copy className="sm:ml-auto">
              <InPageLink
                targetId="offerings-section"
                focusId="offerings-heading"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#EA580C] px-6 text-sm font-bold text-white transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#C2410C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
              >
                Explore Capabilities <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </InPageLink>
            </div>
          </div>
        </Container>
      </section>

      {/* ─────────────────── 02. SERVICE INTRODUCTION ─────────────────── */}
      <section
        className="py-20 text-[#0F172A] sm:py-24 lg:py-32"
        style={{ background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)" }}
        aria-labelledby="context-heading"
      >
        <Container size="wide">
          <div className="grid gap-9 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <h2
                id="context-heading"
                className="font-heading text-[clamp(2.125rem,4vw,2.875rem)] font-normal uppercase leading-[0.96] tracking-[-0.025em] text-[#0F172A]"
              >
                The service in context.
              </h2>
            </div>
            <div className="lg:col-span-8 lg:pt-6">
              <p className="max-w-[780px] text-xl leading-[1.72] text-slate-800 sm:text-2xl">
                {service.introduction}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ─────────────────── 03. CORE OFFERINGS ─────────────────── */}
      <section
        id="offerings-section"
        className="relative isolate bg-[#F8F8F6] py-16 text-[#0F172A] sm:py-20 lg:flex lg:min-h-svh lg:items-center lg:py-[clamp(2.5rem,5svh,4.5rem)]"
        aria-labelledby="offerings-heading"
      >
        <ServiceSectionGlow />
        <Container size="wide" className="relative z-10">
          <div className="mb-8 grid gap-4 lg:mb-[clamp(1.5rem,3svh,2.25rem)] lg:grid-cols-2 lg:items-end">
            <div>
              <h2
                id="offerings-heading"
                tabIndex={-1}
                className="font-heading text-[clamp(2.125rem,4vw,2.875rem)] font-normal uppercase leading-[0.96] tracking-[-0.025em] text-[#0F172A]"
              >
                Core offerings.
              </h2>
            </div>
            <p className="max-w-[600px] text-lg leading-[1.7] text-slate-700">
              Select any capability below to examine its scope, dependencies, and integration with wider enterprise operations.
            </p>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-[clamp(2rem,4vw,3.5rem)]">
            {/* Active Offering Preview Card */}
            <div
              data-offering-card
              className="w-full max-w-[30.5rem] justify-self-center overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] lg:justify-self-start"
            >
              <div
                className="relative aspect-[3/2] overflow-hidden bg-slate-100"
                style={{ backgroundColor: active.imageBackground }}
              >
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={active.image}
                    initial={
                      reduceMotion ? false : { opacity: 0, transform: "scale(1.03)" }
                    }
                    animate={{ opacity: 1, transform: "scale(1)" }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: reduceMotion ? 0.16 : 0.26,
                      ease,
                    }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={active.image}
                      alt={active.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className={active.imageFit === "contain" ? "object-contain" : "object-cover"}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div
                className="min-h-[11rem] p-6 sm:min-h-[12rem] sm:p-7 lg:min-h-[14.5rem]"
                aria-live="polite"
                aria-atomic="true"
              >
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={active.title}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: reduceMotion ? 0.16 : 0.28, ease }}
                  >
                    <h3 className="text-2xl font-extrabold leading-tight text-[#0F172A] sm:text-3xl">
                      {active.title}
                    </h3>
                    <p className="mt-3 text-base leading-[1.65] text-slate-700 sm:text-lg">
                      {active.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Interactive Capability List */}
            <div
              className="border-t border-slate-300"
              role="group"
              aria-label={`${service.title} core capabilities`}
            >
              {service.capabilities.map((capability, index) => (
                <button
                  key={capability.title}
                  type="button"
                  aria-pressed={index === activeCapability}
                  onClick={() => setActiveCapability(index)}
                  className={`group grid min-h-[4.5rem] w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-300 px-4 py-3.5 text-left transition-[background-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#EA580C] ${
                    index === activeCapability
                      ? "bg-white/90 text-[#0F172A] shadow-sm"
                      : "text-slate-700 hover:bg-white/60"
                  }`}
                >
                  <span className="font-mono text-xs font-bold tabular-nums text-[#C2410C]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base font-bold leading-snug sm:text-lg">
                    {capability.title}
                  </span>
                  <ArrowRight
                    className={`h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 ${
                      index === activeCapability ? "text-[#C2410C]" : "text-slate-400"
                    }`}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ─────────────────── 04. DEEP-DIVE SERVICE STORY ─────────────────── */}
      <section
        className="overflow-hidden bg-[#0F172A] py-20 text-white sm:py-24 lg:py-32"
        aria-labelledby="story-heading"
      >
        <Container
          size="wide"
          innerClassName="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16"
        >
          <div
            data-story-image
            className="relative aspect-[4/3] w-full min-w-0 overflow-hidden rounded-[20px] border border-white/10 lg:col-span-7"
          >
            <Image
              src={service.storyImage}
              alt={service.storyImageAlt}
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#07101F]/80 via-transparent to-transparent"
              aria-hidden="true"
            />
          </div>
          <div className="lg:col-span-5">
            <h2
              id="story-heading"
              className="font-heading text-[clamp(2.125rem,4vw,2.875rem)] font-normal uppercase leading-[0.96] tracking-[-0.025em] text-white"
            >
              {service.storyTitle}
            </h2>
            <p className="mt-6 text-lg leading-[1.75] text-slate-300">
              {service.story}
            </p>
          </div>
        </Container>
      </section>

      {/* ─────────────────── DELIVERY / HOW WE APPROACH THIS SERVICE ─────────────────── */}
      <section
        data-delivery-section
        className="border-t border-white/10 bg-[#0B1020] py-20 text-white sm:py-24 lg:py-32"
        aria-labelledby="delivery-heading"
      >
        <Container size="wide">
          <div className="mb-14 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-5">
              <h2
                id="delivery-heading"
                className="font-display text-[clamp(2.125rem,4vw,2.875rem)] font-extrabold uppercase leading-[1.04] tracking-[-0.035em] [word-spacing:0.08em] text-white"
              >
                How we deliver.
              </h2>
            </div>
            <p className="text-lg leading-[1.7] text-slate-300 lg:col-span-7">
              {service.deliveryIntro}
            </p>
          </div>

          {/* Grigoletti-inspired Numbered Delivery Rows */}
          <div className="divide-y divide-white/10 border-y border-white/10">
            {service.deliveryStages.map((stage) => (
              <div
                key={stage.step}
                data-delivery-stage-row
                className="group grid items-start gap-4 py-8 transition-colors duration-200 hover:bg-white/[0.02] sm:grid-cols-12 sm:gap-8 sm:py-10"
              >
                <div className="flex items-center gap-3 sm:col-span-2">
                  <span className="font-heading text-3xl font-normal text-[#EA580C] sm:text-4xl">
                    {stage.step}
                  </span>
                  <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {stage.tag}
                  </span>
                </div>

                <div className="sm:col-span-10">
                  <h3 className="font-display text-xl font-extrabold leading-[1.15] tracking-[-0.025em] text-white transition-colors duration-200 group-hover:text-orange-400 sm:text-2xl">
                    {stage.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
                    {stage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─────────────────── WHO IT'S FOR & COMMON QUESTIONS ─────────────────── */}
      <section
        className="bg-white py-20 text-[#0F172A] sm:py-24 lg:py-32"
        aria-labelledby="audience-heading"
      >
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <h2
                id="audience-heading"
                className="font-heading text-[clamp(2.125rem,4vw,2.875rem)] font-normal uppercase leading-[0.96] tracking-[-0.025em] text-[#0F172A]"
              >
                Who it&apos;s for.
              </h2>
              <p className="mt-6 max-w-[580px] text-lg leading-[1.72] text-slate-800">
                {service.audience}
              </p>
            </div>
            <div className="lg:col-span-7">
              <h2
                id="faq-heading"
                className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#C2410C]"
              >
                Common questions
              </h2>
              <dl className="mt-5 border-t border-slate-300">
                {service.faqs.map((faq) => (
                  <div key={faq.question} className="border-b border-slate-300 py-6">
                    <dt className="text-xl font-extrabold leading-snug text-[#0F172A]">
                      {faq.question}
                    </dt>
                    <dd className="mt-3 text-base leading-[1.7] text-slate-700">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      {/* ─────────────────── WHY SIDDIONA FOR THIS SERVICE ─────────────────── */}
      <section
        className="relative isolate bg-[#F4F4F1] py-20 text-[#0F172A] sm:py-24 lg:py-32"
        aria-labelledby="why-heading"
      >
        <ServiceSectionGlow />
        <Container size="wide" className="relative z-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <h2
                id="why-heading"
                className="font-heading text-[clamp(2.125rem,4vw,2.875rem)] font-normal uppercase leading-[0.96] tracking-[-0.025em] text-[#0F172A]"
              >
                Why Siddiona.
              </h2>
              <h3 className="mt-7 text-2xl font-extrabold leading-tight text-[#0F172A] sm:text-3xl">
                {service.whyTitle}
              </h3>
              <p className="mt-5 max-w-[580px] text-lg leading-[1.72] text-slate-800">
                {service.why}
              </p>
            </div>
            <ul className="border-t border-slate-500/35 lg:col-span-7">
              {service.outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="flex min-h-20 items-center gap-4 border-b border-slate-500/35 py-4 text-lg font-semibold text-[#0F172A]"
                >
                  <Check
                    className="h-5 w-5 shrink-0 text-[#C2410C]"
                    aria-hidden="true"
                  />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          {related.length > 0 && (
            <div className="mt-16 sm:mt-20">
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#C2410C]">
                Related services and solutions
              </h2>
              <ul className="mt-5 flex flex-wrap gap-3">
                {related.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors duration-200 hover:border-[#EA580C] hover:text-[#C2410C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
                    >
                      {item.title}
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ─────────────────── SERVICE NAVIGATION ─────────────────── */}
          <nav
            aria-label="Service pages"
            className="mt-16 flex items-center justify-between border-t border-slate-400/30 pt-10 sm:mt-20 sm:pt-12"
          >
            {/* Previous service arrow */}
            <Link
              href={`/services/${previous.slug}`}
              aria-label={`Previous service: ${previous.title}`}
              title={`Previous: ${previous.title}`}
              className="group inline-flex items-center gap-3.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
            >
              <span className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-slate-300/80 bg-white text-slate-800 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-x-1.5 group-hover:border-[#EA580C] group-hover:bg-[#EA580C] group-hover:text-white group-hover:shadow-[0_8px_24px_rgba(234,88,12,0.28)] active:scale-95">
                <ArrowLeft
                  className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 ease-out group-hover:-translate-x-1 motion-reduce:transform-none"
                  aria-hidden="true"
                />
              </span>
              <div className="hidden sm:flex flex-col text-left select-none">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 transition-colors duration-200 group-hover:text-[#EA580C]">
                  Previous [{previous.serviceNumber}]
                </span>
                <span className="text-sm font-bold text-slate-800 transition-colors duration-200 group-hover:text-[#EA580C]">
                  {previous.title}
                </span>
              </div>
            </Link>

            {/* Service sequence indicator */}
            <div className="flex flex-col items-center select-none">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                {service.serviceNumber} / {String(SERVICES.length).padStart(2, "0")}
              </span>
              <span className="hidden md:block text-[11px] font-medium text-slate-500 mt-0.5">
                {service.title}
              </span>
            </div>

            {/* Next service arrow */}
            <Link
              href={`/services/${next.slug}`}
              aria-label={`Next service: ${next.title}`}
              title={`Next: ${next.title}`}
              className="group inline-flex items-center gap-3.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
            >
              <div className="hidden sm:flex flex-col text-right select-none">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 transition-colors duration-200 group-hover:text-[#EA580C]">
                  Next [{next.serviceNumber}]
                </span>
                <span className="text-sm font-bold text-slate-800 transition-colors duration-200 group-hover:text-[#EA580C]">
                  {next.title}
                </span>
              </div>
              <span className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-slate-300/80 bg-white text-slate-800 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1.5 group-hover:border-[#EA580C] group-hover:bg-[#EA580C] group-hover:text-white group-hover:shadow-[0_8px_24px_rgba(234,88,12,0.28)] active:scale-95">
                <ArrowRight
                  className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transform-none"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </nav>
        </Container>
      </section>

    </article>
  );
}
