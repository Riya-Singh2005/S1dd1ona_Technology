import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SOLUTIONS } from "@/lib/solutions-data";

export function SolutionsPortfolioSection() {
  return (
    <section className="bg-[#FAFBFD] py-20 text-slate-950 sm:py-24 lg:py-32" aria-labelledby="solutions-portfolio-title">
      <Container>
        <Reveal className="grid gap-8 border-b border-slate-300 pb-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#C2410C]">Four focused solutions</p>
            <h2 id="solutions-portfolio-title" className="mt-4 max-w-2xl font-jakarta text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[0.96] tracking-[-0.055em]">
              Built around operational outcomes.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-slate-600 lg:justify-self-end lg:text-lg">
            Each engagement connects assessment, design, implementation, validation, and operational ownership—so the resulting system can be understood and maintained after delivery.
          </p>
        </Reveal>

        <div className="divide-y divide-slate-300">
          {SOLUTIONS.map((solution, index) => (
            <Reveal key={solution.slug} delay={Math.min(index * 0.04, 0.12)}>
              <Link
                href={`/solutions/${solution.slug}`}
                className="group grid gap-6 py-10 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-4 sm:py-12 lg:grid-cols-[72px_minmax(0,1.2fr)_minmax(260px,0.8fr)_52px] lg:items-center lg:gap-10"
              >
                <span className="font-mono text-sm font-semibold tracking-[0.16em] text-[#C2410C]">{solution.number}</span>
                <div>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{solution.category}</p>
                  <h3 className="mt-3 max-w-3xl font-jakarta text-[clamp(1.75rem,3.6vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.045em] transition-colors group-hover:text-[#C2410C]">
                    {solution.title}
                  </h3>
                </div>
                <div className="relative hidden aspect-[4/3] overflow-hidden bg-slate-200 md:block">
                  <Image
                    src={solution.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 28vw, 45vw"
                    className="object-cover saturate-[0.82] transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                    style={{ objectPosition: solution.imagePosition }}
                  />
                  <div className="absolute inset-0 bg-[#16134D]/15 transition-colors duration-300 group-hover:bg-[#16134D]/5" />
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 text-slate-900 transition-[background-color,color,border-color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:border-[#EA580C] group-hover:bg-[#EA580C] group-hover:text-white" aria-hidden="true">
                  <ArrowUpRight className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <p className="text-base leading-7 text-slate-600 lg:col-start-2 lg:max-w-2xl">{solution.summary}</p>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 grid gap-8 border-t border-slate-300 pt-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <h2 className="font-jakarta text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-3xl">
            How solutions relate to our services.
          </h2>
          <div className="max-w-2xl space-y-5 text-base leading-8 text-slate-600">
            <p>
              Each solution packages work from Siddiona&apos;s{" "}
              <Link href="/services" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-[#C2410C]">IT services</Link>{" "}
              around a single outcome. Backup and disaster recovery draws on{" "}
              <Link href="/services/cloud-solutions" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-[#C2410C]">cloud</Link>{" "}
              and{" "}
              <Link href="/services/managed-it-services" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-[#C2410C]">managed IT</Link>{" "}
              expertise; data center migration and smart classrooms build on{" "}
              <Link href="/services/enterprise-solutions" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-[#C2410C]">enterprise infrastructure and integration</Link>;
              annual maintenance extends the support model behind managed IT.
            </p>
            <p>
              Whichever route you take, engagements start with an assessment of your environment and
              finish with documentation and a clear handover to the team that will operate the result.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
