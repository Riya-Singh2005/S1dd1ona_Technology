"use client";

import Image from "next/image";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { BackgroundGradientGlow } from "@/components/ui/background-gradient-glow";

type Leader = {
  id: string;
  name: string;
  title: string;
  domain: string;
  mandate: string;
  imageSrc: string;
  imageAlt: string;
};

const LEADERS: readonly Leader[] = [
  {
    id: "saumya-mohanty",
    name: "Saumya Mohanty",
    title: "Director",
    domain: "Commercial & Strategy",
    mandate: "Commercial strategy and market development",
    imageSrc: "/images/team/saumya-mohanty.jpg",
    imageAlt: "Portrait of Saumya Mohanty",
  },
  {
    id: "mamta-kargeti",
    name: "Mamta Kargeti",
    title: "Director",
    domain: "Operations & Governance",
    mandate: "Operations and corporate governance",
    imageSrc: "/images/team/mamta-kargeti.png",
    imageAlt: "Portrait of Mamta Kargeti",
  },
  {
    id: "dushyant-nagar",
    name: "Dushyant Nagar",
    title: "Director",
    domain: "Legal Advisory & Operations",
    mandate: "Legal advisory and operational oversight",
    imageSrc: "/images/team/dushyant-nagar.png",
    imageAlt: "Portrait of Dushyant Nagar",
  },
] as const;

export function LeadershipSection() {
  const [activeLeader, setActiveLeader] = useState<string | null>(null);

  return (
    <section
      id="leadership"
      aria-labelledby="leadership-heading"
      className="relative scroll-mt-[112px] overflow-hidden border-b border-slate-200/80 py-14 sm:scroll-mt-[128px] sm:py-16 lg:py-20"
    >
      <BackgroundGradientGlow />

      <Container size="default" className="relative z-10">
        <SectionHeading align="center" id="leadership-heading" title="Leadership" />

        <div
          className="mx-auto mt-9 flex max-w-6xl flex-col gap-3 sm:mt-11 md:h-[500px] md:flex-row"
          onMouseLeave={(event) => {
            if (!event.currentTarget.contains(document.activeElement)) {
              setActiveLeader(null);
            }
          }}
        >
          {LEADERS.map((leader) => {
            const isActive = activeLeader === leader.id;

            return (
              <article
                key={leader.id}
                className={`group relative min-h-0 min-w-0 flex-none overflow-hidden rounded-xl border border-[#334155] bg-[#0F172A] transition-[flex-grow,height] duration-500 ease-out motion-reduce:transition-none focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#EA580C] md:h-full ${
                  isActive ? "h-[420px] md:flex-[3.5]" : "h-[168px] md:flex-1"
                }`}
                onMouseEnter={() => setActiveLeader(leader.id)}
                onFocus={() => setActiveLeader(leader.id)}
              >
                <Image
                  src={leader.imageSrc}
                  alt={leader.imageAlt}
                  fill
                  sizes="(max-width: 767px) 100vw, 65vw"
                  className={`object-cover object-top transition-[filter,transform] duration-500 ease-out motion-reduce:transition-none ${
                    isActive
                      ? "scale-100 saturate-100"
                      : activeLeader
                        ? "scale-[1.02] saturate-[.78] md:brightness-[.72]"
                        : "scale-100 saturate-100"
                  }`}
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/70 via-45% to-transparent to-78%"
                />

                <button
                  type="button"
                  aria-expanded={isActive}
                  aria-controls={`${leader.id}-details`}
                  aria-label={`Show ${leader.name}, ${leader.title} – ${leader.domain}`}
                  onClick={() => setActiveLeader(leader.id)}
                  className="absolute inset-0 z-20 cursor-pointer rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#EA580C]"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
                  <h3 className="font-jakarta text-2xl font-bold leading-[1.05] tracking-[-0.035em] text-white sm:text-[28px]">
                    {leader.name}
                  </h3>

                  <div
                    id={`${leader.id}-details`}
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none ${
                      isActive
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0 md:grid-rows-[1fr] md:opacity-100"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p className="mt-2 font-sans text-sm font-bold leading-snug text-[#EA580C] sm:text-base">
                        {leader.title}
                        <span className="block">{leader.domain}</span>
                      </p>
                      <p
                        className={`mt-3 max-w-[34rem] border-l border-[#EA580C] pl-3 font-sans text-sm leading-relaxed text-slate-300 transition-opacity duration-300 motion-reduce:transition-none ${isActive ? "opacity-100 delay-150" : "opacity-0"}`}
                      >
                        {leader.mandate}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
