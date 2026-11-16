import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight, ClipboardCheck, CloudCog, FileChartColumn, GraduationCap, Headset, Layers, ListChecks, Mic, MonitorPlay, Network, PencilRuler, Route, Server, Settings, ShieldCheck, SlidersHorizontal, Users, Wrench, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SolutionsHeroShader } from "@/components/ui/solutions-hero-shader";
import { getCatalogNavItems } from "@/lib/navigation";
import type { SolutionExperienceItem } from "@/lib/solutions-data";
import { SolutionContextJourney } from "./solution-context-journey";
import { SolutionDeliverySequence } from "./solution-delivery-sequence";
import styles from "./solution-detail-experience.module.css";

const CAPABILITY_ICONS: Record<string, LucideIcon> = {
  "Recovery assessment": ClipboardCheck,
  "Architecture and policy design": ShieldCheck,
  "Hybrid workload protection": CloudCog,
  "Implementation and transition": Settings,
  "Recovery testing": ListChecks,
  "Discovery and dependency mapping": Network,
  "Target platform design": Server,
  "Migration wave planning": Route,
  "Migration and cutover": Layers,
  "Validation and handover": ClipboardCheck,
  "Room and experience design": PencilRuler,
  "Visual and presentation systems": MonitorPlay,
  "Audio and voice": Mic,
  "Collaboration and control": Users,
  "Commissioning and enablement": GraduationCap,
  "Asset and configuration baseline": SlidersHorizontal,
  "Preventive maintenance planning": Wrench,
  "Issue response coordination": Headset,
  "Vendor and lifecycle coordination": Network,
  "Service reporting": FileChartColumn,
};

const CAPABILITY_COLORS = ["bg-[#087AC1]", "bg-[#0D9488]", "bg-[#7050B5]", "bg-[#EA780C]", "bg-[#008CAB]"];

