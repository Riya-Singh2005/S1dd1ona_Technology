"use client";

import React from "react";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: React.ReactNode;
  repeat?: number;
  duration?: number;
}

/**
 * Enterprise Marquee Primitive
 * Unconditionally smooth, continuous 60fps horizontal scrolling with self-contained
 * scoped keyframes so it is NEVER frozen by OS or browser accessibility flags.
 */
export function Marquee({
  className = "",
  reverse = false,
  pauseOnHover = true,
  children,
  repeat = 4,
  duration = 26,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      style={
        {
          "--marquee-duration": `${duration}s`,
          "--marquee-direction": reverse ? "reverse" : "normal",
        } as React.CSSProperties
      }
      className={`siddiona-marquee-container group/marquee relative flex overflow-hidden w-full ${className}`}
    >
      <style>{`
        @keyframes siddionaMarqueeScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-100%, 0, 0);
          }
        }
        .siddiona-marquee-track {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: var(--marquee-gap, 1.5rem);
          padding-right: var(--marquee-gap, 1.5rem);
          animation: siddionaMarqueeScroll var(--marquee-duration, 36s) linear infinite !important;
          animation-direction: var(--marquee-direction, normal) !important;
          will-change: transform;
        }
        ${
          pauseOnHover
            ? `
        .siddiona-marquee-container:hover .siddiona-marquee-track {
          animation-play-state: paused !important;
        }
        `
            : ""
        }
      `}</style>

      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className="siddiona-marquee-track"
          aria-hidden={i > 0}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

export default Marquee;
