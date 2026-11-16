import { Metadata } from "next";
import { ServicesExperience } from "@/components/sections/services-experience";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "IT Services: Managed IT, Cloud, SAP & Consultancy",
  description:
    "IT services from Siddiona Technologies, New Delhi: managed IT, IT consultancy, SAP, enterprise infrastructure, applications, cloud, staffing and licensing.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "IT Services | Siddiona Technologies",
    description:
      "IT services from Siddiona Technologies, New Delhi: managed IT, IT consultancy, SAP, enterprise infrastructure, applications, cloud, staffing and licensing.",
    url: absoluteUrl("/services"),
    siteName: "Siddiona Technologies",
    locale: "en_IN",
    type: "website",
  },
};

export default function ServicesPage() {
  return <ServicesExperience />;
}
