import React from "react";
import { cn } from "@/lib/utils";

export interface BackgroundGradientGlowProps {
  className?: string;
  children?: React.ReactNode;
  variant?: "neutral" | "pastel";
}

/** Neutral enterprise surface with architectural gridlines. */
export const PREMIUM_SECTION_SURFACE =
  "linear-gradient(rgba(15,23,42,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.02) 1px, transparent 1px), #F7F8FA";

export const PASTEL_SECTION_SURFACE =
  "linear-gradient(135deg, #FAF7F2 0%, #F5EFE6 25%, #F3EEF8 50%, #EDE8F7 75%, #E8EBF8 100%)";

export function BackgroundGradientGlow({
  className,
  children,
  variant = "neutral",
}: BackgroundGradientGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 pointer-events-none select-none z-0 overflow-hidden",
        className
      )}
    >
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: variant === "pastel" ? PASTEL_SECTION_SURFACE : PREMIUM_SECTION_SURFACE,
          backgroundSize: variant === "pastel" ? "cover" : "32px 32px",
        }}
      />
      {children}
    </div>
  );
}

export default BackgroundGradientGlow;
