"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/ui/container";

const REASONS = [
  {
    title: "Comprehensive Technology Expertise",
    description:
      "Siddiona unifies strategic IT advisory, cloud infrastructure engineering, custom software development, SAP ERP consulting, and physical building technology through one accountable partner.",
  },
  {
    title: "Industry-Specific Solutions",
    description:
      "We design technology systems around the operational, security, and infrastructure requirements of corporate enterprises, healthcare facilities, manufacturing sites, and commercial real estate.",
  },
  {
    title: "Agile & Scalable Delivery Model",
    description:
      "From turnkey project execution to dedicated engineering pods and specialised technical staffing, our delivery model adapts as your requirements evolve.",
  },
  {
    title: "Innovation & Future-Ready Approach",
    description:
      "We build resilient, modular foundations using cloud-native architectures, enterprise security practices, and intelligent building automation designed for long-term durability.",
  },
  {
    title: "Proven Track Record & Client Success",
    description:
      "Our execution discipline supports high-availability cloud transitions, multi-site network rollouts, and dependable ongoing support for mission-critical operations.",
  },
  {
    title: "Long-Term Partnership Approach",
    description:
      "We work beyond individual projects, providing ongoing architectural guidance, technology roadmaps, and dedicated engineering support aligned with your strategic growth.",
  },
] as const;

export function AboutWhySiddionaSection() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.utils.toArray<HTMLElement>(".why-story-item").forEach((item) => {
        gsap.fromTo(
          item,
          {
            opacity: 0,
            transform: "translate3d(-50px, 0, 0) scale(0.9)",
          },
          {
            opacity: 1,
            transform: "translate3d(0, 0, 0) scale(1)",
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              end: "top 50%",
              scrub: 1,
            },
          },
        );
      });
    }, root);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="why-siddiona"
      aria-labelledby="why-siddiona-heading"
      className="relative border-b border-slate-200/70 bg-white py-14 sm:py-16 lg:py-20"
    >
      <Container size="wide">
        <div className="flex flex-col items-start gap-10 md:flex-row md:gap-12">
          <div className="w-full md:sticky md:top-24 md:flex md:h-[calc(100vh-12rem)] md:w-1/3 md:flex-col md:justify-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#EA580C]">
              Our advantage
            </p>
            <h2
              id="why-siddiona-heading"
              className="text-balance font-heading text-[34px] font-normal uppercase leading-[0.96] tracking-[-0.025em] text-[#16134D] sm:text-[38px] md:text-[42px] lg:text-[44px]"
            >
              Why Siddiona
            </h2>
            <div
              className="mt-6 h-1.5 w-16 rounded-full bg-gradient-to-r from-[#EA580C] to-[#16134D]"
              aria-hidden="true"
            />
          </div>

          <div className="w-full space-y-8 pb-2 md:w-2/3 md:space-y-9 md:pb-6 md:pt-[5vh]">
            {REASONS.map((reason) => (
              <article
                key={reason.title}
                className="why-story-item origin-left will-change-[transform,opacity]"
              >
                <p className="max-w-[850px] text-left text-xl font-medium leading-[1.7] text-slate-800">
                  <strong className="font-extrabold text-[#EA580C]">
                    {reason.title}.
                  </strong>{" "}
                  {reason.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
