"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Eye, EyeOff, LoaderCircle, Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { FormError, SubmitButton } from "@/components/careers/form-fields";
import {
  closeJob,
  deleteJob,
  publishJob,
  submitJobForApproval,
  unpublishJob,
} from "@/app/admin/actions";
import type { ActionResult, JobTransitionOutcome } from "@/lib/careers/types";
import type { AdminRole, JobStatus } from "@/lib/supabase/database.types";
import { adminButtonClasses } from "./admin-ui";
import { JobReviewActions } from "./job-review-actions";

/**
 * Publish, unpublish, close and delete controls for a job.
 *
 * Publishing is reversible and immediate, so it submits directly.
 * Closing and deleting are confirmed in a dialog, because closing stops
 * candidates mid-flight and deleting cannot be undone.
 *
 * Unpublish sets the status back to `draft`. The row and every
 * application attached to it stay exactly where they are; the role
 * simply stops appearing in public listings.
 */

export interface JobStatusActionsProps {
  jobId: string;
  status: JobStatus;
  applicationCount: number;
  adminRole: AdminRole;
}

type Confirmable = "close" | "delete";

const CONFIRM_COPY: Record<
  Confirmable,
  { title: string; description: string; cta: string; danger: boolean }
> = {
  close: {
    title: "Close this role?",
    description:
      "Candidates will no longer be able to apply. The role and every application stay in the system, and you can reopen it later.",
    cta: "Close the role",
    danger: false,
  },
  delete: {
    title: "Delete this role?",
    description:
      "This cannot be undone. A role with applications attached cannot be deleted; close it instead.",
    cta: "Delete permanently",
    danger: true,
  },
};

