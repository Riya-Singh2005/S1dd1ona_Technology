import React from "react";

interface BorderBeamProps {
  className?: string;
  duration?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

/**
 * Enterprise BorderBeam
 * Subtle, restrained travelling illumination along the container perimeter.
 * Adheres to Siddiona Enterprise Editorial design standards (no harsh neon/rainbow).
 */
export function BorderBeam({
  className = "",
  duration = 14,
  borderWidth = 1.5,
  colorFrom = "#ea580c",
  colorTo = "#16134d",
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      style={
        {
          "--duration": `${duration}s`,
          padding: `${borderWidth}px`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden ${className}`}
    >
      <div
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 55deg, ${colorFrom} 105deg, ${colorTo} 145deg, transparent 185deg, transparent 360deg)`,
          animationDelay: `-${delay}s`,
        }}
        className="absolute inset-[-150%] animate-border-beam-spin will-change-transform"
      />
    </div>
  );
}
