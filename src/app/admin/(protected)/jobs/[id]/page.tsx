import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getAdminActors, getJobApprovalState, getJobById } from "@/lib/careers/queries";
import { formatDate, formatDateTime, isJobClosed } from "@/lib/careers/format";
import { JobForm } from "@/components/admin/job-form";
import { JobStatusActions } from "@/components/admin/job-status-actions";
import { CopyLinkedInLinkButton } from "@/components/admin/linkedin-application-link";
import { JobStatusBadge, PageHeader, Panel } from "@/components/admin/admin-ui";
import { linkedInApplicationUrl } from "@/lib/site";
import { createdJobMessage } from "@/lib/careers/job-approval";
import type { JobStatus } from "@/lib/supabase/database.types";

/**
 * Edit a job.
 *
 * Lifecycle controls sit above the form rather than inside it, because
 * publishing and closing are not edits: they take effect immediately
 * and independently of whatever is currently typed into the fields
 * below.
 */

export const dynamic = "force-dynamic";

interface AdminJobPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}

export const metadata: Metadata = { title: "Edit job" };

export default async function AdminJobPage({ params, searchParams }: AdminJobPageProps) {
  const { id } = await params;
  const { created } = await searchParams;

  const { supabase, adminRole } = await requireAdmin(`/admin/jobs/${id}`);
  const [job, approval, applicationCountResult] = await Promise.all([
    getJobById(supabase, id),
    getJobApprovalState(supabase, id),
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("job_id", id),
  ]);

  if (!job) notFound();
  if (applicationCountResult.error) {
    throw new Error(`[careers] job application count failed: ${applicationCountResult.error.message}`);
  }
  const applicationCount = applicationCountResult.count ?? 0;
  const actors = await getAdminActors(supabase, [
    job.created_by,
    approval?.submitted_by,
    approval?.reviewed_by,
  ]);
  const creator = job.created_by ? actors[job.created_by] : null;
  const submitter = approval?.submitted_by ? actors[approval.submitted_by] : null;
  const reviewer = approval?.reviewed_by ? actors[approval.reviewed_by] : null;
  const applicationLinkAvailable = !isJobClosed(job);
  const linkedinApplicationUrl = applicationLinkAvailable
    ? linkedInApplicationUrl(job.id)
    : null;

  const unavailableReason =
    job.status === "draft"
      ? "Publish this job to enable its LinkedIn application link."
      : job.status === "pending_approval"
        ? "This link becomes available after the job is approved and published."
        : job.status === "changes_requested"
          ? "Resolve the requested changes and publish this job to enable its LinkedIn link."
      : job.status === "closed"
        ? "Reopen and publish this job to enable its LinkedIn application link."
        : "Applications have passed their closing date. Update the date before sharing this job on LinkedIn.";

  return (
    <>
      <Link
        href="/admin/jobs"
        className="group mb-5 inline-flex items-center gap-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-slate-500 transition-colors duration-150 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
      >
        <ChevronLeft
          className="h-3.5 w-3.5 transition-transform duration-150 ease-out group-hover:-translate-x-0.5"
          aria-hidden="true"
        />
        All jobs
      </Link>

      {created && ["draft", "pending_approval", "published"].includes(created) && (
        <p
          role="status"
          className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13.5px] font-medium text-emerald-800"
        >
          {createdJobMessage(created as JobStatus)}
        </p>
      )}

      <PageHeader
        eyebrow="Edit"
        title={job.title}
        action={
          job.status === "published" ? (
            <Link
              href={`/careers/${job.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-[13.5px] font-semibold text-slate-800 transition-[border-color,background-color] duration-150 ease-out hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View live
            </Link>
          ) : undefined
        }
      />

      <Panel className="mb-7">
        <div className="flex flex-wrap items-center justify-between gap-5 p-5">
          <dl className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <div>
              <dt className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Status
              </dt>
              <dd className="mt-1.5">
                <JobStatusBadge status={job.status} />
              </dd>
            </div>

            <div>
              <dt className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-slate-500">Creator</dt>
              <dd className="mt-1 text-[14px] font-medium text-slate-900">{creator?.name ?? "Administrator"}</dd>
            </div>

            {approval?.submitted_at && (
              <div>
                <dt className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-slate-500">Submitted</dt>
                <dd className="mt-1 text-[14px] font-medium text-slate-900">
                  {submitter?.name ?? "Administrator"} · {formatDateTime(approval.submitted_at)}
                </dd>
              </div>
            )}

            {approval?.reviewed_at && (
              <div>
                <dt className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-slate-500">Reviewed</dt>
                <dd className="mt-1 text-[14px] font-medium text-slate-900">
                  {reviewer?.name ?? "Administrator"} · {formatDateTime(approval.reviewed_at)}
                </dd>
              </div>
            )}

            <div>
              <dt className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Applications
              </dt>
              <dd className="mt-1 font-mono text-[14px] font-semibold tabular-nums text-slate-900">
                {applicationCount > 0 ? (
                  <Link
                    href={`/admin/applications?jobId=${job.id}`}
                    className="underline-offset-4 transition-colors duration-150 hover:text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
                  >
                    {applicationCount}
                  </Link>
                ) : (
                  applicationCount
                )}
              </dd>
            </div>

            <div>
              <dt className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Posted
              </dt>
              <dd className="mt-1 text-[14px] font-medium text-slate-900">
                {job.published_at ? formatDate(job.published_at) : "Not published"}
              </dd>
            </div>

            <div>
              <dt className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Last edited
              </dt>
              <dd className="mt-1 text-[14px] font-medium text-slate-900">
                {formatDateTime(job.updated_at)}
              </dd>
            </div>
          </dl>

          <JobStatusActions
            jobId={job.id}
            status={job.status}
            applicationCount={applicationCount}
            adminRole={adminRole}
          />
        </div>
      </Panel>

      {job.status === "changes_requested" && approval?.review_reason && (
        <section className="mb-7 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4" aria-labelledby="changes-requested-heading">
          <h2 id="changes-requested-heading" className="text-[14px] font-semibold text-rose-900">Changes requested</h2>
          <p className="mt-1.5 whitespace-pre-wrap text-[13.5px] leading-[1.6] text-rose-800">{approval.review_reason}</p>
        </section>
      )}

      <Panel title="LinkedIn application link" className="mb-7">
        <div className="p-5">
          {linkedinApplicationUrl ? (
            <>
              <p className="max-w-[72ch] text-[13.5px] leading-[1.6] text-slate-600">
                Paste this stable URL into LinkedIn&apos;s external application field. Candidates
                will arrive at this role&apos;s current public page and apply through Siddiona.
              </p>

              <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  <label
                    htmlFor="linkedin-application-url"
                    className="sr-only"
                  >
                    LinkedIn application URL
                  </label>
                  <input
                    id="linkedin-application-url"
                    value={linkedinApplicationUrl}
                    readOnly
                    spellCheck={false}
                    className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 font-mono text-base text-slate-700 selection:bg-orange-200 focus:border-[#EA580C] focus:bg-white focus:outline-none focus:shadow-[0_0_0_3px_rgba(234,88,12,0.14)] sm:text-[12.5px]"
                  />
                </div>

                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <CopyLinkedInLinkButton
                    url={linkedinApplicationUrl}
                    jobTitle={job.title}
                  />
                  <a
                    href={linkedinApplicationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-[13.5px] font-semibold text-slate-800 transition-[border-color,background-color] duration-150 ease-out hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Open application page
                  </a>
                </div>
              </div>
            </>
          ) : (
            <p className="text-[13.5px] leading-[1.6] text-slate-600">{unavailableReason}</p>
          )}
        </div>
      </Panel>

      <JobForm job={job} applicationCount={applicationCount} adminRole={adminRole} />
    </>
  );
}
