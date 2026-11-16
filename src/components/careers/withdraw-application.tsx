"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { withdrawApplication } from "@/app/careers/actions";
import type { ActionResult } from "@/lib/careers/types";
import { FormError, SubmitButton } from "./form-fields";

/**
 * Withdraw an application.
 *
 * Confirmed in a dialog because it cannot be undone: a candidate cannot
 * re-apply for the same role afterwards, since UNIQUE (user_id, job_id)
 * still holds their row.
 *
 * The frontend gate is courtesy. The
 * `applications_guard_candidate_update` trigger is what actually
 * decides: it permits exactly one candidate-initiated transition, to
 * `withdrawn`, from a live status, and silently reverts anything else.
 */

export interface WithdrawApplicationProps {
  applicationId: string;
  jobTitle: string;
}

export function WithdrawApplication({ applicationId, jobTitle }: WithdrawApplicationProps) {
  const router = useRouter();
  const [requested, setRequested] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    withdrawApplication,
    null
  );

  /**
   * Open state is derived rather than closed from an effect.
   *
   * A successful withdrawal dismisses the dialog on the same render
   * that receives the result, instead of painting the open dialog once
   * more and then closing it.
   */
  const open = requested && !state?.ok;

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setRequested(true)}
        className="text-[13px] font-semibold text-slate-500 underline-offset-4 transition-colors duration-200 hover:text-red-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
      >
        Withdraw application
      </button>

      <Dialog
        open={open}
        onOpenChange={setRequested}
        title="Withdraw this application?"
        eyebrow="Confirm"
        description={`This removes you from consideration for ${jobTitle}. You will not be able to apply for this role again.`}
        dismissible={!pending}
      >
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="applicationId" value={applicationId} />

          <FormError message={state?.ok === false ? state.message : undefined} />

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <SubmitButton
              pending={pending}
              pendingLabel="Withdrawing"
              fullWidth={false}
              className="bg-red-600 shadow-[0_10px_26px_rgba(220,38,38,0.2)] hover:bg-red-700 focus-visible:ring-red-500 sm:flex-1"
            >
              Yes, withdraw
            </SubmitButton>

            <button
              type="button"
              onClick={() => setRequested(false)}
              disabled={pending}
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-[14.5px] font-bold text-slate-800 transition-[border-color,background-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
            >
              Keep it
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export default WithdrawApplication;
