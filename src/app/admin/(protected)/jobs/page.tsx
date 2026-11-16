import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Plus, X } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { listAllJobsWithCounts } from "@/lib/careers/queries";
import { formatDate, isJobClosed } from "@/lib/careers/format";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/careers/constants";
import { JOB_STATUS_FILTER_OPTIONS } from "@/lib/careers/constants";
import type { JobStatus } from "@/lib/supabase/database.types";
import {
  adminButtonClasses,
  adminFilterControlClasses,
  adminFilterLabelClasses,
  EmptyState,
  JobStatusBadge,
  PageHeader,
  Panel,
  TableScroller,
  Td,
  Th,
} from "@/components/admin/admin-ui";
import { CopyLinkedInLinkButton } from "@/components/admin/linkedin-application-link";
import { linkedInApplicationUrl } from "@/lib/site";
import { JobReviewActions } from "@/components/admin/job-review-actions";
import { JobSubmitButton } from "@/components/admin/job-submit-button";
import { FilterSubmitButton } from "@/components/admin/filter-submit-button";

/**
 * All jobs, in every state.
 *
 * An administrator sees drafts and closed roles here because the
 * `jobs_admin_read_all` policy grants it. The same query run by an
 * anonymous visitor returns only published roles, since only
 * `jobs_public_read_published` would match. The filtering is the
 * database's, not this page's.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jobs",
};

interface AdminJobsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminJobsPage({ searchParams }: AdminJobsPageProps) {
  const { status: requestedStatus } = await searchParams;
  const status = JOB_STATUS_FILTER_OPTIONS.some(
    (option) => option.value && option.value === requestedStatus
  )
    ? (requestedStatus as JobStatus)
    : undefined;
  const { supabase, adminRole } = await requireAdmin("/admin/jobs");
  const jobs = await listAllJobsWithCounts(supabase, status);

  return (
    <>
      <PageHeader
        eyebrow="Roles"
        title="Jobs"
        description="Every role, including drafts and closed positions."
        action={
          <Link href="/admin/jobs/new" className={adminButtonClasses.primary}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New job
          </Link>
        }
      />

      <Panel className="mb-6">
        <form method="get" className="flex flex-wrap items-end gap-3 p-5">
          <div className="w-full sm:w-56">
            <label htmlFor="job-status-filter" className={adminFilterLabelClasses}>Status</label>
            <select
              id="job-status-filter"
              name="status"
              defaultValue={status ?? ""}
              className={adminFilterControlClasses}
            >
              {JOB_STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <FilterSubmitButton />
          {status && (
            <Link
              href="/admin/jobs"
              className="inline-flex min-h-11 items-center gap-1.5 text-[13px] font-medium text-slate-500 transition-colors duration-150 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 sm:min-h-10"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Link>
          )}
        </form>
      </Panel>

      <Panel title={`${jobs.length} job${jobs.length === 1 ? "" : "s"}`}>
        {jobs.length === 0 ? (
          <EmptyState
            title="No jobs yet"
            description={status ? "No jobs match this status." : "Create your first role and publish it to make it visible on the careers page."}
            action={
              <Link href="/admin/jobs/new" className={adminButtonClasses.primary}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                New job
              </Link>
            }
          />
        ) : (
          <TableScroller label="Jobs">
            <table className="w-full min-w-[1240px] border-collapse">
              <thead>
                <tr>
                  <Th>Role</Th>
                  <Th>Department</Th>
                  <Th>Creator</Th>
                  <Th>Submitted</Th>
                  <Th>Type</Th>
                  <Th className="text-right">Applications</Th>
                  <Th>Posted</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const count = job.applicationCount;
                  const applicationLinkAvailable = !isJobClosed(job);
                  const linkedinUnavailableReason =
                    job.status === "draft"
                      ? "Publish to enable"
                      : job.status === "pending_approval"
                        ? "Available after approval"
                        : job.status === "changes_requested"
                          ? "Resolve changes and publish"
                      : job.status === "closed"
                        ? "Reopen to enable"
                        : "Closing date passed";

                  return (
                    <tr key={job.id} className="transition-colors duration-150 hover:bg-slate-50">
                      <Td mobileLabel="Role">
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="font-medium text-slate-900 underline-offset-4 transition-colors duration-150 hover:text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
                        >
                          {job.title}
                        </Link>
                        <span className="mt-0.5 block font-mono text-[11.5px] text-slate-400">
                          /{job.slug}
                        </span>
                      </Td>
                      <Td mobileLabel="Department" className="whitespace-nowrap text-slate-600">{job.department}</Td>
                      <Td mobileLabel="Creator" className="whitespace-nowrap text-slate-600">
                        {job.creator?.name ?? "Administrator"}
                      </Td>
                      <Td mobileLabel="Submitted" className="whitespace-nowrap text-slate-600">
                        {job.approval?.submitted_at ? (
                          <>
                            <span className="block">{job.submitter?.name ?? "Administrator"}</span>
                            <span className="text-[12px] text-slate-400">{formatDate(job.approval.submitted_at)}</span>
                          </>
                        ) : "Not submitted"}
                      </Td>
                      <Td mobileLabel="Type" className="whitespace-nowrap text-slate-600">
                        {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
                      </Td>
                      <Td mobileLabel="Applications" className="text-right">
                        {count > 0 ? (
                          <Link
                            href={`/admin/applications?jobId=${job.id}`}
                            className="font-mono font-semibold tabular-nums text-slate-900 underline-offset-4 transition-colors duration-150 hover:text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
                          >
                            {count}
                          </Link>
                        ) : (
                          <span className="font-mono tabular-nums text-slate-400">0</span>
                        )}
                      </Td>
                      <Td mobileLabel="Posted" className="whitespace-nowrap text-slate-600">
                        {job.published_at ? formatDate(job.published_at) : "Not published"}
                      </Td>
                      <Td mobileLabel="Status">
                        <JobStatusBadge status={job.status} />
                      </Td>
                      <Td mobileLabel="Actions" className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {adminRole !== "super_admin" && ["draft", "changes_requested", "closed"].includes(job.status) && (
                            <JobSubmitButton jobId={job.id} />
                          )}
                          {adminRole === "super_admin" && job.status === "pending_approval" && (
                            <JobReviewActions jobId={job.id} compact />
                          )}
                          <CopyLinkedInLinkButton
                            url={
                              applicationLinkAvailable
                                ? linkedInApplicationUrl(job.id)
                                : undefined
                            }
                            jobTitle={job.title}
                            disabledReason={linkedinUnavailableReason}
                            variant="table"
                          />

                          {job.status === "published" && (
                            <Link
                              href={`/careers/${job.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`View ${job.title} on the public site`}
                              title="View public job page"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
                            >
                              <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          )}
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableScroller>
        )}
      </Panel>
    </>
  );
}
