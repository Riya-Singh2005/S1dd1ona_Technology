import { Panel } from "@/components/admin/admin-ui";

export function AdminPageSkeleton({ rows = 7, form = false }: { rows?: number; form?: boolean }) {
  return (
    <div aria-busy="true" aria-label="Loading admin content" className="motion-reduce:animate-none">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-20 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="h-8 w-56 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="h-4 max-w-lg animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
      </div>
      {form ? (
        <Panel><div className="space-y-5 p-5">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-11 animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" />)}</div></Panel>
      ) : (
        <AdminTableSkeleton rows={rows} />
      )}
      <span className="sr-only" role="status">Loading</span>
    </div>
  );
}

export function AdminTableSkeleton({ rows = 7 }: { rows?: number }) {
  return (
    <Panel className="overflow-hidden">
      <div aria-busy="true" className="divide-y divide-slate-100">
        <div className="hidden h-11 bg-slate-50 sm:block" />
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="grid gap-3 px-4 py-4 sm:grid-cols-4 sm:gap-5 sm:px-5">
            {Array.from({ length: 4 }, (_, cell) => <div key={cell} className="h-4 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />)}
          </div>
        ))}
      </div>
    </Panel>
  );
}
