import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DarkGradientBgProps {
  children?: ReactNode;
  className?: string;
}

const streaks: readonly CSSProperties[] = [
  {
    maskImage:
      "linear-gradient(90deg, transparent 0%, #000 20%, transparent 36%, #000 55%, transparent 67%, #000 78%, transparent 97%)",
  },
  {
    maskImage:
      "linear-gradient(90deg, transparent 11%, #000 25%, rgba(0,0,0,.55) 41%, transparent 67%, #000 78%, transparent 97%)",
  },
  {
    maskImage:
      "linear-gradient(90deg, transparent 9%, #000 20%, rgba(0,0,0,.55) 28%, rgba(0,0,0,.42) 40%, #000 48%, transparent 78%, #000 88%, transparent 97%)",
  },
  {
    maskImage:
      "linear-gradient(90deg, transparent 0%, #000 17%, rgba(0,0,0,.55) 26%, #000 35%, transparent 47%, transparent 69%, #000 79%, transparent 97%)",
  },
] as const;

export function DarkGradientBg({ children, className }: DarkGradientBgProps) {
  return (
    <div className={cn("relative w-full overflow-hidden bg-black", className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(100% 100% at 0% 0%, rgb(46,46,46) 0%, rgb(0,0,0) 100%)",
            maskImage:
              "radial-gradient(125% 100% at 0% 0%, #000 0%, rgba(0,0,0,.224) 88.2883%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(125% 100% at 0% 0%, #000 0%, rgba(0,0,0,.224) 88.2883%, transparent 100%)",
          }}
        >
          {streaks.map((style, index) => (
            <div
              key={index}
              className="absolute -inset-x-[18%] -inset-y-[10%] opacity-[0.16]"
              style={{
                background:
                  "linear-gradient(rgb(0,207,255) 0%, rgba(0,207,255,0) 100%)",
                transform: "skewX(45deg)",
                WebkitMaskImage: style.maskImage,
                ...style,
              }}
            />
          ))}
        </div>

        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,.5) 1px, transparent 0)",
            backgroundSize: "20px 20px",
            maskImage: "linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(51,65,85,0.2),transparent_58%)]" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
