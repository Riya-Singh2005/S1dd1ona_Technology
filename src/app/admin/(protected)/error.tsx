"use client";

import { useEffect } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";
import { adminButtonClasses, Panel } from "@/components/admin/admin-ui";

export default function ProtectedAdminError({ error, reset, retry }: { error: Error & { digest?: string }; reset: () => void; retry?: () => void }) {
  useEffect(() => { console.error("[admin] protected route error", error.digest ?? "", error.message); }, [error]);
  return (
    <Panel>
      <div className="p-6 sm:p-8">
        <TriangleAlert className="h-6 w-6 text-amber-600" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold text-slate-900">This section could not load</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">The admin navigation is still available. Retry this request, or move to another section.</p>
        {error.digest && <p className="mt-4 font-mono text-xs text-slate-500">Reference: {error.digest}</p>}
        <button type="button" onClick={retry ?? reset} className={`${adminButtonClasses.dark} mt-6`}>
          <RotateCw className="h-4 w-4" aria-hidden="true" /> Try again
        </button>
      </div>
    </Panel>
  );
}
