import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { WhyJoinSiddiona } from "@/components/careers/why-join-siddiona";
import { CareersHero } from "@/components/careers/careers-hero";
import { JobsIndex } from "@/components/careers/jobs-index";
import { getJobFacets, listPublishedJobs } from "@/lib/careers/queries";

/**
 * The careers landing page.
 *
 * A Server Component: the roles come from Postgres on the server, so a
 * visitor gets fully rendered HTML with no client-side fetch, no
 * loading shimmer, and nothing for a crawler to miss. Interactive leaves
 * own the hero handoff, job filtering, and Why Join editorial selection.
 *
 * Section rhythm follows the banding `service-detail-experience.tsx`
 * already establishes on this site: dark open roles followed by a light
 * working-here chapter.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Careers at Siddiona Technologies | IT Jobs in New Delhi" },
  description:
    "Open roles at Siddiona Technologies in New Delhi. Join teams working across enterprise IT, SAP, cloud, applications and integrated infrastructure.",
  alternates: { canonical: "/careers" },
};

export default async function CareersPage() {
  const jobs = await listPublishedJobs();
  const facets = getJobFacets(jobs);

  return (
    <>
      <CareersHero openRoleCount={jobs.length} />

      {/* ---------------------------------------------------------------
          Open roles
          --------------------------------------------------------------- */}
      <section
        id="open-roles"
        tabIndex={-1}
        aria-labelledby="open-roles-heading"
        className="min-h-dvh scroll-mt-0 border-t border-white/10 bg-[#0B1020] pb-20 pt-10 sm:pb-24 sm:pt-12 lg:pb-28"
      >
        <Container size="default">
          <Reveal>
            <SectionHeading
              id="open-roles-heading"
              title="We Are Hiring"
              theme="dark"
            />
          </Reveal>

          <div className="mt-12 sm:mt-14">
            <JobsIndex jobs={jobs} facets={facets} />
          </div>
        </Container>
      </section>

      <WhyJoinSiddiona />

    </>
  );
}
