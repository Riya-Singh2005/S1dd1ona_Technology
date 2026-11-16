"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  align?: "left" | "center";
  theme?: "light" | "dark";
  id?: string;
  className?: string;
  children?: React.ReactNode;
}

const titleContainerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
};

const titleWordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    filter: "blur(3px)",
    color: "#EA580C",
  },
  visible: (finalColor: string) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    color: finalColor,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

/**
 * Standardized Section Heading Component for Siddiona Technologies
 * Unifies typography (Plus Jakarta Sans display title, Inter description, monospace eyebrow),
 * color tokens (Deep Obsidian Ink #0F172A on light / #FFFFFF on dark),
 * and hydration-safe editorial word text animation across all homepage sections.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  theme = "light",
  id,
  className,
  children,
}: SectionHeadingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const words = typeof title === "string" ? title.split(" ") : null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "section-heading-reveal w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        align === "center" ? "text-center mx-auto max-w-3xl" : "text-left max-w-4xl",
        isVisible || reduceMotion
          ? "opacity-100 translate-y-0 filter-none"
          : "opacity-0 translate-y-3.5 blur-[2px]",
        className
      )}
    >
      {/* Eyebrow Label with Tangelo Orange Indicator */}
      {eyebrow && (
        <div
          className={cn(
            "flex items-center gap-2.5 mb-3 sm:mb-4",
            align === "center" ? "justify-center" : "justify-start"
          )}
        >
          <span
            className="w-2.5 h-1 bg-[#EA580C] rounded-full shrink-0"
            aria-hidden="true"
          />
          <span
            className={cn(
              "text-xs sm:text-sm font-mono font-bold uppercase tracking-[0.14em]",
              theme === "dark" ? "text-orange-400" : "text-[#EA580C]"
            )}
          >
            {eyebrow}
          </span>
        </div>
      )}

      {/* Main bold display title with a restrained Tangelo-to-ink word reveal. */}
      <motion.h2
        id={id}
        initial="hidden"
        animate={isVisible || reduceMotion ? "visible" : "hidden"}
        variants={titleContainerVariants}
        className={cn(
          "font-heading font-normal uppercase tracking-[-0.025em] text-balance leading-[0.96]",
          "text-[34px] sm:text-[38px] md:text-[42px] lg:text-[44px]",
          theme === "dark" ? "text-white" : "text-[#0F172A]"
        )}
      >
        {words ? (
          words.map((word, index) => (
            <React.Fragment key={`${word}-${index}`}>
              <motion.span
                variants={titleWordVariants}
                custom={theme === "dark" ? "#FFFFFF" : "#0F172A"}
                className="inline-block section-heading-word"
              >
                {word}
              </motion.span>
              {index < words.length - 1 && " "}
            </React.Fragment>
          ))
        ) : (
          title
        )}
      </motion.h2>

      {/* Supporting Narrative Description in Inter */}
      {description && (
        <p
          className={cn(
            "text-base sm:text-[17.5px] lg:text-[18.5px] leading-[1.65] font-normal text-pretty mt-3.5 sm:mt-4",
            theme === "dark" ? "text-slate-300" : "text-slate-700",
            align === "center" ? "mx-auto max-w-2xl" : "max-w-3xl"
          )}
        >
          {description}
        </p>
      )}

      {/* Optional Injected Elements (e.g. status pills, filters, action buttons) */}
      {children && <div className="mt-4 sm:mt-5">{children}</div>}
    </div>
  );
}

export default SectionHeading;
