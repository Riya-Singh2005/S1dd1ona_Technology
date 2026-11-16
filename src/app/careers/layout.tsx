import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import {
  CareersAccountBarSkeleton,
  CareersAccountSlot,
} from "@/components/careers/careers-account-slot";
import { absoluteUrl } from "@/lib/site";

/**
 * The careers shell.
 *
 * Every careers route opens on the same dark band: it clears the fixed
 * dark-glass navbar, carries the account strip, and gives the section a
 * consistent entrance regardless of which page you arrive on.
 *
 * Reading the session here opts the whole segment into dynamic
 * rendering, which is correct: these pages show live job data and
 * per-user state, so a cached response would be wrong rather than fast.
 */

export const metadata: Metadata = {
  title: {
    default: "Careers",
    template: "%s | Careers | Siddiona Technologies",
  },
  description:
    "Open roles at Siddiona Technologies. We work where people, business thinking and technology meet.",
  openGraph: {
    title: "Careers at Siddiona Technologies",
    description:
      "Open roles at Siddiona Technologies. We work where people, business thinking and technology meet.",
    url: absoluteUrl("/careers"),
    siteName: "Siddiona Technologies",
    locale: "en_IN",
    type: "website",
  },
};

export default function CareersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-1 flex-col bg-[#070B14]">
      <div className="pt-[88px] sm:pt-[100px]">
        <Container size="default">
          <Suspense fallback={<CareersAccountBarSkeleton />}>
            <CareersAccountSlot />
          </Suspense>
        </Container>
      </div>

      {children}
    </div>
  );
}
