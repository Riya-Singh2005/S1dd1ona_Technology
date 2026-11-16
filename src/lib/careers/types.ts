import type { Database } from "@/lib/supabase/database.types";
import type { JobStatus } from "@/lib/supabase/database.types";

/**
 * Domain shapes for the careers feature.
 *
 * Derived from the database row types rather than restated, so a schema
 * change surfaces as a type error instead of a runtime surprise.
 */

export type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];
export type ApplicationEventRow =
  Database["public"]["Tables"]["application_events"]["Row"];
export type ApplicationNoteRow =
  Database["public"]["Tables"]["application_notes"]["Row"];
export type JobApprovalStateRow =
  Database["public"]["Tables"]["job_approval_state"]["Row"];

/**
 * The columns the public jobs index needs. Selecting this subset keeps
 * the long-form description out of a listing payload that renders
 * nothing but a title and a metadata line.
 */
export const JOB_SUMMARY_COLUMNS =
  "id, title, slug, department, location, work_mode, employment_type, experience, salary_min, salary_max, currency, short_description, status, published_at, closing_at" as const;

export type JobSummary = Pick<
  JobRow,
  | "id"
  | "title"
  | "slug"
  | "department"
  | "location"
  | "work_mode"
  | "employment_type"
  | "experience"
  | "salary_min"
  | "salary_max"
  | "currency"
  | "short_description"
  | "status"
  | "published_at"
  | "closing_at"
>;

/** A candidate's application joined to the role it is for. */
export interface ApplicationWithJob extends ApplicationRow {
  job: Pick<
    JobRow,
    "id" | "title" | "slug" | "department" | "location" | "employment_type"
  > | null;
}

export type ApplicationListItem = Pick<
  ApplicationRow,
  "id" | "reference" | "full_name" | "email" | "status" | "created_at"
> & {
  job: ApplicationWithJob["job"];
};

/** Only the fields rendered by the admin dashboard's recent list. */
export type RecentApplicationSummary = Pick<
  ApplicationRow,
  "id" | "reference" | "full_name" | "status" | "created_at"
> & {
  job: Pick<JobRow, "id" | "title"> | null;
};

export interface JobSummaryWithCount
  extends JobSummary,
    Pick<JobRow, "created_by" | "created_at"> {
  applicationCount: number;
  approval: JobApprovalStateRow | null;
  creator: AdminActorSummary | null;
  submitter: AdminActorSummary | null;
}

export interface AdminActorSummary {
  id: string;
  name: string;
  email: string;
}

export interface JobTransitionOutcome {
  status: JobStatus;
  message: string;
}

export interface ApplicationDetail extends ApplicationWithJob {
  events: ApplicationEventRow[];
}

/** The admin application detail view, which additionally sees notes. */
export interface AdminApplicationDetail extends ApplicationDetail {
  notes: ApplicationNoteRow[];
  profile: ProfileRow | null;
}

export interface DashboardStats {
  openJobs: number;
  draftJobs: number;
  pendingApprovalJobs: number;
  changesRequestedJobs: number;
  closedJobs: number;
  totalApplications: number;
  applicationsThisWeek: number;
  byStatus: Record<string, number>;
}

export interface PaginationInput {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const ADMIN_PAGE_SIZES = [25, 50, 100] as const;
export const DEFAULT_ADMIN_PAGE_SIZE = 25;

export function normalizePagination(input: PaginationInput = {}): Required<PaginationInput> {
  const page = Number.isInteger(input.page) && (input.page ?? 0) > 0 ? input.page! : 1;
  const pageSize = ADMIN_PAGE_SIZES.includes(
    input.pageSize as (typeof ADMIN_PAGE_SIZES)[number]
  )
    ? input.pageSize!
    : DEFAULT_ADMIN_PAGE_SIZE;

  return { page, pageSize };
}

export interface AdminCandidateSummary {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  applications: number;
  latestAt: string;
}

/** Filter state for both the public index and the admin list. */
export interface JobFilters {
  department?: string;
  location?: string;
  employmentType?: string;
}

export interface ApplicationFilters extends PaginationInput {
  jobId?: string;
  status?: string;
  department?: string;
  since?: string;
  query?: string;
}

/**
 * The shape every Server Action in this feature returns.
 *
 * A discriminated union rather than throwing, because these results are
 * rendered by `useActionState` and a thrown error would give the
 * candidate a generic error boundary instead of a message about their
 * own form.
 */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export function actionOk(): ActionResult<undefined>;
export function actionOk<T>(data: T): ActionResult<T>;
export function actionOk<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data };
}

export function actionError<T = undefined>(
  message: string,
  fieldErrors?: Record<string, string>
): ActionResult<T> {
  return { ok: false, message, fieldErrors };
}
