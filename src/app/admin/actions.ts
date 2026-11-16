"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/auth/guards";
import {
  applicationNoteSchema,
  applicationStatusSchema,
  jobSchema,
  jobIntentSchema,
  jobReviewSchema,
  jobSubmissionSchema,
  toFieldErrors,
} from "@/lib/careers/validation";
import {
  actionError,
  actionOk,
  type ActionResult,
  type JobTransitionOutcome,
} from "@/lib/careers/types";
import { slugForJobUpdate, slugify } from "@/lib/careers/format";
import { normalizeJobFieldErrors } from "@/lib/careers/job-form-errors";
import {
  lifecycleErrorMessage,
  statusForCreateIntent,
  transitionOutcome,
} from "@/lib/careers/job-approval";
import {
  APPLICATION_STATUS_DESCRIPTIONS,
  APPLICATION_STATUS_LABELS,
} from "@/lib/careers/constants";
import { applicationStatusEmail } from "@/lib/email/templates";
import { sendEmail, siteOrigin } from "@/lib/email/send";

/**
 * Admin Server Actions.
 *
 * Each one re-checks the caller through `getAdminContext` rather than
 * trusting the layout that rendered the form. A Server Action is a POST
 * to the route that hosts it, so anyone who can send that request
 * reaches this code.
 *
 * Even that is not the real boundary. Every write below goes through
 * the caller's own session, so the `jobs_admin_*` and
 * `applications_admin_update` policies decide whether it lands. If this
 * file's guards were deleted, a non-admin would still be refused by
 * Postgres.
 */

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readOptional(formData: FormData, key: string): string | undefined {
  const value = readString(formData, key).trim();
  return value === "" ? undefined : value;
}

function parseJobForm(formData: FormData, generatedSlug?: string) {
  return jobSchema.safeParse({
    title: readString(formData, "title"),
    slug: generatedSlug ?? readString(formData, "slug"),
    department: readString(formData, "department"),
    location: readString(formData, "location"),
    workMode: readOptional(formData, "workMode"),
    employmentType: readString(formData, "employmentType") || "full_time",
    experience: readString(formData, "experience"),
    salaryMin: readString(formData, "salaryMin"),
    salaryMax: readString(formData, "salaryMax"),
    currency: readString(formData, "currency") || "INR",
    shortDescription: readString(formData, "shortDescription"),
    description: readString(formData, "description"),
    responsibilities: readString(formData, "responsibilities"),
    requirements: readString(formData, "requirements"),
    niceToHave: readString(formData, "niceToHave"),
    whatYouWillWorkOn: readString(formData, "whatYouWillWorkOn"),
    benefits: readString(formData, "benefits"),
    hiringProcess: readString(formData, "hiringProcess"),
    closingAt: readString(formData, "closingAt"),
  });
}

/** A bare `YYYY-MM-DD` becomes end of day, so a closing date includes its own day. */
function toClosingTimestamp(value: string | undefined): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T23:59:59.999Z`).toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function revalidateJobSurfaces(slug?: string) {
  revalidatePath("/careers");
  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/careers/${slug}`);
}

// =====================================================================
// Jobs
// =====================================================================

export async function createJob(
  _previous: ActionResult<{ jobId: string }> | null,
  formData: FormData
): Promise<ActionResult<{ jobId: string }>> {
  const context = await getAdminContext();
  if (!context.ok) return actionError(context.message);

  const parsed = parseJobForm(formData, slugify(readString(formData, "title")));
  if (!parsed.success) {
    const fieldErrors = normalizeJobFieldErrors(toFieldErrors(parsed.error));
    if (fieldErrors.slug) {
      fieldErrors.title = fieldErrors.title ?? "Use a title that includes letters or numbers";
      delete fieldErrors.slug;
    }
    return actionError("Please check the highlighted fields.", fieldErrors);
  }

  const input = parsed.data;
  const intent = jobIntentSchema.safeParse(readString(formData, "intent"));
  if (!intent.success) return actionError("Choose whether to save or submit this job.");
  const status = statusForCreateIntent(intent.data, context.adminRole);
  if (!status) return actionError("Only the Super Admin can publish jobs.");

  const { data, error } = await context.supabase
    .from("jobs")
    .insert({
      title: input.title,
      slug: input.slug,
      department: input.department,
      location: input.location,
      work_mode: input.workMode ?? null,
      employment_type: input.employmentType,
      experience: input.experience ?? null,
      salary_min: input.salaryMin ?? null,
      salary_max: input.salaryMax ?? null,
      currency: input.currency,
      short_description: input.shortDescription,
      description: input.description,
      responsibilities: input.responsibilities,
      requirements: input.requirements,
      nice_to_have: input.niceToHave,
      what_you_will_work_on: input.whatYouWillWorkOn,
      benefits: input.benefits,
      hiring_process: input.hiringProcess,
      closing_at: toClosingTimestamp(input.closingAt),
      status,
    })
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return actionError("A job with this title already exists. Adjust the title and try again.", {
        title: "This title creates an address that is already in use",
      });
    }
    if (error.code === "42501") {
      return actionError("You do not have permission to create a job.");
    }
    console.error("[admin] createJob failed", error.message);
    return actionError("We could not save that job. Please try again.");
  }

  revalidateJobSurfaces(data.slug);

  // `redirect` throws a control-flow signal, so nothing after it runs.
  // It sits at the very end for that reason.
  redirect(`/admin/jobs/${data.id}?created=${status}`);
}