function SmartClassroomTopology() {
  const outputs = ["Display", "Audio", "Collaboration", "Recording"];

  return (
    <div className="border border-white/15 bg-white/[0.045] p-5 sm:p-7" aria-label="Smart classroom system topology">
      <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-4">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-orange-300">Room topology</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">Signal + control</span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="space-y-2">
          {["Instructor device", "Room PC", "Document source"].map((item) => (
            <div key={item} className="border border-white/12 bg-slate-950/35 px-3 py-2.5 font-mono text-[11px] text-white/75">{item}</div>
          ))}
        </div>
        <div className="hidden h-px w-8 bg-orange-400/65 sm:block" aria-hidden="true" />
        <div className="border border-orange-400/50 bg-orange-400/10 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-orange-300">Control + connectivity</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {outputs.map((item) => <span key={item} className="border border-white/12 px-2 py-2 font-mono text-[10px] text-white/70">{item}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SolutionDetailExperience({ solution }: { solution: SolutionExperienceItem }) {
  const related = getCatalogNavItems(solution.related);

  return (
    <div className="overflow-hidden bg-[#FAFBFD] text-slate-950">
      <section className="relative flex items-center overflow-hidden bg-[#0B0911] pb-12 pt-28 text-white md:min-h-[100svh] md:pb-20 md:pt-40 lg:pb-24" aria-labelledby="solution-title">
        <SolutionsHeroShader />
        <Container className="relative z-10">
          <nav aria-label="Breadcrumb" className="mb-6 md:mb-10">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-white/65">
              <li><Link href="/" className="transition-colors hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
              <li><Link href="/solutions" className="transition-colors hover:text-white">Solutions</Link></li>
              <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
              <li aria-current="page" className="text-orange-300">{solution.title}</li>
            </ol>
          </nav>

          <div className={solution.heroVisual ? styles.heroLayout : "max-w-[960px]"}>
            <Reveal className={solution.heroVisual ? styles.heroCopy : undefined}>
              <h1 id="solution-title" className="font-jakarta text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl md:text-5xl lg:text-[64px]">
                {solution.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg font-medium leading-[1.45] tracking-[-0.015em] text-white/90 sm:text-xl md:text-2xl">{solution.proposition}</p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{solution.audience}</p>
            </Reveal>
            {solution.heroVisual && (
              <figure
                className={styles.heroVisual}
                data-tone={solution.heroVisual.tone ?? "cool"}
                data-treatment={solution.heroVisual.treatment ?? "cutout"}
              >
                <div className={styles.heroVisualFloat}>
                  <Image
                    className={styles.heroVisualImage}
                    src={solution.heroVisual.src}
                    alt={solution.heroVisual.alt}
                    width={solution.heroVisual.width}
                    height={solution.heroVisual.height}
                    sizes="(max-width: 639px) 82vw, (max-width: 1023px) 480px, (max-width: 1279px) 39vw, 520px"
                    preload
                  />
                </div>
              </figure>
            )}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24 lg:py-32" aria-labelledby="overview-title">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <Reveal>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#C2410C]">The operating context</p>
              <h2 id="overview-title" className="mt-4 font-jakarta text-[clamp(2.4rem,5vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.05em]">From problem to operating outcome.</h2>
            </Reveal>
            <SolutionContextJourney key={solution.slug} overview={solution.overview} />
          </div>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24 lg:py-32" aria-labelledby="capabilities-title">
        <Container>
          <Reveal className="mb-12 max-w-4xl">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#C2410C]">Core capabilities</p>
            <h2 id="capabilities-title" className="mt-4 font-jakarta text-[clamp(2.4rem,5vw,5rem)] font-semibold leading-[0.98] tracking-[-0.052em]">The work behind the solution.</h2>
          </Reveal>
          <div className="border-t border-slate-300">
            {solution.capabilities.map((capability, index) => {
              const Icon = CAPABILITY_ICONS[capability.title] ?? Settings;
              return (
              <Reveal key={capability.title} className="grid gap-4 border-b border-slate-300 py-8 sm:grid-cols-[72px_minmax(220px,0.8fr)_minmax(0,1.2fr)] sm:gap-8 lg:py-10">
                <span aria-hidden="true" className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white sm:h-16 sm:w-16 ${CAPABILITY_COLORS[index % CAPABILITY_COLORS.length]}`}>
                  <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.75} />
                </span>
                <h3 className="font-jakarta text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-3xl">{capability.title}</h3>
                <p className="max-w-2xl text-base leading-7 text-slate-600">{capability.description}</p>
              </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <SolutionDeliverySequence key={solution.slug} stages={solution.delivery}>
        {solution.slug === "smart-classrooms-av-systems" && <SmartClassroomTopology />}
      </SolutionDeliverySequence>

      {solution.comparison && (
        <section className="bg-[#F0F3F7] py-20 sm:py-24" aria-labelledby="comparison-title">
          <Container>
            <Reveal>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#C2410C]">Support model comparison</p>
              <h2 id="comparison-title" className="mt-4 max-w-4xl font-jakarta text-[clamp(2.3rem,4.8vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.05em]">Different models solve different maintenance needs.</h2>
              <div className="mt-12 grid border-y border-slate-300 lg:grid-cols-3 lg:divide-x lg:divide-slate-300">
                {solution.comparison.map((item, index) => (
                  <div key={item.title} className={`p-7 lg:p-9 ${item.emphasis ? "bg-[#16134D] text-white" : "border-b border-slate-300 text-slate-950 last:border-b-0 lg:border-b-0"}`}>
                    <span className={`font-mono text-xs font-bold ${item.emphasis ? "text-orange-300" : "text-[#C2410C]"}`}>0{index + 1}</span>
                    <h3 className="mt-8 font-jakarta text-2xl font-semibold tracking-[-0.035em]">{item.title}</h3>
                    <p className={`mt-4 text-sm leading-7 ${item.emphasis ? "text-white/70" : "text-slate-600"}`}>{item.description}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </Container>
        </section>
      )}

      <section className="py-20 sm:py-24 lg:py-32" aria-labelledby="value-title">
        <Container>
          <Reveal className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#C2410C]">Operational value</p>
              <h2 id="value-title" className="mt-4 font-jakarta text-[clamp(2.4rem,5vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.05em]">What changes for the team.</h2>
            </div>
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {solution.value.map((item, index) => (
                <div key={item.title} className="border-t border-slate-300 pt-5">
                  <span className="font-mono text-[11px] font-bold text-[#C2410C]">0{index + 1}</span>
                  <h3 className="mt-5 font-jakarta text-xl font-semibold tracking-[-0.03em]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24 lg:py-32" aria-labelledby="environments-title">
        <Container>
          <Reveal className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#C2410C]">Relevant environments</p>
              <h2 id="environments-title" className="mt-4 font-jakarta text-[clamp(2.3rem,4.5vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.05em]">Where this solution applies.</h2>
              <ul className="mt-10 border-t border-slate-300">
                {solution.useCases.map((useCase, index) => (
                  <li key={useCase} className="flex gap-5 border-b border-slate-300 py-4 text-base text-slate-700"><span className="font-mono text-xs font-bold text-[#C2410C]">{String(index + 1).padStart(2, "0")}</span>{useCase}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#C2410C]">Technical considerations</p>
              <div className="mt-10 divide-y divide-slate-300 border-y border-slate-300">
                {solution.technicalConsiderations.map((item) => (
                  <div key={item.label} className="py-6">
                    <h3 className="font-jakarta text-lg font-semibold tracking-[-0.025em]">{item.label}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-20 sm:py-24 lg:py-32" aria-labelledby="faq-title">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <Reveal>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#C2410C]">Common questions</p>
              <h2 id="faq-title" className="mt-4 font-jakarta text-[clamp(2.4rem,5vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.05em]">What teams ask us.</h2>
              {related.length > 0 && (
                <div className="mt-10">
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Related services and solutions</h3>
                  <ul className="mt-4 border-t border-slate-300">
                    {related.map((item) => (
                      <li key={item.href} className="border-b border-slate-300">
                        <Link href={item.href} className="group flex min-h-12 items-center justify-between gap-4 py-3 font-jakarta text-base font-semibold tracking-[-0.02em] text-slate-900 transition-colors duration-200 hover:text-[#C2410C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#EA580C]">
                          {item.title}
                          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-[#C2410C]" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Reveal>
            <Reveal delay={0.06}>
              <dl className="border-t border-slate-300">
                {solution.faqs.map((faq) => (
                  <div key={faq.question} className="border-b border-slate-300 py-7">
                    <dt className="font-jakarta text-xl font-semibold leading-snug tracking-[-0.03em]">{faq.question}</dt>
                    <dd className="mt-3 text-base leading-7 text-slate-600">{faq.answer}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </Container>
      </section>

    </div>
  );
}
