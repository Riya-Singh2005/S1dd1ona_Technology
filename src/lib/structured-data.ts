import { absoluteUrl, SITE_ORIGIN } from "@/lib/site";

// Demo address: placeholder values, not a real office.
export const OFFICE_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "123 Demo Business Park",
  addressLocality: "New Delhi",
  addressRegion: "Delhi",
  postalCode: "110001",
  addressCountry: "IN",
} as const;

const ORGANIZATION_ID = absoluteUrl("/#organization");
const WEBSITE_ID = absoluteUrl("/#website");

type ServicePageSchemaInput = {
  kind: "service" | "solution";
  slug: string;
  title: string;
  description: string;
};

export function buildSitewideSchemas(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: "Siddiona Technologies Services Pvt. Ltd.",
        url: SITE_ORIGIN,
        logo: absoluteUrl("/brand/Siddionalogo-transparent.png"),
        email: "sales@example.com",
        telephone: "+91-00000-00000",
        address: OFFICE_ADDRESS,
        foundingDate: "2021",
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_ORIGIN,
        name: "Siddiona Technologies",
        publisher: { "@id": ORGANIZATION_ID },
        inLanguage: "en-IN",
      },
    ],
  };
}

export function buildServicePageSchemas({
  kind,
  slug,
  title,
  description,
}: ServicePageSchemaInput): Record<string, unknown> {
  const parentName = kind === "service" ? "Services" : "Solutions";
  const parentPath = kind === "service" ? "/services" : "/solutions";
  const url = absoluteUrl(`${parentPath}/${slug}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: title,
        description,
        url,
        provider: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: parentName, item: absoluteUrl(parentPath) },
          { "@type": "ListItem", position: 3, name: title, item: url },
        ],
      },
    ],
  };
}

export function serializeJsonLd(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
