"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CareersServerClient } from "@/lib/supabase/server";
import { RESUME_BUCKET } from "@/lib/careers/constants";
import {
  applicationSchema,
  profileSchema,
  toFieldErrors,
  validateResumeObject,
  withdrawApplicationSchema,
} from "@/lib/careers/validation";
import { actionError, actionOk, type ActionResult } from "@/lib/careers/types";
import { formatDateTime } from "@/lib/careers/format";
import {
  applicationReceivedEmail,
  newApplicationNotificationEmail,
} from "@/lib/email/templates";
import { sendEmail, sendToRecruitment, siteOrigin } from "@/lib/email/send";
import { parseAttributionJson } from "@/lib/analytics/attribution";

/**
 * Candidate-facing Server Actions.
 *
 * Next.js 16 treats a Server Action as a POST to whatever route hosts
 * it, and its own docs warn that a proxy matcher change can silently
 * remove coverage. So nothing here trusts the proxy, the client, or a
 * previously rendered page: every action re-authenticates, re-validates,
 * and then relies on Row Level Security to have the final say.
 */

const RATE_LIMIT_WINDOW_SECONDS = 3600;
const APPLICATIONS_PER_HOUR = 6;
const PROFILE_UPDATES_PER_HOUR = 20;

/**
 * Consumes a token from the Postgres fixed-window limiter.
 *
 * Fails open. If the limiter itself is unavailable, blocking a genuine
 * candidate from applying is a worse outcome than briefly allowing an
 * abusive one through, and RLS still constrains what they can do.
 */
async function withinRateLimit(
  supabase: CareersServerClient,
  bucket: string,
  limit: number,
  windowSeconds = RATE_LIMIT_WINDOW_SECONDS
): Promise<boolean> {
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_bucket: bucket,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error("[careers] rate limit check failed", error.message);
    return true;
  }
  return data !== false;
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// =====================================================================
// Submit an application
// =====================================================================

export interface SubmittedApplication {
  reference: string;
  applicationId: string;
  /** Formatted server-side so the page and the email agree exactly. */
  submittedAt: string;
}

