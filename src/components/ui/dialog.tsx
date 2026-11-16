"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./dialog.module.css";

/**
 * Modal dialog built on the native `<dialog>` element.
 *
 * `showModal()` hands us the top layer, a real focus trap, `inert`
 * background content, Escape handling and correct accessibility
 * semantics from the platform. Those are precisely the parts custom
 * modal implementations get wrong, so none of them are reimplemented
 * here.
 *
 * What this component adds is the exit animation. `close()` removes the
 * element from the top layer immediately, so closing has to be deferred
 * until the transition has run.
 *
 * `transform-origin` stays centred. Popovers and dropdowns should grow
 * from their trigger; a modal is a new surface rather than an expansion
 * of the thing that opened it, so centre is correct here.
 */

const EXIT_DURATION_MS = 180;

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  eyebrow?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Widens the panel for multi-field forms. */
  size?: "default" | "wide";
  surface?: "default" | "admin";
  /** Suppresses backdrop and Escape dismissal, e.g. mid-submission. */
  dismissible?: boolean;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  eyebrow,
  description,
  children,
  size = "default",
  surface = "default",
  dismissible = true,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<"open" | "closed">("closed");

  const titleId = useId();
  const descriptionId = useId();

  const beginClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || !dialog.open) return;

    setState("closed");
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      dialog.close();
      onOpenChange(false);
    }, EXIT_DURATION_MS);
  }, [onOpenChange]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      if (!dialog.open) {
        dialog.showModal();
        // The element must paint in its closed state before the
        // transition is allowed to start, or there is nothing to
        // transition from and the panel simply appears.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setState("open"));
        });
      } else {
        setState("open");
      }
      return;
    }

    if (dialog.open) {
      beginClose();
    }
  }, [open, beginClose]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  // Escape fires `cancel`. Intercept it so the close runs through the
  // same animated path as every other dismissal.
  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (dismissible) beginClose();
  };

  /**
   * Backdrop dismissal.
   *
   * A click on a native dialog's backdrop targets the dialog element
   * itself, so comparing the target is enough. The check also means a
   * drag that starts inside the panel and releases outside it does not
   * close the dialog, which is the behaviour people expect when they
   * are selecting text in a form.
   */
  const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (!dismissible) return;
    if (event.target === dialogRef.current) beginClose();
  };

  return (
    <dialog
      ref={dialogRef}
      data-state={state}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={styles.dialog}
      onCancel={handleCancel}
      onClick={handleClick}
    >
      <div className={styles.viewport}>
          <div
            className={cn(
              size === "wide" ? styles.panelWide : styles.panel,
              surface === "admin" && styles.adminPanel,
              className
            )}
            role="document"
          >
            <span className={styles.grabber} aria-hidden="true" />

            <div className={styles.header}>
              <div className={styles.titleGroup}>
                {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className={styles.description}>
                    {description}
                  </p>
                )}
              </div>

              {dismissible && (
                <button
                  type="button"
                  onClick={beginClose}
                  className={styles.close}
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </button>
              )}
            </div>

          <div className={styles.body}>{children}</div>
        </div>
      </div>
    </dialog>
  );
}

export default Dialog;
