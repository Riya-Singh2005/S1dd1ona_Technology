"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  toFieldErrors,
  updatePasswordSchema,
  type FieldErrors,
} from "@/lib/careers/validation";
import { FormError, FormNotice, SubmitButton, TextField } from "./form-fields";

/**
 * Sets a new password after a recovery link.
 *
 * `/auth/confirm` has already verified the emailed token and put the
 * browser into a recovery session, so this only needs `updateUser`.
 * Supabase Auth owns the credential end to end; nothing here hashes or
 * stores a password.
 *
 * The session is verified on mount rather than trusted, because someone
 * can land on this URL directly without a valid recovery session.
 */

export function ResetPasswordForm() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionState, setSessionState] = useState<"checking" | "valid" | "invalid">(
    "checking"
  );
  const [, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!cancelled) setSessionState(user ? "valid" : "invalid");
      } catch {
        if (!cancelled) setSessionState("invalid");
      }
    };

    void verify();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    setFormError(undefined);

    const formData = new FormData(event.currentTarget);
    const parsed = updatePasswordSchema.safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }

    setPending(true);

    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      setPending(false);
      setFormError("Password reset is unavailable right now. Please try again shortly.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setPending(false);

    if (error) {
      const message = error.message.toLowerCase();
      setFormError(
        message.includes("same")
          ? "That is your current password. Choose a different one."
          : message.includes("session") || message.includes("expired")
            ? "Your reset link has expired. Request a new one."
            : "We could not update your password. Please try again."
      );
      return;
    }

    setDone(true);
    startTransition(() => router.refresh());
  };

  if (sessionState === "checking") {
    return (
      <p className="py-6 text-center text-[14.5px] text-slate-500" aria-live="polite">
        Checking your reset link
      </p>
    );
  }

  if (sessionState === "invalid") {
    return (
      <div>
        <FormError message="This reset link has expired or has already been used." />
        <p className="mt-4 text-[14.5px] leading-[1.65] text-slate-600">
          Reset links are single use and time limited. Request a new one and it will arrive in a
          moment.
        </p>
        <Link
          href="/careers/join"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#EA580C] px-6 text-[14.5px] font-bold text-white transition-[background-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#C2410C] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <span
          className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
          aria-hidden="true"
        >
          <CheckCircle2 className="h-5 w-5" />
        </span>

        <h2 className="font-display text-xl font-extrabold tracking-[-0.03em] text-slate-900">
          Password updated
        </h2>

        <p className="mx-auto mt-3 max-w-[40ch] text-[14.5px] leading-[1.65] text-slate-600">
          You are signed in with your new password.
        </p>

        <Link
          href="/careers"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#EA580C] px-6 text-[14.5px] font-bold text-white transition-[background-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#C2410C] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
        >
          Back to open roles
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-extrabold tracking-[-0.035em] text-slate-900">
        Set a new password
      </h2>
      <p className="mt-2 text-[14.5px] leading-[1.6] text-slate-600">
        Choose something you have not used elsewhere.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <FormError message={formError} />

        <TextField
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 10 characters, including a letter and a number."
          error={fieldErrors.password}
          disabled={pending}
        />

        <TextField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          error={fieldErrors.confirmPassword}
          disabled={pending}
        />

        <FormNotice>
          Once this is saved you will stay signed in on this device.
        </FormNotice>

        <SubmitButton pending={pending} pendingLabel="Saving">
          Update password
        </SubmitButton>
      </form>
    </div>
  );
}

export default ResetPasswordForm;
