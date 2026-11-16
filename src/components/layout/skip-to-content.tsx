import { cn } from "@/lib/utils";
import { InPageLink } from "@/components/ui/in-page-link";

export interface SkipToContentProps {
  targetId?: string;
  className?: string;
}

/**
 * Accessible skip-link allowing screen-reader and keyboard users
 * to jump directly to main content.
 */
export function SkipToContent({
  targetId = "main-content",
  className,
}: SkipToContentProps) {
  return (
    <InPageLink
      targetId={targetId}
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50",
        "px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-md shadow-lg",
        "outline-none ring-2 ring-white ring-offset-2 ring-offset-slate-950",
        className
      )}
    >
      Skip to main content
    </InPageLink>
  );
}
