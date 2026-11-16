import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Form from "next/form";
import { Search, X } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { listAllJobs, listApplications } from "@/lib/careers/queries";
import { daysAgoIso, formatDate } from "@/lib/careers/format";
import { APPLICATION_STATUS_OPTIONS } from "@/lib/careers/constants";
import { StatusChip } from "@/components/careers/status-chip";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminTableSkeleton } from "@/components/admin/admin-skeletons";
import { FilterSubmitButton } from "@/components/admin/filter-submit-button";
import type { PaginatedResult, ApplicationListItem } from "@/lib/careers/types";
import { ADMIN_PAGE_SIZES, normalizePagination } from "@/lib/careers/types";
import {
  adminButtonClasses,
  adminFilterControlClasses,
  adminFilterLabelClasses,
  adminFilterSearchClasses,
  EmptyState,
  PageHeader,
  Panel,
  TableScroller,
  Td,
  Th,
} from "@/components/admin/admin-ui";

/**
 * All applications, with filters.
 *
 * The filter bar uses `next/form`, with a normal GET fallback. The
 * resulting URL remains shareable and bookmarkable,
 * which matters when a recruiter wants to send a colleague "everyone
 * shortlisted for the SAP role".
 *
 * Search runs server-side across name, email and reference. The term is
 * stripped of PostgREST's filter syntax before it is interpolated, in
 * `listApplications`, so a crafted query cannot restructure the filter
 * it sits inside.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Applications",
};

const DATE_RANGES = [
  { value: "", label: "Any time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
] as const;

interface AdminApplicationsPageProps {
  searchParams: Promise<{
    jobId?: string;
    status?: string;
    department?: string;
    days?: string;
    q?: string;
    page?: string;
    pageSize?: string;
  }>;
}

async function ApplicationsTable({
  result,
  hasFilters,
  params,
}: {
  result: Promise<PaginatedResult<ApplicationListItem>>;
  hasFilters: boolean;
  params: Awaited<AdminApplicationsPageProps["searchParams"]>;
}) {
  const applications = await result;
  return (
    <Panel title={`${applications.total} application${applications.total === 1 ? "" : "s"}`}>
      {applications.items.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Nothing matches those filters" : "No applications yet"}
          description={hasFilters ? "Try widening the search, or clear the filters to see everything." : "Applications appear here the moment a candidate submits one."}
          action={hasFilters ? <Link href="/admin/applications" className={adminButtonClasses.outline}>Clear filters</Link> : undefined}
        />
      ) : (
        <>
          <TableScroller label="Applications">
            <table className="w-full min-w-[860px] border-collapse">
              <thead><tr><Th>Candidate</Th><Th>Role</Th><Th>Department</Th><Th>Submitted</Th><Th>Status</Th></tr></thead>
              <tbody>
                {applications.items.map((application) => (
                  <tr key={application.id} className="transition-colors duration-150 hover:bg-slate-50">
                    <Td mobileLabel="Candidate">
                      <Link href={`/admin/applications/${application.id}`} className="font-medium text-slate-900 underline-offset-4 transition-colors duration-150 hover:text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2">{application.full_name}</Link>
                      <span className="mt-0.5 block truncate text-[12.5px] text-slate-500">{application.email}</span>
                      <span className="mt-0.5 block font-mono text-[11.5px] text-slate-400">{application.reference}</span>
                    </Td>
                    <Td mobileLabel="Role" className="text-slate-600">{application.job?.title ?? "Role removed"}</Td>
                    <Td mobileLabel="Department" className="whitespace-nowrap text-slate-600">{application.job?.department ?? ""}</Td>
                    <Td mobileLabel="Submitted" className="whitespace-nowrap text-slate-600"><time dateTime={application.created_at}>{formatDate(application.created_at)}</time></Td>
                    <Td mobileLabel="Status"><StatusChip status={application.status} /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroller>
          <AdminPagination
            basePath="/admin/applications"
            page={applications.page}
            pageSize={applications.pageSize}
            total={applications.total}
            totalPages={applications.totalPages}
            params={{ jobId: params.jobId, status: params.status, department: params.department, days: params.days, q: params.q }}
          />
        </>
      )}
    </Panel>
  );
}

export default async function AdminApplicationsPage({
  searchParams,
}: AdminApplicationsPageProps) {
  const params = await searchParams;
  const { supabase } = await requireAdmin("/admin/applications");
  const pagination = normalizePagination({
    page: Number(params.page),
    pageSize: Number(params.pageSize),
  });

  const since = daysAgoIso(
    params.days ? Number.parseInt(params.days, 10) : Number.NaN
  );

  const jobsPromise = listAllJobs(supabase);
  const applicationsPromise = listApplications(supabase, {
      jobId: params.jobId,
      status: params.status,
      department: params.department,
      since,
      query: params.q,
      ...pagination,
    });
  const jobs = await jobsPromise;

  const departments = Array.from(new Set(jobs.map((job) => job.department))).sort((a, b) =>
    a.localeCompare(b)
  );

  const hasFilters = Boolean(
    params.jobId || params.status || params.department || params.days || params.q
  );

  return (
    <>
      <PageHeader
        eyebrow="Pipeline"
        title="Applications"
        description="Every submitted application, across every role."
      />

      <Panel className="mb-6">
        <Form action="/admin/applications" className="p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="xl:col-span-2">
              <label htmlFor="q" className={adminFilterLabelClasses}>
                Search
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="q"
                  name="q"
                  type="search"
                  defaultValue={params.q ?? ""}
                  placeholder="Name, email or application ID"
                  className={adminFilterSearchClasses}
                />
              </div>
            </div>

            <div>
              <label htmlFor="jobId" className={adminFilterLabelClasses}>
                Role
              </label>
              <select
                id="jobId"
                name="jobId"
                defaultValue={params.jobId ?? ""}
                className={adminFilterControlClasses}
              >
                <option value="">All roles</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className={adminFilterLabelClasses}>
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={params.status ?? ""}
                className={adminFilterControlClasses}
              >
                <option value="">All statuses</option>
                {APPLICATION_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="department" className={adminFilterLabelClasses}>
                Department
              </label>
              <select
                id="department"
                name="department"
                defaultValue={params.department ?? ""}
                className={adminFilterControlClasses}
              >
                <option value="">All departments</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="days" className={adminFilterLabelClasses}>
                Submitted
              </label>
              <select
                id="days"
                name="days"
                defaultValue={params.days ?? ""}
                className={adminFilterControlClasses}
              >
                {DATE_RANGES.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pageSize" className={adminFilterLabelClasses}>Rows per page</label>
              <select id="pageSize" name="pageSize" defaultValue={String(pagination.pageSize)} className={adminFilterControlClasses}>
                {ADMIN_PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <FilterSubmitButton />

            {hasFilters && (
              <Link
                href="/admin/applications"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition-colors duration-150 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </Link>
            )}

          </div>
        </Form>
      </Panel>

      <Suspense key={JSON.stringify(params)} fallback={<AdminTableSkeleton />}>
        <ApplicationsTable result={applicationsPromise} hasFilters={hasFilters} params={params} />
      </Suspense>
    </>
  );
}
