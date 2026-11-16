import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { JobApplyRail, JobApplyRailSkeleton } from "@/components/careers/job-apply-rail";
import { JobDetailBody } from "@/components/careers/job-detail-body";
import { getPublishedJob } from "@/lib/careers/queries";
import {
  EMPLOYMENT_TYPE_LABELS,
  WORK_MODE_LABELS,
} from "@/lib/careers/constants";
import {
  formatDate,
  formatPostedAge,
  formatSalaryRange,
  isJobClosed,
} from "@/lib/careers/format";
import { buildJobPostingSchema, serializeJsonLd } from "@/lib/careers/structured-data";
import { absoluteUrl, SITE_ORIGIN } from "@/lib/site";

/**
 * Job detail.
 *
 * `getPublishedJob` filters on `status = 'published'`, and the
 * `jobs_public_read_published` policy enforces the same thing at the
 * database. A draft or unpublished role therefore returns null and
 * lands on `notFound()`, which is indistinguishable from a slug that
 * never existed. That is deliberate: a 403 would confirm the role is
 * real and merely hidden.
 *
 * The segment's own `not-found.tsx` renders careers-specific guidance
 * for a role that is no longer listed.
 */

export const dynamic = "force-dynamic";

interface JobPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublishedJob(slug);

  /**
   * A missing, draft or closed role renders the careers 404.
   *
   * The status stays 200: `careers/loading.tsx` is a Suspense boundary,
   * so the response is committed before this segment resolves. Calling
   * `notFound()` here still gives Google one unambiguous signal, a single
   * Next.js `noindex` tag with no canonical, which Google Jobs accepts
   * for a posting that has been taken down. A real 404 would need the
   * slug checked in `proxy.ts`, ahead of the loading boundary.
   *
   * `getPublishedJob` is request-memoised, so reading the row here and
   * again in the page body costs one query, not two.
   */
  if (!job) notFound();

  const location = job.work_mode
    ? `${job.location}, ${WORK_MODE_LABELS[job.work_mode]}`
    : job.location;

  const description = `${job.short_description} ${location}. ${EMPLOYMENT_TYPE_LABELS[job.employment_type]}.`;

  return {
    title: job.title,
    description,
    alternates: { canonical: `/careers/${job.slug}` },
    openGraph: {
      title: `${job.title} | Careers at Siddiona Technologies`,
      description,
      url: absoluteUrl(`/careers/${job.slug}`),
      siteName: "Siddiona Technologies",
      locale: "en_IN",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${job.title} | Careers at Siddiona Technologies`,
      description,
    },
  };
}

export default async function JobDetailPage({ params }: JobPageProps) {
  const { slug } = await params;
  const job = await getPublishedJob(slug);

  if (!job) notFound();

  const isClosed = isJobClosed(job);

  const salary = formatSalaryRange(job);

  const metaRows: Array<{ label: string; value: string }> = [
    { label: "Department", value: job.department },
    {
      label: "Location",
      value: job.work_mode
        ? `${job.location}, ${WORK_MODE_LABELS[job.work_mode]}`
        : job.location,
    },
    { label: "Employment type", value: EMPLOYMENT_TYPE_LABELS[job.employment_type] },
  ];

  if (job.experience) metaRows.push({ label: "Experience", value: job.experience });
  if (salary) metaRows.push({ label: "Compensation", value: salary });
  if (job.closing_at) {
    metaRows.push({ label: "Applications close", value: formatDate(job.closing_at) });
  }

  const jsonLd = buildJobPostingSchema({ job, origin: SITE_ORIGIN });

  return (
    <>
      {/*
        JSON-LD in a native <script>, not next/script. next/script is
        built for loading and executing JavaScript; this is inert data,
        and the Next.js docs call for a plain tag here.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      {/* -------------------------------------------------------------
          Dark title band
          ------------------------------------------------------------- */}
      <section className="bg-[#070B14] pb-8 pt-8 sm:pb-10 sm:pt-10">
        <Container size="default">
          <Link
            href="/careers#open-roles"
            className="group inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white/50 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B14]"
          >
            <ChevronLeft
              className="h-3.5 w-3.5 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            All open roles
          </Link>

          <div data-hero-exit className="mt-7 max-w-[20ch]">
            <h1 className="text-balance font-display text-[34px] font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:text-[44px] lg:text-[52px]">
              {job.title}
            </h1>
          </div>

          <p className="mt-5 max-w-[62ch] text-pretty text-[16.5px] leading-[1.65] text-slate-300 sm:text-[18px]">
            {job.short_description}
          </p>

          <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-3 text-[13.5px] text-slate-200">
            {metaRows.map((row) => (
              <div key={row.label}>
                <dt className="text-[11px] text-slate-400">{row.label}</dt>
                <dd className="mt-0.5 font-semibold">{row.value}</dd>
              </div>
            ))}
          </dl>

          {job.published_at && (
            <p className="mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
              {formatPostedAge(job.published_at)}
            </p>
          )}
        </Container>
      </section>

      {/* -------------------------------------------------------------
          Editorial body, on the same warm neutral the service detail
          pages use for their light chapters.
          ------------------------------------------------------------- */}
      <section className="bg-[#F7F6F2] py-8 sm:py-10 lg:py-12">
        <Container size="default">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12">
            <Reveal distance={10}>
              <JobDetailBody job={job} />
            </Reveal>

            <Suspense fallback={<JobApplyRailSkeleton metaRows={metaRows} />}>
              <JobApplyRail job={job} isClosed={isClosed} metaRows={metaRows} />
            </Suspense>
          </div>
        </Container>
      </section>

    </>
  );
}
