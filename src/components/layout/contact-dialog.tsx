"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { ContactForm } from "@/components/sections/contact-form";
import styles from "./contact-dialog.module.css";

export function ContactDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    dialog.querySelector<HTMLElement>('input[name="fullName"]')?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialogRef}
      onClose={() => {
        // In development, React replays effects. The cleanup closes the dialog,
        // but its queued close event can arrive after the next showModal call.
        if (!dialogRef.current?.open) onClose();
      }}
      onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}
      aria-labelledby="contact-dialog-title"
      aria-describedby="contact-dialog-description"
      className={styles.dialog}
    >
      <div className={styles.shell}>
        <div className={styles.intro}>
          <div className={styles.introTop}>
            <Image
              src="/brand/Siddionalogo-orange-white.png"
              alt="Siddiona Technologies"
              width={1450}
              height={520}
              className={styles.logo}
              unoptimized
            />
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close contact form"
              className={styles.close}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className={styles.introCopy}>
            <h2 id="contact-dialog-title" className={styles.title}>Get in Touch</h2>
            <p id="contact-dialog-description" className={styles.description}>
              Tell us a little about your requirements, and our team will get back to you shortly.
            </p>
          </div>

          <div className={styles.directContact}>
            <span>Prefer email?</span>
            <a href="mailto:hr@example.com">HR — hr@example.com</a>
            <a href="mailto:tech@example.com">Technical — tech@example.com</a>
          </div>
        </div>

        <div className={styles.formPane}>
          <ContactForm inDialog />
        </div>
      </div>
    </dialog>,
    document.body
  );
}
