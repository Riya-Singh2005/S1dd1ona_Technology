"use client";

import { useReducedMotion } from "framer-motion";
import { MeshGradient } from "@paper-design/shaders-react";

interface BackgroundShaderProps {
  overlayClassName?: string;
}

export function BackgroundShader({
  overlayClassName = "bg-[#07101f]/45",
}: BackgroundShaderProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <MeshGradient
        style={{ height: "100%", width: "100%" }}
        distortion={0.8}
        swirl={0.1}
        offsetX={0}
        offsetY={0}
        scale={1}
        rotation={0}
        speed={reduceMotion ? 0 : 0.28}
        colors={["hsl(216, 90%, 27%)", "hsl(243, 68%, 36%)", "hsl(205, 91%, 64%)", "hsl(211, 61%, 57%)"]}
      />
      {overlayClassName ? <div className={`absolute inset-0 ${overlayClassName}`} /> : null}
    </div>
  );
}

export default BackgroundShader;