export function JobStatusActions({ jobId, status, applicationCount, adminRole }: JobStatusActionsProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<Confirmable | null>(null);
  const [activeLifecycle, setActiveLifecycle] = useState<
    "publish" | "unpublish" | "close" | null
  >(null);

  const [publishState, publishAction, publishPending] = useActionState<
    ActionResult<JobTransitionOutcome> | null,
    FormData
  >(publishJob, null);
  const [unpublishState, unpublishAction, unpublishPending] = useActionState<
    ActionResult<JobTransitionOutcome> | null,
    FormData
  >(unpublishJob, null);
  const [closeState, closeAction, closePending] = useActionState<
    ActionResult<JobTransitionOutcome> | null,
    FormData
  >(closeJob, null);

  const [deleteState, deleteAction, deletePending] = useActionState<
    ActionResult | null,
    FormData
  >(deleteJob, null);
  const [submitState, submitAction, submitPending] = useActionState<
    ActionResult<JobTransitionOutcome> | null,
    FormData
  >(submitJobForApproval, null);

  /**
   * Close the confirmation once, on the render that first sees a
   * successful result.
   *
   * React's "adjusting state during render" pattern rather than an
   * effect. Identity comparison matters here: `useActionState` returns
   * a fresh object per submission, so closing a role, reopening it and
   * closing it again each get their own dismissal instead of the
   * dialog refusing to reopen because an older result was still ok.
   */
  const [consumedResult, setConsumedResult] = useState<ActionResult<JobTransitionOutcome> | null>(null);
  if (closeState && closeState !== consumedResult) {
    setConsumedResult(closeState);
    if (closeState.ok) setConfirming(null);
  }

  useEffect(() => {
    if (publishState?.ok || unpublishState?.ok || closeState?.ok) router.refresh();
  }, [publishState, unpublishState, closeState, router]);

  useEffect(() => {
    if (submitState?.ok) router.refresh();
  }, [submitState, router]);

  const copy = confirming ? CONFIRM_COPY[confirming] : null;
  const activeLifecycleState =
    activeLifecycle === "publish"
      ? publishState
      : activeLifecycle === "unpublish"
        ? unpublishState
        : activeLifecycle === "close"
          ? closeState
          : null;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {activeLifecycleState?.ok === false && (
        <p role="alert" className="w-full text-[13px] font-medium text-red-600">
          {activeLifecycleState.message}
        </p>
      )}

      {adminRole === "super_admin" && status !== "published" && status !== "pending_approval" && (
        <form action={publishAction}>
          <input type="hidden" name="jobId" value={jobId} />
          <button type="submit" onClick={() => setActiveLifecycle("publish")} disabled={publishPending} className={adminButtonClasses.primary}>
            {publishPending ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            {publishPending ? "Publishing" : status === "closed" ? "Reopen and publish" : "Publish"}
          </button>
        </form>
      )}

      {adminRole !== "super_admin" && ["draft", "changes_requested", "closed"].includes(status) && (
        <form action={submitAction}>
          <input type="hidden" name="jobId" value={jobId} />
          <button type="submit" disabled={submitPending} className={adminButtonClasses.primary}>
            {submitPending ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            {submitPending ? "Submitting" : "Submit for approval"}
          </button>
        </form>
      )}

      {adminRole === "super_admin" && status === "pending_approval" && (
        <JobReviewActions jobId={jobId} />
      )}

      {status === "published" && (
        <form action={unpublishAction}>
          <input type="hidden" name="jobId" value={jobId} />
          <button type="submit" onClick={() => setActiveLifecycle("unpublish")} disabled={unpublishPending} className={adminButtonClasses.outline}>
            {unpublishPending ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
            {unpublishPending ? "Unpublishing" : "Unpublish"}
          </button>
        </form>
      )}

      {submitState?.ok === false && (
        <p role="alert" className="w-full text-[13px] font-medium text-red-600">
          {submitState.message}
        </p>
      )}

      {status !== "closed" && (
        <button
          type="button"
          onClick={() => {
            setActiveLifecycle("close");
            setConfirming("close");
          }}
          className={adminButtonClasses.outline}
        >
          <Archive className="h-4 w-4" aria-hidden="true" />
          Close
        </button>
      )}

      <button
        type="button"
        onClick={() => setConfirming("delete")}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-[13.5px] font-medium text-slate-500 transition-colors duration-150 ease-out hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete
      </button>

      <Dialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
        title={copy?.title ?? ""}
        eyebrow="Confirm"
        description={copy?.description}
        dismissible={!closePending && !deletePending}
      >
        {confirming === "delete" ? (
          <form action={deleteAction} className="space-y-4">
            <input type="hidden" name="jobId" value={jobId} />

            <FormError
              message={deleteState?.ok === false ? deleteState.message : undefined}
            />

            {applicationCount > 0 && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-[13.5px] font-medium leading-[1.55] text-amber-800">
                This role has {applicationCount} application
                {applicationCount === 1 ? "" : "s"} attached, so it cannot be deleted. Close it
                instead.
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <SubmitButton
                pending={deletePending}
                pendingLabel="Deleting"
                fullWidth={false}
                disabled={applicationCount > 0}
                className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 sm:flex-1"
              >
                Delete permanently
              </SubmitButton>

              <button
                type="button"
                onClick={() => setConfirming(null)}
                disabled={deletePending}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-[14.5px] font-semibold text-slate-800 transition-[border-color,background-color,transform] duration-150 ease-out hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 disabled:opacity-60 sm:flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form action={closeAction} className="space-y-4">
            <input type="hidden" name="jobId" value={jobId} />

            <FormError
              message={closeState?.ok === false ? closeState.message : undefined}
            />

            {applicationCount > 0 && (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-[13.5px] font-medium leading-[1.55] text-slate-700">
                {applicationCount} application{applicationCount === 1 ? "" : "s"} will be kept and
                stay visible to their candidates.
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <SubmitButton
                pending={closePending}
                pendingLabel="Closing"
                fullWidth={false}
                className="sm:flex-1"
              >
                {copy?.cta ?? "Confirm"}
              </SubmitButton>

              <button
                type="button"
                onClick={() => setConfirming(null)}
                disabled={closePending}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-[14.5px] font-semibold text-slate-800 transition-[border-color,background-color,transform] duration-150 ease-out hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 disabled:opacity-60 sm:flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}

export default JobStatusActions;
