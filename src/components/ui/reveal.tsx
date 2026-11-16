"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { motion, useAnimationControls, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export type RevealElement = "div" | "figure" | "li" | "section";

export interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait before this element starts, used for staggered groups. */
  delay?: number;
  /** Vertical drift in pixels. Kept short so nothing reads as a slide-in. */
  distance?: number;
  as?: RevealElement;
}

const MOTION_ELEMENTS = {
  div: motion.div,
  figure: motion.figure,
  li: motion.li,
  section: motion.section,
} as const;

/**
 * Shared editorial entrance wrapper for Siddiona sections.
 *
 * Animates opacity and a short vertical drift once the element enters the viewport,
 * then stays put. Only the wrapper is a Client Component, so Server Component
 * children keep rendering on the server.
 *
 * Server and initial client output are visible. The hidden entrance state is applied
 * only when a working observer sees the element, with a timeout restoring visibility
 * if the animation cannot complete.
 *
 * Reduced-motion users receive the completed, fully visible state without displacement.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = 14,
  as = "div",
}: RevealProps) {
  const MotionComponent = MOTION_ELEMENTS[as];
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const setElement = useCallback((element: HTMLElement | null) => { ref.current = element; }, []);
  const controls = useAnimationControls();

  useEffect(() => {
    const element = ref.current;
    if (!element || reduceMotion || !window.IntersectionObserver) return;
    let fallback: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      fallback = setTimeout(() => controls.set("visible"), (delay + 0.8) * 1000);
      try {
        controls.set("hidden");
        void controls.start("visible").catch(() => controls.set("visible"));
      } catch {
        controls.set("visible");
      }
    }, { threshold: 0.25, rootMargin: "0px 0px -40px 0px" });
    observer.observe(element);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
      controls.stop();
    };
  }, [controls, delay, reduceMotion]);

  const variants: Variants = {
    hidden: { opacity: 0, transform: `translate3d(0, ${distance}px, 0)` },
    visible: {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
      transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <MotionComponent
      ref={setElement}
      className={cn("reveal-item", className)}
      initial={false}
      animate={controls}
      variants={variants}
    >
      {children}
    </MotionComponent>
  );
}

export default Reveal;
