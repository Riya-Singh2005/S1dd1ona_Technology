"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Variants } from "framer-motion";
import { Container } from "@/components/ui/container";
import { DarkGradientBg } from "@/components/ui/elegant-dark-pattern";
import { TextEffect } from "@/components/ui/text-effect";

type MatrixNode = {
  id: "people" | "business" | "technology" | "integration";
  code: string;
  label: string;
  description: string;
  // Quadrant placement; the padding nudges each visual outward, away from the core.
  quadrant: string;
};

const MATRIX_NODES: readonly MatrixNode[] = [
  {
    id: "people",
    code: "01",
    label: "People",
    description: "Human Intelligence & Strategy",
    quadrant: "left-0 top-0 pb-6",
  },
  {
    id: "business",
    code: "02",
    label: "Business",
    description: "Process & Value Delivery",
    quadrant: "right-0 top-0 pb-6",
  },
  {
    id: "technology",
    code: "03",
    label: "Technology",
    description: "Cloud & Custom Systems",
    quadrant: "bottom-0 left-0 pt-10",
  },
  {
    id: "integration",
    code: "04",
    label: "Integration",
    description: "System Scalability",
    quadrant: "bottom-0 right-0 pt-10",
  },
] as const;

const HEADLINE =
  "Bringing people, technology, and business thinking together to build practical, dependable enterprise systems.";

// Transparent 3D artwork per matrix node, each on the same 772×421 canvas so all four
// render at an identical scale.
const CORE_VISUALS: Record<MatrixNode["id"], string> = {
  people: "/images/enterprise-core/people-3d.png",
  business: "/images/enterprise-core/business-3d.png",
  technology: "/images/enterprise-core/technology-3d.png",
  integration: "/images/enterprise-core/integration-3d.png",
};

export function CompanyOverviewSection() {
  const [activeNode, setActiveNode] = useState<MatrixNode["id"]>("people");
  const active = MATRIX_NODES.find((node) => node.id === activeNode) ?? MATRIX_NODES[0];

  const wordVariants: { container: Variants; item: Variants } = {
    container: {
      hidden: { opacity: 1 },
      visible: {
        opacity: 1,
        transition: { delayChildren: 0.08, staggerChildren: 0.04 },
      },
    },
    item: {
      hidden: { opacity: 0, transform: "translateY(12px)", filter: "blur(6px)" },
      visible: {
        opacity: 1,
        transform: "translateY(0px)",
        filter: "blur(0px)",
        transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
      },
    },
  };

  return (
    <section id="company-overview" aria-labelledby="company-overview-heading" className="flex flex-col">
      <DarkGradientBg className="flex flex-1 flex-col justify-center border-b border-white/10 min-h-[100svh] py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-20">
          <div className="lg:col-span-7">
            <h2
              id="company-overview-heading"
              className="font-heading text-[34px] font-normal uppercase leading-[0.96] tracking-[-0.025em] text-white sm:text-[38px] md:text-[42px] lg:text-[44px]"
            >
              Who we are
            </h2>

            <TextEffect
              as="p"
              per="word"
              variants={wordVariants}
              delay={0.08}
              staggerDuration={0.04}
              duration={0.5}
              className="company-overview-headline mt-6 block max-w-[820px] font-jakarta text-2xl font-extrabold leading-[1.14] tracking-[-0.035em] text-white sm:text-3xl lg:text-[40px] xl:text-[44px]"
              itemClassName=""
            >
              {HEADLINE}
            </TextEffect>

            <p className="mt-6 max-w-2xl font-sans text-base font-medium leading-relaxed text-slate-300 sm:text-lg">
              Built on the principle of &ldquo;Unique Ideas. More Values.&rdquo;, Siddiona
              Technologies helps forward-thinking organizations turn complex operational
              needs into resilient software, cloud environments, and integrated digital
              infrastructure.
            </p>

            <Link
              href="/about"
              className="group mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#EA580C] px-6 py-3.5 font-sans text-sm font-semibold text-white shadow-[0_12px_28px_rgba(234,88,12,0.24)] transition-[background-color,transform,box-shadow] duration-200 hover:bg-[#C2410C] hover:shadow-[0_16px_34px_rgba(234,88,12,0.3)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-base"
            >
              <span>Explore Our Full Story</span>
              <ArrowRight className="h-4 w-4 text-white transition-transform duration-200 group-hover:translate-x-[3px]" aria-hidden="true" />
            </Link>
          </div>

          <div className="lg:col-span-5">
            <div className="relative mx-auto h-[430px] w-full max-w-[560px] sm:h-[470px]">
              {/* Each quadrant is one control: pointing at its 3D visual activates it, and the
                  core below reads the same activeNode. The artwork carries its own visible
                  label, so the node text is kept for assistive technology only. */}
              {MATRIX_NODES.map((node) => {
                const isActive = node.id === activeNode;
                return (
                  <button
                    key={node.id}
                    type="button"
                    aria-pressed={isActive}
                    onMouseEnter={() => setActiveNode(node.id)}
                    onFocus={() => setActiveNode(node.id)}
                    onClick={() => setActiveNode(node.id)}
                    className={`group absolute z-10 flex h-1/2 w-1/2 items-center justify-center focus-visible:outline-none ${node.quadrant}`}
                  >
                    <span className="sr-only">
                      {node.code} {node.label}: {node.description}
                    </span>
                    <span aria-hidden="true" className="relative aspect-[772/421] w-[min(96%,260px)] shrink-0 select-none rounded-2xl group-focus-visible:ring-2 group-focus-visible:ring-[#EA580C] group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-black">
                      <Image
                        src={CORE_VISUALS[node.id]}
                        alt=""
                        fill
                        draggable={false}
                        sizes="(min-width: 640px) 260px, 170px"
                        className={`object-contain transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:scale-100 ${
                          isActive ? "scale-100 opacity-100" : "scale-[0.97] opacity-70"
                        }`}
                      />
                    </span>
                  </button>
                );
              })}

              <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:h-44 sm:w-44">
                <div className="absolute inset-0 animate-[spin_20s_linear_infinite] rounded-full border border-dashed border-[#EA580C]/70" aria-hidden="true" />
                <div className="absolute inset-3 rounded-full border border-white/10" aria-hidden="true" />
                <div className="relative flex h-[7.5rem] w-[7.5rem] flex-col items-center justify-center rounded-full border border-white/15 bg-[#0F172A] px-4 text-center shadow-[0_16px_35px_rgba(0,0,0,0.45)] sm:h-32 sm:w-32">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-orange-300">
                    Active · {active.code}
                  </span>
                  <strong className="mt-1 font-jakarta text-sm font-extrabold uppercase tracking-[-0.02em] text-white">
                    Enterprise Core
                  </strong>
                  <span aria-live="polite" className="mt-1.5 max-w-[100px] font-sans text-[9px] font-medium leading-tight text-slate-300">
                    {active.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
      </DarkGradientBg>
    </section>
  );
}

export default CompanyOverviewSection;
