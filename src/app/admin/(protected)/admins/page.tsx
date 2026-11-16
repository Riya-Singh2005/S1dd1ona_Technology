import type { Metadata } from "next";
import { Suspense } from "react";
import Form from "next/form";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { requireAdminManager } from "@/lib/auth/guards";
import { listAdminAccounts } from "@/lib/admin-management/queries";
import type { AdminAccountPage, AdminAccountSummary } from "@/lib/admin-management/types";
import { ADMIN_PAGE_SIZES, normalizePagination } from "@/lib/careers/types";
import { formatDate, formatDateTime } from "@/lib/careers/format";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminTableSkeleton } from "@/components/admin/admin-skeletons";
import { CreateAdminDialog } from "@/components/admin/create-admin-dialog";
import { FilterSubmitButton } from "@/components/admin/filter-submit-button";
import { RevokeAdminButton } from "@/components/admin/revoke-admin-button";
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
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administrators",
};

interface AdminsPageProps {
  searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>;
}

function permissionLabel(account: AdminAccountSummary): string {
  if (account.role === "super_admin") return "Admin Manager";
  if (account.role === "recruiter") return "Recruiter (legacy)";
  return "Administrator";
}

function StatusBadge({ status }: Pick<AdminAccountSummary, "status">) {
  const label = status === "active" ? "Active" : status === "disabled" ? "Disabled" : "Pending";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold whitespace-nowrap",
        status === "active" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "pending" && "border-amber-200 bg-amber-50 text-amber-800",
        status === "disabled" && "border-slate-300 bg-slate-100 text-slate-600"
      )}
    >
      {label}
    </span>
  );
}

async function AdminsTable({
  result,
  query,
  currentUserId,
}: {
  result: Promise<AdminAccountPage>;
  query?: string;
  currentUserId: string;
}) {
  const accounts = await result;
  const hasQuery = Boolean(query?.trim());

  return (
    <Panel title={`${accounts.total} administrator${accounts.total === 1 ? "" : "s"}`}>
      {accounts.items.length === 0 ? (
        <EmptyState
          title={hasQuery ? "No administrators match that search" : "No administrators yet"}
          description={
            hasQuery
              ? "Try another name or email address, or clear the search."
              : "Create an administrator to give someone secure dashboard access."
          }
          action={
            hasQuery ? (
              <Link href="/admin/admins" className={adminButtonClasses.outline}>
                Clear search
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <TableScroller label="Administrators">
            <table className="w-full min-w-[1080px] border-collapse">
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Permission</Th>
                  <Th>Status</Th>
                  <Th>Account created</Th>
                  <Th>Last sign-in</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {accounts.items.map((account) => {
                  const isCurrentUser = account.userId === currentUserId;
                  return (
                    <tr
                      key={account.userId}
                      className="transition-colors duration-150 hover:bg-slate-50"
                    >
                      <Td mobileLabel="Name" className="font-medium text-slate-900">
                        {account.fullName || "Name not provided"}
                      </Td>
                      <Td mobileLabel="Email">
                        <a
                          href={`mailto:${account.email}`}
                          className="text-slate-600 underline-offset-4 transition-colors duration-150 hover:text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
                        >
                          {account.email}
                        </a>
                      </Td>
                      <Td mobileLabel="Permission" className="whitespace-nowrap text-slate-600">
                        {permissionLabel(account)}
                      </Td>
                      <Td mobileLabel="Status">
                        <StatusBadge status={account.status} />
                      </Td>
                      <Td mobileLabel="Account created" className="whitespace-nowrap text-slate-600">
                        <time dateTime={account.createdAt}>{formatDate(account.createdAt)}</time>
                      </Td>
                      <Td mobileLabel="Last sign-in" className="whitespace-nowrap text-slate-600">
                        {account.lastSignInAt ? (
                          <time dateTime={account.lastSignInAt}>
                            {formatDateTime(account.lastSignInAt)}
                          </time>
                        ) : (
                          "Never"
                        )}
                      </Td>
                      <Td mobileLabel="Actions" className="text-right">
                        {isCurrentUser ? (
                          <span className="text-[12.5px] font-medium text-slate-600">You</span>
                        ) : account.role === "super_admin" ? (
                          <span className="text-[12.5px] font-medium text-slate-600">Protected</span>
                        ) : (
                          <RevokeAdminButton
                            userId={account.userId}
                            name={account.fullName || account.email}
                          />
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableScroller>
          <AdminPagination
            basePath="/admin/admins"
            page={accounts.page}
            pageSize={accounts.pageSize}
            total={accounts.total}
            totalPages={accounts.totalPages}
            params={{ q: query }}
          />
        </>
      )}
    </Panel>
  );
}

export default async function AdminsPage({ searchParams }: AdminsPageProps) {
  const params = await searchParams;
  const { supabase, user } = await requireAdminManager("/admin/admins");
  const pagination = normalizePagination({
    page: Number(params.page),
    pageSize: Number(params.pageSize),
  });
  const query = params.q?.trim() || undefined;
  const accounts = listAdminAccounts(supabase, { ...pagination, query });

  return (
    <>
      <PageHeader
        eyebrow="Access"
        title="Administrators"
        description="Invite administrators and control who can access the careers dashboard."
        action={<CreateAdminDialog />}
      />

      <Panel className="mb-6">
        <Form action="/admin/admins" className="p-5">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
            <div>
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
                  defaultValue={query ?? ""}
                  placeholder="Name or email"
                  className={adminFilterSearchClasses}
                />
              </div>
            </div>
            <div>
              <label htmlFor="pageSize" className={adminFilterLabelClasses}>
                Rows per page
              </label>
              <select
                id="pageSize"
                name="pageSize"
                defaultValue={String(pagination.pageSize)}
                className={adminFilterControlClasses}
              >
                {ADMIN_PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <FilterSubmitButton />
            {query && (
              <Link
                href="/admin/admins"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition-colors duration-150 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </Link>
            )}
          </div>
        </Form>
      </Panel>

      <Suspense
        key={`${query ?? ""}:${pagination.page}:${pagination.pageSize}`}
        fallback={<AdminTableSkeleton />}
      >
        <AdminsTable result={accounts} query={query} currentUserId={user.id} />
      </Suspense>
    </>
  );
}