export async function submitApplication(
  _previous: ActionResult<SubmittedApplication> | null,
  formData: FormData
): Promise<ActionResult<SubmittedApplication>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return actionError("Your session has expired. Please sign in again to submit.");
  }

  const parsed = applicationSchema.safeParse({
    jobId: readString(formData, "jobId"),
    fullName: readString(formData, "fullName"),
    email: readString(formData, "email"),
    phone: readString(formData, "phone"),
    coverLetter: readString(formData, "coverLetter"),
    resumePath: readString(formData, "resumePath"),
    linkedinUrl: readString(formData, "linkedinUrl"),
    portfolioUrl: readString(formData, "portfolioUrl"),
    githubUrl: readString(formData, "githubUrl"),
    additionalInfo: readString(formData, "additionalInfo"),
    attribution: parseAttributionJson(readString(formData, "attribution")),
  });

  if (!parsed.success) {
    return actionError("Please check the highlighted fields.", toFieldErrors(parsed.error));
  }

  const input = parsed.data;

  if (!(await withinRateLimit(supabase, `apply:${user.id}`, APPLICATIONS_PER_HOUR))) {
    return actionError(
      "You have submitted several applications in a short window. Please try again a little later."
    );
  }

  // ---------------------------------------------------------------
  // Resume verification.
  //
  // The browser uploaded straight to Supabase Storage, which keeps a
  // multi-megabyte file out of the 1MB Server Action body cap. The
  // consequence is that `resumePath` arrives as an untrusted string, so
  // it is checked three ways before it is written to a row:
  //   1. the folder is the caller's own user id
  //   2. the object actually exists
  //   3. its real size and MIME type are acceptable
  // Storage RLS already prevents writing outside your own folder; this
  // stops a crafted path from pointing at someone else's file.
  // ---------------------------------------------------------------
  const [folder, fileName] = input.resumePath.split("/");

  if (folder !== user.id) {
    return actionError("That resume upload could not be verified. Please upload it again.", {
      resumePath: "Upload your resume again",
    });
  }

  const { data: objects, error: listError } = await supabase.storage
    .from(RESUME_BUCKET)
    .list(folder, { limit: 100, search: fileName });

  if (listError) {
    console.error("[careers] resume verification failed", listError.message);
    return actionError("We could not verify your resume upload. Please try uploading it again.", {
      resumePath: "Upload your resume again",
    });
  }

  const object = objects?.find((entry) => entry.name === fileName);
  const resumeCheck = validateResumeObject(
    object?.metadata as { size?: number; mimetype?: string } | undefined
  );

  if (!resumeCheck.ok) {
    return actionError(resumeCheck.message, { resumePath: resumeCheck.message });
  }

  // The job is re-read so we can give an accurate message. The INSERT
  // policy enforces the same conditions regardless of what happens here.
  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, slug, department, status, closing_at")
    .eq("id", input.jobId)
    .maybeSingle();

  if (!job || job.status !== "published") {
    return actionError("This role is no longer open for applications.");
  }

  if (job.closing_at && new Date(job.closing_at).getTime() <= Date.now()) {
    return actionError("Applications for this role have closed.");
  }

  const { data: inserted, error: insertError } = await supabase
    .from("applications")
    .insert({
      job_id: input.jobId,
      user_id: user.id,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      resume_path: input.resumePath,
      cover_letter: input.coverLetter ?? null,
      linkedin_url: input.linkedinUrl ?? null,
      portfolio_url: input.portfolioUrl ?? null,
      github_url: input.githubUrl ?? null,
      additional_info: input.additionalInfo ?? null,
      first_touch_attribution: input.attribution?.firstTouch ?? null,
      last_touch_attribution: input.attribution?.latestTouch ?? null,
    })
    .select("id, reference, created_at")
    .single();

  if (insertError) {
    // 23505 is a unique violation. The only unique constraint that a
    // candidate can trip is (user_id, job_id), so this is a duplicate
    // application. The database is what prevents it, not a pre-check.
    if (insertError.code === "23505") {
      return actionError("You have already applied for this role. You can track it in your applications.");
    }
    // 42501 is an RLS refusal: a draft job, a closed job, or a mismatched user.
    if (insertError.code === "42501") {
      return actionError("This role is not accepting applications.");
    }
    console.error("[careers] application insert failed", insertError.message);
    return actionError("Something went wrong saving your application. Please try again.");
  }

  // Keep the profile in step with what the candidate just told us, so
  // the next application is prefilled correctly. Best effort only.
  await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      phone: input.phone,
      linkedin_url: input.linkedinUrl ?? null,
      portfolio_url: input.portfolioUrl ?? null,
      github_url: input.githubUrl ?? null,
      resume_path: input.resumePath,
    })
    .eq("id", user.id);

  // ---------------------------------------------------------------
  // Email is fired after the row is committed and is never awaited in a
  // way that could fail the submission. A provider outage must not cost
  // a candidate their application.
  // ---------------------------------------------------------------
  const origin = siteOrigin();
  const submittedAt = formatDateTime(inserted.created_at);

  await Promise.allSettled([
    sendEmail({
      kind: "application_received",
      to: input.email,
      applicationId: inserted.id,
      content: applicationReceivedEmail({
        candidateName: input.fullName,
        jobTitle: job.title,
        reference: inserted.reference,
        submittedAt,
        applicationUrl: `${origin}/careers/applications`,
      }),
    }),
    sendToRecruitment(
      "new_application_notification",
      newApplicationNotificationEmail({
        candidateName: input.fullName,
        candidateEmail: input.email,
        candidatePhone: input.phone,
        jobTitle: job.title,
        department: job.department,
        reference: inserted.reference,
        submittedAt,
        adminUrl: `${origin}/admin/applications/${inserted.id}`,
      }),
      { applicationId: inserted.id, replyTo: input.email }
    ),
  ]);

  revalidatePath("/careers/applications");
  revalidatePath(`/careers/${job.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/applications");

  return actionOk({
    reference: inserted.reference,
    applicationId: inserted.id,
    submittedAt,
  });
}

// =====================================================================
// Withdraw an application
// =====================================================================

export async function withdrawApplication(
  _previous: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return actionError("Your session has expired. Please sign in again.");
  }

  const parsed = withdrawApplicationSchema.safeParse({
    applicationId: readString(formData, "applicationId"),
  });

  if (!parsed.success) {
    return actionError("That application could not be identified.");
  }

  /**
   * The UPDATE policy limits this to the caller's own row, and the
   * `applications_guard_candidate_update` trigger reduces a candidate's
   * update to exactly one legal transition: a withdrawal from a live
   * status. Sending any other status here would be silently reverted
   * rather than applied.
   */
  const { data, error } = await supabase
    .from("applications")
    .update({ status: "withdrawn" })
    .eq("id", parsed.data.applicationId)
    .select("id, status")
    .maybeSingle();

  if (error) {
    console.error("[careers] withdraw failed", error.message);
    return actionError("We could not withdraw that application. Please try again.");
  }

  if (!data) {
    return actionError("That application could not be found.");
  }

  if (data.status !== "withdrawn") {
    // The trigger reverted it, which means the application had already
    // reached a state a candidate cannot withdraw from.
    return actionError("This application can no longer be withdrawn.");
  }

  revalidatePath("/careers/applications");
  revalidatePath("/admin/applications");

  return actionOk();
}

// =====================================================================
// Update candidate profile
// =====================================================================

export async function updateProfile(
  _previous: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return actionError("Your session has expired. Please sign in again.");
  }

  const parsed = profileSchema.safeParse({
    fullName: readString(formData, "fullName"),
    phone: readString(formData, "phone"),
    location: readString(formData, "location"),
    linkedinUrl: readString(formData, "linkedinUrl"),
    portfolioUrl: readString(formData, "portfolioUrl"),
    githubUrl: readString(formData, "githubUrl"),
    bio: readString(formData, "bio"),
  });

  if (!parsed.success) {
    return actionError("Please check the highlighted fields.", toFieldErrors(parsed.error));
  }

  if (!(await withinRateLimit(supabase, `profile:${user.id}`, PROFILE_UPDATES_PER_HOUR))) {
    return actionError("Too many changes in a short window. Please try again shortly.");
  }

  const input = parsed.data;

  // No `.eq("id", user.id)` escape hatch is needed for safety here, but
  // it keeps the statement honest about its intent. The UPDATE policy
  // would reject any other row regardless.
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      phone: input.phone ?? null,
      location: input.location ?? null,
      linkedin_url: input.linkedinUrl ?? null,
      portfolio_url: input.portfolioUrl ?? null,
      github_url: input.githubUrl ?? null,
      bio: input.bio ?? null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[careers] profile update failed", error.message);
    return actionError("We could not save your profile. Please try again.");
  }

  revalidatePath("/careers/profile");
  return actionOk();
}

// =====================================================================
// Attach a newly uploaded resume to the profile
// =====================================================================

export async function updateProfileResume(
  _previous: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return actionError("Your session has expired. Please sign in again.");
  }

  const resumePath = readString(formData, "resumePath").trim();
  const [folder, fileName] = resumePath.split("/");

  if (!resumePath || folder !== user.id || !fileName) {
    return actionError("That resume upload could not be verified. Please upload it again.");
  }

  const { data: objects, error: listError } = await supabase.storage
    .from(RESUME_BUCKET)
    .list(folder, { limit: 100, search: fileName });

  if (listError) {
    return actionError("We could not verify your resume upload. Please try again.");
  }

  const object = objects?.find((entry) => entry.name === fileName);
  const resumeCheck = validateResumeObject(
    object?.metadata as { size?: number; mimetype?: string } | undefined
  );

  if (!resumeCheck.ok) {
    return actionError(resumeCheck.message);
  }

  const { error } = await supabase
    .from("profiles")
    .update({ resume_path: resumePath })
    .eq("id", user.id);

  if (error) {
    return actionError("We could not save your resume. Please try again.");
  }

  revalidatePath("/careers/profile");
  return actionOk();
}
