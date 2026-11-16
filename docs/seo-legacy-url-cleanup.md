# Search Console and Legacy URL Cleanup

**Canonical origin:** `https://siddiona.com`  
**Evidence reviewed:** repository routing and metadata, production HTTP responses, and the full Search Console Page indexing export of October 14, 2026.

## Policy

The current application replaced a WordPress/WooCommerce site. Google still reports URLs learned from the former site, hostname variants, trailing-slash variants, and old RSS feeds.

- **Legacy URLs are not redirected.** Former WordPress URLs, and routes this site has since renamed or retired, match no route and return `404` with the custom not-found page. There is no catch-all homepage redirect.
- **The custom 404 page hides the navbar.** `app/not-found.tsx` and the careers not-found pages carry `data-hide-site-header`; a `body:has(...)` rule in `globals.css` hides the header on first paint.
- **`/?wc-ajax=…`** is the one legacy request that would otherwise render a real page (the homepage). `proxy.ts` rewrites it to a path no route matches, so it also gets the 404.
- **Host and slash normalisation still redirect.** `http://` → `https://` and `www.` → apex are handled by Vercel, and Next.js strips trailing slashes. These are URL normalisation, not legacy redirects, and must stay.
- Next.js always sends 404 when it renders the not-found page, even when the proxy asks for 410. Google treats 404 and 410 almost identically for removal, so the site uses 404 throughout.
- Public pages use the single canonical origin and are the only pages in the sitemap.
- Admin, sign-in, and candidate-account HTML pages are crawlable so their `noindex` metadata can be read. They remain protected by server-side guards and Supabase Row Level Security. API, auth-callback, and token-bearing verification paths are disallowed in `robots.txt`.

## Legacy URLs covered by validation

`scripts/validate-seo.ts` (`legacyPaths`) asserts that each of these returns 404, does not redirect, and renders the custom page with the navbar hidden:

- Former WordPress service and page URLs: `/home`, `/service`, `/service/*` (for example `/service/managed-it-service`, `/service/enterprise-solution`).
- Former singular careers routes: `/career`, `/career/*`.
- Renamed or retired routes of this application: `/services/why-siddiona-technologies`, `/services/outsourcing-augmentation`, `/services/technical-staffing`, `/solutions/data-center-virtualization`, `/solutions/smart-boardroom-av`, and the retired solution slugs.
- WooCommerce and WordPress artefacts: `/product/*`, `/product-tag/*`, `/my-account`, `/job/*`, `/testimonial/*`, dated posts (`/2021/10/…`), `/feed` URLs, `/wp-includes/*`, and `/?wc-ajax=…`.

Running the script with `SEO_CHECK_PRODUCTION_HOSTS=1` also replays URLs from the Search Console export on their `www.` and trailing-slash forms. After the normalisation hops, each must end at 404.

## October 14, 2026 coverage export

The full export (55 not indexed, 34 indexed) was reviewed URL by URL.

| Reason | Pages | What the URLs are | Treatment |
| --- | --- | --- | --- |
| Page with redirect | 27 | `/service/*`, `/home`, `http://` and `www.` roots, slash variants, `/product/*` | Legacy paths now 404. Host roots still normalise to `https://siddiona.com/`. |
| Excluded by 'noindex' tag | 5 | WordPress feeds and `/my-account` on `www.` | 404. They move to "Not found" on recrawl. |
| Alternative page with proper canonical tag | 3 | `/privacy-policy`, `/terms-of-service`, one UTM product URL | Legal pages were canonicalised to `www` before October 5 (`87193ef`); they are self-canonical now. Request indexing and validate. The product URL 404s. |
| Crawled – currently not indexed | 11 | WordPress posts, jobs, testimonial, `wp-emoji`, `wc-ajax` | 404. They leave the report on recrawl. |
| Discovered – currently not indexed | 9 | `/careers`, both job pages, `/services/application-services`, `/services/enterprise-solutions`, all four solution pages | Fixed below; request indexing after deploy. |

## Indexing fixes (October 14, 2026)

- **Internal linking.** Each solution page was linked from one page, each service page from three, because the desktop header dropdowns render their links only on hover. The footer now lists every service and solution, the homepage has a "What we do" directory, detail pages link to related services and solutions, and the navbar labels "What We Do" and "Solutions" link to `/services` and `/solutions` (hover still opens the dropdown).
- **Metadata in `<head>`.** Next.js streamed metadata into `<body>` on dynamic routes (the careers pages) for Googlebot, and Google ignores a canonical outside `<head>`. `htmlLimitedBots: /.*/` in `next.config.ts` makes metadata blocking for every request.
- **Inherited metadata.** The root layout no longer sets a canonical or robots directive (the homepage sets its own canonical), and the careers layout no longer sets a canonical, so 404 and noindex pages stop pointing at other URLs.
- **Missing roles.** `/careers/[slug]` calls `notFound()` from `generateMetadata`, giving one `noindex` tag and no canonical. The status remains 200 because `careers/loading.tsx` commits the response first; a real 404 would require a slug check in `proxy.ts`.
- **Content.** Search titles and 140–160 character descriptions name the service and location. Each service and solution page gained a "Who it's for" section, answered questions, and related links. Claims needing confirmation are marked `TODO(verify)` in source.
- **Structured data.** A salary of 0 is treated as unpublished on the page, in `JobPosting`, and when saved from the admin form. `workHours` (which held the work mode) is removed. Job and Organization addresses use the full Demo Business Park address, and Organization carries `foundingDate`.

## Google Search Console follow-up

1. After deploying, use **URL Inspection → Request indexing** for the nine "Discovered" pages, then `/privacy-policy` and `/terms-of-service`.
2. Resubmit `https://siddiona.com/sitemap.xml`.
3. Start **Validate fix** on "Alternative page with proper canonical tag"; let running validations continue. Legacy URLs will move to "Not found (404)", which is informational and needs no action.
4. Use **Removals** only for urgent temporary hiding; it does not replace a 404.
5. Record any newly surfaced legacy path in `legacyPaths` so the validator keeps covering it.
6. Expect recrawling and deindexing to take several weeks.
