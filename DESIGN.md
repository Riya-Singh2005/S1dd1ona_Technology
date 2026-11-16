# Siddiona Interface Direction

## Solution Capability Icons (October 5, 2026)

- Use relevant icons from the existing Lucide family for core-capability rows on all four Solution detail pages, not decorative numbers.
- Use white 1.75-stroke glyphs in blue, teal, violet, orange, and cyan circular badges, matching the approved reference. This is a local badge palette exception; global action colors remain unchanged.
- Keep badges 56px on mobile and 64px from `sm`, with 28px / 32px icons, and hide them from assistive technology. Retain the existing typography, row spacing, and dividers.
- Keep delivery stages numbered because they convey order. Do not add new icon motion, image assets, or client-side behavior.

Siddiona uses a restrained enterprise editorial system. Interfaces should feel credible, technically capable, and human. Reuse the existing components and tokens before adding new patterns.

## Foundations

- Section-heading type: Anton, uppercase with a compact 0.96 line-height.
- Hero and page-title type: Plus Jakarta Sans, extra-bold.
- Supporting display type: Plus Jakarta Sans, extra-bold for card titles and prominent non-heading statements.
- Body and UI type: Inter.
- Technical labels: JetBrains Mono, used sparingly.
- Dark foundation: `#0F172A`, `#0B1020`, and `#111827`.
- Primary action: `#EA580C`.
- Major non-hero and non-footer sections use the exact shared pastel gradient defined in the project brief.
- Corners stay measured (generally 12–18px). Shadows remain soft and low-contrast.

## Composition

- Use the shared `Container` so navigation and page content align.
- Prefer clear editorial hierarchy, asymmetric image/text compositions, and generous whitespace.
- Keep primary section headings between 30px and 46px across supported breakpoints.
- Body copy runs at 16px, 17.5px, and 18.5px with 1.65 line height.
- Avoid decorative telemetry, invented statistics, status strips, floating blobs, and persistent glow.

## Motion

- Motion communicates state or hierarchy and must stop quickly.
- Use opacity and transform for transitions. Keep interactions interruptible.
- Respect `prefers-reduced-motion`: preserve fully visible text and state changes while removing decorative displacement, blur, and stagger where practical.
- The technology showcase retains its physical stacked-card rotation and manual arrow controls.

## Content and Brand

- Use official Siddiona logo files without filters, recoloring, distortion, or generated substitutes.
- Keep claims concise and verifiable.
- Only display approved partners and verified external profile links.
- All meaningful text remains selectable and copyable.
