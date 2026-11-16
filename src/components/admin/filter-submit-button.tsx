"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { adminButtonClasses } from "@/components/admin/admin-ui";

export function FilterSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={adminButtonClasses.dark} disabled={pending} aria-busy={pending}>
      {pending && <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
      {pending ? "Applying" : "Apply filters"}
      <span className="sr-only" aria-live="polite">{pending ? "Applying filters" : ""}</span>
    </button>
  );
}
