import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getDashboardStats, listRecentApplications } from "@/lib/careers/queries";
import { formatDate } from "@/lib/careers/format";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_PIPELINE,
} from "@/lib/careers/constants";
import { StatusChip } from "@/components/careers/status-chip";
import {
  adminButtonClasses,
  EmptyState,
  PageHeader,
  Panel,
  StatCard,
  TableScroller,
  Td,
  Th,
} from "@/components/admin/admin-ui";
import type { ApplicationStatus } from "@/lib/supabase/database.types";

/**
 * Admin dashboard.
 *
 * Every figure comes from a counted query rather than a cached
 * aggregate, so the numbers are true at the moment the page renders.
 * The counts use `head: true`, which returns the count without the rows.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const [stats, recent] = await Promise.all([
    getDashboardStats(supabase),
    listRecentApplications(supabase, 8),
  ]);

  // Terminal states are shown after the pipeline rather than inside it.
  const statusOrder: ApplicationStatus[] = [
    ...APPLICATION_PIPELINE,
    "rejected",
    "withdrawn",
  ];

  const maxStatusCount = Math.max(
    1,
    ...statusOrder.map((status) => stats.byStatus[status] ?? 0)
  );

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Hiring activity across every role."
        action={
          <Link href="/admin/jobs/new" className={adminButtonClasses.primary}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New job
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open roles"
          value={stats.openJobs}
          hint={
            stats.pendingApprovalJobs > 0
              ? `${stats.pendingApprovalJobs} awaiting approval`
              : stats.draftJobs > 0
              ? `${stats.draftJobs} draft${stats.draftJobs === 1 ? "" : "s"} not yet published`
              : "All roles are published"
          }
          href="/admin/jobs"
        />
        <StatCard
          label="Total applications"
          value={stats.totalApplications}
          hint="Across every role, all time"
          href="/admin/applications"
        />
        <StatCard
          label="This week"
          value={stats.applicationsThisWeek}
          hint="Submitted in the last 7 days"
          href="/admin/applications"
        />
        <StatCard
          label="Needs review"
          value={stats.byStatus.submitted ?? 0}
          hint="Submitted and not yet looked at"
          href="/admin/applications?status=submitted"
        />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel
          title="Recent applications"
          action={
            <Link
              href="/admin/applications"
              className="text-[13px] font-medium text-[#C2410C] underline-offset-4 transition-colors duration-150 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
            >
              View all
            </Link>
          }
        >
          {recent.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Applications appear here the moment a candidate submits one."
            />
          ) : (
            <TableScroller label="Recent applications">
              <table className="w-full min-w-[620px] border-collapse">
                <thead>
                  <tr>
                    <Th>Candidate</Th>
                    <Th>Role</Th>
                    <Th>Submitted</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((application) => (
                    <tr key={application.id} className="transition-colors duration-150 hover:bg-slate-50">
                      <Td mobileLabel="Candidate">
                        <Link
                          href={`/admin/applications/${application.id}`}
                          className="font-medium text-slate-900 underline-offset-4 transition-colors duration-150 hover:text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
                        >
                          {application.full_name}
                        </Link>
                        <span className="mt-0.5 block font-mono text-[11.5px] text-slate-400">
                          {application.reference}
                        </span>
                      </Td>
                      <Td mobileLabel="Role" className="text-slate-600">{application.job?.title ?? "Role removed"}</Td>
                      <Td mobileLabel="Submitted" className="whitespace-nowrap text-slate-600">
                        {formatDate(application.created_at)}
                      </Td>
                      <Td mobileLabel="Status">
                        <StatusChip status={application.status} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroller>
          )}
        </Panel>

        <Panel title="By status">
          <div className="space-y-3 p-5">
            {statusOrder.map((status) => {
              const count = stats.byStatus[status] ?? 0;
              const width = Math.round((count / maxStatusCount) * 100);

              return (
                <div key={status}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] font-medium text-slate-700">
                      {APPLICATION_STATUS_LABELS[status]}
                    </span>
                    <span className="font-mono text-[13px] font-semibold tabular-nums text-slate-900">
                      {count}
                    </span>
                  </div>

                  {/*
                    A proportional bar, not a percentage of some target.
                    Scaled against the largest bucket so the shape of the
                    pipeline is readable at any volume.
                  */}
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-800"
                      style={{ width: `${count === 0 ? 0 : Math.max(width, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-200 px-5 py-4">
            <dl className="space-y-2 text-[13px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Draft roles</dt>
                <dd className="font-mono font-semibold tabular-nums text-slate-900">
                  {stats.draftJobs}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Pending approval</dt>
                <dd className="font-mono font-semibold tabular-nums text-slate-900">
                  {stats.pendingApprovalJobs}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Changes requested</dt>
                <dd className="font-mono font-semibold tabular-nums text-slate-900">
                  {stats.changesRequestedJobs}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Closed roles</dt>
                <dd className="font-mono font-semibold tabular-nums text-slate-900">
                  {stats.closedJobs}
                </dd>
              </div>
            </dl>
          </div>
        </Panel>
      </div>
    </>
  );
}
