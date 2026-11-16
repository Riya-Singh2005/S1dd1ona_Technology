import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SERVICES_NAV, SOLUTIONS_NAV, type NavItemConfig } from "@/lib/navigation";

/**
 * Homepage directory of every service and solution.
 *
 * A Server Component so each detail page is a plain, crawlable link from
 * the homepage, rather than only reachable through the hover-driven
 * header menus.
 */

function CapabilityList({ items }: { items: NavItemConfig[] }) {
  return (
    <ul className="border-t border-slate-300">
      {items.map((item) => (
        <li key={item.href} className="border-b border-slate-300">
          <Link
            href={item.href}
            className="group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#EA580C]"
          >
            <span>
              <span className="block font-jakarta text-lg font-semibold tracking-[-0.025em] text-slate-950 transition-colors duration-200 group-hover:text-[#C2410C]">
                {item.title}
              </span>
              {item.description && (
                <span className="mt-1.5 block text-sm leading-6 text-slate-600">{item.description}</span>
              )}
            </span>
            <ArrowUpRight
              className="mt-1 h-4 w-4 text-slate-400 transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#C2410C]"
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HomeCapabilitiesSection() {
  return (
    <section
      id="what-we-do"
      aria-labelledby="what-we-do-heading"
      className="border-b border-slate-200/80 bg-[#FAFBFD] py-16 text-slate-950 sm:py-20 lg:py-24"
    >
      <Container size="default">
        <Reveal className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#C2410C]">What we do</p>
            <h2
              id="what-we-do-heading"
              className="mt-4 font-jakarta text-[clamp(2.1rem,4.6vw,3.75rem)] font-semibold leading-[1] tracking-[-0.05em]"
            >
              IT services and enterprise solutions.
            </h2>
          </div>
          {/* TODO(verify): confirm "across India" reflects where Siddiona delivers. */}
          <p className="max-w-2xl text-base leading-8 text-slate-600 lg:text-lg">
            From our office in New Delhi, Siddiona Technologies supports organisations
            across India with eight services covering the ongoing work of running enterprise
            technology, and four solutions that apply that expertise to a specific outcome: recovery,
            infrastructure change, connected learning spaces, and planned maintenance.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h3 className="mb-5 flex items-baseline justify-between gap-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <span>Services</span>
              <Link href="/services" className="normal-case tracking-normal text-[#C2410C] underline-offset-4 hover:underline">
                All services
              </Link>
            </h3>
            <CapabilityList items={SERVICES_NAV} />
          </Reveal>
          <Reveal delay={0.06}>
            <h3 className="mb-5 flex items-baseline justify-between gap-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <span>Solutions</span>
              <Link href="/solutions" className="normal-case tracking-normal text-[#C2410C] underline-offset-4 hover:underline">
                All solutions
              </Link>
            </h3>
            <CapabilityList items={SOLUTIONS_NAV} />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
