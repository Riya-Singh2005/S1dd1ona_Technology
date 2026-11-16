import { z } from "zod";
import { attributionPairSchema } from "@/lib/analytics/attribution";
import {
  RESUME_ACCEPTED_MIME_TYPES,
  RESUME_BUCKET,
  RESUME_MAX_BYTES,
} from "./constants";
export {
  jobIntentSchema,
  jobReviewSchema,
  jobSubmissionSchema,
} from "./job-approval-validation";

/**
 * Zod schemas shared by the client forms and the server actions.
 *
 * The client uses them for immediate feedback. The server re-parses
 * every payload from scratch, because a Server Action is reachable by
 * anyone who can send a POST to the route that hosts it. Client-side
 * validation here is a convenience, never a control.
 */

const trimmed = (value: unknown) =>
  typeof value === "string" ? value.trim() : value;

/** Optional URL field that treats an empty string as "not provided". */
const optionalUrl = (label: string) =>
  z.preprocess(
    (value) => {
      const next = trimmed(value);
      return next === "" ? undefined : next;
    },
    z
      .string()
      .url(`Enter a valid ${label} URL, including https://`)
      .max(500, `That ${label} URL is too long`)
      .optional()
  );

const optionalText = (max: number) =>
  z.preprocess(
    (value) => {
      const next = trimmed(value);
      return next === "" ? undefined : next;
    },
    z.string().max(max, `Keep this under ${max} characters`).optional()
  );

// ---------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address")
  .email("Enter a valid email address")
  .max(254, "That email address is too long");

/**
 * 10 characters rather than 8. Supabase enforces a minimum of its own,
 * but this is a careers portal holding CVs and contact details, so the
 * floor is raised deliberately.
 */
export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(72, "Passwords are limited to 72 characters")
  .refine((value) => /[a-zA-Z]/.test(value), {
    message: "Include at least one letter",
  })
  .refine((value) => /[0-9]/.test(value), {
    message: "Include at least one number",
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});

export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(120, "That name is too long"),
  email: emailSchema,
  password: passwordSchema,
});

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Both passwords need to match",
    path: ["confirmPassword"],
  });

// ---------------------------------------------------------------------
// Candidate profile
// ---------------------------------------------------------------------

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(120, "That name is too long"),
  phone: optionalText(32),
  location: optionalText(120),
  linkedinUrl: optionalUrl("LinkedIn"),
  portfolioUrl: optionalUrl("portfolio"),
  githubUrl: optionalUrl("GitHub"),
  bio: optionalText(1200),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// ---------------------------------------------------------------------
// Application
//
// `resumePath` is a storage key the browser produced by uploading
// directly to Supabase Storage. The server never trusts it: the submit
// action confirms the object exists, sits inside the caller's own
// folder, and has an acceptable size and MIME type, before the row is
// written.
// ---------------------------------------------------------------------

const RESUME_PATH_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-zA-Z._-]{1,120}$/;

export const applicationSchema = z.object({
  jobId: z.string().uuid("That role could not be identified"),
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(120, "That name is too long"),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .min(6, "Enter a phone number we can reach you on")
    .max(32, "That phone number is too long")
    .regex(/^[0-9+()\-.\s]+$/, "Use digits, spaces and + ( ) - only"),
  // Optional, with no length rule. The Server Action's 1MB body limit is
  // the only ceiling. An empty or whitespace-only value is stored as null.
  coverLetter: z.preprocess((value) => {
    const next = trimmed(value);
    return next === "" ? undefined : next;
  }, z.string().optional()),
  resumePath: z
    .string()
    .trim()
    .min(1, "Upload your resume")
    .regex(RESUME_PATH_PATTERN, "That resume upload could not be verified"),
  linkedinUrl: optionalUrl("LinkedIn"),
  portfolioUrl: optionalUrl("portfolio"),
  githubUrl: optionalUrl("GitHub"),
  additionalInfo: optionalText(2000),
  attribution: attributionPairSchema.optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const withdrawApplicationSchema = z.object({
  applicationId: z.string().uuid(),
});

// ---------------------------------------------------------------------
// Admin: jobs
// ---------------------------------------------------------------------

/** Textarea input becomes one array entry per non-empty line. */
export const linesToArray = z.preprocess((value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}, z
  .array(z.string().min(1).max(600, "Keep each entry under 600 characters"))
  .max(40, "That is more than 40 entries"));

const hiringProcessSchema = z.preprocess(
  (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value !== "string" || value.trim() === "") return [];
    // One step per line, "Title | Description".
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [title, ...rest] = line.split("|");
        return {
          title: (title ?? "").trim(),
          description: rest.join("|").trim(),
        };
      });
  },
  z
    .array(
      z.object({
        title: z
          .string()
          .trim()
          .min(1, "Each step needs a title")
          .max(120, "Keep each step title under 120 characters"),
        description: z
          .string()
          .trim()
          .max(600, "Keep each step description under 600 characters"),
      })
    )
    .max(12, "Keep the process to 12 steps or fewer")
);

