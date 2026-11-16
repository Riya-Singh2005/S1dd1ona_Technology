"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Copy, ExternalLink, LoaderCircle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { adminButtonClasses } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

interface CopyLinkedInLinkButtonProps {
  url?: string;
  jobTitle: string;
  disabledReason?: string;
  variant?: "table" | "panel";
}

type CopyState = "idle" | "copying" | "copied";

export function CopyLinkedInLinkButton({
  url,
  jobTitle,
  disabledReason,
  variant = "panel",
}: CopyLinkedInLinkButtonProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [manualCopyOpen, setManualCopyOpen] = useState(false);
  const resetTimer = useRef<number | null>(null);
  const manualUrlId = useId();

  useEffect(
    () => () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    },
    []
  );

  async function copyLink() {
    if (!url || copyState === "copying") return;

    setCopyState("copying");
    try {
      if (!window.isSecureContext || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable");
      }

      await navigator.clipboard.writeText(url);
      setCopyState("copied");
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopyState("idle"), 4000);
    } catch {
      setCopyState("idle");
      setManualCopyOpen(true);
    }
  }

  const isDisabled = !url || copyState === "copying";
  const label =
    copyState === "copying"
      ? "Copying"
      : copyState === "copied"
        ? "Copied"
        : "Copy LinkedIn link";

  return (
    <>
      <div className={cn("inline-flex", variant === "table" && "flex-col items-end gap-1")}>
        <button
          type="button"
          onClick={copyLink}
          disabled={isDisabled}
          aria-label={
            !url
              ? `LinkedIn application link unavailable for ${jobTitle}`
              : `${label} for ${jobTitle}`
          }
          aria-describedby={!url && disabledReason ? manualUrlId : undefined}
          aria-busy={copyState === "copying" || undefined}
          className={cn(
            variant === "panel"
              ? adminButtonClasses.outline
              : "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[12.5px] font-semibold text-slate-700 transition-[border-color,background-color,color] duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:opacity-70"
          )}
        >
          {copyState === "copying" ? (
            <LoaderCircle
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : copyState === "copied" ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {label}
        </button>

        <span className="sr-only" role="status" aria-live="polite">
          {copyState === "copied" ? `LinkedIn application link copied for ${jobTitle}.` : ""}
        </span>

        {!url && disabledReason && variant === "table" && (
          <span
            id={manualUrlId}
            className="max-w-40 text-right text-[11.5px] leading-4 text-slate-500"
          >
            {disabledReason}
          </span>
        )}
      </div>

      {url && (
        <Dialog
          open={manualCopyOpen}
          onOpenChange={setManualCopyOpen}
          title="Copy the LinkedIn link"
          eyebrow="Manual copy"
          description="Your browser could not copy automatically. Select the complete URL and press Ctrl+C or Command+C."
          surface="admin"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor={manualUrlId}
                className="mb-1.5 block text-[13px] font-semibold text-slate-800"
              >
                LinkedIn application URL
              </label>
              <input
                id={manualUrlId}
                value={url}
                readOnly
                autoFocus
                spellCheck={false}
                onFocus={(event) => event.currentTarget.select()}
                onClick={(event) => event.currentTarget.select()}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 font-mono text-base text-slate-900 selection:bg-orange-200 focus:border-[#EA580C] focus:outline-none focus:shadow-[0_0_0_3px_rgba(234,88,12,0.14)] sm:text-[13px]"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => setManualCopyOpen(false)}
                className={cn(adminButtonClasses.primary, "sm:flex-1")}
              >
                Done
              </button>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className={cn(adminButtonClasses.outline, "sm:flex-1")}
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Open application page
              </a>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
