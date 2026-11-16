import type { AdminRole, JobStatus } from "@/lib/supabase/database.types";
import type { JobTransitionOutcome } from "./types";

export type JobIntent = "draft" | "submit" | "publish";

export function statusForCreateIntent(
  intent: JobIntent,
  role: AdminRole
): JobStatus | null {
  if (intent === "draft") return "draft";
  if (intent === "submit") return "pending_approval";
  return role === "super_admin" ? "published" : null;
}

export function createdJobMessage(status: JobStatus): string {
  if (status === "published") return "Job created and published on the careers page.";
  if (status === "pending_approval") return "Job created and submitted for Super Admin approval.";
  return "Job created and saved as a private draft.";
}

export function lifecycleErrorMessage(message: string): string {
  if (message.includes("no longer pending")) {
    return "This job has already changed. Refresh the page and review its current status.";
  }
  if (message.includes("Super Admin")) return "Only the Super Admin can publish jobs.";
  if (message.includes("reason")) return "Enter a reason between 1 and 2000 characters.";
  if (message.includes("could not be found")) return "That job could not be found.";
  return "We could not update that job. Please refresh and try again.";
}

export function transitionOutcome(status: JobStatus): JobTransitionOutcome {
  const messages: Record<JobStatus, string> = {
    draft: "The job is now a private draft.",
    pending_approval: "The job was submitted for approval.",
    published: "The job is published on the careers page.",
    changes_requested: "The requested changes were sent to the administrator.",
    closed: "The job is closed to new applications.",
  };
  return { status, message: messages[status] };
}
