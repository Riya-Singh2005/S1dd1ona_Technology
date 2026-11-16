"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BackgroundShader } from "@/components/ui/background-shader";
import { Container } from "@/components/ui/container";
import { InPageLink } from "@/components/ui/in-page-link";
import { SERVICES } from "@/lib/services-data";
import styles from "./services-experience.module.css";

/* ─── Editorial service list data ─────────────────────────────────────── */
const practices = SERVICES.map((service) => ({
  ...service,
  image: service.storyImage ?? service.image,
  imageAlt: service.storyImageAlt ?? service.imageAlt,
}));

/* ─── Floating card data — capabilities ecosystem ─────────────────────── */
const FLOAT_CARDS = [
  {
    id: "fc-managed",
    label: "Managed Operations",
    src: "/images/capabilities/managed-it.jpg",
    alt: "Engineers in a data centre",
    rotate: "-2deg",
    x: "0%",
    y: "0%",
    z: 1,
  },
  {
    id: "fc-cloud",
    label: "Cloud & Migration",
    src: "/images/capabilities/cloud-solutions.jpg",
    alt: "Cloud infrastructure",
    rotate: "1.5deg",
    x: "0%",
    y: "0%",
    z: 2,
  },
  {
    id: "fc-enterprise",
    label: "Enterprise Systems",
    src: "/images/catalog/enterprise-operations.jpg",
    alt: "Enterprise operations",
    rotate: "-1deg",
    x: "0%",
    y: "0%",
    z: 3,
  },
  {
    id: "fc-application",
    label: "Application Services",
    src: "/images/capabilities/application-services.jpg",
    alt: "Software engineering",
    rotate: "2deg",
    x: "0%",
    y: "0%",
    z: 4,
  },
  {
    id: "fc-sap",
    label: "SAP Consultancy",
    src: "/images/capabilities/sap-consultancy.jpg",
    alt: "SAP consultancy professionals",
    rotate: "-1.5deg",
    x: "0%",
    y: "0%",
    z: 5,
  },
];

/* ─── Delivery principles ──────────────────────────────────────────────── */
const DELIVERY_PRINCIPLES = [
  "Understand the operating context before choosing technology.",
  "Design for implementation, ownership, and long-term change.",
  "Bring the right specialists together around the actual constraint.",
  "Keep decisions clear, governed, and connected to business value.",
];

