import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Form from "next/form";
import { requireAdmin } from "@/lib/auth/guards";
import { listCandidates } from "@/lib/careers/queries";
import { formatDate } from "@/lib/careers/format";
import { ADMIN_PAGE_SIZES, normalizePagination, type AdminCandidateSummary, type PaginatedResult } from "@/lib/careers/types";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminTableSkeleton } from "@/components/admin/admin-skeletons";
import { FilterSubmitButton } from "@/components/admin/filter-submit-button";
import {
  adminFilterControlClasses,
  adminFilterLabelClasses,
  EmptyState,
  PageHeader,
  Panel,
  TableScroller,
  Td,
  Th,
} from "@/components/admin/admin-ui";

/**
 * Candidates.
 *
 * Derived from applications rather than stored separately. A candidate
 * is someone who applied, so deriving the list means it can never drift
 * out of step with the applications it summarises, and there is no
 * second copy of anybody's contact details to keep in sync or to leak.
 *
 * `profiles` is deliberately not the source here: it holds an account
 * for anyone who ever signed in, including people who never applied,
 * and they are not candidates.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Candidates",
};

interface AdminCandidatesPageProps {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}

async function CandidatesTable({ result }: { result: Promise<PaginatedResult<AdminCandidateSummary>> }) {
  const candidates = await result;
  return (
    <Panel title={`${candidates.total} candidate${candidates.total === 1 ? "" : "s"}`}>
      {candidates.items.length === 0 ? (
        <EmptyState title="No candidates yet" description="Anyone who submits an application appears here." />
      ) : (
        <>
          <TableScroller label="Candidates">
            <table className="w-full min-w-[720px] border-collapse">
              <thead><tr><Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th className="text-right">Applications</Th><Th>Most recent</Th></tr></thead>
              <tbody>
                {candidates.items.map((candidate) => (
                  <tr key={candidate.userId} className="transition-colors duration-150 hover:bg-slate-50">
                    <Td mobileLabel="Name" className="font-medium text-slate-900">{candidate.fullName}</Td>
                    <Td mobileLabel="Email"><a href={`mailto:${candidate.email}`} className="text-slate-600 underline-offset-4 transition-colors duration-150 hover:text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2">{candidate.email}</a></Td>
                    <Td mobileLabel="Phone"><a href={`tel:${candidate.phone.replace(/\s/g, "")}`} className="whitespace-nowrap text-slate-600 underline-offset-4 transition-colors duration-150 hover:text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2">{candidate.phone}</a></Td>
                    <Td mobileLabel="Applications" className="text-right"><Link href={`/admin/applications?q=${encodeURIComponent(candidate.email)}`} className="font-mono font-semibold tabular-nums text-slate-900 underline-offset-4 transition-colors duration-150 hover:text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2">{candidate.applications}</Link></Td>
                    <Td mobileLabel="Most recent" className="whitespace-nowrap text-slate-600"><time dateTime={candidate.latestAt}>{formatDate(candidate.latestAt)}</time></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroller>
          <AdminPagination basePath="/admin/candidates" page={candidates.page} pageSize={candidates.pageSize} total={candidates.total} totalPages={candidates.totalPages} />
        </>
      )}
    </Panel>
  );
}

export default async function AdminCandidatesPage({ searchParams }: AdminCandidatesPageProps) {
  const params = await searchParams;
  const { supabase } = await requireAdmin("/admin/candidates");
  const pagination = normalizePagination({ page: Number(params.page), pageSize: Number(params.pageSize) });
  const candidates = listCandidates(supabase, pagination);

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Candidates"
        description="Everyone who has applied, and how many roles they have applied for."
      />
      <Panel className="mb-6">
        <Form action="/admin/candidates" className="flex flex-wrap items-end gap-3 p-5">
          <div className="w-full sm:w-40">
            <label htmlFor="pageSize" className={adminFilterLabelClasses}>Rows per page</label>
            <select id="pageSize" name="pageSize" defaultValue={String(pagination.pageSize)} className={adminFilterControlClasses}>
              {ADMIN_PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
          <FilterSubmitButton />
        </Form>
      </Panel>
      <Suspense key={`${pagination.page}:${pagination.pageSize}`} fallback={<AdminTableSkeleton />}>
        <CandidatesTable result={candidates} />
      </Suspense>
    </>
  );
}
