import assert from "node:assert/strict";

const baseUrl = (process.env.SEO_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const productionOrigin = "https://siddiona.com";
const userAgent = "SiddionaSEOValidator/2.0";

// Former WordPress URLs and renamed or retired routes. None redirect; each
// must answer 404 with the custom not-found page, which hides the navbar.
const legacyPaths = [
  "/home",
  "/service",
  "/service/solutions",
  "/career",
  "/career/corporate-sales-professionals",
  "/services/why-siddiona-technologies",
  "/service/managed-it-service",
  "/service/it-consultancy-service",
  "/service/application-service",
  "/service/cloud-solutions",
  "/service/enterprise-solution",
  "/service/sap-consulting-services",
  "/services/outsourcing-augmentation",
  "/services/technical-staffing",
  "/solutions/data-center-virtualization",
  "/solutions/smart-boardroom-av",
  "/solutions/software-licensing-compliance",
  "/solutions/enterprise-networking-sdn",
  "/solutions/physical-security-access",
  "/solutions/facility-safety-power",
  "/solutions/bms-scada-automation",
  "/wp-includes/js/wp-emoji-release.min.js?ver=7.1",
  "/job/backend-developer1",
  "/job/backend-developer3",
  "/?wc-ajax=%25%25endpoint%25%25",
  "/product-tag/watch",
  "/product-tag/watch/feed",
  "/my-account?wishlist_notice=true&add_to_wishlist=%25product_id%25",
  "/product/smartwatch-amazfit/feed",
  "/product/apple-smart-watch",
  "/product/combination-padlock",
  "/product/primium-smartwatch",
  "/product/smart-fingerprint-lock?utm_source=rss&utm_medium=rss&utm_campaign=smart-fingerprint-lock",
  "/2025/01/10/hello-world",
  "/2021/10/05/do-you-really-understand-the-concept-of-product-value",
  "/2021/10/18/protect-your-workplace-fromcyber-attacks",
  "/2021/10/13/the-steps-to-gainingprivileged-access-security",
  "/2021/10/17/mid-market-businesses-dontsmall-about-security",
  "/2021/10/17/mid-market-businesses-dontsmall-about-security/feed",
  "/testimonial/ravi-kumar",
  "/job/frontend2-developer/feed",
] as const;

const catalogPaths = [
  "/services/managed-it-services",
  "/services/it-consultancy-services",
  "/services/sap-consultancy-services",
  "/services/enterprise-solutions",
  "/services/application-services",
  "/services/cloud-solutions",
  "/services/staffing-solutions",
  "/services/software-licensing-compliance",
  "/solutions/backup-disaster-recovery",
  "/solutions/data-center-migration-virtualization",
  "/solutions/smart-classrooms-av-systems",
  "/solutions/annual-maintenance-contract-services",
] as const;

// Legacy URLs from the Search Console export (October 2026). After the
// host (www) and trailing-slash normalisation hops, each must end at 404.
const exportedLegacyUrls = [
  ["https://www.siddiona.com/service/enterprise-solution/", 404],
  ["https://www.siddiona.com/service/managed-it-service/", 404],
  ["https://www.siddiona.com/service/solutions/", 404],
  ["https://www.siddiona.com/home/", 404],
  ["https://www.siddiona.com/product/apple-smart-watch/", 404],
  ["https://www.siddiona.com/product/primium-smartwatch/", 404],
  ["https://www.siddiona.com/product-tag/watch/feed/", 404],
  ["https://www.siddiona.com/job/frontend2-developer/feed/", 404],
  ["https://www.siddiona.com/job/backend-developer3/", 404],
  ["https://www.siddiona.com/2025/01/10/hello-world/", 404],
  ["https://www.siddiona.com/testimonial/ravi-kumar/", 404],
  ["https://www.siddiona.com/product/smart-fingerprint-lock/?utm_source=rss&utm_medium=rss&utm_campaign=smart-fingerprint-lock", 404],
] as const;

const privatePages = [
  "/admin/sign-in",
  "/admin",
  "/careers/join",
  "/careers/profile",
  "/careers/applications",
  "/careers/reset-password",
] as const;

type PageResult = { path: string; html: string; response: Response };

function absolute(path: string): string {
  return new URL(path, `${baseUrl}/`).toString();
}

async function request(path: string, redirect: RequestRedirect = "manual"): Promise<Response> {
  return fetch(absolute(path), { redirect, headers: { "user-agent": userAgent } });
}

function attribute(html: string, element: string, attributeName: string, attributeValue: string, wanted: string): string[] {
  const tags = html.match(new RegExp(`<${element}\\b[^>]*>`, "gi")) ?? [];
  const result: string[] = [];
  for (const tag of tags) {
    const attrs = Object.fromEntries(
      [...tag.matchAll(/([:\w-]+)\s*=\s*["']([^"']*)["']/g)].map((match) => [match[1].toLowerCase(), match[2]])
    );
    if (attrs[attributeName]?.toLowerCase() === attributeValue.toLowerCase() && attrs[wanted]) result.push(attrs[wanted]);
  }
  return result;
}

function headOf(html: string): string {
  const end = html.search(/<body\b/i);
  return end === -1 ? html : html.slice(0, end);
}

function textContent(html: string, tag: string): string {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return (match?.[1] ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function sitemapLocations(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

function schemaTypes(value: unknown, result = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) schemaTypes(item, result);
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (key === "@type" && typeof item === "string") result.add(item);
      schemaTypes(item, result);
    }
  }
  return result;
}

function parseJsonLd(html: string): Set<string> {
  const scripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const types = new Set<string>();
  for (const script of scripts) schemaTypes(JSON.parse(script[1]), types);
  return types;
}

async function validatePublicPage(url: string): Promise<PageResult> {
  const expected = new URL(url);
  const path = `${expected.pathname}${expected.search}`;
  const response = await request(path, "follow");
  const html = await response.text();
  assert.equal(response.status, 200, `${path}: expected HTTP 200`);
  assert.equal(response.url, absolute(path), `${path}: unexpected final URL`);

  // Google only honours a canonical inside <head>, so every check reads
  // the head alone. Streamed metadata would land in <body> and fail here.
  const head = headOf(html);
  const canonicals = attribute(head, "link", "rel", "canonical", "href");
  assert.equal(canonicals.length, 1, `${path}: expected exactly one canonical in <head>`);
  assert.equal(new URL(canonicals[0]).toString(), expected.toString(), `${path}: canonical mismatch`);
  assert.equal(attribute(html, "link", "rel", "canonical", "href").length, 1, `${path}: canonical repeated outside <head>`);

  // No robots meta means index, follow. Any directive present must not block.
  const robots = attribute(html, "meta", "name", "robots", "content").join(",").toLowerCase();
  assert.doesNotMatch(robots, /noindex|nofollow/, `${path}: conflicting robots directive`);
  assert.equal(response.headers.get("x-robots-tag"), null, `${path}: conflicting X-Robots-Tag`);
  assert.ok(textContent(head, "title").length >= 10, `${path}: missing or short <title> in <head>`);
  const description = attribute(head, "meta", "name", "description", "content")[0] ?? "";
  assert.ok(description.length >= 40, `${path}: missing or short description in <head>`);
  assert.ok(description.length <= 170, `${path}: description is ${description.length} characters`);

  const hrefs = new Set([...html.matchAll(/<a\b[^>]*href=["']([^"'#?]+)/gi)].map((match) => match[1]));
  for (const catalogPath of catalogPaths) {
    assert.ok(hrefs.has(catalogPath), `${path}: no crawlable link to ${catalogPath}`);
  }

  for (const script of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    const text = script[1];
    if (!text.includes("JobPosting")) continue;
    for (const match of text.matchAll(/"(minValue|maxValue|value)":\s*(-?[\d.]+)/g)) {
      assert.ok(Number(match[2]) > 0, `${path}: JobPosting ${match[1]} must be a real figure, got ${match[2]}`);
    }
  }
  assert.ok(textContent(html, "h1").length >= 3, `${path}: missing H1 in returned HTML`);

  const types = parseJsonLd(html);
  assert.ok(types.has("Organization"), `${path}: Organization schema missing`);
  assert.ok(types.has("WebSite"), `${path}: WebSite schema missing`);
  if (expected.pathname.startsWith("/services/") || expected.pathname.startsWith("/solutions/")) {
    assert.ok(types.has("Service"), `${path}: Service schema missing`);
    assert.ok(types.has("BreadcrumbList"), `${path}: BreadcrumbList schema missing`);
  }
  if (expected.pathname.split("/").length === 3 && expected.pathname.startsWith("/careers/")) {
    assert.ok(types.has("JobPosting"), `${path}: JobPosting schema missing`);
  }
  return { path, html, response };
}

async function validateLegacy(): Promise<void> {
  for (const path of legacyPaths) {
    const response = await request(path);
    const html = await response.text();
    assert.equal(response.status, 404, `${path}: legacy URL must return 404, got ${response.status}`);
    assert.equal(response.headers.get("location"), null, `${path}: legacy URL must not redirect`);
    const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    assert.match(markup, /<[a-z]+[^>]*\sdata-hide-site-header/i, `${path}: custom 404 page (navbar hidden) not rendered`);
  }
}

async function validatePrivatePages(robots: string): Promise<void> {
  for (const path of privatePages) {
    assert.ok(!robots.includes(`Disallow: ${path}`), `${path}: noindex HTML page must remain crawlable`);
    const response = await request(path, "follow");
    const html = await response.text();
    assert.equal(response.status, 200, `${path}: unauthenticated route must end on a safe 200 page`);
    const directives = attribute(html, "meta", "name", "robots", "content").join(",").toLowerCase();
    assert.match(directives, /noindex/, `${path}: noindex metadata missing`);
    assert.equal(response.headers.get("x-robots-tag"), null, `${path}: unexpected X-Robots-Tag`);
  }
}

async function validateProductionHosts(): Promise<void> {
  if (process.env.SEO_CHECK_PRODUCTION_HOSTS !== "1") return;
  const checks = [
    ["http://siddiona.com/", productionOrigin + "/"],
    ["https://www.siddiona.com/", productionOrigin + "/"],
    ["http://www.siddiona.com/", productionOrigin + "/"],
  ] as const;
  for (const [source, expected] of checks) {
    const response = await fetch(source, { redirect: "follow", headers: { "user-agent": userAgent } });
    assert.equal(response.status, 200, `${source}: canonical host did not reach 200`);
    assert.equal(response.url, expected, `${source}: canonical host mismatch`);
  }
  for (const [source, finalStatus] of exportedLegacyUrls) {
    const response = await fetch(source, { redirect: "follow", headers: { "user-agent": userAgent } });
    assert.equal(response.status, finalStatus, `${source}: expected final ${finalStatus}, got ${response.status}`);
  }
  const www = await fetch("https://www.siddiona.com/", { redirect: "manual", headers: { "user-agent": userAgent } });
  assert.ok([301, 308].includes(www.status), `https://www: redirect must be permanent, got ${www.status}`);
  assert.equal(www.headers.get("location"), `${productionOrigin}/`, "https://www: must redirect directly to canonical origin");
}

async function main(): Promise<void> {
  const [robotsResponse, sitemapResponse] = await Promise.all([
    request("/robots.txt", "follow"),
    request("/sitemap.xml", "follow"),
  ]);
  assert.equal(robotsResponse.status, 200, "robots.txt must return 200");
  assert.equal(sitemapResponse.status, 200, "sitemap.xml must return 200");
  const [robots, sitemap] = await Promise.all([robotsResponse.text(), sitemapResponse.text()]);
  assert.ok(robots.includes(`Sitemap: ${productionOrigin}/sitemap.xml`), "robots.txt sitemap reference mismatch");
  assert.ok(robots.includes("Disallow: /api/"), "robots.txt must exclude API endpoints");
  assert.ok(robots.includes("Disallow: /auth/"), "robots.txt must exclude auth callbacks");
  assert.ok(robots.includes("Disallow: /careers/verify"), "robots.txt must exclude token-bearing verification URLs");
  assert.match(sitemap, /<urlset[^>]+xmlns=["']http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9["']/, "sitemap namespace missing");

  const locations = sitemapLocations(sitemap);
  assert.ok(locations.length > 0, "sitemap contains no URLs");
  assert.equal(new Set(locations).size, locations.length, "sitemap contains duplicate URLs");
  for (const location of locations) {
    const url = new URL(location);
    assert.equal(url.origin, productionOrigin, `${location}: sitemap origin is not canonical`);
    assert.equal(url.search, "", `${location}: sitemap URL must not contain a query`);
    assert.ok(!privatePages.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`)), `${location}: private URL found in sitemap`);
    assert.ok(
      !legacyPaths.some((path) => {
        const legacy = new URL(path, productionOrigin);
        return legacy.pathname !== "/" && legacy.pathname === url.pathname;
      }),
      `${location}: legacy URL found in sitemap`
    );
  }

  const pages = await Promise.all(locations.map(validatePublicPage));
  const titles = pages.map(({ html }) => textContent(html, "title"));
  const descriptions = pages.map(({ html }) => attribute(html, "meta", "name", "description", "content")[0]);
  assert.equal(new Set(titles).size, titles.length, "public page titles must be unique");
  assert.equal(new Set(descriptions).size, descriptions.length, "public page descriptions must be unique");

  await validateLegacy();
  await validatePrivatePages(robots);

  for (const path of ["/not-a-real-page", "/services/not-a-real-service", "/solutions/not-a-real-solution", "/careers/not-a-real-job"]) {
    const response = await request(path, "follow");
    const html = await response.text();
    // Job pages sit under careers/loading.tsx, which commits a 200 before
    // the slug resolves; their 404 is signalled by noindex instead.
    const expected = path.startsWith("/careers/") ? [200, 404] : [404];
    assert.ok(expected.includes(response.status), `${path}: unknown route must return ${expected.join(" or ")}, got ${response.status}`);
    // A 404 must not point a canonical at another page or mix robots signals.
    assert.equal(attribute(html, "link", "rel", "canonical", "href").length, 0, `${path}: 404 page must not carry a canonical`);
    const robots = attribute(html, "meta", "name", "robots", "content");
    assert.equal(robots.length, 1, `${path}: expected one robots tag, got ${robots.join(" | ")}`);
    assert.match(robots[0], /noindex/i, `${path}: 404 page must be noindex`);
  }

  const contact = await request("/api/contact");
  assert.equal(contact.status, 405, "GET /api/contact must remain unavailable");
  await validateProductionHosts();
  console.log(`SEO validation passed for ${locations.length} public pages, ${privatePages.length} private pages, and ${legacyPaths.length} legacy URLs.`);
  if (process.env.SEO_CHECK_PRODUCTION_HOSTS === "1") {
    console.log(`Production host and ${exportedLegacyUrls.length} exported legacy URL checks passed.`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