export async function updateJob(
  _previous: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const context = await getAdminContext();
  if (!context.ok) return actionError(context.message);

  const jobId = readString(formData, "jobId");
  if (!jobId) return actionError("That job could not be identified.");

  const { data: existingJob, error: existingJobError } = await context.supabase
    .from("jobs")
    .select("title, slug, status")
    .eq("id", jobId)
    .maybeSingle();

  if (existingJobError) {
    console.error("[admin] updateJob lookup failed", existingJobError.message);
    return actionError("We could not save those changes. Please try again.");
  }

  if (!existingJob) {
    return actionError("That job could not be found, or you do not have permission to edit it.");
  }

  const title = readString(formData, "title");
  const parsed = parseJobForm(
    formData,
    slugForJobUpdate(title, existingJob.title, existingJob.slug)
  );
  if (!parsed.success) {
    const fieldErrors = normalizeJobFieldErrors(toFieldErrors(parsed.error));
    if (fieldErrors.slug) {
      fieldErrors.title = fieldErrors.title ?? "Use a title that includes letters or numbers";
      delete fieldErrors.slug;
    }
    return actionError(
      "Please check the highlighted fields.",
      fieldErrors
    );
  }

  const input = parsed.data;

  const { data, error } = await context.supabase
    .from("jobs")
    .update({
      title: input.title,
      slug: input.slug,
      department: input.department,
      location: input.location,
      work_mode: input.workMode ?? null,
      employment_type: input.employmentType,
      experience: input.experience ?? null,
      salary_min: input.salaryMin ?? null,
      salary_max: input.salaryMax ?? null,
      currency: input.currency,
      short_description: input.shortDescription,
      description: input.description,
      responsibilities: input.responsibilities,
      requirements: input.requirements,
      nice_to_have: input.niceToHave,
      what_you_will_work_on: input.whatYouWillWorkOn,
      benefits: input.benefits,
      hiring_process: input.hiringProcess,
      closing_at: toClosingTimestamp(input.closingAt),
    })
    .eq("id", jobId)
    .select("slug, status")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return actionError("A job with this title already exists. Adjust the title and try again.", {
        title: "This title creates an address that is already in use",
      });
    }
    console.error("[admin] updateJob failed", error.message);
    return actionError("We could not save those changes. Please try again.");
  }

  if (!data) {
    return actionError("That job could not be found, or you do not have permission to edit it.");
  }

  revalidateJobSurfaces(data.slug);
  if (existingJob.slug !== data.slug) {
    revalidatePath(`/careers/${existingJob.slug}`);
  }
  revalidatePath(`/admin/jobs/${jobId}`);

  return actionOk();
}

/**
 * Publish, unpublish or close.
 *
 * Unpublishing sets the status back to `draft`, which removes the role
 * from every public listing while leaving the row, and every
 * application attached to it, entirely intact.
 *
 * `published_at` is left alone rather than cleared. The
 * `jobs_sync_published_at` trigger only stamps it when it is null, so
 * re-publishing preserves the original posting date instead of
 * rewriting history and telling Google Jobs the role is brand new.
 */
async function changeJobLifecycle(
  _previous: ActionResult<JobTransitionOutcome> | null,
  formData: FormData,
  status: "draft" | "published" | "closed"
): Promise<ActionResult<JobTransitionOutcome>> {
  const context = await getAdminContext();
  if (!context.ok) return actionError<JobTransitionOutcome>(context.message);

  const parsed = jobSubmissionSchema.safeParse({ jobId: readString(formData, "jobId") });

  if (!parsed.success) return actionError<JobTransitionOutcome>("That status change is not valid.");

  if (status === "published" && context.adminRole !== "super_admin") {
    return actionError<JobTransitionOutcome>("Only the Super Admin can publish jobs.");
  }

  const { data: job } = await context.supabase
    .from("jobs")
    .select("slug")
    .eq("id", parsed.data.jobId)
    .maybeSingle();
  const { data: nextStatus, error } = await context.supabase.rpc("set_job_lifecycle", {
    p_job_id: parsed.data.jobId,
    p_status: status,
  });

  if (error) {
    console.error("[admin] setJobStatus failed", error.message);
    return actionError<JobTransitionOutcome>(lifecycleErrorMessage(error.message));
  }

  if (!job) {
    return actionError<JobTransitionOutcome>("That job could not be found, or you do not have permission to change it.");
  }

  revalidateJobSurfaces(job.slug);
  revalidatePath(`/admin/jobs/${parsed.data.jobId}`);

  return actionOk(transitionOutcome(nextStatus));
}