export function ServicesExperience() {
  /* ── Editorial service list ── */
  const [activeIndex, setActiveIndex] = useState(0);
  const [keyboardSelection, setKeyboardSelection] = useState(false);
  const reduceMotion = useReducedMotion();
  const serviceLinks = useRef<(HTMLAnchorElement | null)[]>([]);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const instant = reduceMotion || keyboardSelection;
  const transition = { duration: instant ? 0 : 0.24, ease: [0.23, 1, 0.32, 1] as const };

  /* ── GSAP ── */
  const heroRef = useRef<HTMLElement>(null);
  const editorialRef = useRef<HTMLElement>(null);
  const floatRef = useRef<HTMLElement>(null);
  const deliveryRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      /* Hero text entrance */
      gsap.fromTo(
        "[data-services-hero-copy]",
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.72,
          stagger: 0.1,
          ease: "power4.out",
          delay: 0.18,
        }
      );

      /* Editorial section heading */
      gsap.fromTo(
        "[data-editorial-heading]",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-editorial-heading]",
            start: "top 88%",
          },
        }
      );

      /* Floating cards stagger entrance */
      gsap.fromTo(
        "[data-float-card]",
        { opacity: 0, y: 40, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-float-section]",
            start: "top 80%",
          },
        }
      );

      /* Delivery section rows */
      gsap.fromTo(
        "[data-delivery-row]",
        { opacity: 0, x: -14 },
        {
          opacity: 1,
          x: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-delivery-section]",
            start: "top 82%",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  /* ── Keyboard nav for service list ── */
  function select(index: number, keyboard = false) {
    setKeyboardSelection(keyboard);
    setActiveIndex(index);
  }

  function navigate(event: KeyboardEvent<HTMLAnchorElement>, index: number) {
    let next: number;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % practices.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + practices.length) % practices.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = practices.length - 1;
    else return;
    event.preventDefault();
    select(next, true);
    serviceLinks.current[next]?.focus({ preventScroll: true });
  }

  return (
    <>
      {/* ─────────────────────────── HERO ─────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[82svh] items-end overflow-hidden bg-[#0B1020] pb-12 pt-28 text-white sm:pb-20 sm:pt-40 lg:min-h-[88svh] lg:pb-24"
        aria-label="Services hero"
      >
        <BackgroundShader overlayClassName="bg-[#061B3B]/10" />
        <Container className="relative z-10">
          <div className="max-w-[1040px]">
            <p
              data-services-hero-copy
              className="mb-6 text-xs font-extrabold uppercase tracking-[0.2em] text-orange-300 sm:text-sm"
            >
              Services
            </p>
            <h1
              data-hero-exit
              data-services-hero-copy
              className="max-w-[980px] font-display text-[36px] font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-[clamp(2.8rem,7.3vw,6rem)]"
            >
              Technology that works the way your business needs to.
            </h1>
            <p
              data-services-hero-copy
              className="mt-6 max-w-[680px] text-base leading-[1.65] text-blue-50 sm:mt-7 sm:text-xl"
            >
              From dependable infrastructure to software, cloud, enterprise systems, and specialist teams — we connect the right disciplines around the work.
            </p>
            <InPageLink
              data-services-hero-copy
              targetId="service-list"
              focusId="service-list-heading"
              className="mt-9 inline-flex min-h-12 items-center gap-2 border-b border-white/60 text-sm font-bold transition-[gap,border-color] duration-200 hover:gap-3 hover:border-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
            >
              Explore services <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </InPageLink>
          </div>
        </Container>
      </section>

      {/* ─────────────────────────── EDITORIAL SERVICE LIST ───────────────── */}
      <section
        ref={editorialRef}
        id="service-list"
        aria-labelledby="service-list-heading"
        className={`relative isolate overflow-hidden bg-[#070B12] py-16 text-white sm:py-20 lg:py-24 ${styles.section}`}
      >
        {/* Subtle ambient glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(216 90% 20% / 0.8), transparent 70%)",
          }}
        />

        <Container size="full" className={`relative z-10 ${styles.container}`} innerClassName={styles.inner}>
          {/* Section header */}
          <div className="mb-10 grid gap-6 sm:mb-14 md:grid-cols-2 md:gap-12">
            <h2
              id="service-list-heading"
              tabIndex={-1}
              data-editorial-heading
              className="font-heading text-[clamp(2.125rem,4vw,2.875rem)] font-normal uppercase leading-[0.96] tracking-[-0.025em] text-white"
            >
              Our services.
            </h2>
            <p
              data-editorial-heading
              className="max-w-[48ch] text-base font-medium leading-[1.65] text-slate-400 sm:text-lg"
            >
              Eight connected practices spanning managed IT, technology strategy, SAP, enterprise platforms, application engineering, cloud, technology staffing, and software licensing.
            </p>
          </div>

          {/* Editorial numbered rows */}
          <LayoutGroup id="services-list">
            <ol className={styles.list} aria-label="Siddiona service practices">
              {practices.map((service, index) => {
                const selected = activeIndex === index;
                const panelId = `service-row-${service.slug}`;
                return (
                  <motion.li
                    key={service.slug}
                    layout={instant ? false : "position"}
                    transition={transition}
                    data-active={selected}
                    className={styles.row}
                    onPointerMove={(event) => {
                      if (
                        event.pointerType !== "mouse" ||
                        !window.matchMedia("(hover: hover) and (pointer: fine)").matches
                      )
                        return;
                      const prev = lastPointer.current;
                      if (prev?.x === event.clientX && prev?.y === event.clientY) return;
                      lastPointer.current = { x: event.clientX, y: event.clientY };
                      if (!selected) select(index);
                    }}
                  >
                    {/* Active row background surface */}
                    <motion.div
                      initial={false}
                      animate={{ opacity: selected ? 1 : 0 }}
                      transition={transition}
                      className={styles.surface}
                      aria-hidden="true"
                    />

                    {/* Left column: sequence + category */}
                    <motion.div
                      layout={instant ? false : "position"}
                      transition={transition}
                      className={styles.metadata}
                    >
                      <span className={styles.sequence}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.category}>{service.label}</span>
                    </motion.div>

                    {/* Middle column: thumbnail (active only) */}
                    {selected && (
                      <motion.div
                        initial={{ opacity: instant ? 1 : 0 }}
                        animate={{ opacity: 1 }}
                        transition={transition}
                        className={styles.image}
                      >
                        <Image
                          src={service.image}
                          alt={service.imageAlt}
                          fill
                          sizes="(min-width: 1200px) 210px, (min-width: 992px) 180px, 150px"
                          loading="eager"
                          className="object-cover"
                        />
                      </motion.div>
                    )}

                    {/* Right column: title + expandable details */}
                    <motion.div
                      id={panelId}
                      layout={instant ? false : "position"}
                      transition={transition}
                      className={styles.content}
                    >
                      <h3>
                        <Link
                          ref={(el) => {
                            serviceLinks.current[index] = el;
                          }}
                          href={`/services/${service.slug}`}
                          aria-label={`Open ${service.title}`}
                          onKeyDown={(e) => navigate(e, index)}
                          className={styles.select}
                        >
                          <span className={styles.title}>{service.title}</span>
                          <span className={styles.indicator} aria-hidden="true">
                            <ArrowUpRight size={20} />
                          </span>
                        </Link>
                      </h3>
                      {selected && (
                        <motion.div
                          initial={{ opacity: instant ? 1 : 0 }}
                          animate={{ opacity: 1 }}
                          transition={transition}
                          className={styles.details}
                        >
                          <p>{service.description}</p>
                          <Link
                            href={`/services/${service.slug}`}
                            className={styles.link}
                          >
                            Explore service{" "}
                            <ArrowUpRight size={14} aria-hidden="true" />
                          </Link>
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.li>
                );
              })}
            </ol>
          </LayoutGroup>

          {/* Accessible live region */}
          <p className="sr-only" role="status">
            Featured service: {practices[activeIndex].title}
          </p>
        </Container>
      </section>

      {/* ─────────────────────────── FLOATING CARD SECTION ────────────────── */}
      <section
        ref={floatRef}
        data-float-section
        className="overflow-hidden bg-[#0F172A] py-20 text-white sm:py-24 lg:py-32"
        aria-labelledby="capabilities-heading"
      >
        <Container size="wide">
          {/* Header */}
          <div className="mb-16 grid gap-8 lg:grid-cols-2 lg:items-end">
            <h2
              id="capabilities-heading"
              className="font-heading text-[clamp(2.125rem,4vw,2.875rem)] font-normal uppercase leading-[0.96] tracking-[-0.025em] text-white"
            >
              Connected delivery capabilities.
            </h2>
            <p className="max-w-[52ch] text-lg leading-[1.7] text-slate-400">
              Each service draws on a shared base of engineering, architecture,
              and operational expertise — ensuring work across disciplines stays
              coherent.
            </p>
          </div>

          {/* Floating card grid */}
          <div
            className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            aria-label="Service capability areas"
          >
            {FLOAT_CARDS.map((card, i) => (
              <div
                key={card.id}
                data-float-card
                className="group relative flex flex-col overflow-hidden rounded-[14px] border border-white/10 bg-[#111827] shadow-[0_24px_56px_rgba(0,0,0,0.4)] transition-[transform,box-shadow] duration-[360ms] [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-2 hover:border-orange-500/30 hover:shadow-[0_32px_72px_rgba(0,0,0,0.5)]"
                style={{
                  transform: `rotate(${card.rotate})`,
                  transitionDelay: `${i * 30}ms`,
                }}
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
                    className="object-cover transition-transform duration-[480ms] [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#111827]/80 via-transparent to-transparent"
                    aria-hidden="true"
                  />
                </div>

                {/* Label */}
                <div className="flex flex-1 items-end p-4">
                  <span className="text-sm font-bold leading-snug text-white">
                    {card.label}
                  </span>
                </div>

                {/* Orange corner accent */}
                <div
                  className="pointer-events-none absolute bottom-0 right-0 h-16 w-16 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden="true"
                  style={{
                    background:
                      "radial-gradient(circle at 100% 100%, rgb(234 88 12 / 0.22), transparent 70%)",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Caption row */}
          <p className="mt-10 text-sm text-slate-500">
            Capabilities span managed operations, cloud, enterprise infrastructure,
            application engineering, and SAP consultancy — all under one delivery model.
          </p>
        </Container>
      </section>

      {/* ─────────────────────────── CONNECTED DELIVERY ───────────────────── */}
      <section
        ref={deliveryRef}
        data-delivery-section
        className="py-20 sm:py-24 lg:py-32"
        aria-labelledby="connected-delivery-title"
        style={{ background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)" }}
      >
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <h2
                id="connected-delivery-title"
                className="font-heading text-[clamp(2.125rem,4vw,2.875rem)] font-normal uppercase leading-[0.96] tracking-[-0.025em] text-[#0F172A]"
              >
                Built for connected delivery.
              </h2>
              <p className="mt-6 max-w-[560px] text-lg leading-[1.7] text-slate-600">
                Technology decisions rarely stay inside one discipline. We bring
                architecture, engineering, operations, and business priorities
                into the same conversation.
              </p>
            </div>

            <div className="border-t border-slate-200 lg:col-span-7">
              {DELIVERY_PRINCIPLES.map((item) => (
                <div
                  key={item}
                  data-delivery-row
                  className="flex min-h-20 items-center gap-4 border-b border-slate-200 py-4 text-base font-semibold leading-snug text-slate-800 sm:text-lg"
                >
                  <span
                    className="block h-1.5 w-1.5 shrink-0 rounded-full bg-[#EA580C]"
                    aria-hidden="true"
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ─────────────────────────── FINAL CTA ────────────────────────────── */}
      <section className="bg-[#0B1020] py-20 text-white sm:py-24 lg:py-28">
        <Container
          size="wide"
          className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end"
        >
          <h2 className="max-w-[820px] font-heading text-[clamp(2.125rem,4vw,2.875rem)] font-normal uppercase leading-[0.96] tracking-[-0.025em]">
            Bring us the technology question that matters now.
          </h2>
          <div className="flex shrink-0 flex-col items-start gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
            <a
              href="mailto:hr@example.com?subject=Technology%20services%20enquiry"
              className="inline-flex min-h-13 items-center gap-2 rounded-full bg-[#EA580C] px-6 text-sm font-bold text-white transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#C2410C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
            >
              HR — hr@example.com <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="mailto:tech@example.com?subject=Technology%20services%20enquiry"
              className="inline-flex min-h-13 items-center gap-2 rounded-full bg-[#EA580C] px-6 text-sm font-bold text-white transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#C2410C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
            >
              Technical — tech@example.com <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
