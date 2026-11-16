# Siddiona Design V2 Foundation Specification

## Current Solution Capability Icon Treatment (October 5, 2026)

- The operating-context section now uses a connected Problem → Approach → Outcome journey: orange warning, blue route, and teal check nodes, a directional vertical connector, and an active-row highlight. Scroll or selecting a node advances a 250ms transform trace; reduced motion keeps a complete static connector. All original descriptions stay visible and buttons retain keyboard focus and pressed-state semantics.

- Replace core-capability numbers on the four Solution detail pages with relevant white Lucide outline icons (`strokeWidth={1.75}`), using the existing icon family.
- Circular badges are 56px on mobile and 64px from `sm`; glyphs are 28px and 32px respectively. Row order uses blue `#087AC1`, teal `#0D9488`, violet `#7050B5`, orange `#EA780C`, and cyan `#008CAB`, following the approved reference. This palette is scoped to capability badges, not global actions.
- Preserve Plus Jakarta Sans titles, Inter descriptions, editorial row spacing, and slate dividers. Badges are decorative and hidden from screen readers; headings supply meaning. Do not add animation or clickable affordances to these static icons.
- Hero typography remains 36px / 48px / 64px with 1.08 line height over the shared animated Solutions background. Delivery numbering remains sequential.
Brand • Theme • Typography • Image System • Visual Direction

**Project:** Siddiona Technologies Services Pvt. Ltd. (`siddiona.com`)  
**Design Direction:** Enterprise Editorial Technology  
**Framework:** Tailwind CSS v4 CSS-First Design Tokens (`@theme`)  
**Version:** 4.0.0 (Design V2 Foundation Release)  
**Status:** Approved & Authoritative  

## Technology Showcase Control Layout

- Keep the approved 7/5 desktop composition: the 3D circular practice stack occupies the visual column and the editorial panel occupies the content column.
- The changing practice copy lives inside a fixed `415px` desktop viewport. Persistent actions never sit inside the animated slide body.
- Use one responsive two-zone action bar below that viewport: `Explore Practice Scope` remains left-aligned; previous/next arrows and pagination dots remain grouped on the right. The bar stacks vertically below the `sm` breakpoint.
- Preserve 44px minimum action targets, Tangelo Orange active accents, dark circular arrow controls, and a stable baseline across every practice.

---

> [!IMPORTANT]
> **Foundation Boundary:** This document establishes the foundational design system and visual governance across all pages (`/`, `/about`, `/services`, `/solutions`, `/projects`, `/career`, `/contact`). Homepage sections are **NOT** redesigned in this phase; all upcoming page builds must adhere to this foundation.

---

## 1. Official Siddiona Brand Asset — Source of Truth

The **only authoritative brand mark** for Siddiona Technologies Services Pvt. Ltd. is the official logo provided by the company:

