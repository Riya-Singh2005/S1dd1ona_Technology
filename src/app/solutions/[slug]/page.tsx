import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SolutionDetailExperience } from "@/components/sections/solution-detail-experience";
import { absoluteUrl } from "@/lib/site";
import { buildServicePageSchemas, serializeJsonLd } from "@/lib/structured-data";
import { getSolution, SOLUTIONS } from "@/lib/solutions-data";

interface SolutionSlugPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return SOLUTIONS.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: SolutionSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolution(slug);

  if (!solution) {
    return {
      title: "Solution not found",
      robots: { index: false, follow: true },
    };
  }

  const path = `/solutions/${solution.slug}`;
  return {
    title: solution.seoTitle,
    description: solution.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      title: `${solution.seoTitle} | Siddiona Technologies`,
      description: solution.metaDescription,
      url: absoluteUrl(path),
      siteName: "Siddiona Technologies",
      locale: "en_IN",
      type: "website",
    },
  };
}

export default async function SolutionDetailPage({ params }: SolutionSlugPageProps) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) notFound();

  const jsonLd = buildServicePageSchemas({
    kind: "solution",
    slug: solution.slug,
    title: solution.title,
    description: solution.metaDescription,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <SolutionDetailExperience solution={solution} />
    </>
  );
}
