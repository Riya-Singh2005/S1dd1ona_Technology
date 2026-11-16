import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { adminButtonClasses } from "@/components/admin/admin-ui";

interface AdminPaginationProps {
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  params?: Record<string, string | undefined>;
}

export function AdminPagination({
  basePath,
  page,
  pageSize,
  total,
  totalPages,
  params = {},
}: AdminPaginationProps) {
  const hrefFor = (targetPage: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
    query.set("page", String(targetPage));
    query.set("pageSize", String(pageSize));
    return `${basePath}?${query.toString()}`;
  };

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4" aria-label="Pagination">
      <p className="text-[12.5px] text-slate-500">
        Showing <span className="font-semibold text-slate-700">{start}-{end}</span> of{" "}
        <span className="font-semibold text-slate-700">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={adminButtonClasses.outline} scroll={false}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
          </Link>
        ) : (
          <span className={`${adminButtonClasses.outline} pointer-events-none opacity-50`} aria-disabled="true">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
          </span>
        )}
        <span className="min-w-20 text-center font-mono text-[12px] text-slate-500">
          {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={hrefFor(page + 1)} className={adminButtonClasses.outline} scroll={false}>
            Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className={`${adminButtonClasses.outline} pointer-events-none opacity-50`} aria-disabled="true">
            Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