export const slugSchema = z
  .string()
  .trim()
  .min(2, "Enter a slug")
  .max(120, "That slug is too long")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers and single hyphens"
  );

// A salary of 0 means "not published", not a real figure. Storing it as
// null keeps "From ₹0" off the job page and out of the JobPosting schema.
const optionalSalary = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  if (parsed === 0) return undefined;
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}, z.number().int("Enter a whole number").min(0, "Cannot be negative").max(1_000_000_000).optional());

const optionalDate = z.preprocess((value) => {
  const next = trimmed(value);
  return next === "" || next === null ? undefined : next;
}, z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional());

export const jobSchema = z
  .object({
    title: z.string().trim().min(2, "Enter a job title").max(160),
    slug: slugSchema,
    department: z.string().trim().min(2, "Enter a department").max(120),
    location: z.string().trim().min(2, "Enter a location").max(160),
    workMode: z.enum(["onsite", "hybrid", "remote"]).optional(),
    employmentType: z.enum([
      "full_time",
      "part_time",
      "contract",
      "internship",
      "temporary",
    ]),
    experience: optionalText(80),
    salaryMin: optionalSalary,
    salaryMax: optionalSalary,
    currency: z.string().trim().length(3, "Use a 3 letter currency code").default("INR"),
    shortDescription: z
      .string()
      .trim()
      .min(10, "Write a short summary of at least 10 characters")
      .max(400, "Keep the summary under 400 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Describe the role")
      .max(20000, "That description is very long"),
    responsibilities: linesToArray,
    requirements: linesToArray,
    niceToHave: linesToArray,
    whatYouWillWorkOn: linesToArray,
    benefits: linesToArray,
    hiringProcess: hiringProcessSchema,
    closingAt: optionalDate,
  })
  .refine(
    (data) =>
      data.salaryMin === undefined ||
      data.salaryMax === undefined ||
      data.salaryMax >= data.salaryMin,
    {
      message: "The maximum needs to be at least the minimum",
      path: ["salaryMax"],
    }
  );

export type JobInput = z.infer<typeof jobSchema>;

export const jobStatusSchema = z.object({
  jobId: z.string().uuid(),
  status: z.enum(["draft", "published", "closed"]),
});

// ---------------------------------------------------------------------
// Admin: applications
// ---------------------------------------------------------------------

export const applicationStatusSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum([
    "submitted",
    "under_review",
    "shortlisted",
    "interview",
    "offer",
    "rejected",
    "withdrawn",
  ]),
});

export const applicationNoteSchema = z.object({
  applicationId: z.string().uuid(),
  body: z
    .string()
    .trim()
    .min(1, "Write a note")
    .max(4000, "Keep notes under 4000 characters"),
});

// ---------------------------------------------------------------------
// Resume object verification, used server-side after upload
// ---------------------------------------------------------------------

export interface ResumeObjectMetadata {
  size?: number;
  mimetype?: string;
}

export function validateResumeObject(
  metadata: ResumeObjectMetadata | null | undefined
): { ok: true } | { ok: false; message: string } {
  if (!metadata) {
    return { ok: false, message: "We could not find that resume upload. Please upload it again." };
  }

  const size = metadata.size ?? 0;
  if (size <= 0) {
    return { ok: false, message: "That resume file is empty. Please upload it again." };
  }
  if (size > RESUME_MAX_BYTES) {
    return { ok: false, message: "Resumes need to be 5 MB or smaller." };
  }

  const mimeType = metadata.mimetype ?? "";
  if (!RESUME_ACCEPTED_MIME_TYPES.includes(mimeType as (typeof RESUME_ACCEPTED_MIME_TYPES)[number])) {
    return { ok: false, message: "Resumes need to be a PDF, DOC or DOCX file." };
  }

  return { ok: true };
}

export { RESUME_BUCKET };

// ---------------------------------------------------------------------
// Form error shaping
// ---------------------------------------------------------------------

export type FieldErrors = Record<string, string>;

/** Flattens a ZodError into one message per field, which is all a form needs. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!result[key]) {
      result[key] = issue.message;
    }
  }
  return result;
}
