import { Metadata } from "next";
import { SolutionsPageHero } from "@/components/sections/solutions-page-hero";
import { SolutionsPortfolioSection } from "@/components/sections/solutions-portfolio-section";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Enterprise IT Solutions: Backup, Data Center, AV & AMC",
  description:
    "Enterprise IT solutions from Siddiona Technologies: backup and disaster recovery, data center migration and virtualization, smart classrooms and AV, and IT AMC.",
  alternates: { canonical: "/solutions" },
  openGraph: {
    title: "Enterprise IT Solutions | Siddiona Technologies",
    description:
      "Enterprise IT solutions from Siddiona Technologies: backup and disaster recovery, data center migration and virtualization, smart classrooms and AV, and IT AMC.",
    url: absoluteUrl("/solutions"),
    siteName: "Siddiona Technologies",
    locale: "en_IN",
    type: "website",
  },
};

export default function SolutionsPage() {
  return (
    <div className="min-h-[100svh] bg-[#FAFBFD]">
      <SolutionsPageHero />

      <SolutionsPortfolioSection />
    </div>
  );
}
