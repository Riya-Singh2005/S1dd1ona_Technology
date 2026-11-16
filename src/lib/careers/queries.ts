import "server-only";

import { cache } from "react";
import { createClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import type { CareersServerClient } from "@/lib/supabase/server";
import { RESUME_BUCKET } from "./constants";
import {
  JOB_SUMMARY_COLUMNS,
  type AdminApplicationDetail,
  type AdminCandidateSummary,
  type ApplicationDetail,
  type ApplicationFilters,
  type ApplicationListItem,
  type ApplicationRow,
  type ApplicationWithJob,
  type RecentApplicationSummary,
  type DashboardStats,
  type JobFilters,
  type JobApprovalStateRow,
  type AdminActorSummary,
  type JobRow,
  type JobSummary,
  type JobSummaryWithCount,
  type PaginatedResult,
  type PaginationInput,
  normalizePagination,
} from "./types";

/**
 * Server-side reads for the careers feature.
 *
 * Every function here goes through the request-scoped anon client, so
 * Row Level Security applies. The service-role client is deliberately
 * absent: if a query needs to be filtered by ownership or role, the
 * database does the filtering.
 *
 * That means "list all applications" and "list my applications" can be
 * the same query shape and still return different rows to different
 * callers, which is exactly the property we want.
 */

const JOB_RELATION = "job:jobs(id, title, slug, department, location, employment_type)";
const JOB_INNER_RELATION =
  "job:jobs!inner(id, title, slug, department, location, employment_type)";
const APPLICATION_LIST_COLUMNS =
  "id, reference, full_name, email, status, created_at" as const;
const RECENT_APPLICATION_COLUMNS =
  "id, reference, full_name, status, created_at, job:jobs(id, title)" as const;

/**
 * A client for the public read paths, or null when Supabase is not
 * configured yet.
 *
 * The careers page is a public marketing route. A missing environment
 * variable should leave it rendering with an empty roles list, not
 * throw a 500 at every visitor and every crawler. Authenticated routes
 * are free to fail loudly, because there is nothing useful to show
 * without a session anyway.
 */
async function publicClient(): Promise<CareersServerClient | null> {
  if (!isSupabaseServerConfigured()) {
    console.warn(
      "[careers] Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
    return null;
  }
  return createClient();
}

// ---------------------------------------------------------------------
// Public job browsing
// ---------------------------------------------------------------------

/**
 * Published roles, newest first.
 *
 * `status = 'published'` is applied here for index efficiency, but it is
 * not what enforces the rule. The `jobs_public_read_published` policy
 * does; this clause just lets Postgres use the composite index.
 */
export async function listPublishedJobs(filters: JobFilters = {}): Promise<JobSummary[]> {
  const supabase = await publicClient();
  if (!supabase) return [];

  let query = supabase
    .from("jobs")
    .select(JOB_SUMMARY_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (filters.department) query = query.eq("department", filters.department);
  if (filters.location) query = query.eq("location", filters.location);
  if (filters.employmentType) {
    query = query.eq(
      "employment_type",
      filters.employmentType as JobRow["employment_type"]
    );
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`[careers] listPublishedJobs failed: ${error.message}`);
  }
  return (data ?? []) as JobSummary[];
}

/**
 * A single published role by slug, or null.
 *
 * Returning null for a draft or a nonexistent slug is intentional and
 * identical: the caller raises `notFound()` either way, so an
 * unpublished job's URL is indistinguishable from a wrong one.
 *
 * Wrapped in React's `cache` so `generateMetadata` and the page body
 * share one query per request. Next.js memoises `fetch` automatically
 * but knows nothing about a Supabase client, so without this the row is
 * read twice on every job page view.
 */
export const getPublishedJob = cache(
  async (slug: string): Promise<JobRow | null> => {
    const supabase = await publicClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      throw new Error(`[careers] getPublishedJob failed: ${error.message}`);
    }
    return data;
  }
);

/**
 * Resolve the immutable job ID used by external application links.
 *
 * The explicit published filter is required even for an administrator
 * session, whose broader RLS policy can otherwise read drafts and closed
 * roles. The redirect route must behave like a public visitor for everyone.
 */
export const getPublishedJobById = cache(
  async (jobId: string): Promise<JobRow | null> => {
    const supabase = await publicClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      throw new Error(`[careers] getPublishedJobById failed: ${error.message}`);
    }
    return data;
  }
);