export async function publishJob(previous: ActionResult<JobTransitionOutcome> | null, formData: FormData) {
  return changeJobLifecycle(previous, formData, "published");
}

export async function unpublishJob(previous: ActionResult<JobTransitionOutcome> | null, formData: FormData) {
  return changeJobLifecycle(previous, formData, "draft");
}

export async function closeJob(previous: ActionResult<JobTransitionOutcome> | null, formData: FormData) {
  return changeJobLifecycle(previous, formData, "closed");
}

export async function submitJobForApproval(
  _previous: ActionResult<JobTransitionOutcome> | null,
  formData: FormData
): Promise<ActionResult<JobTransitionOutcome>> {
  const context = await getAdminContext();
  if (!context.ok) return actionError<JobTransitionOutcome>(context.message);
  const parsed = jobSubmissionSchema.safeParse({ jobId: readString(formData, "jobId") });
  if (!parsed.success) return actionError<JobTransitionOutcome>("That job could not be identified.");

  const { data: job } = await context.supabase
    .from("jobs")
    .select("slug")
    .eq("id", parsed.data.jobId)
    .maybeSingle();
  const { data: nextStatus, error } = await context.supabase.rpc("submit_job_for_approval", {
    p_job_id: parsed.data.jobId,
  });
  if (error) {
    console.error("[admin] submitJobForApproval failed", error.message);
    return actionError<JobTransitionOutcome>(lifecycleErrorMessage(error.message));
  }
  if (!job) return actionError<JobTransitionOutcome>("That job could not be found.");
  revalidateJobSurfaces(job.slug);
  revalidatePath(`/admin/jobs/${parsed.data.jobId}`);
  return actionOk(transitionOutcome(nextStatus));
}

async function reviewJob(
  _previous: ActionResult<JobTransitionOutcome> | null,
  formData: FormData,
  decision: "approve" | "changes_requested"
): Promise<ActionResult<JobTransitionOutcome>> {
  const context = await getAdminContext();
  if (!context.ok) return actionError<JobTransitionOutcome>(context.message);
  if (context.adminRole !== "super_admin") {
    return actionError<JobTransitionOutcome>("Only the Super Admin can review job submissions.");
  }

  const parsed = jobReviewSchema.safeParse({
    jobId: readString(formData, "jobId"),
    decision,
    ...(decision === "changes_requested" ? { reason: readString(formData, "reason") } : {}),
  });
  if (!parsed.success) {
    return actionError<JobTransitionOutcome>("Please check the review.", toFieldErrors(parsed.error));
  }

  const { data: job } = await context.supabase
    .from("jobs")
    .select("slug")
    .eq("id", parsed.data.jobId)
    .maybeSingle();
  const { data: nextStatus, error } = await context.supabase.rpc("review_job_submission", {
    p_job_id: parsed.data.jobId,
    p_decision: parsed.data.decision,
    p_reason: parsed.data.decision === "changes_requested" ? parsed.data.reason : null,
  });
  if (error) {
    console.error("[admin] reviewJobSubmission failed", error.message);
    return actionError<JobTransitionOutcome>(lifecycleErrorMessage(error.message));
  }
  if (!job) return actionError<JobTransitionOutcome>("That job could not be found.");
  revalidateJobSurfaces(job.slug);
  revalidatePath(`/admin/jobs/${parsed.data.jobId}`);
  return actionOk(transitionOutcome(nextStatus));
}

export async function approveJob(previous: ActionResult<JobTransitionOutcome> | null, formData: FormData) {
  return reviewJob(previous, formData, "approve");
}

export async function requestJobChanges(previous: ActionResult<JobTransitionOutcome> | null, formData: FormData) {
  return reviewJob(previous, formData, "changes_requested");
}

/**
 * Delete a job.
 *
 * `applications.job_id` is ON DELETE RESTRICT, so a role that anybody
 * has applied for cannot be removed. That is the point: deleting it
 * would orphan real applications. The friendly message below explains
 * what to do instead.
 */
