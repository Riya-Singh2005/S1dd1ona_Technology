import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailExperience } from "@/components/sections/service-detail-experience";
import { getService, SERVICES } from "@/lib/services-data";
import { absoluteUrl } from "@/lib/site";
import { buildServicePageSchemas, serializeJsonLd } from "@/lib/structured-data";

interface ServiceSlugPageProps { params: Promise<{ slug: string }> }

export const dynamicParams = false;

export function generateStaticParams() { return SERVICES.map(({ slug }) => ({ slug })) }

export async function generateMetadata({ params }: ServiceSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) {
    return {
      title: "Service not found",
      robots: { index: false, follow: true },
    };
  }

  const path = `/services/${service.slug}`;
  return {
    title: service.seoTitle,
    description: service.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      title: `${service.seoTitle} | Siddiona Technologies`,
      description: service.metaDescription,
      url: absoluteUrl(path),
      siteName: "Siddiona Technologies",
      locale: "en_IN",
      type: "website",
    },
  };
}

export default async function ServiceDetailPage({ params }: ServiceSlugPageProps) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const index = SERVICES.findIndex((item) => item.slug === service.slug);
  const previous = SERVICES[(index - 1 + SERVICES.length) % SERVICES.length];
  const next = SERVICES[(index + 1) % SERVICES.length];
  const jsonLd = buildServicePageSchemas({
    kind: "service",
    slug: service.slug,
    title: service.title,
    description: service.metaDescription,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <ServiceDetailExperience service={service} previous={previous} next={next} />
    </>
  );
}
