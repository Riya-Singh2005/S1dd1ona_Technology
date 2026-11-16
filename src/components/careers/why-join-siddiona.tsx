"use client";

import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import styles from "./why-join-siddiona.module.css";

const REASONS = [
  { title: "Career Growth", description: "Grow through meaningful work, increasing responsibility, and opportunities to develop your professional path." },
  { title: "Innovation & Technology", description: "Work with modern technologies and practical IT solutions that address real business needs." },
  { title: "Continuous Learning", description: "Build technical judgement, business understanding, and communication skills through hands-on experience." },
  { title: "Collaborative Culture", description: "Share ideas and exchange knowledge with colleagues across technology and business disciplines." },
  { title: "Real-World Projects", description: "Work through real client requirements, operational constraints, and practical technology delivery decisions." },
  { title: "Professional Development", description: "Strengthen your expertise through challenging assignments, new responsibilities, and unfamiliar technical problems." },
  { title: "Recognition & Rewards", description: "Make your contribution visible through quality work and the outcomes you help deliver." },
  { title: "Diverse Exposure", description: "Gain exposure to infrastructure, networking, software, security, cloud, and enterprise technology systems." },
  { title: "Dynamic Work Environment", description: "Bring initiative, take ownership of tasks, and improve how practical work gets delivered." },
  { title: "Long-Term Career Opportunities", description: "Build practical expertise and professional habits that support your longer-term career with Siddiona." },
] as const;

export function WhyJoinSiddiona() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!section || reduceMotion.matches || typeof IntersectionObserver === "undefined" || typeof section.animate !== "function") return;
    const heading = section.querySelector<HTMLElement>("[data-join-heading]");
    if (!heading) return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      if (reduceMotion.matches) return;
      const items = Array.from(section.querySelectorAll<HTMLElement>("li"));
      const twoColumns = window.matchMedia("(min-width: 768px)").matches;
      try {
        [heading, ...items].forEach((element, index) => {
          const row = twoColumns ? (index - 1) % 5 : index - 1;
          animations.push(element.animate(
            [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }],
            { duration: 250, delay: index === 0 ? 0 : 250 + row * 40, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "backwards" },
          ));
        });
      } catch {
        // Enhancement failure must never leave readable content hidden.
        animations.forEach((animation) => animation.cancel());
      }
    }, { threshold: 0.25 });
    observer.observe(heading);
    const cancelMotion = () => {
      if (reduceMotion.matches) {
        observer.disconnect();
        animations.forEach((animation) => animation.cancel());
      }
    };
    reduceMotion.addEventListener("change", cancelMotion);
    return () => {
      observer.disconnect();
      reduceMotion.removeEventListener("change", cancelMotion);
      animations.forEach((animation) => animation.cancel());
    };
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="working-here-heading" className={styles.section}>
      <Container size="default">
        <div data-join-heading>
          <SectionHeading id="working-here-heading" align="center" title={<span>WHY JOIN SIDDIONA</span>} />
        </div>
        <ol className={styles.grid} aria-label="Ten reasons to join Siddiona">
          {REASONS.map(({ title, description }, index) => (
            <li key={title} className={styles.item}>
              <span aria-hidden="true" className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.description}>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
