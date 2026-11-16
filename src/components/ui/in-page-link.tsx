"use client";

import type { ComponentProps } from "react";

type InPageLinkProps = Omit<ComponentProps<"a">, "href" | "onClick"> & {
  targetId: string;
  focusId?: string;
};

/** Scroll within the current document without adding a fragment to the URL. */
export function InPageLink({ targetId, focusId, ...props }: InPageLinkProps) {
  return (
    <a
      {...props}
      href={`#${targetId}`}
      onClick={(event) => {
        event.preventDefault();
        const target = document.getElementById(targetId);
        if (!target) return;

        (document.getElementById(focusId ?? targetId) ?? target).focus({ preventScroll: true });
        target.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      }}
    />
  );
}
