"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, UserMinus } from "lucide-react";
import { revokeAdministrator } from "@/app/admin/(protected)/admins/actions";
import { adminButtonClasses } from "@/components/admin/admin-ui";
import { FormError } from "@/components/careers/form-fields";
import { Dialog } from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/careers/types";

export function RevokeAdminButton({ userId, name }: { userId: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    revokeAdministrator,
    null
  );

  const [consumedResult, setConsumedResult] = useState<ActionResult | null>(null);
  if (state && state !== consumedResult) {
    setConsumedResult(state);
    if (state.ok) setOpen(false);
  }

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-medium text-slate-500 transition-colors duration-150 ease-out hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
      >
        <UserMinus className="h-3.5 w-3.5" aria-hidden="true" />
        Revoke
      </button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Revoke administrator access?"
        eyebrow="Confirm"
        description={`${name} will immediately lose access to the admin dashboard. Their account and candidate data will be kept.`}
        dismissible={!pending}
        surface="admin"
      >
        <form action={action} className="space-y-5">
          <input type="hidden" name="userId" value={userId} />
          <FormError message={state?.ok === false ? state.message : undefined} />

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <button
              type="submit"
              disabled={pending}
              aria-busy={pending || undefined}
              className={`${adminButtonClasses.danger} min-h-12 sm:flex-1`}
            >
              {pending && (
                <LoaderCircle
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              {pending ? "Revoking" : "Revoke access"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className={`${adminButtonClasses.outline} min-h-12 sm:flex-1`}
            >
              Cancel
            </button>
          </div>
        </form>
      </Dialog>
      <span className="sr-only" role="status" aria-live="polite">
        {state?.ok ? `${name}'s administrator access was revoked.` : ""}
      </span>
    </>
  );
}
