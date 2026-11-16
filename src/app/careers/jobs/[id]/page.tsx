import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getPublishedJobById } from "@/lib/careers/queries";
import { linkedInJobDestinationPath } from "@/lib/site";

/**
 * Stable external application link.
 *
 * LinkedIn keeps this immutable job-ID URL while candidates are redirected
 * to the role's current canonical slug. A temporary redirect is deliberate:
 * the slug can change again after a title edit.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Job application link",
  robots: { index: false, follow: false },
};

interface LinkedInJobLinkPageProps {
  params: Promise<{ id: string }>;
}

const jobIdSchema = z.string().uuid();

export default async function LinkedInJobLinkPage({ params }: LinkedInJobLinkPageProps) {
  const candidate = jobIdSchema.safeParse((await params).id);
  if (!candidate.success) notFound();

  const job = await getPublishedJobById(candidate.data);
  if (!job) notFound();

  redirect(linkedInJobDestinationPath(job.slug));
}
