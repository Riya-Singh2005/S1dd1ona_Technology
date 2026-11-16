import type { Metadata } from "next";
import { LegalDocument } from "@/components/sections/legal-document";
import { PRIVACY_POLICY } from "@/lib/legal-content";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Siddiona Technologies collects, uses, shares and protects personal data on siddiona.com, our enquiry forms and careers portal, including Google sign-in.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | Siddiona Technologies",
    description:
      "How Siddiona Technologies collects, uses, shares, and protects personal data, including data received through Google sign-in on the careers portal.",
    url: absoluteUrl("/privacy-policy"),
    type: "article",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      content={PRIVACY_POLICY}
      related={{ title: "Terms of Service", href: "/terms-of-service" }}
    />
  );
}
