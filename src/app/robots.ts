import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_ORIGIN } from "@/lib/site";

/**
 * robots.txt
 *
 * Public pages and noindex HTML pages remain crawlable. Crawlers must be
 * able to fetch admin, sign-in, and candidate-account pages in order to
 * discover their page-level noindex directives.
 *
 *   /auth      OAuth and email-verification handlers, which carry
 *              single-use tokens in their query strings and must never
 *              end up in an index
 *   /api       non-document endpoints
 *   /careers/verify
 *              a token-bearing confirmation page
 *
 * These exclusions are a crawler courtesy, not a security control.
 * Private pages remain protected server-side and by Row Level Security.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          // Carries a live one-time token in its URL.
          "/careers/verify",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_ORIGIN,
  };
}
