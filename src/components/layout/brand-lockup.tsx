import type { MouseEventHandler } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLockupProps {
  isLight: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  preload?: boolean;
}

export function BrandLockup({
  isLight,
  className,
  onClick,
  preload = false,
}: BrandLockupProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 sm:gap-2.5",
        isLight ? "focus-visible:ring-offset-white" : "focus-visible:ring-offset-[#0F172A]",
        className
      )}
      aria-label="Siddiona Technologies Home"
    >
      <Image
        src={isLight
          ? "/brand/Siddiona-emblem-icon.png"
          : "/brand/Siddiona-emblem-icon-white.png"}
        alt="Siddiona Technologies Logo"
        width={500}
        height={520}
        className="h-[46px] w-auto shrink-0 object-contain sm:h-[50px] lg:h-[54px] xl:h-[58px]"
        priority={preload}
        unoptimized
      />

      <span className="flex min-w-0 flex-col justify-center">
        <span className="flex items-baseline whitespace-nowrap font-jakarta text-[13px] font-bold uppercase leading-tight tracking-tight sm:text-sm lg:text-[15px]">
          <span className={cn("transition-colors duration-300", isLight ? "text-[#190856]" : "text-white")}>
            Siddiona&nbsp;
          </span>
          <span className="text-[#EA580C]">Technologies</span>
        </span>
        <span
          className={cn(
            "mt-0.5 whitespace-nowrap font-sans text-[10px] font-semibold leading-none tracking-normal transition-colors duration-300 sm:text-[11px] lg:text-[11.5px]",
            isLight ? "text-[#64748B]" : "text-[#E2E8F0]"
          )}
        >
          Unique Ideas. More Values.
        </span>
      </span>
    </Link>
  );
}
