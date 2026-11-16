import React from "react";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";
import { BorderBeam } from "@/components/ui/border-beam";
import { IsoSeal } from "@/components/ui/iso-seal";
import { ISO_CERTIFICATIONS } from "@/lib/certifications";
import {
  MicrosoftLogo,
  AwsLogo,
  GoogleCloudLogo,
  AdobeLogo,
  VmwareLogo,
} from "@/components/ui/partner-logos";

export interface EcosystemPartner {
  id: string;
  name: string;
  category: string;
  logo: React.ComponentType<{ className?: string }>;
  logoClassName?: string;
  badge?: string;
}

export const ECOSYSTEM_PARTNERS: EcosystemPartner[] = [
  {
    id: "microsoft",
    name: "Microsoft Partner",
    category: "Cloud & Productivity",
    logo: MicrosoftLogo,
    logoClassName: "h-[22px] sm:h-[24px] w-auto max-h-[24px] object-contain",
    badge: "Cloud Solutions",
  },
  {
    id: "aws",
    name: "AWS Consulting",
    category: "Infrastructure & Compute",
    logo: AwsLogo,
    logoClassName: "h-[24px] sm:h-[26px] w-auto max-h-[26px] object-contain",
    badge: "Public Cloud",
  },
  {
    id: "google-cloud",
    name: "Google Cloud",
    category: "Enterprise Workloads",
    logo: GoogleCloudLogo,
    logoClassName: "h-[26px] sm:h-[28px] w-auto max-h-[28px] object-contain",
    badge: "Hybrid Cloud",
  },
  {
    id: "adobe",
    name: "Adobe Partners",
    category: "Creative & Enterprise DX",
    logo: AdobeLogo,
    logoClassName: "h-[24px] sm:h-[26px] w-auto max-h-[26px] object-contain",
    badge: "Digital Media",
  },
  {
    id: "vmware",
    name: "VMware Professional",
    category: "Virtualization & SDDC",
    logo: VmwareLogo,
    logoClassName: "h-[19px] sm:h-[21px] w-auto max-h-[21px] object-contain",
    badge: "Virtualization",
  },
];

interface LogoCloud15Props {
  className?: string;
  duration?: number;
}

/**
 * Adapted 21st.dev Logo Cloud 15 for Siddiona Technologies.
 * Enterprise OEM & Cloud Ecosystem marquee showcasing approved partners:
 * Microsoft Partner, AWS Consulting, Google Cloud, Adobe Partners, VMware Professional.
 */
export function LogoCloud15({ className = "", duration = 36 }: LogoCloud15Props) {
  return (
    <div className={cn("w-full", className)}>
      {/* Outer Card Container with Top Badge (NO overflow-hidden on outer container so badge is never clipped) */}
      <div className="relative bg-white/90 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)] backdrop-blur-xs pt-9 pb-7 sm:pt-10 sm:pb-8">
        {/* Subtle Enterprise BorderBeam constrained to card shape */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <BorderBeam
            duration={16}
            colorFrom="#ea580c"
            colorTo="#16134d"
            className="opacity-70"
          />
        </div>

        {/* Eyebrow Status Pill anchored on top border (100% visible, zero clipping) */}
        <div className="absolute inset-x-0 top-0 flex -translate-y-1/2 items-center justify-center px-4 z-20 pointer-events-none">
          <div className="bg-white border border-slate-200/90 px-4 sm:px-5 py-1.5 rounded-full shadow-xs flex items-center gap-2.5 pointer-events-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EA580C] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EA580C]" />
            </span>
            <span className="font-display text-sm font-bold leading-none tracking-[0.02em] text-slate-800 uppercase sm:text-base">
              Authorized OEM & Cloud Ecosystem
            </span>
          </div>
        </div>

        {/* Marquee Row with Left & Right Gradient Fade Masks (WebKit + standard mask for 100% cross-browser rendering) */}
        <div
          className="relative w-full overflow-hidden z-10"
          style={{
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 4%, black 9%, black 91%, rgba(0,0,0,0.8) 96%, transparent 100%)",
            maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 4%, black 9%, black 91%, rgba(0,0,0,0.8) 96%, transparent 100%)",
          }}
        >
          <Marquee
            duration={duration}
            pauseOnHover
            repeat={4}
            className="[--marquee-gap:1.5rem] sm:[--marquee-gap:2rem] py-1"
          >
            {ECOSYSTEM_PARTNERS.map((partner) => {
              const Logo = partner.logo;
              return (
                <div
                  key={partner.id}
                  className="h-[62px] sm:h-[68px] flex items-center gap-3.5 px-4 sm:px-5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-300 group/item cursor-default shrink-0"
                  aria-label={partner.name}
                  role="group"
                >
                  <div className="flex items-center justify-center h-8 sm:h-9 w-auto shrink-0 transition-transform duration-300 group-hover/item:scale-105">
                    <Logo className={partner.logoClassName || "h-6 sm:h-7 w-auto object-contain"} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs sm:text-[13px] font-bold text-slate-800 tracking-tight group-hover/item:text-[#16134D] transition-colors whitespace-nowrap">
                      {partner.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                      {partner.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </Marquee>
        </div>

        <div className="relative z-10 mx-3 my-5 flex items-center gap-3 sm:mx-5 sm:my-6" aria-hidden="true">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white px-4 py-1.5 shadow-xs sm:px-5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EA580C] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EA580C]" />
            </span>
            <span className="font-display text-sm font-bold uppercase leading-none tracking-[0.02em] text-slate-800 sm:text-base">
              Certifications &amp; compliance
            </span>
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        {/* ISO certifications move in the exact opposite direction to the OEM track. */}
        <div
          className="relative z-10 w-full overflow-hidden"
          style={{
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 4%, black 9%, black 91%, rgba(0,0,0,0.8) 96%, transparent 100%)",
            maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 4%, black 9%, black 91%, rgba(0,0,0,0.8) 96%, transparent 100%)",
          }}
        >
          <Marquee
            reverse={true}
            duration={34}
            pauseOnHover
            repeat={4}
            aria-label="Siddiona ISO certifications"
            className="[--marquee-gap:1.5rem] py-1 sm:[--marquee-gap:2rem]"
          >
            {ISO_CERTIFICATIONS.map((certification) => (
              <div
                key={certification.id}
                className="group/item flex h-[62px] w-[292px] shrink-0 cursor-default items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white px-4 transition-all duration-300 hover:border-slate-300 hover:shadow-xs sm:h-[68px] sm:w-[326px] sm:px-5"
                aria-label={`${certification.standard} — ${certification.title}`}
                role="group"
              >
                <span className="transition-transform duration-300 group-hover/item:scale-105">
                  <IsoSeal />
                </span>
                <span className="min-w-0 text-left">
                  <span className="flex items-baseline gap-2 whitespace-nowrap">
                    <span className="font-mono text-[11px] font-bold tracking-tight text-[#16134D] sm:text-xs">
                      {certification.standard}
                    </span>
                    <span className="font-mono text-[9px] font-semibold tracking-[0.08em] text-[#EA580C]">
                      {certification.acronym}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate font-jakarta text-[11px] font-semibold text-[#334155] sm:text-xs">
                    {certification.title}
                  </span>
                </span>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
}

export default LogoCloud15;
