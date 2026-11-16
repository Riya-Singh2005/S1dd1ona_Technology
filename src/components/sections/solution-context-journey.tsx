"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, CircleCheck, Route, TriangleAlert } from "lucide-react";
import type { SolutionExperienceItem } from "@/lib/solutions-data";
import styles from "./solution-detail-experience.module.css";

const STAGES = [
  { key: "problem", Icon: TriangleAlert, color: "bg-[#EA780C]", label: "Problem" },
  { key: "approach", Icon: Route, color: "bg-[#087AC1]", label: "Approach" },
  { key: "outcome", Icon: CircleCheck, color: "bg-[#0D9488]", label: "Outcome" },
] as const;

export function SolutionContextJourney({ overview }: { overview: SolutionExperienceItem["overview"] }) {
  const root = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!root.current || !("IntersectionObserver" in window)) return;
    // Discrete step changes only: no per-frame scroll state or animation loop.
    const observer = new IntersectionObserver((entries) => {
      const entering = entries.filter((entry) => entry.isIntersecting);
      if (!entering.length) return;
      const nearest = entering.sort((a, b) =>
        Math.abs(a.boundingClientRect.top - window.innerHeight * 0.4) -
        Math.abs(b.boundingClientRect.top - window.innerHeight * 0.4)
      )[0];
      setActive(Number((nearest.target as HTMLElement).dataset.step));
    }, { rootMargin: "-35% 0px -50% 0px", threshold: 0 });
    root.current.querySelectorAll("[data-step]").forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  return (
    <ol ref={root} className="border-y border-slate-300" aria-label="Problem to approach to outcome">
      {STAGES.map(({ key, Icon, color, label }, index) => (
        <li key={key} data-step={index} data-active={active === index} className={`${styles.contextRow} grid grid-cols-[48px_minmax(0,1fr)] gap-5 border-b border-slate-300 py-7 last:border-b-0 sm:gap-8`}>
          {index < STAGES.length - 1 && (
            <span className={styles.connector} aria-hidden="true">
              <span className={styles.trace} style={{ transform: `scaleY(${active > index ? 1 : 0})` }} />
              <ChevronDown className={styles.pathArrow} strokeWidth={1.75} />
            </span>
          )}
          <button type="button" aria-label={`Highlight ${label.toLowerCase()} step`} aria-pressed={active === index} onClick={() => setActive(index)} className={`${styles.contextIcon} relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600 ${color}`}>
            <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={1.75} />
          </button>
          <div className="relative min-w-0">
            <h3 className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">{label}</h3>
            <p className="text-base leading-8 text-slate-600 sm:text-lg">{overview[key]}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
