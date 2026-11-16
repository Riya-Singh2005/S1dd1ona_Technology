import type { Metadata } from "next";
import { LegalDocument } from "@/components/sections/legal-document";
import { TERMS_OF_SERVICE } from "@/lib/legal-content";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms on which Siddiona Technologies makes siddiona.com, its careers portal and Google account sign-in available to visitors, enquirers and job applicants.",
  alternates: {
    canonical: "/terms-of-service",
  },
  openGraph: {
    title: "Terms of Service | Siddiona Technologies",
    description:
      "The terms governing use of siddiona.com, the careers portal, account sign-in, and job applications.",
    url: absoluteUrl("/terms-of-service"),
    type: "article",
  },
};

export default function TermsOfServicePage() {
  return (
    <LegalDocument
      content={TERMS_OF_SERVICE}
      related={{ title: "Privacy Policy", href: "/privacy-policy" }}
    />
  );
}
