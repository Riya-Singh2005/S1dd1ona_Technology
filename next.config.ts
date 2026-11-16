import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Disable streaming metadata. On dynamic routes (the careers pages)
  // Next.js otherwise appends <title>, canonical and robots tags to the
  // <body> for Googlebot, and Google ignores a canonical outside <head>.
  htmlLimitedBots: /.*/,
};

export default nextConfig;

// Exposes Cloudflare bindings to `next dev` via getCloudflareContext().
initOpenNextCloudflareForDev();
