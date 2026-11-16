import type { MetadataRoute } from "next";
import { SERVICES_NAV, SOLUTIONS_NAV } from "@/lib/navigation";
import { listPublishedJobSlugs } from "@/lib/careers/queries";
import { absoluteUrl } from "@/lib/site";

/**
 * Sitemap.
 *
 * Job postings need to be discoverable quickly, and Google Jobs treats
 * the sitemap as a primary signal, so published roles are listed with
 * their real `updated_at` rather than a synthetic timestamp.
 *
 * Only published roles appear. Drafts and closed positions are excluded
 * by the `jobs_public_read_published` policy, so the correct behaviour
 * is enforced by the database rather than by a filter in this file.
 *
 * Private surfaces (admin, auth, candidate account pages) are absent by
 * construction and additionally disallowed in `robots.ts`.
 */

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/services"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/solutions"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/careers"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/privacy-policy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms-of-service"), changeFrequency: "yearly", priority: 0.3 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = SERVICES_NAV.map((service) => ({
    url: absoluteUrl(service.href),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const solutionRoutes: MetadataRoute.Sitemap = SOLUTIONS_NAV.map((solution) => ({
    url: absoluteUrl(solution.href),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // A database hiccup should degrade the sitemap, not fail the route and
  // hand a crawler a 500.
  let jobRoutes: MetadataRoute.Sitemap = [];
  try {
    const jobs = await listPublishedJobSlugs();
    jobRoutes = jobs.map((job) => ({
      url: absoluteUrl(`/careers/${job.slug}`),
      lastModified: new Date(job.updated_at),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    console.error("[sitemap] could not list published jobs", error);
  }

  return [...staticRoutes, ...serviceRoutes, ...solutionRoutes, ...jobRoutes];
}
