"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { InPageLink } from "@/components/ui/in-page-link";
import type { LegalSection } from "@/lib/legal-content";

export interface LegalTocProps {
  sections: LegalSection[];
  className?: string;
}

/**
 * Sticky table of contents for long legal documents.
 *
 * Tracks which clause is currently in view so a reader always knows where they
 * are in the document. Links scroll without changing the URL after hydration;
 * their native anchor fallback still works without JavaScript.
 */
export function LegalToc({ sections, className }: LegalTocProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    // Clause tops are read directly rather than observed: a clause can be taller
    // or shorter than the viewport, and scroll position answers "which clause am
    // I reading" without depending on how a section crosses an observer band.
    const HEADER_OFFSET = 160;

    let frame = 0;

    const update = () => {
      frame = 0;

      const atPageEnd =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

      if (atPageEnd) {
        setActiveId(elements[elements.length - 1].id);
        return;
      }

      let current = elements[0].id;
      for (const element of elements) {
        if (element.getBoundingClientRect().top - HEADER_OFFSET > 0) break;
        current = element.id;
      }

      setActiveId(current);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sections]);

  return (
    <nav aria-label="Document sections" className={cn("w-full", className)}>
      <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#EA580C]">
        On this page
      </p>
      <ul className="mt-4 flex flex-col gap-0.5 border-l border-slate-200">
        {sections.map((section) => {
          const isActive = section.id === activeId;

          return (
            <li key={section.id}>
              <InPageLink
                targetId={section.id}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l-2 py-1.5 pl-4 text-sm leading-snug transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2",
                  isActive
                    ? "border-[#EA580C] font-semibold text-[#0F172A]"
                    : "border-transparent font-medium text-slate-600 hover:border-slate-300 hover:text-[#0F172A]"
                )}
              >
                {section.title}
              </InPageLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default LegalToc;
