"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const PageLoader = dynamic(() => import("@/components/ui/page-loader").then((module) => module.PageLoader));
const RouteExitMotion = dynamic(() => import("@/components/ui/route-exit-motion").then((module) => module.RouteExitMotion));
const SiteNavbar = dynamic(() => import("@/components/layout/header").then((module) => module.SiteNavbar));
const Footer = dynamic(() => import("@/components/layout/footer").then((module) => module.Footer));

function useHasMarketingChrome() {
  const pathname = usePathname();
  return !pathname.startsWith("/admin");
}

export function RouteTopChrome() {
  const hasMarketingChrome = useHasMarketingChrome();
  if (!hasMarketingChrome) return null;
  return <><PageLoader /><RouteExitMotion /><SiteNavbar /></>;
}

export function RouteBottomChrome() {
  const hasMarketingChrome = useHasMarketingChrome();
  if (!hasMarketingChrome) return null;
  return <Footer />;
}
