import type {
  ApplicationStatus,
  EmploymentType,
  JobStatus,
  WorkMode,
} from "@/lib/supabase/database.types";

/**
 * Presentation vocabulary for the careers domain.
 *
 * Every label lives here so the public site, the candidate dashboard,
 * the admin console and the transactional emails cannot describe the
 * same status three different ways.
 *
 * House style note: no em-dashes or en-dashes anywhere in user-visible
 * copy. Ranges use a plain hyphen.
 */

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
  temporary: "Temporary",
};

export const EMPLOYMENT_TYPE_OPTIONS = (
  Object.keys(EMPLOYMENT_TYPE_LABELS) as EmploymentType[]
).map((value) => ({ value, label: EMPLOYMENT_TYPE_LABELS[value] }));

/** schema.org employmentType values, for JobPosting structured data. */
export const EMPLOYMENT_TYPE_SCHEMA: Record<EmploymentType, string> = {
  full_time: "FULL_TIME",
  part_time: "PART_TIME",
  contract: "CONTRACTOR",
  internship: "INTERN",
  temporary: "TEMPORARY",
};

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  onsite: "Onsite",
  hybrid: "Hybrid",
  remote: "Remote",
};

export const WORK_MODE_OPTIONS = (
  Object.keys(WORK_MODE_LABELS) as WorkMode[]
).map((value) => ({ value, label: WORK_MODE_LABELS[value] }));

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  published: "Published",
  changes_requested: "Changes Requested",
  closed: "Closed",
};

export const JOB_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  ...Object.entries(JOB_STATUS_LABELS).map(([value, label]) => ({ value, label })),
] as const;

/**
 * The candidate-facing pipeline, in order.
 *
 * `withdrawn` is excluded from the ordered rail because it is an exit,
 * not a stage, and `rejected` ends the rail rather than sitting inside
 * it. Both are handled as terminal states by the timeline UI.
 */
export const APPLICATION_PIPELINE: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
  "offer",
];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offer: "Offer",
  rejected: "Not Progressing",
  withdrawn: "Withdrawn",
};

/** Written for the candidate, so the tone stays human on a rejection. */
export const APPLICATION_STATUS_DESCRIPTIONS: Record<ApplicationStatus, string> = {
  submitted: "We have your application and it is in the queue for review.",
  under_review: "Someone on the hiring team is reading your application.",
  shortlisted: "You are on the shortlist for this role.",
  interview: "You are in the interview stage. We will be in touch about scheduling.",
  offer: "An offer is in progress for this role.",
  rejected: "We are not moving forward with this application. Thank you for the time you put in.",
  withdrawn: "You withdrew this application.",
};

export const APPLICATION_STATUS_OPTIONS = (
  Object.keys(APPLICATION_STATUS_LABELS) as ApplicationStatus[]
).map((value) => ({ value, label: APPLICATION_STATUS_LABELS[value] }));

export const TERMINAL_APPLICATION_STATUSES: ApplicationStatus[] = [
  "rejected",
  "withdrawn",
];

export function isTerminalStatus(status: ApplicationStatus): boolean {
  return TERMINAL_APPLICATION_STATUSES.includes(status);
}

/**
 * Tone tokens for status chips. Restrained on purpose: the site reserves
 * `#EA580C` for primary conversion actions, so a status chip never
 * borrows it.
 */
export type StatusTone = "neutral" | "progress" | "positive" | "closed";

export const APPLICATION_STATUS_TONE: Record<ApplicationStatus, StatusTone> = {
  submitted: "neutral",
  under_review: "progress",
  shortlisted: "progress",
  interview: "progress",
  offer: "positive",
  rejected: "closed",
  withdrawn: "closed",
};

// ---------------------------------------------------------------------
// Resume upload limits
//
// These mirror the `resumes` bucket configuration in migration 0004.
// The bucket is the real enforcement point; these constants exist so the
// browser can fail fast with a readable message instead of waiting for a
// 400 from storage.
// ---------------------------------------------------------------------
export const RESUME_MAX_BYTES = 5 * 1024 * 1024;

export const RESUME_ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const RESUME_ACCEPT_ATTRIBUTE = ".pdf,.doc,.docx";

export const RESUME_BUCKET = "resumes";

export function resumeExtensionFor(mimeType: string): string | null {
  switch (mimeType) {
    case "application/pdf":
      return "pdf";
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    default:
      return null;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
