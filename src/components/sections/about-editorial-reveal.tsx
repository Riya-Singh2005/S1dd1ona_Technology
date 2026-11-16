"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

interface AboutEditorialRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AboutEditorialReveal({ children, className, delay = 0 }: AboutEditorialRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const animation = gsap.fromTo(
      element,
      { autoAlpha: 0, y: 22, filter: "blur(5px)" },
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.72,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 88%", once: true },
      },
    );

    return () => {
      animation.revert();
    };
  }, [delay]);

  return <div ref={elementRef} className={cn(className)}>{children}</div>;
}
