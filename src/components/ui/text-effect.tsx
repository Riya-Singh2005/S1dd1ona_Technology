"use client";

import React, { useSyncExternalStore } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export type TextEffectPer = "word" | "char" | "line";

export interface TextEffectProps {
  id?: string;
  children?: string;
  words?: string[];
  separator?: React.ReactNode;
  per?: TextEffectPer;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  itemClassName?: string;
  delay?: number;
  staggerDuration?: number;
  duration?: number;
  trigger?: boolean;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  onAnimationComplete?: () => void;
}

const MOTION_ELEMENTS = {
  span: motion.span,
  div: motion.div,
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
} as const;

const emptySubscribe = () => () => {};

/**
 * Enterprise-grade, accessible TextEffect component based on Framer Motion.
 * Supports per-word, per-character, or per-line editorial reveals with blur and vertical drift.
 * Completely hydration-safe: SSR and first client render produce 100% identical DOM/styles.
 * Runs the smooth 21st.dev-inspired editorial animation reliably across all operating systems.
 */
export function TextEffect({
  id,
  children,
  words,
  separator,
  per = "word",
  as: Component = "span",
  className = "",
  itemClassName = "hero-eyebrow-word",
  delay = 0.15,
  staggerDuration = 0.12,
  duration = 0.5,
  trigger = true,
  variants,
  onAnimationComplete,
}: TextEffectProps) {
  // Hydration-safe mount tracking using React 18/19 useSyncExternalStore
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const reduceMotion = useReducedMotion();

  // Split content deterministically based on words or children mode
  const segments: string[] = words
    ? words
    : children
    ? per === "word"
      ? children.split(" ")
      : per === "char"
      ? children.split("")
      : [children]
    : [];

  // Base deterministic variants — 100% identical on SSR and first client hydration
  const defaultContainerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerDuration,
      },
    },
  };

  const defaultItemVariants: Variants = {
    hidden: {
      opacity: 0,
      transform: "translateY(10px)",
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      transform: "translateY(0px)",
      filter: "blur(0px)",
      transition: {
        duration: duration,
        ease: [0.23, 1, 0.32, 1],
      },
    },
  };

  const containerVariants = variants?.container || defaultContainerVariants;
  const itemVariants = variants?.item || defaultItemVariants;

  const MotionComponent =
    MOTION_ELEMENTS[Component as keyof typeof MOTION_ELEMENTS] || motion.span;

  // Animation activates smoothly AFTER mount and when trigger is active
  const isAnimateVisible = reduceMotion || (isMounted && trigger);

  return (
    <MotionComponent
      id={id}
      className={className}
      initial="hidden"
      animate={isAnimateVisible ? "visible" : "hidden"}
      variants={containerVariants}
      onAnimationComplete={onAnimationComplete}
    >
      {segments.map((segment, index) => (
        <React.Fragment key={`${segment}-${index}`}>
          <motion.span
            variants={itemVariants}
            className={`inline-block ${itemClassName}`}
          >
            {segment}
          </motion.span>
          {index < segments.length - 1 && (
            separator !== undefined ? (
              <span className="inline-flex items-center justify-center hero-eyebrow-sep" aria-hidden="true">
                {separator}
              </span>
            ) : (
              per === "word" && "\u00A0"
            )
          )}
        </React.Fragment>
      ))}
    </MotionComponent>
  );
}
