"use client";

import { useActionState } from "react";
import { setupAdminPassword } from "@/app/admin/auth-actions";
import { FormError, FormNotice, SubmitButton, TextField } from "@/components/careers/form-fields";

export function AdminPasswordSetupForm() {
  const [state, formAction, pending] = useActionState(setupAdminPassword, null);
  const fieldErrors = state && !state.ok ? state.fieldErrors ?? {} : {};
  const formError = state && !state.ok ? state.message : undefined;

  return (
    <form action={formAction} noValidate className="space-y-5">
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
        surface="admin"
      />
      <TextField
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={fieldErrors.confirmPassword}
        disabled={pending}
        surface="admin"
      />
      <FormNotice>After saving, you will continue to the admin dashboard.</FormNotice>
      <SubmitButton pending={pending} pendingLabel="Saving password" surface="admin">
        Set password and continue
      </SubmitButton>
    </form>
  );
}
