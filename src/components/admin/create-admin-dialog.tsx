"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus, ShieldCheck } from "lucide-react";
import { createAdministrator } from "@/app/admin/(protected)/admins/actions";
import { adminButtonClasses } from "@/components/admin/admin-ui";
import { FormError, SubmitButton, TextField } from "@/components/careers/form-fields";
import { Dialog } from "@/components/ui/dialog";
import { useTransientSuccess } from "@/lib/careers/use-transient-success";
import type { ActionResult } from "@/lib/careers/types";
import type { CreateAdminResult } from "@/app/admin/(protected)/admins/actions";

function CreateAdminForm({
  onCreated,
  onPendingChange,
}: {
  onCreated: () => void;
  onPendingChange: (pending: boolean) => void;
}) {
  const [state, action, pending] = useActionState<
    ActionResult<CreateAdminResult> | null,
    FormData
  >(createAdministrator, null);
  const fieldErrors = state?.ok === false ? (state.fieldErrors ?? {}) : {};

  useEffect(() => onPendingChange(pending), [pending, onPendingChange]);

  useEffect(() => {
    if (state?.ok) onCreated();
  }, [state, onCreated]);

  return (
    <form action={action} className="space-y-5" noValidate>
      <FormError message={state?.ok === false ? state.message : undefined} />

      <TextField
        label="Full name"
        name="fullName"
        autoComplete="name"
        required
        placeholder="Aarav Sharma"
        error={fieldErrors.fullName}
        disabled={pending}
        surface="admin"
      />

      <TextField
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        placeholder="aarav@example.com"
        error={fieldErrors.email}
        disabled={pending}
        surface="admin"
      />

      <dl className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-slate-50 px-4">
        <div className="flex items-center justify-between gap-4 py-3">
          <dt className="text-[12.5px] font-medium text-slate-500">Permission</dt>
          <dd className="text-[13px] font-semibold text-slate-900">Administrator</dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-3">
          <dt className="text-[12.5px] font-medium text-slate-500">Account setup</dt>
          <dd className="text-right text-[13px] font-semibold text-slate-900">
            Secure email invitation
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row-reverse">
        <SubmitButton
          pending={pending}
          pendingLabel="Sending invitation"
          fullWidth={false}
          surface="admin"
          className="sm:flex-1"
        >
          Send invitation
        </SubmitButton>
      </div>
    </form>
  );
}

export function CreateAdminDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [lastResult, setLastResult] = useState<{ ok: true } | null>(null);
  const saved = useTransientSuccess(lastResult);

  const handleCreated = useCallback(() => {
    setLastResult({ ok: true });
    setOpen(false);
    router.refresh();
  }, [router]);

  const handlePendingChange = useCallback((nextPending: boolean) => {
    setPending(nextPending);
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setFormKey((value) => value + 1);
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {saved && (
        <span
          role="status"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-700"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Administrator added
        </span>
      )}

      <button type="button" onClick={() => setOpen(true)} className={adminButtonClasses.primary}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Create admin
      </button>

      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Create administrator"
        eyebrow="Access"
        description="They will receive a secure link to choose a password and enter the dashboard."
        dismissible={!pending}
        surface="admin"
      >
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#EA580C]" aria-hidden="true" />
          <p className="text-[13px] leading-[1.55] text-slate-600">
            This grants administrator access. Admin Manager permission remains exclusive to the
            Sales account.
          </p>
        </div>
        <CreateAdminForm
          key={formKey}
          onCreated={handleCreated}
          onPendingChange={handlePendingChange}
        />
      </Dialog>
    </div>
  );
}