/** Slugs for `generateStaticParams` and the sitemap. */
export async function listPublishedJobSlugs(): Promise<
  Array<{ slug: string; updated_at: string }>
> {
  const supabase = await publicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("jobs")
    .select("slug, updated_at")
    .eq("status", "published");

  if (error) {
    throw new Error(`[careers] listPublishedJobSlugs failed: ${error.message}`);
  }
  return data ?? [];
}

/** Distinct filter values, derived from what is actually published. */
export function getJobFacets(jobs: JobSummary[]): {
  departments: string[];
  locations: string[];
  employmentTypes: string[];
} {
  const unique = (values: string[]) =>
    Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));

  return {
    departments: unique(jobs.map((row) => row.department)),
    locations: unique(jobs.map((row) => row.location)),
    employmentTypes: unique(jobs.map((row) => row.employment_type)),
  };
}

// ---------------------------------------------------------------------
// Candidate
// ---------------------------------------------------------------------

export async function listMyApplications(
  supabase: CareersServerClient
): Promise<ApplicationWithJob[]> {
  const { data, error } = await supabase
    .from("applications")
    .select(`*, ${JOB_RELATION}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`[careers] listMyApplications failed: ${error.message}`);
  }
  return (data ?? []) as unknown as ApplicationWithJob[];
}

export async function getMyApplicationForJob(
  supabase: CareersServerClient,
  userId: string,
  jobId: string
): Promise<ApplicationRow | null> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .maybeSingle();

  if (error) throw new Error(`[careers] getMyApplicationForJob failed: ${error.message}`);
  return data ?? null;
}

export async function getMyApplicationDetail(
  supabase: CareersServerClient,
  applicationId: string
): Promise<ApplicationDetail | null> {
  const { data, error } = await supabase
    .from("applications")
    .select(`*, ${JOB_RELATION}`)
    .eq("id", applicationId)
    .maybeSingle();

  if (error) throw new Error(`[careers] getMyApplicationDetail failed: ${error.message}`);
  if (!data) return null;

  const { data: events, error: eventsError } = await supabase
    .from("application_events")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });

  if (eventsError) throw new Error(`[careers] getMyApplicationDetail events failed: ${eventsError.message}`);
  return { ...(data as unknown as ApplicationWithJob), events: events ?? [] };
}

/** The timeline for every application in one round trip. */
export async function listMyApplicationEvents(
  supabase: CareersServerClient,
  applicationIds: string[]
): Promise<Record<string, ApplicationDetail["events"]>> {
  if (applicationIds.length === 0) return {};

  const { data, error } = await supabase
    .from("application_events")
    .select("*")
    .in("application_id", applicationIds)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`[careers] listMyApplicationEvents failed: ${error.message}`);
  if (!data) return {};

  const grouped: Record<string, ApplicationDetail["events"]> = {};
  for (const event of data) {
    (grouped[event.application_id] ??= []).push(event);
  }
  return grouped;
}

// ---------------------------------------------------------------------
// Admin
//
// These read the same tables as the candidate queries. They return more
// rows only because `is_admin()` is true for the caller, so the admin
// SELECT policies match. There is no privilege escalation in code.
// ---------------------------------------------------------------------

export async function listAllJobs(supabase: CareersServerClient): Promise<JobSummary[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_SUMMARY_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`[careers] listAllJobs failed: ${error.message}`);
  }
  return (data ?? []) as JobSummary[];
}

export async function listAllJobsWithCounts(
  supabase: CareersServerClient,
  status?: JobRow["status"]
): Promise<JobSummaryWithCount[]> {
  let query = supabase
    .from("jobs")
    .select(`${JOB_SUMMARY_COLUMNS}, created_by, created_at, applications(count)`)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  const { data, error } = await query;

  if (error) {
    throw new Error(`[careers] listAllJobsWithCounts failed: ${error.message}`);
  }

  const jobs = (data ?? []) as unknown as Array<
    JobSummary & Pick<JobRow, "created_by" | "created_at"> & {
      applications?: Array<{ count: number }>;
    }
  >;
  const jobIds = jobs.map((job) => job.id);
  const { data: approvals, error: approvalsError } = jobIds.length
    ? await supabase.from("job_approval_state").select("*").in("job_id", jobIds)
    : { data: [], error: null };
  if (approvalsError) {
    throw new Error(`[careers] job approval list failed: ${approvalsError.message}`);
  }

  const approvalByJob = new Map(
    ((approvals ?? []) as JobApprovalStateRow[]).map((approval) => [approval.job_id, approval])
  );
  const actorIds = Array.from(
    new Set(
      jobs
        .flatMap((job) => {
          const approval = approvalByJob.get(job.id);
          return [job.created_by, approval?.submitted_by, approval?.reviewed_by];
        })
        .filter((id): id is string => Boolean(id))
    )
  );
  const actors = await getAdminActors(supabase, actorIds);

  return jobs.map(({ applications, ...job }) => {
    const approval = approvalByJob.get(job.id) ?? null;
    return {
      ...job,
      applicationCount: applications?.[0]?.count ?? 0,
      approval,
      creator: job.created_by ? actors[job.created_by] ?? null : null,
      submitter: approval?.submitted_by ? actors[approval.submitted_by] ?? null : null,
    };
  });
}

export async function getJobById(
  supabase: CareersServerClient,
  jobId: string
): Promise<JobRow | null> {
  const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId).maybeSingle();
  if (error) throw new Error(`[careers] getJobById failed: ${error.message}`);
  return data ?? null;
}

export async function getJobApprovalState(
  supabase: CareersServerClient,
  jobId: string
): Promise<JobApprovalStateRow | null> {
  const { data, error } = await supabase
    .from("job_approval_state")
    .select("*")
    .eq("job_id", jobId)
    .maybeSingle();
  if (error) throw new Error(`[careers] job approval state failed: ${error.message}`);
  return data ?? null;
}

export async function getAdminActors(
  supabase: CareersServerClient,
  ids: Array<string | null | undefined>
): Promise<Record<string, AdminActorSummary>> {
  const uniqueIds = Array.from(new Set(ids.filter((id): id is string => Boolean(id))));
  if (uniqueIds.length === 0) return {};
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", uniqueIds);
  if (error) throw new Error(`[careers] admin actor lookup failed: ${error.message}`);
  return Object.fromEntries(
    (data ?? []).map((profile) => [
      profile.id,
      {
        id: profile.id,
        name: profile.full_name?.trim() || "Administrator",
        email: profile.email,
      },
    ])
  );
}

export async function listApplications(
  supabase: CareersServerClient,
  filters: ApplicationFilters = {}
): Promise<PaginatedResult<ApplicationListItem>> {
  const { page, pageSize } = normalizePagination(filters);
  const offset = (page - 1) * pageSize;
  let query = supabase
    .from("applications")
    .select(`${APPLICATION_LIST_COLUMNS}, ${JOB_INNER_RELATION}`, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (filters.jobId) query = query.eq("job_id", filters.jobId);
  if (filters.status) {
    query = query.eq("status", filters.status as ApplicationRow["status"]);
  }
  if (filters.since) query = query.gte("created_at", filters.since);
  if (filters.department) query = query.eq("job.department", filters.department);

  if (filters.query) {
    // Escaping matters: `,` separates clauses in PostgREST's `or`, and a
    // bare `%` or `(` would let a crafted search string restructure the
    // filter it is embedded in.
    const term = filters.query.replace(/[,()%\\]/g, "").trim();
    if (term) {
      query = query.or(
        `full_name.ilike.%${term}%,email.ilike.%${term}%,reference.ilike.%${term}%`
      );
    }
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(`[careers] listApplications failed: ${error.message}`);
  }

  const total = count ?? 0;
  return {
    items: (data ?? []) as unknown as ApplicationListItem[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getAdminApplicationDetail(
  supabase: CareersServerClient,
  applicationId: string
): Promise<AdminApplicationDetail | null> {
  const applicationPromise = supabase
    .from("applications")
    .select(`*, ${JOB_RELATION}`)
    .eq("id", applicationId)
    .maybeSingle();
  const eventsPromise = supabase
      .from("application_events")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true });
  const notesPromise = supabase
      .from("application_notes")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false });

  const [{ data, error }, { data: events, error: eventsError }, { data: notes, error: notesError }] =
    await Promise.all([applicationPromise, eventsPromise, notesPromise]);

  if (error) throw new Error(`[careers] getAdminApplicationDetail failed: ${error.message}`);
  if (!data) return null;
  if (eventsError) throw new Error(`[careers] application events failed: ${eventsError.message}`);
  if (notesError) throw new Error(`[careers] application notes failed: ${notesError.message}`);

  const application = data as unknown as ApplicationWithJob;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", application.user_id)
    .maybeSingle();
  if (profileError) throw new Error(`[careers] application profile failed: ${profileError.message}`);

  return {
    ...application,
    events: events ?? [],
    notes: notes ?? [],
    profile: profile ?? null,
  };
}

export async function getDashboardStats(
  supabase: CareersServerClient
): Promise<DashboardStats> {
  const { data, error } = await supabase.rpc("admin_dashboard_stats");
  if (error) throw new Error(`[careers] getDashboardStats failed: ${error.message}`);
  return data as unknown as DashboardStats;
}

export async function listRecentApplications(
  supabase: CareersServerClient,
  limit = 8
): Promise<RecentApplicationSummary[]> {
  const { data, error } = await supabase
    .from("applications")
    .select(RECENT_APPLICATION_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`[careers] listRecentApplications failed: ${error.message}`);
  return (data ?? []) as unknown as RecentApplicationSummary[];
}

/**
 * Distinct candidates, derived from applications.
 *
 * There is no separate candidates table on purpose. A "candidate" is
 * someone who applied, and deriving the list means it can never drift
 * out of step with the applications it summarises.
 */
export async function listCandidates(
  supabase: CareersServerClient,
  pagination: PaginationInput = {}
): Promise<PaginatedResult<AdminCandidateSummary>> {
  const { page, pageSize } = normalizePagination(pagination);
  const { data, error } = await supabase.rpc("admin_candidate_summaries", {
    p_limit: pageSize,
    p_offset: (page - 1) * pageSize,
  });
  if (error) throw new Error(`[careers] listCandidates failed: ${error.message}`);

  const result = data as unknown as { items?: AdminCandidateSummary[]; total?: number };
  const total = Number(result?.total ?? 0);
  return {
    items: Array.isArray(result?.items) ? result.items : [],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

// ---------------------------------------------------------------------
// Resume access
// ---------------------------------------------------------------------

/**
 * A short-lived signed URL for a stored resume.
 *
 * The bucket is private and has no public read policy, so this is the
 * only way to open a CV. Signing happens through the caller's own
 * session, which means storage RLS still decides whether they are
 * allowed to: an admin or the file's owner, nobody else.
 *
 * 60 seconds is enough to follow a link and short enough that a URL
 * pasted into a chat is dead before it travels.
 */
export async function createResumeSignedUrl(
  supabase: CareersServerClient,
  resumePath: string,
  expiresInSeconds = 60
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(resumePath, expiresInSeconds);

  if (error) {
    console.error("[careers] createResumeSignedUrl failed", error.message);
    return null;
  }
  return data?.signedUrl ?? null;
}
