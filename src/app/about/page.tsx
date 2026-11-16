import type { Metadata } from "next";
import { MissionSection } from "@/components/sections/mission-section";
import { TechnologyShowcase } from "@/components/sections/technology-showcase";
import { VisionSection } from "@/components/sections/vision-section";
import { WhoWeAreSection } from "@/components/sections/who-we-are-section";
import { AboutWhySiddionaSection } from "@/components/sections/about-why-siddiona-section";
import { AboutCertificationsSection } from "@/components/sections/about-certifications-section";
import { absoluteUrl } from "@/lib/site";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: { absolute: "About Siddiona Technologies | IT Services Company, New Delhi" },
  description:
    "Siddiona Technologies is an ISO-certified IT services company established in 2021 in New Delhi. Learn about our mission, vision and practices.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Siddiona Technologies",
    description:
      "Siddiona Technologies is an ISO-certified IT services company established in 2021 in New Delhi. Learn about our mission, vision and practices.",
    url: absoluteUrl("/about"),
    siteName: "Siddiona Technologies",
    locale: "en_IN",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className={`flex flex-1 flex-col ${styles.page}`}>
      <WhoWeAreSection />
      <MissionSection />
      <VisionSection />
      <AboutWhySiddionaSection />
      <TechnologyShowcase />
      <AboutCertificationsSection />
    </div>
  );
}
