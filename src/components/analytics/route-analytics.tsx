"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { shouldLoadSiteAnalytics } from "@/lib/analytics/routes";

const SiteAnalytics = dynamic(() =>
  import("@/components/analytics/site-analytics").then((module) => module.SiteAnalytics)
);

/**
 * Keeps the marketing analytics graph out of every admin route while
 * preserving the existing public-site and Careers behaviour.
 */
export function RouteAnalytics() {
  const pathname = usePathname();
  if (!shouldLoadSiteAnalytics(pathname)) return null;
  return <SiteAnalytics />;
}
