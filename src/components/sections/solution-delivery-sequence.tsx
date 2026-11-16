"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/ui/container";
import type { SolutionDeliveryStage } from "@/lib/solutions-data";
import styles from "./solution-delivery-sequence.module.css";

interface SolutionDeliverySequenceProps {
  stages: SolutionDeliveryStage[];
  children?: ReactNode;
}

/** Desktop scroll narrative; initial HTML and non-pinned modes expose all copy. */
export function SolutionDeliverySequence({ stages, children }: SolutionDeliverySequenceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || stages.length < 2) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)", () => {
      const composition = stage.querySelector<HTMLElement>(`.${styles.composition}`);
      if (!composition) return;
      let dispose: (() => void) | undefined;
      let frame = 0;
      let stopped = false;
      let measured = "";
      const dimensions = () => `${window.innerWidth}:${window.innerHeight}:${composition.offsetWidth}:${composition.offsetHeight}`;
      const initialize = () => {
      dispose?.();
      dispose = undefined;
      // Never trap a composition that cannot fit the available viewport.
      section.dataset.enhanced = "true";
      // Measure layout, not scroll overflow: the animated number can extend the
      // container's scrollHeight during refresh/resize and falsely disable pinning.
      const fits = () => {
        const stageStyle = getComputedStyle(stage);
        return composition.offsetHeight + parseFloat(stageStyle.paddingTop) + parseFloat(stageStyle.paddingBottom) <= window.innerHeight;
      };
      // The six-step migration sequence needs less whitespace on short desktops,
      // not smaller text or a permanently disabled animation.
      if (!fits() && stages.length === 6) section.dataset.compact = "true";
      if (!fits()) {
        delete section.dataset.enhanced;
        delete section.dataset.compact;
        return;
      }
      const rows = Array.from(section.querySelectorAll<HTMLLIElement>("li"));
      const numbers = Array.from(section.querySelectorAll<HTMLElement>("[data-delivery-number]"));
      const numberRail = section.querySelector<HTMLElement>("[data-number-rail]");
      let current = -1;
      const showStep = (next: number) => {
        if (next === current) return;
        current = next;
        rows.forEach((row, index) => { row.dataset.active = String(index === next); });
        numbers.forEach((number, index) => { number.dataset.active = String(index === next); });
        if (numberRail) {
          numberRail.style.transform = `translateY(${rows[next].offsetTop - rows[0].offsetTop}px)`;
        }
      };
      // One immediate scroll clock; transitions retarget without queued tweens.
      const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${stages.length * Math.max(260, window.innerHeight * 0.45)}`,
          pin: stage,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        onUpdate: (self) => {
          showStep(Math.min(stages.length - 1, Math.floor(self.progress * stages.length)));
        },
        onRefresh: (self) => {
          current = -1;
          showStep(Math.min(stages.length - 1, Math.floor(self.progress * stages.length)));
        },
      });
      showStep(Math.min(stages.length - 1, Math.floor(trigger.progress * stages.length)));
      dispose = () => {
        trigger.kill();
        if (numberRail) {
          numberRail.style.removeProperty("transform");
        }
        rows.forEach((row, index) => { row.dataset.active = String(index === 0); });
        numbers.forEach((number, index) => { number.dataset.active = String(index === 0); });
        delete section.dataset.enhanced;
        delete section.dataset.compact;
      };
      };
      const recalculate = () => {
        if (stopped || frame) return;
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          if (stopped) return;
          try {
            initialize();
          } catch {
            dispose?.();
            dispose = undefined;
            delete section.dataset.enhanced;
            delete section.dataset.compact;
          }
          measured = dimensions();
        });
      };
      // CSS/font/layout readiness, not a timer or a DevTools resize, drives setup.
      const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => {
        if (dimensions() !== measured) recalculate();
      });
      observer?.observe(composition);
      window.addEventListener("resize", recalculate);
      window.addEventListener("load", recalculate);
      window.addEventListener("siddiona-hero-reveal", recalculate);
      document.fonts?.addEventListener("loadingdone", recalculate);
      void document.fonts?.ready.then(() => { if (!stopped) recalculate(); });
      recalculate();
      return () => {
        stopped = true;
        window.cancelAnimationFrame(frame);
        observer?.disconnect();
        window.removeEventListener("resize", recalculate);
        window.removeEventListener("load", recalculate);
        window.removeEventListener("siddiona-hero-reveal", recalculate);
        document.fonts?.removeEventListener("loadingdone", recalculate);
        dispose?.();
        delete section.dataset.enhanced;
        delete section.dataset.compact;
      };
    });
    return () => media.revert();
  }, [stages]);

  if (stages.length === 0) return null;

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="delivery-title">
      <div ref={stageRef} className={styles.stage}>
        <Container size="wide">
          <div className={styles.composition}>
            <div className={styles.introduction}>
              <p className={styles.eyebrow}>Delivery sequence</p>
              <h2 id="delivery-title" className={styles.heading}>A controlled path into operation.</h2>
              <p className={styles.summary}>A step-by-step delivery process, shaped around your environment and the people who will operate it.</p>
            </div>
              <div className={styles.number} data-number-rail aria-hidden="true">
                {stages.map((_, index) => (
                  <span key={index} data-delivery-number data-active={index === 0}>{String(index + 1).padStart(2, "0")}</span>
                ))}
              </div>
            <ol className={styles.list}>
              {stages.map((step, index) => (
                <li key={`${step.title}-${index}`} className={styles.row} data-active={index === 0}>
                  <span className={styles.index} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className={styles.title}>{step.title}</h3>
                  <p className={styles.description}>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </div>
      {children && <Container><div className={styles.supporting}>{children}</div></Container>}
    </section>
  );
}
