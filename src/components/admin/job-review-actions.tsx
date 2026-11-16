"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MessageSquareText } from "lucide-react";
import { approveJob, requestJobChanges } from "@/app/admin/actions";
import { FormError, SubmitButton, TextAreaField } from "@/components/careers/form-fields";
import { Dialog } from "@/components/ui/dialog";
import type { ActionResult, JobTransitionOutcome } from "@/lib/careers/types";
import { adminButtonClasses } from "./admin-ui";

export function JobReviewActions({
  jobId,
  compact = false,
}: {
  jobId: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<"approve" | "changes" | null>(null);
  const [reason, setReason] = useState("");
  const [ignoredResult, setIgnoredResult] = useState<ActionResult<JobTransitionOutcome> | null>(null);
  const [approveState, approveAction, approvePending] = useActionState<
    ActionResult<JobTransitionOutcome> | null,
    FormData
  >(
    approveJob,
    null
  );
  const [changesState, changesAction, changesPending] = useActionState<
    ActionResult<JobTransitionOutcome> | null,
    FormData
  >(
    requestJobChanges,
    null
  );
  const state = dialog === "approve" ? approveState : changesState;
  const action = dialog === "approve" ? approveAction : changesAction;
  const pending = dialog === "approve" ? approvePending : changesPending;

  const [consumedApprove, setConsumedApprove] = useState<ActionResult<JobTransitionOutcome> | null>(null);
  const [consumedChanges, setConsumedChanges] = useState<ActionResult<JobTransitionOutcome> | null>(null);
  if (approveState && approveState !== consumedApprove) {
    setConsumedApprove(approveState);
    if (approveState.ok) {
      setDialog(null);
      setReason("");
    }
  }
  if (changesState && changesState !== consumedChanges) {
    setConsumedChanges(changesState);
    if (changesState.ok) {
      setDialog(null);
      setReason("");
    }
  }

  useEffect(() => {
    if (!approveState?.ok && !changesState?.ok) return;
    router.refresh();
  }, [approveState, changesState, router]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setIgnoredResult(approveState);
            setDialog("approve");
          }}
          className={compact ? "inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 text-[12px] font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2" : adminButtonClasses.primary}
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          {compact ? "Approve" : "Approve & publish"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIgnoredResult(changesState);
            setDialog("changes");
          }}
          className={compact ? "inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2" : adminButtonClasses.outline}
        >
          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
          Request changes
        </button>
      </div>

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIgnoredResult(state);
            setDialog(null);
          }
        }}
        eyebrow="Review"
        title={dialog === "approve" ? "Approve and publish this job?" : "Request changes"}
        description={
          dialog === "approve"
            ? "The role will become public immediately and candidates will be able to apply."
            : "Explain what needs to change. The administrator will see this reason until the job is resubmitted."
        }
        dismissible={!pending}
        surface="admin"
      >
        <form action={action} className="space-y-4">
          <input type="hidden" name="jobId" value={jobId} />
          {dialog === "changes" && (
            <TextAreaField
              label="Reason"
              name="reason"
              required
              rows={5}
              maxLength={2000}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              error={state?.ok === false && state !== ignoredResult ? state.fieldErrors?.reason : undefined}
              disabled={pending}
            />
          )}
          <FormError
            message={state?.ok === false && state !== ignoredResult ? state.message : undefined}
          />
          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <SubmitButton
              pending={pending}
              pendingLabel={dialog === "approve" ? "Publishing" : "Sending"}
              fullWidth={false}
              className="sm:flex-1"
              surface="admin"
            >
              {dialog === "approve" ? "Approve & publish" : "Request changes"}
            </SubmitButton>
            <button
              type="button"
              onClick={() => {
                setIgnoredResult(state);
                setDialog(null);
              }}
              disabled={pending}
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-[14.5px] font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 disabled:opacity-60 sm:flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