- **Source File (Project Root):** [`img/WhatsApp Image 2026-08-31 at 4.17.34 PM.jpeg`](file:///d:/siddiona.com/img/WhatsApp%20Image%202026-08-31%20at%204.17.34%20PM.jpeg)
- **Source File (Web Public):** [`public/brand/Siddionalogo.jpeg`](file:///d:/siddiona.com/public/brand/Siddionalogo.jpeg)
- **Integrity Verification:** SHA256 `4D5042B167B26133C5C9CA9CE7DCB0E31727FFFBB81E3A8D9E769765A282BC68`
- **Visual Anatomy:**
  - **Emblem:** Dynamic Purple & Orange stylized spherical "ST" globe glyph.
  - **Company Title:** "SIDDIONA" in Deep Royal Purple (`#190856` / `#20116C`).
  - **Vertical Descriptor:** "TECHNOLOGIES" in Vivid Tangelo Orange (`#DC4500` / `#EA580C`).
  - **Corporate Tagline:** "Unique Ideas. More Values." in Neutral Dark Charcoal (`#383838`).
  - **Canvas Base:** Pure White (`#FFFFFF`).
  - **Native Dimensions:** 1600 × 671 pixels.
  - **Native Aspect Ratio:** **2.38:1** (Horizontal wide mark).

### Strict Brand Mark Rules:
1. **No Alternate Logos:** All legacy or synthetic variations (`logo.png`, `logo-white.png`, `logo-light-bg.png`, `logo-wordpress.png`) are strictly prohibited and deprecated.
2. **Preserve Native Aspect Ratio:** The logo must maintain its natural horizontal proportion (~2.38:1). It must never be squished, stretched, or placed into a square/circular container.
3. **Never Redraw or AI-Generate:** The logo must never be redrawn, vectorized with altered letterforms, or replaced by AI generators.
4. **Dark Surface Integration:** Because the official mark is a JPEG on a crisp white ground, when placed on dark surfaces (e.g. the Midnight Sovereign footer), it must be mounted inside a clean white brand plate (`bg-white px-3 py-1.5 rounded-lg inline-block`) to preserve 100% brand fidelity, tagline legibility, and color authenticity.

---

## 2. Image Asset Library (`img/`) & Complete Inventory

The `img/` directory at the project root represents the primary approved visual library for the Siddiona website. All imagery balances three essential enterprise pillars: **PEOPLE**, **TECHNOLOGY**, and **ENTERPRISE**.

### Complete Inventory of `img/` Assets:

| Filename | Dimensions | Aspect Ratio | Subject & Visual Elements | Visual Category | Recommended Website Purpose & Section | Safe Cropping | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`WhatsApp Image 2026-08-31 at 4.17.34 PM.jpeg`** | 1600 × 671 | 2.38:1 | Official Siddiona brand mark with ST globe glyph, purple/orange logotype & tagline. | BRAND | Global Header, Mobile Drawer, Footer (brand plate), OpenGraph meta. | **NO CROP** (Maintain 2.38:1) | **CRITICAL** |
| **`adeolu-eletu-E7RLgUjjazc-unsplash.jpg`** | 4523 × 2996 | 1.51:1 (~3:2) | Executive in tailored charcoal business suit reviewing financial/business report newspaper. | PEOPLE / ENTERPRISE | Strategic IT Advisory, Executive Consulting, Corporate Governance, Diligence. | 16:9, 3:2, 4:3 | **HIGH** |
| **`carlos-muza-hpjSkU2UYSU-unsplash.jpg`** | 2426 × 1728 | 1.40:1 (~4:3) | Modern laptop displaying analytical dashboard charts, metrics, and business telemetry on desk. | TECHNOLOGY / ENTERPRISE | Managed IT Services, 24/7 NOC Telemetry, Cloud FinOps, Performance SLAs. | 16:9, 3:2, 4:3 | **HIGH** |
| **`christina-wocintechchat-com-m-faEfWCdOKIg-unsplash.jpg`** | 6016 × 4016 | 1.50:1 (3:2) | Professional women in tech engaged in architectural technology collaboration. | PEOPLE / TECHNOLOGY | Technical Staff Augmentation, Agile Pods, Career & Culture, Engineering Leadership. | 16:9, 3:2, 4:3 | **HIGH** |
| **`israel-andrade-YI_9SivVt_s-unsplash (1).jpg`** | 5842 × 3895 | 1.50:1 (3:2) | Modern open-plan corporate workplace with engineers operating multi-monitor workstations. | ENTERPRISE / PEOPLE | Systems Integration, Enterprise Infrastructure Operations, Who We Are, Operating Scale. | 16:9, 3:2 | **HIGH** |
| **`kevin-matos-Nl_FMFpXo2g-unsplash.jpg`** | 4000 × 6000 | 0.67:1 (2:3) | Dramatic low-angle perspective of glass-and-steel commercial skyscrapers reaching into the sky. | ENTERPRISE | Institutional Stature, Commercial Infrastructure, Smart Building / BMS context, Vertical editorial card. | 2:3, 3:4, or center horizontal banner slice | **MEDIUM** |
| **`thisisengineering-uyfohHiTxho-unsplash.jpg`** | 7890 × 5263 | 1.50:1 (3:2) | Close-up of software engineer writing code on MacBook Pro at a minimalist modern workstation. | TECHNOLOGY | Custom Software Engineering, Cloud Deployment, Architecture Design, Engineering Craft. | 16:9, 3:2, 4:3 | **HIGH** |

---

## 3. Image Ratio System Specification

To eliminate layout shifts (CLS) and maintain editorial visual consistency across all viewports, imagery must adhere to the standardized aspect ratio system:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          IMAGE RATIO STANDARDS                              │
├──────────────────────────┬──────────────┬───────────────────────────────────┤
│ Context                  │ Aspect Ratio │ Primary Purpose                   │
├──────────────────────────┼──────────────┼───────────────────────────────────┤
│ Hero Banners             │ 16:9         │ Immersive panoramic framing       │
│ Large Editorial Sections │ 3:2          │ Narrative corporate photography   │
│ Services Showcase Cards  │ 4:3          │ Balanced card framing             │
│ Solutions Topology Cards │ 4:3          │ Technical hardware / systems      │
│ Projects & Case Studies  │ 16:9         │ Wide client deliverable framing   │
│ Leadership Portraits     │ 3:4          │ Executive portrait format         │
│ Career & Culture Stories │ 3:2 or 4:3   │ Team collaboration & workplace    │
│ OpenGraph Social Share   │ 1.91:1       │ Standard 1200 × 630 preview       │
└──────────────────────────┴──────────────┴───────────────────────────────────┘
```

---

## 4. Typography System: Research, Candidate Testing & Recommendation

### 4.1 Industry Benchmark Analysis
- **Ntiva (`ntiva.com/it-consulting-services`):** Deploys `Inter` with structured 8-point vertical rhythm, tight negative letter-spacing on display headings (`-0.02em`), and clean two-column editorial hierarchy. High utilitarian readability, but slightly generic.
- **Wipro (`wipro.com/consulting`):** Sophisticated semi-geometric sans-serif with generous whitespace, purple accentuation, and balanced proportions projecting global consulting stature.
- **Infosys (`infosys.com`):** Clean, high-contrast sans-serif stack emphasizing clarity, structured multi-column grids, and authoritative corporate weight.

### 4.2 Candidate Testing on Authentic Siddiona Content
Candidates were evaluated directly against real copy:
- **H1:** *"We Build Any Kind of Technology"*
- **H2:** *"Why Siddiona"*
- **H3:** *"Managed IT Services"*
- **Body:** Real Siddiona SLA, cloud, and engineering capability text.

1. **Inter:** High interface utility and data legibility, but feels like an engineering SaaS/developer tool rather than an executive B2B consultancy.
2. **Manrope:** Friendly and balanced, but circular lowercase geometry softens the institutional authority required for enterprise RFPs.
3. **Geist:** Crisp Swiss precision, but carries heavy developer-monochrome connotations detached from physical ELV infrastructure and enterprise SAP consulting.
4. **Plus Jakarta Sans (RECOMMENDED):**
   - **Visual Character:** Geometric neo-grotesque inspired by modernist architecture with distinct ink-traps in bold/extrabold weights and clean optical kerning.
   - **Editorial Stature:** Gives H1 and H2 commanding presence, authority, and architectural rhythm.
   - **Infrastructure Fit:** Self-hosted locally in `src/assets/fonts/` (Weights 500, 600, 700, 800), guaranteeing zero Google Fonts download warnings and instant font swapping.

### 4.3 Typographic Scale & Pairing Architecture
- **Display & Headings:** `Plus Jakarta Sans` (Weights 600, 700, 800)
- **Body & UI Controls:** `Inter` (Weights 400, 500, 600)
- **Technical Metrics & Serials:** `JetBrains Mono` (Weights 500, 600)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TYPOGRAPHIC HIERARCHY                              │
├───────────────────┬──────────────┬──────────────┬──────────────┬────────────┤
│ Level             │ Desktop Size │ Mobile Size  │ Leading      │ Tracking   │
├───────────────────┼──────────────┼──────────────┼──────────────┼────────────┤
│ Hero Display (H1) │ 3.75rem(60px)│ 2.25rem(36px)│ 1.10 (Tight) │ -0.03em    │
│ Section Title (H2)│ 2.50rem(40px)│ 1.875rem(30px│ 1.15         │ -0.02em    │
│ Subsection (H3)   │ 1.50rem(24px)│ 1.25rem(20px)│ 1.25         │ -0.01em    │
│ Feature / Card H4 │ 1.125rem(18px│ 1.125rem(18px│ 1.35         │ 0.00em     │
│ Body Large        │ 1.125rem(18px│ 1.00rem(16px)│ 1.60 (Relaxed│ 0.00em     │
│ Body Regular      │ 1.00rem(16px)│ 0.9375rem(15)│ 1.60         │ 0.00em     │
│ Caption / Label   │ 0.8125rem(13)│ 0.8125rem(13)│ 1.40         │ +0.01em    │
│ Technical Tag/Mono│ 0.75rem(12px)│ 0.75rem(12px)│ 1.20         │ +0.05em    │
└───────────────────┴──────────────┴──────────────┴──────────────┴────────────┘
```

---

## 5. Visual Identity & Color System Architecture

### 5.1 Core Principle: Brand Logo ≠ Entire Website Color Theme
The official Siddiona logo is the **Brand Mark**, not the complete UI color palette:
- **Brand Mark (Untouched):** Royal Purple (`#190856`), Tangelo Orange (`#DC4500`), and Dark Charcoal tagline (`#383838`). The logo is anchored in the header and footer with zero color alteration.
- **Website UI Color System:** An independent, timeless Enterprise Editorial palette that establishes institutional credibility without forcing purple and orange onto every heading, border, card, icon, or badge.

### 5.2 Enterprise Editorial UI Palette
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ENTERPRISE EDITORIAL UI PALETTE                       │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Canvas Pure Base               │ Crisp Enterprise White #FFFFFF             │
│ Canvas Subtle Ground           │ Architectural Slate    #F8FAFC             │
│ Canvas Elevated Ground         │ Clean Neutral Muted    #F1F5F9             │
├────────────────────────────────┼────────────────────────────────────────────┤
│ Headings & Display Titles      │ Deep Obsidian Ink      #0F172A (16.5:1 AAA)│
│ Body Narrative & Copy          │ Neutral Slate 700      #334155 (7.5:1 AAA) │
│ Metadata & Secondary Labels    │ Neutral Slate 500      #64748B (4.6:1 AA)  │
├────────────────────────────────┼────────────────────────────────────────────┤
│ Border Hairline Subtle         │ Architectural Slate    #E2E8F0             │
│ Border Strong / Input Border   │ Active Slate           #CBD5E1             │
│ Border Focus Ring              │ High-Contrast Slate    #0F172A             │
├────────────────────────────────┼────────────────────────────────────────────┤
│ Dark Editorial Ground (Footer) │ Midnight Obsidian      #0B0F19 / #0F172A   │
│ Dark Section Card Ground       │ Deep Slate Ground      #111827 / #1E293B   │
├────────────────────────────────┼────────────────────────────────────────────┤
│ Primary Action (Restrained)    │ Enterprise Tangelo     #EA580C / #C2410C   │
│ Secondary Action / Nav Hover   │ Obsidian Ink / Slate   #0F172A / #334155   │
├────────────────────────────────┼────────────────────────────────────────────┤
│ Operational Status             │ Operational Emerald    #10B981             │
└────────────────────────────────┴────────────────────────────────────────────┘
```

### 5.3 Restrained Accent Policy
- **Primary Conversion CTA Only:** Tangelo Orange (`#EA580C`) is reserved **strictly for primary conversion actions** (e.g. "Schedule Consultation").
- **No Color Saturation:** Orange and purple must **NOT** be sprayed onto every icon, badge, card border, heading, or background.
- **The "Logo Removed" Quality Test:** If the Siddiona logo is temporarily hidden from the page, the website must still possess a coherent, sophisticated enterprise visual identity through typography, photography, whitespace, and structural contrast alone.

---

## 6. Theme Exploration & Final Recommendation

### Evaluated Directions:
- **A. Enterprise Editorial:** Light foundation, sophisticated typography, authentic photography, deep contrast grounding bands, restrained Siddiona colors, generous whitespace.
- **B. Executive Technology:** White/off-white foundation, deep navy/slate, Siddiona purple, selective orange, architecture + technology imagery, high contrast.
- **C. Modern Digital Enterprise:** Light foundation, controlled gradients, purple/blue accents, interactive technology visuals, restrained motion.

### Final Recommendation: **Enterprise Editorial (Direction A)**
- **Why It Wins:**
  1. **Honors Brand Truth:** Accommodates the official white-ground brand mark seamlessly.
  2. **Elevates Human & Technical Reality:** Integrates authentic photography from `img/` naturally.
  3. **Credibility Over Hype:** Projects the stature of global consulting institutions (Ntiva, Wipro, Infosys, Deloitte).
  4. **Grounding Contrast:** Uses Midnight Sovereign Navy (`#0A0927`) for authoritative section breaks and footers.

---

## 7. 21st.dev Inspiration Findings & Reusable Patterns

- **Researched Components:**
  - *Editorial Hero Patterns (`hero-05`, `hero-07`):* Asymmetric layout with crisp top-aligned eyebrow, high-contrast headline, and full-width authentic photography.
  - *Interactive Network Visualizers (`constellation-grid`, `interactive-synapse-network`):* Demonstrates connected systems and data routing.
- **Strict Guardrails:**
  - Used for pattern inspiration and micro-interaction mechanics only.
  - No 21st.dev template aesthetics; all implementations must strictly follow Siddiona Enterprise Editorial branding.
  - Primary imagery strictly sourced from `img/`.

---

## 8. Animation Philosophy & Performance Guardrails

### Core Rule: *"Animation Supports Storytelling, Not Decoration"*

| Permitted Purpose-Driven Motion | Prohibited Decorative Noise |
| :--- | :--- |
| Smooth section entrances (`opacity: 0, y: 12` to `opacity: 1, y: 0` in 250–350ms). | Continuous bouncing particles or decorative floating bubbles across standard content sections. |
| Tactile hover lifts (`-translate-y-0.5` or `-translate-y-1`) with subtle shadow bloom. | Overpowering glowing borders or pulsing neons on cards. |
| Interactive topology HUD inspections activated by explicit user click. | Hover-reactive canvas warp that distracts from reading. |
| ~~Strict `@media (prefers-reduced-motion: reduce)` fallbacks.~~ **Superseded 2026-09-12: motion is unconditional, see "Unconditional Motion Policy" below.** | Unconditional continuous motion that degrades CPU/GPU performance. |

---

## 9. Global Navigation Direction & Information Architecture

- **Sitemap Taxonomy:** `Home`, `Who We Are`, `Services`, `Solutions`, `Projects`, `Career`, `Contact`.
- **Desktop Bar:** Luminous 64–72px bar (`bg-white/95 backdrop-blur-md border-b border-slate-200/80`).
- **Official Brand Mark:** Placed at leading position with preserved 2.38:1 aspect ratio (`h-9 sm:h-10 w-auto`).
- **Mega-Menus:** Clean 2-column dropdowns for Services and Solutions with direct links to practice areas.
- **Conversion Anchor:** Single primary CTA button ("Schedule Consultation").
- **Mobile Drawer:** Clean sliding drawer with collapsible category accordions and touch targets ≥44px.

---

## 10. UI Component Design Language & Primitives

1. **Buttons:**
   - **Primary:** Siddiona Tangelo Orange (`bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-sm active:scale-[0.98]`).
   - **Secondary:** Siddiona Sovereign Navy (`bg-[#16134D] hover:bg-[#1E1B4B] text-white shadow-sm`).
   - **Outline:** Crisp Slate Border (`border border-slate-300 bg-white text-slate-800 hover:bg-slate-50`).
2. **Cards:**
   - Physical crisp white surfaces (`bg-white border border-slate-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)]`).
   - Subtle hover lift (`-translate-y-1`) with border tinting to `border-orange-500/40` or `border-indigo-900/30`.
3. **Badges & Pills:**
   - Subtle status pills (`bg-orange-50 text-orange-800 border border-orange-200/60 text-xs font-semibold px-2.5 py-0.5 rounded-full`).
4. **Framing & Baselines:**
   - Section vertical padding: `py-16` (mobile) to `py-20` / `py-24` (desktop).
   - Standard container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.

---

## 11. Accessibility (a11y) & Responsive Principles

- **WCAG 2.1 AA / AAA Compliance:** All text colors meet or exceed 4.5:1 (normal text) and 3:1 (large text/graphics). Headings achieve 16.2:1 AAA.
- **Keyboard Navigation:** Every interactive element has a visible focus ring (`focus-visible:ring-2 focus-visible:ring-orange-500`).
- **Skip Link:** Global `SkipToContent` component bypasses header directly to `#main-content`.
- **Responsive Breakpoints:**
  - Mobile: `<640px` (Single column, full-width touch targets)
  - Tablet: `640px–1024px` (2-column balanced reflow)
  - Desktop: `>1024px` (Full editorial grid, 12-column asymmetric balance)

---

## 12. Prohibited AI Tropes & Anti-Patterns

| Prohibited Anti-Pattern | Why It Is Prohibited | Siddiona Standard |
| :--- | :--- | :--- |
| **Dark Cyberpunk Neon** | Degrades institutional trust for enterprise B2B buyers. | Luminous Enterprise White & Slate canvas with Sovereign Navy contrast bands. |
| **Generic Gradient Blobs** | Visual noise with zero brand connection. | Crisp white cards with hairline borders (`#E2E8F0`). |
| **Pervasive Glassmorphism** | Degrades contrast and legibility. | Solid, clean physical card surfaces. |
| **Repetitive Card Grids** | Causes visual fatigue. | Asymmetric editorial layouts, telemetry rows, and full-width feature bands. |
| **Alternate Logo Assets** | Destroys brand consistency. | Strictly `Siddionalogo.jpeg`. |

---

## 13. Open Decisions for Human Approval

1. **Brand Plate in Footer:** Official `Siddionalogo.jpeg` is mounted within a clean white brand plate in the dark footer. *Decision confirmed.*
2. **Typography Deployment:** Self-hosted `Plus Jakarta Sans` is established as primary display font. *Decision confirmed.*
3. **Asset Migration:** `img/` assets will be progressively migrated to `public/images/editorial/` during individual page builds. *Decision confirmed.*

---

## 14. Hero Editorial Serif Accent (2026-09-09)

- Plus Jakarta Sans remains the primary display face across the site.
- The homepage Hero uses Plus Jakarta Sans throughout; emphasis comes from weight and the existing Tangelo light treatment rather than a separate serif or italic face.
- The accent preserves the established Tangelo Orange treatment on `forward.` and does not alter body, UI, navigation, technical, or section-heading typography.
- The font is loaded through `next/font/google`, self-hosted by Next.js, and exposed as the `--font-editorial` token with a Georgia fallback.

---

## 15. Ecosystem and Certification Marquees (2026-09-11)

- The Authorized OEM & Cloud Ecosystem surface contains two independent horizontal rails: the established OEM rail and a secondary ISO certifications rail moving in the opposite direction.
- Both rails use matching `h-[62px] sm:h-[68px]` rounded white cards, slate hairline borders, 32–36 second linear motion, `translate3d` transforms, hover pause, and dual standard/WebKit gradient edge masks.
- Certification codes use JetBrains Mono, certification titles use Plus Jakarta Sans, and supporting descriptions use Inter. Seal graphics use original inline SVG geometry in Sovereign Navy (`#16134D`) and Tangelo Orange (`#EA580C`).
- Marquee containers must remain clipped locally and must be browser-tested with `document.documentElement.scrollWidth === document.documentElement.clientWidth`.
- The `Certifications & compliance` divider must match the `Authorized OEM & Cloud Ecosystem` heading exactly: white rounded pill, slate hairline border and shadow, animated Tangelo beacon, uppercase JetBrains Mono, `tracking-widest`, identical padding, and the same responsive 11–12px type size.
- Opposing motion is isolated per component instance through `--marquee-direction`: OEM is `normal`, ISO is `reverse`. Never interpolate direction into the shared track selector because a later marquee instance can override earlier instances.

---

## 16. Premium Company Overview (2026-09-11)

- The homepage overview uses the supplied elegant-dark reference treatment: a charcoal radial field, four masked cyan illumination streaks, a fine dot texture, and a soft slate vignette. It is implemented locally by `DarkGradientBg`; external texture URLs are prohibited.
- Desktop composition uses a 7/5 editorial split. The left column begins with a normal title-case `Who we are` heading in white Plus Jakarta Sans ExtraBold—never a pill or status badge—followed by the white display statement, Slate-300 Inter supporting copy, and Tangelo CTA. The right contains the light interactive Enterprise Synergy Matrix as the high-contrast focal surface.
- The headline reveals by word using only opacity, `translateY(12px)`, and `blur(6px)` over 500ms with the established strong ease-out curve and 40ms stagger.
- Matrix nodes use JetBrains Mono serials and Plus Jakarta Sans labels. Hover, focus, and click all update the active core readout and Tangelo connector; the 20-second orbit is decorative.
- Reduced-motion rendering exposes every headline word instantly through a CSS media override and stops the orbit/beacon animations without changing server/client markup.
- The overview remains shorter than `/about` and contains no metrics, certifications, customer claims, or external image dependencies.

---

## 17. Condensed Section Display Typography (2026-09-11)

- Site section headings use Anton through the shared `font-heading` token. Hero and page-level titles retain Plus Jakarta Sans through `font-display`.
- Primary section headings scale from 34px on mobile to 44px on large screens, with uppercase treatment, `0.96` line-height, and `-0.025em` tracking.
- The shared `SectionHeading` is the source of truth. Standalone section headings must consume the same token and metrics rather than introducing another display face.
- Compact ecosystem labels use the same typeface at 14–16px with `0.035em` tracking; their smaller scale preserves the existing pill architecture and matched-label requirement.
- Inter remains the body face, Plus Jakarta Sans remains the supporting brand display and card-title face, and JetBrains Mono remains reserved for technical codes and metadata.

---

## 18. Translucent Direction-Aware Navbar (2026-09-11)

- Navbar dimensions, logo size, padding, navigation spacing, rounded geometry, and breakpoint behavior are fixed and must not change as part of scroll-behavior refinements.
- On the hero, use a translucent Obsidian surface with a restrained white hairline and medium backdrop blur. On light content and internal pages, use a 75% white surface with strong blur, saturation, and the established soft shadow.
- Beyond the 24px top safety zone, scroll down hides the navbar and scroll up reveals it. A 6px direction threshold prevents touchpad jitter; movement uses only `transform` over 300ms with the approved strong ease-out curve.
- Open navigation menus always keep the navbar visible. Reduced-motion users receive the same visibility behavior without an animated transition.

---

## 19. Navigation Brand Lockup (2026-09-11)

- Header branding combines the emblem-only `Siddiona-emblem-icon.png` with live text; full baked-text lockup images are not permitted in navigation.
- Emblem height is 32px mobile, 38px small screens, and 40px large screens. The lockup gap is 10px mobile and 12px from the small breakpoint.
- Line one is a single unbroken Plus Jakarta Sans Bold uppercase line at 14/16/17px: `SIDDIONA` is white on dark hero surfaces or Royal Navy `#190856` on light surfaces; `TECHNOLOGIES` is always Tangelo `#EA580C`.
- Line two is Inter Semibold at 10/11/11.5px: `Unique Ideas. More Values.` uses Soft White `#E2E8F0` on dark surfaces and Slate `#64748B` on light surfaces.
- The complete lockup is one focusable home link. The emblem alternative text is `Siddiona Technologies Logo`; the link accessible label is `Siddiona Technologies Home`.
- Dark hero surfaces use the approved white/orange emblem extracted from `Siddionalogo-orange-white.png`; light surfaces use the purple/orange emblem. Both assets are text-free transparent crops of the same ST globe mark.
- The navbar surface is centered and capped at 1280px on wide screens. This width cap must not alter the established 56/64/72px brand-link height or the surrounding responsive padding.

## 20. Compact Activity-Aware Navigation (2026-09-11)

- The floating capsule is capped at `max-w-6xl` and centered inside `px-4 sm:px-6` viewport gutters.
- The shared ST emblem scales to 46px on mobile, 50px at `sm`, 54px at `lg`, and 58px at `xl`. The complete live-text lockup uses width targets of 185px, 215px, and 245px while preserving the emblem's native aspect ratio.
- The navbar starts visible at the absolute top of the page. Across the Hero and every following section, downward scrolling hides it and upward scrolling reveals it. It remains visible while scrolling is idle and hides only when downward travel resumes.
- Hover, focus-within, and open-menu states are hard visibility guards. The visible class contract is `translate-y-0 opacity-100 pointer-events-auto`; the hidden contract is `-translate-y-full opacity-0 pointer-events-none`.
- Entrance and exit use the requested `transition-all duration-300 ease-in-out`. Reduced-motion users receive an immediate state change through `motion-reduce:transition-none`.
- Verification passed at 1440px, 1280px, 1024px, 768px, and 390px. The 390px layout retained the 48px menu target and reported no horizontal document overflow.
- At desktop widths, symmetric 245px edge tracks reserve independent space for the brand and CTA. The center navigation cannot overlap either edge; the verified 1440px brand-to-Home clearance is 35px.
- Entrance and exit animate only compositor-friendly transform and opacity over 280ms using the established drawer curve `cubic-bezier(0.32, 0.72, 0, 1)`. Rapid direction changes retarget from the current visual position without restarting keyframes. Reduced-motion mode retains a short 200ms opacity fade while removing vertical travel.

---

## 21. Hero Supporting Copy (2026-09-11)

- The primary Hero supporting statement uses Inter Semibold at 17px by default, 18.5px from `sm`, and 20px from `lg`, with a 1.6 line-height.
- Keep the copy centered, text-balanced, and capped at 780px so its increased emphasis does not create crowding or unstable wrapping.

---

## 22. Adaptive Glass Navigation (2026-09-11)

- Navigation uses a centered fixed glass shell capped at 1240px, with a 72px minimum height and responsive 12-20px viewport gutters.
- Surface tone follows the section beneath the header. Automatic computed-background luminance detection is the default; `data-nav-tone="dark"` and `data-nav-tone="light"` are available when imagery or layered effects need an explicit contrast choice.
- Dark treatment: translucent Slate 950 at 34%, white 16% edge, 18px blur, and a tinted depth shadow. Light treatment: white at 72%, bright refractive edge, 18px blur, and a restrained Slate shadow.
- Desktop navigation appears from 1280px and remains on one line. Its three-column shell reserves 245px for both brand and CTA, preventing overlap with the centered link group.
- Scrolling down hides the header and scrolling up reveals it without an inactivity timeout. A 6px threshold suppresses trackpad jitter. Focus, open menu, open mobile drawer, and page-top states keep it visible.
- Entrance and exit animate only transform and opacity over 260ms with `cubic-bezier(0.32, 0.72, 0, 1)`. Reduced-motion mode removes vertical travel and keeps a 150ms opacity transition.
- The mobile drawer uses a 300ms right-edge transform, 200ms backdrop fade, 48px controls, Escape dismissal, focus placement, and body-scroll locking.
- **Superseded surface rule:** Use only the dark translucent treatment across all sections and routes. Do not switch to a white navbar surface or the purple/orange light emblem variant.
- Logo, navigation capsule, and CTA are separate visual entities aligned on one full-width stripe. Logo anchors left, navigation remains centered, and CTA anchors right.
- The stripe uses a subtle dark gradient veil with 6px blur; only the center navigation receives the heavier 20px glass material.
- Stripe visibility uses a coordinated 280ms material transition: 18px vertical lift plus opacity, 8px inward edge drift, and a restrained 98.5% navigation scale. This navbar motion is always enabled by explicit product direction.
- Brand lockup and desktop CTA are top-only edge entities. Once `scrollY > 8`, they remain hidden until the user returns to the absolute page top; only the navigation capsule returns during upward-scroll reveals.
- Center navigation uses 24px backdrop blur and 160% saturation; the stripe veil uses 10px blur. Visibility motion belongs only to the stripe wrapper: 320ms transform and opacity with `cubic-bezier(0.22, 1, 0.36, 1)`. Do not add nested visibility transforms to the capsule.
- **Current motion implementation:** GSAP owns stripe visibility with a 300ms entrance, 220ms exit, 16px vertical path, `power3.out`, and `overwrite: "auto"`. Top-only logo and CTA use one synchronized 240ms GSAP tween with no stagger.
- Center navigation uses a 62% Slate 950 surface, 22% white edge, 18% inner highlight, and 28% depth shadow to maintain contrast over light sections while retaining the 24px blur.
- Center navigation fills its middle grid track up to 760px, distributes destinations with `justify-between`, and uses 15px semibold labels with 14px horizontal link padding.
- **Current container rule:** Brand lockup, navigation, and CTA share one dark glass capsule. Remove all top-only edge visibility behavior; the unified container enters and exits as one GSAP-animated object.
- Navbar direction detection and rendering both use GSAP. ScrollTrigger supplies direction; a single `force3D` transform/opacity tween uses a 280ms `power4.out` entrance and 200ms exit. Do not add child visibility transitions or a second scroll-motion engine.
- **Current timing:** GSAP entrance is 360ms and exit is 280ms. The longer timing preserves the same 16px path and `power4.out` response while giving the glass surface a calmer arrival and departure.
- The desktop brand retains its 245px track while the compact CTA defines an automatic-width right track. Navigation fills the flexible space between them, preserving equal 24px outer gutters without changing the CTA dimensions.
## Interactive Brand Footer

- The global footer uses a rounded Midnight surface, subtle orange radial illumination, and the transparent orange-white Siddiona lockup.
- The oversized outlined `SIDDIONA` signature reveals an orange highlight around fine-pointer movement; its gradient is updated directly rather than stored in React state.
- Content enters once through GSAP ScrollTrigger using 24px vertical travel, opacity, `power4.out`, and a 75ms stagger. The wordmark line draw uses SVG stroke offset and `power2.inOut`.
- The layout collapses from three desktop columns to one column, while Explore links retain a compact two-column arrangement before the desktop breakpoint.
- The compact variant excludes Contact from Explore, uses smaller 14px link/contact text, and caps the decorative wordmark at 82% / 1040px to prevent the footer from dominating the viewport.
- Footer density is intentionally compact: 48px maximum desktop top padding, 40px information-block bottom padding, a 112-unit wordmark viewBox, and reduced link/contact spacing keep the complete footer well below a desktop viewport height.

## Who We Are Cinematic System

- The About hero uses one unchanged blue-hour enterprise skyline rather than abstract gradient geometry or a bright alternate frame. Its overfilled stage descends 10vh while receiving a restrained 3.5% camera push, smoothed through a 1.35-second GSAP scrub.
- The official `Unique Ideas. More Values.` phrase is the sole About hero headline. It uses Plus Jakarta Sans extra-bold at a fluid 48–96px scale, centered in two intentional lines with high-contrast white rendering.
- The story panel uses warm near-black `#1C1213`, centered editorial copy, Tangelo metadata markers and CTA, and progressive word illumination inspired by the supplied reading sequence.
- Decorative motion is GSAP-only, compositor-friendly, always enabled by explicit product direction, and isolated from the locked global navigation.
- The Hero-to-story handoff uses spatial continuity rather than a hard boundary: the same skyline gains a warm brighter exposure, the headline fades, and a masked 58vh blur/dark veil resolves into the story's `#1C1213` surface.

## About Hero Photograph — 2026-09-12

Supersedes the blue-hour skyline described in "Who We Are Cinematic System" above. The chapter structure, motion, and typography are unchanged; only the frame and its treatment changed.

- The About hero uses `public/images/about/siddiona-workspace-hero.jpg`, a blue-duotone enterprise workspace photograph (1239x675). It replaces both illustrated city rasters.
- The frame is full-bleed `fill` with `object-cover object-center` and `sizes="100vw"`. Cover never distorts the aspect ratio; centre framing keeps the monitor, desk and chair in view on portrait viewports.
- Contrast treatment: a single vertical scrim, `#0B1020` at 62% to 46% to `#11152C` at 82%. The source frame is light, so the earlier 10–30% scrim could not carry the white editorial lockup. The scrim is a legibility device, not a mood layer, and is the minimum that keeps the `Unique Ideas. More Values.` headline and the monospace baseline metadata readable at every breakpoint.
- The second brighter exposure that previously crossfaded over the skyline was removed. A brightness-boosted copy of an already-light photograph clips highlights and reads as a flash rather than as dusk lighting.
- The sticky scene's fallback colour is `#7EB6DC`, matched to the photograph's dominant tone so a slow image load does not flash a dark ground.
- Motion is unchanged: 10vh descent on the overfilled stage, 3.5% camera push, 1.35s scrub, 58vh masked veil resolving into the `#1C1213` story surface.
- Known limitation: the source frame is 1239px wide, below a full-bleed desktop hero. Next.js does not upscale, so displays wider than ~1240 CSS pixels stretch the original. The photograph's shallow depth of field hides most of this. A higher-resolution original is the fix if it becomes visible.

## Reduced Motion on About — 2026-09-12 (SUPERSEDED)

> Superseded the same day by "Unconditional Motion Policy" at the end of this document. The `gsap.matchMedia()` gate described below has been removed.


Supersedes "Decorative motion is GSAP-only... always enabled by explicit product direction."

- The About chapter is wrapped in `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`. Under `reduce`, no tween is created and the markup renders in its final state: the headline is visible, the story words are fully opaque, the CTA is in place, and the stage carries no transform.
- The shared `Reveal` wrapper resolves the same way through the `.reveal-item` rule in `globals.css`.
- Windows reports `prefers-reduced-motion: reduce` whenever Settings → Accessibility → Visual effects → Animation effects is off. On such a machine the About page is intentionally static. This is the correct behaviour, not a defect.

## Unconditional Motion Policy — 2026-09-12

**Standing project rule. Supersedes every earlier reduced-motion guidance in this document.**

`prefers-reduced-motion` is honoured across typography and section entrances. Important text remains fully visible while decorative displacement, blur, shimmer, and scroll choreography are removed.

### Never add any of these

| Form | Example |
| :--- | :--- |
| CSS media block | `@media (prefers-reduced-motion: reduce) { ... }` |
| Tailwind variant | `motion-reduce:transition-none`, `motion-safe:animate-*` |
| GSAP gate | `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` |
| Framer Motion hook | `useReducedMotion()`, `<MotionConfig reducedMotion="user">` |
| Manual query | `window.matchMedia("(prefers-reduced-motion: reduce)")` |

Use a plain `gsap.context()` for GSAP scoping. Use Framer Motion's variants directly with no preference branch.

### Why this was decided

Windows reports `prefers-reduced-motion: reduce` whenever Settings → Accessibility → Visual effects → Animation effects is off, which is a common default on managed and lower-powered machines. The site was rendering entirely static for stakeholders reviewing it, and the motion design is considered part of the product's proof of engineering quality.

### What this costs

This is an accessibility trade-off, recorded here deliberately so it is not mistaken for an oversight. Users who set a reduced-motion preference — commonly because motion triggers vestibular symptoms, nausea, or migraine — receive the full animation. If that trade-off is ever revisited, the correct fix is to reintroduce the preference query at the points listed in the table above, not to disable individual animations.

### Consequence to design against

With no reduced-motion fallback, an animation that fails to run leaves its content in the animation's starting state. Several entrance animations start at `opacity: 0`, so content can be invisible if the animation never advances. Keep entrance animations on `animation-fill-mode: forwards` (CSS) or a settled `animate` state (Framer Motion), and never rely on a media-query rule to reveal content.
