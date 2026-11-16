"use client";

import { useActionState } from "react";
import { signInAdmin } from "@/app/admin/auth-actions";
import { FormError, SubmitButton, TextField } from "@/components/careers/form-fields";

/**
 * Admin sign in.
 *
 * The same Supabase Auth as the candidate side. There is no separate
 * admin credential store, no second password table, and no shared
 * secret: the difference between an administrator and a candidate is a
 * row in `admin_users`, enforced by Row Level Security.
 *
 * Consequently this form cannot grant anybody anything. It establishes
 * a session; the database decides what that session can see.
 */

export interface AdminSignInFormProps {
  next: string;
}

export function AdminSignInForm({ next }: AdminSignInFormProps) {
  const action = signInAdmin.bind(null, next);
  const [state, formAction, pending] = useActionState(action, null);
  const fieldErrors = state && !state.ok ? state.fieldErrors ?? {} : {};
  const formError = state && !state.ok ? state.message : undefined;

  return (
    <form action={formAction} noValidate className="space-y-4">
      <FormError message={formError} />

      <TextField
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        error={fieldErrors.email}
        disabled={pending}
        surface="admin"
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={fieldErrors.password}
        disabled={pending}
        surface="admin"
      />

      <SubmitButton pending={pending} pendingLabel="Signing in" surface="admin">
        Sign in
      </SubmitButton>
    </form>
  );
}

export default AdminSignInForm;
