/**
 * The single canonical production origin for public URLs and SEO signals.
 *
 * Deployment aliases and preview URLs must never become canonical URLs.
 */
export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://siddiona-demo.workers.dev"
).replace(/\/+$/, "");

export const LINKEDIN_JOB_SOURCE = "linkedin";
export const LINKEDIN_JOB_MEDIUM = "job_posting";

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_ORIGIN).toString();
}

function linkedInAttributionQuery(): string {
  return new URLSearchParams({
    utm_source: LINKEDIN_JOB_SOURCE,
    utm_medium: LINKEDIN_JOB_MEDIUM,
  }).toString();
}

/** Stable URL recruiters paste into LinkedIn's external application field. */
export function linkedInApplicationPath(jobId: string): string {
  return `/careers/jobs/${encodeURIComponent(jobId)}?${linkedInAttributionQuery()}`;
}

export function linkedInApplicationUrl(jobId: string): string {
  return absoluteUrl(linkedInApplicationPath(jobId));
}

/** Current canonical job destination for the stable LinkedIn redirect. */
export function linkedInJobDestinationPath(slug: string): string {
  return `/careers/${encodeURIComponent(slug)}?${linkedInAttributionQuery()}`;
}
