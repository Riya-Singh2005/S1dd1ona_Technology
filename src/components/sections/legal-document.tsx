import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { BackgroundGradientGlow } from "@/components/ui/background-gradient-glow";
import { LegalToc } from "@/components/sections/legal-toc";
import { InPageLink } from "@/components/ui/in-page-link";
import type { LegalBlock, LegalDocumentContent } from "@/lib/legal-content";

export interface LegalDocumentProps {
  content: LegalDocumentContent;
  /** The companion legal page, linked so readers can move between the two. */
  related: { title: string; href: string };
}

function LegalBlocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <div className="mt-4 space-y-4 sm:mt-5">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "paragraph":
            return (
              <p key={index} className="editorial-copy text-slate-700">
                {block.text}
              </p>
            );

          case "list":
            return (
              <ul key={index} className="flex flex-col gap-3">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#EA580C]"
                      aria-hidden="true"
                    />
                    <span className="editorial-copy text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            );

          case "definitions":
            return (
              <dl key={index} className="flex flex-col gap-4">
                {block.items.map((item) => (
                  <div
                    key={item.term}
                    className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5"
                  >
                    <dt className="font-display text-[15px] font-extrabold tracking-[-0.01em] text-[#0F172A] sm:text-base">
                      {item.term}
                    </dt>
                    <dd className="editorial-copy mt-1.5 text-slate-700">{item.text}</dd>
                  </div>
                ))}
              </dl>
            );

          case "callout":
            return (
              <div
                key={index}
                className="rounded-xl border border-orange-200 bg-orange-50/70 p-5 sm:p-6"
              >
                <p className="font-display text-base font-extrabold tracking-[-0.015em] text-[#9A3412]">
                  {block.title}
                </p>
                <p className="editorial-copy mt-2 text-slate-700">{block.text}</p>
              </div>
            );
        }
      })}
    </div>
  );
}

/**
 * Shared renderer for Siddiona's legal documents.
 *
 * Content arrives as structured data from `@/lib/legal-content`, so the Privacy
 * Policy and Terms of Service stay visually identical and only the prose differs.
 */
export function LegalDocument({ content, related }: LegalDocumentProps) {
  const { eyebrow, title, summary, effectiveDate, lastUpdated, intro, sections, contact } =
    content;

  return (
    <div className="flex flex-1 flex-col">
      <section
        aria-labelledby="legal-title"
        className="relative overflow-hidden pb-10 pt-32 sm:pb-14 sm:pt-36"
      >
        <BackgroundGradientGlow />
        <Container className="relative z-10">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-slate-700">
              <li>
                <Link href="/" className="inline-flex min-h-11 items-center hover:text-[#EA580C]">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight size={14} aria-hidden="true" />
              </li>
              <li aria-current="page" className="font-semibold text-[#0F172A]">
                {title}
              </li>
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2.5">
                <span className="h-1 w-2.5 shrink-0 rounded-full bg-[#EA580C]" aria-hidden="true" />
                <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#EA580C] sm:text-sm">
                  {eyebrow}
                </span>
              </div>
              <h1
                id="legal-title"
                className="font-display mt-3.5 text-3xl font-extrabold leading-[1.1] tracking-[-0.035em] text-[#0F172A] sm:text-4xl lg:text-[46px]"
              >
                {title}
              </h1>
              <p className="editorial-copy mt-5 max-w-xl text-slate-700">{summary}</p>
            </div>

            <div className="lg:col-span-5">
              <dl className="grid gap-4 rounded-2xl border border-slate-200/90 bg-white/80 p-5 sm:grid-cols-2 sm:p-6">
                <div>
                  <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    Effective
                  </dt>
                  <dd className="mt-1.5 text-[15px] font-semibold text-[#0F172A]">
                    {effectiveDate}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    Last updated
                  </dt>
                  <dd className="mt-1.5 text-[15px] font-semibold text-[#0F172A]">{lastUpdated}</dd>
                </div>
                <div className="sm:col-span-2">
                  <Link
                    href={related.href}
                    className="group inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[#EA580C] transition-colors duration-200 hover:text-[#C2410C] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
                  >
                    Read our {related.title}
                    <ArrowUpRight
                      size={16}
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </div>
              </dl>
            </div>
          </div>
        </Container>
      </section>

      <section aria-label={`${title} document`} className="border-t border-slate-200/80 bg-white py-12 sm:py-16">
        <Container className="w-full">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <aside className="hidden lg:col-span-4 lg:block xl:col-span-3">
              <LegalToc sections={sections} className="sticky top-[128px]" />
            </aside>

            {/* Capped at a comfortable reading measure; long clauses are the point of the page. */}
            <article className="min-w-0 max-w-[44rem] lg:col-span-8 xl:col-span-8">
              <div className="space-y-4 border-l-2 border-[#EA580C] pl-5">
                {intro.map((paragraph) => (
                  <p key={paragraph} className="editorial-copy text-slate-700">
                    {paragraph}
                  </p>
                ))}
              </div>

              <details className="mt-8 rounded-xl border border-slate-200/90 bg-[#F8FAFC] p-4 lg:hidden">
                <summary className="cursor-pointer font-display text-sm font-extrabold uppercase tracking-[0.06em] text-[#0F172A] marker:text-[#EA580C]">
                  Jump to a section
                </summary>
                <ul className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <InPageLink
                        targetId={section.id}
                        className="block py-1 text-sm font-medium text-slate-600 hover:text-[#EA580C]"
                      >
                        {section.title}
                      </InPageLink>
                    </li>
                  ))}
                </ul>
              </details>

              <div className="mt-10 flex flex-col gap-10 sm:mt-12 sm:gap-12">
                {/*
                  Deliberately not wrapped in `Reveal`: legal clauses must render
                  unconditionally, without depending on viewport observation or
                  client hydration to become readable.
                */}
                {sections.map((section, index) => (
                  <section
                    key={section.id}
                    id={section.id}
                    tabIndex={-1}
                    aria-labelledby={`${section.id}-heading`}
                    className={
                      index === 0
                        ? "scroll-mt-[112px] sm:scroll-mt-[128px]"
                        : "scroll-mt-[112px] border-t border-slate-200/80 pt-10 sm:scroll-mt-[128px] sm:pt-12"
                    }
                  >
                    <h2
                      id={`${section.id}-heading`}
                      className="font-display text-xl font-extrabold leading-[1.25] tracking-[-0.02em] text-[#0F172A] sm:text-[24px]"
                    >
                      {section.title}
                    </h2>
                    <LegalBlocks blocks={section.blocks} />
                  </section>
                ))}
              </div>

              <div className="mt-12 rounded-2xl border border-slate-200/90 bg-[#0F172A] p-6 text-white sm:mt-14 sm:p-8">
                <h2 className="font-display text-xl font-extrabold tracking-[-0.02em] text-white sm:text-[24px]">
                  {contact.title}
                </h2>
                <p className="editorial-copy mt-3 max-w-2xl text-slate-300">
                  {contact.description}
                </p>
                <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {contact.channels.map((channel) => (
                    <div key={channel.label}>
                      <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-orange-400">
                        {channel.label}
                      </dt>
                      <dd className="mt-1.5 text-[15px] font-semibold leading-snug text-white">
                        {channel.href ? (
                          <a
                            href={channel.href}
                            className="transition-colors duration-200 hover:text-orange-300 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                          >
                            {channel.value}
                          </a>
                        ) : (
                          channel.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default LegalDocument;
