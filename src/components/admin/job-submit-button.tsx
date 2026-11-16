"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Send } from "lucide-react";
import { submitJobForApproval } from "@/app/admin/actions";
import type { ActionResult, JobTransitionOutcome } from "@/lib/careers/types";

export function JobSubmitButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionResult<JobTransitionOutcome> | null, FormData>(
    submitJobForApproval,
    null
  );

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <form action={action} className="inline-flex flex-col items-end gap-1">
      <input type="hidden" name="jobId" value={jobId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <LoaderCircle className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        ) : (
          <Send className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {pending ? "Submitting" : "Submit"}
      </button>
      {state?.ok === false && (
        <span role="alert" className="max-w-48 text-right text-[11px] font-medium text-red-600">
          {state.message}
        </span>
      )}
    </form>
  );
}
