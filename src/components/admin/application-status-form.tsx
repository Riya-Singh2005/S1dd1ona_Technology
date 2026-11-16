"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { FormError, SubmitButton } from "@/components/careers/form-fields";
import { updateApplicationStatus } from "@/app/admin/actions";
import type { ActionResult } from "@/lib/careers/types";
import {
  APPLICATION_STATUS_DESCRIPTIONS,
  APPLICATION_STATUS_OPTIONS,
} from "@/lib/careers/constants";
import type { ApplicationStatus } from "@/lib/supabase/database.types";
import { useTransientSuccess } from "@/lib/careers/use-transient-success";

/**
 * Move an application through the pipeline.
 *
 * Changing the status emails the candidate by default, and the exact
 * wording they will receive is shown before the button is pressed. A
 * recruiter should never have to guess what a dropdown is about to send
 * to a real person.
 *
 * The notification can be suppressed for corrections, such as undoing a
 * misclick, where a second email would only confuse.
 *
 * The `application_events` row is written by a database trigger rather
 * than here, so the candidate's timeline cannot drift out of step with
 * the row it describes.
 */

export interface ApplicationStatusFormProps {
  applicationId: string;
  status: ApplicationStatus;
  candidateName: string;
}

export function ApplicationStatusForm({
  applicationId,
  status,
  candidateName,
}: ApplicationStatusFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updateApplicationStatus,
    null
  );

  const [selected, setSelected] = useState<ApplicationStatus>(status);
  const [notify, setNotify] = useState(true);

  /**
   * Re-sync the dropdown when the server sends a new status.
   *
   * This is React's documented "adjusting state when a prop changes"
   * pattern: compare against the previous prop during render and
   * correct immediately. An effect would render the stale value once
   * before fixing it, which is visible as a flicker on a slow device.
   */
  const [lastStatus, setLastStatus] = useState<ApplicationStatus>(status);
  if (lastStatus !== status) {
    setLastStatus(status);
    setSelected(status);
  }

  const saved = useTransientSuccess(state);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  const changed = selected !== status;
  const firstName = candidateName.split(" ")[0] || candidateName;

  return (
    <form action={formAction} className="space-y-4 p-5">
      <input type="hidden" name="applicationId" value={applicationId} />
      <input type="hidden" name="notify" value={notify ? "true" : "false"} />

      <FormError message={state?.ok === false ? state.message : undefined} />

      <div>
        <label
          htmlFor="application-status"
          className="mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500"
        >
          Status
        </label>
        <select
          id="application-status"
          name="status"
          value={selected}
          onChange={(event) => setSelected(event.target.value as ApplicationStatus)}
          disabled={pending}
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-[14px] font-medium text-slate-900 transition-[border-color,box-shadow] duration-150 ease-out focus:border-[#EA580C] focus:shadow-[0_0_0_3px_rgba(234,88,12,0.14)] focus:outline-none disabled:bg-slate-50"
        >
          {APPLICATION_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {changed && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
            {notify ? `${firstName} will be emailed` : "No email will be sent"}
          </p>
          <p className="mt-2 text-[13.5px] leading-[1.55] text-slate-700">
            {APPLICATION_STATUS_DESCRIPTIONS[selected]}
          </p>

          <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-[13px] font-medium text-slate-700">
            <input
              type="checkbox"
              checked={notify}
              onChange={(event) => setNotify(event.target.checked)}
              disabled={pending}
              className="h-4 w-4 rounded border-slate-300 text-[#EA580C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
            />
            Email the candidate about this change
          </label>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton
          pending={pending}
          pendingLabel="Saving"
          fullWidth={false}
          disabled={!changed}
          className="min-h-10 px-4 text-[13.5px]"
        >
          Update status
        </SubmitButton>

        {saved && (
          <span
            role="status"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-700"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Updated
          </span>
        )}
      </div>
    </form>
  );
}

export default ApplicationStatusForm;