export async function deleteJob(
  _previous: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const context = await getAdminContext();
  if (!context.ok) return actionError(context.message);

  const jobId = readString(formData, "jobId");
  if (!jobId) return actionError("That job could not be identified.");

  const { count } = await context.supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("job_id", jobId);

  if ((count ?? 0) > 0) {
    return actionError(
      `This role has ${count} application${count === 1 ? "" : "s"} attached, so it cannot be deleted. Close it instead to stop new applications while keeping the history.`
    );
  }

  const { error } = await context.supabase.from("jobs").delete().eq("id", jobId);

  if (error) {
    // 23503 is a foreign key violation, which means an application
    // arrived between the count above and this delete.
    if (error.code === "23503") {
      return actionError(
        "An application arrived for this role. Close it instead to stop new applications while keeping the history."
      );
    }
    console.error("[admin] deleteJob failed", error.message);
    return actionError("We could not delete that job. Please try again.");
  }

  revalidateJobSurfaces();
  redirect("/admin/jobs?deleted=1");
}

// =====================================================================
// Applications
// =====================================================================

export async function updateApplicationStatus(
  _previous: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const context = await getAdminContext();
  if (!context.ok) return actionError(context.message);

  const parsed = applicationStatusSchema.safeParse({
    applicationId: readString(formData, "applicationId"),
    status: readString(formData, "status"),
  });

  if (!parsed.success) return actionError("That status is not valid.");

  const notify = readString(formData, "notify") !== "false";

  // Read first so we know whether this is actually a change. Re-sending
  // "you are shortlisted" because someone re-saved the same value would
  // be a bad experience for the candidate.
  const { data: before } = await context.supabase
    .from("applications")
    .select("id, status, full_name, email, reference, job:jobs(title)")
    .eq("id", parsed.data.applicationId)
    .maybeSingle();

  if (!before) {
    return actionError("That application could not be found.");
  }

  if (before.status === parsed.data.status) {
    return actionOk();
  }

  const { data: updated, error } = await context.supabase
    .from("applications")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.applicationId)
    .select("id, status")
    .maybeSingle();

  if (error) {
    console.error("[admin] updateApplicationStatus failed", error.message);
    return actionError("We could not update that status. Please try again.");
  }

  if (!updated || updated.status !== parsed.data.status) {
    return actionError("That status change was rejected. Please refresh and try again.");
  }

  // The `application_events` row is written by an AFTER UPDATE trigger,
  // so the timeline cannot drift out of step with the row it describes.

  if (notify) {
    const jobRelation = before.job as unknown as { title: string } | null;
    const jobTitle = jobRelation?.title ?? "your application";

    // Never awaited in a way that could fail the update. A mail
    // provider outage must not leave the pipeline stuck.
    await sendEmail({
      kind: "application_status_updated",
      to: before.email,
      applicationId: before.id,
      content: applicationStatusEmail({
        candidateName: before.full_name,
        jobTitle,
        reference: before.reference,
        statusLabel: APPLICATION_STATUS_LABELS[parsed.data.status],
        statusDescription: APPLICATION_STATUS_DESCRIPTIONS[parsed.data.status],
        applicationUrl: `${siteOrigin()}/careers/applications`,
      }),
    }).catch((sendError) => {
      console.error("[admin] status email failed", sendError);
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${parsed.data.applicationId}`);
  revalidatePath("/careers/applications");

  return actionOk();
}

export async function addApplicationNote(
  _previous: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const context = await getAdminContext();
  if (!context.ok) return actionError(context.message);

  const parsed = applicationNoteSchema.safeParse({
    applicationId: readString(formData, "applicationId"),
    body: readString(formData, "body"),
  });

  if (!parsed.success) {
    return actionError("Please check the note.", toFieldErrors(parsed.error));
  }

  const { error } = await context.supabase.from("application_notes").insert({
    application_id: parsed.data.applicationId,
    author_id: context.user.id,
    body: parsed.data.body,
  });

  if (error) {
    console.error("[admin] addApplicationNote failed", error.message);
    return actionError("We could not save that note. Please try again.");
  }

  revalidatePath(`/admin/applications/${parsed.data.applicationId}`);
  return actionOk();
}

export async function deleteApplicationNote(
  _previous: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const context = await getAdminContext();
  if (!context.ok) return actionError(context.message);

  const noteId = readString(formData, "noteId");
  const applicationId = readString(formData, "applicationId");

  if (!noteId) return actionError("That note could not be identified.");

  const { error } = await context.supabase
    .from("application_notes")
    .delete()
    .eq("id", noteId);

  if (error) {
    console.error("[admin] deleteApplicationNote failed", error.message);
    return actionError("We could not delete that note. Please try again.");
  }

  if (applicationId) revalidatePath(`/admin/applications/${applicationId}`);
  return actionOk();
}
