import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { JobForm } from "@/components/admin/job-form";
import { PageHeader } from "@/components/admin/admin-ui";

/**
 * Create a job.
 *
 * The form offers "Save as draft" and "Create and publish" as separate
 * submits rather than a status dropdown, because those are the two
 * things a recruiter actually wants at this moment and naming them
 * removes a decision about what a field means.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New job",
};

export default async function NewJobPage() {
  const { adminRole } = await requireAdmin("/admin/jobs/new");

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

      <PageHeader
        eyebrow="Create"
        title="New job"
        description={
          adminRole === "super_admin"
            ? "Save a private draft or publish the role when it is ready."
            : "Save a private draft or submit the completed role for Super Admin approval."
        }
      />

      <JobForm adminRole={adminRole} />
    </>
  );
}
