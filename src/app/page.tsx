import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/hero-section";
import { CompanyOverviewSection } from "@/components/sections/company-overview-section";
import { AuthorizedEcosystemSection } from "@/components/sections/authorized-ecosystem-section";
import { HomeCapabilitiesSection } from "@/components/sections/home-capabilities-section";
import { LeadershipSection } from "@/components/sections/leadership-section";

// The homepage canonical lives here rather than in the root layout, where
// it would be inherited by every route that forgets to set its own.
export const metadata: Metadata = {
  title: { absolute: "Siddiona Technologies | Enterprise IT Services in New Delhi" },
  description:
    "Siddiona Technologies is a New Delhi IT services company offering managed IT, IT consultancy, SAP, cloud, application and enterprise solutions across India.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <HeroSection />
      <CompanyOverviewSection />
      <AuthorizedEcosystemSection />
      <HomeCapabilitiesSection />
      <LeadershipSection />
    </div>
  );
}
