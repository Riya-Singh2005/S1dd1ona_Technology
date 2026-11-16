import { ApplyButton } from "@/components/careers/apply-button";
import { getMyApplicationForJob } from "@/lib/careers/queries";
import type { ApplicationRow, JobRow } from "@/lib/careers/types";
import { createClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

interface JobApplyRailProps {
  job: JobRow;
  isClosed: boolean;
  metaRows: Array<{ label: string; value: string }>;
}

export function JobApplyRailSkeleton({ metaRows }: Pick<JobApplyRailProps, "metaRows">) {
  return (
    <aside aria-busy="true" aria-label="Loading application options">
      <div className="lg:sticky lg:top-28">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5">
          <div className="h-3 w-14 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
          <div className="mt-3 h-6 w-48 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
          <div className="mt-5 h-11 w-full animate-pulse rounded-lg bg-slate-200 motion-reduce:animate-none" />
          <dl className="mt-6 border-t border-slate-200 pt-5">
            {metaRows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 py-2.5">
                <div className="h-3 w-24 rounded bg-slate-100" />
                <div className="h-4 w-28 rounded bg-slate-100" />
              </div>
            ))}
          </dl>
        </div>
      </div>
    </aside>
  );
}

export async function JobApplyRail({ job, isClosed, metaRows }: JobApplyRailProps) {
  let user: { id: string; email: string | null } | null = null;
  let profile: {
    full_name: string | null;
    phone: string | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
    github_url: string | null;
    resume_path: string | null;
  } | null = null;
  let existing: ApplicationRow | null = null;

  if (isSupabaseServerConfigured()) {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    const claims = claimsData?.claims;
    user = claims?.sub ? { id: claims.sub, email: claims.email ?? null } : null;

    if (user) {
      const [profileResult, existingApplication] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, phone, linkedin_url, portfolio_url, github_url, resume_path")
          .eq("id", user.id)
          .maybeSingle(),
        getMyApplicationForJob(supabase, user.id, job.id),
      ]);
      if (profileResult.error) {
        throw new Error(`[careers] application prefill failed: ${profileResult.error.message}`);
      }
      profile = profileResult.data;
      existing = existingApplication;
    }
  }

  const applyProps = {
    job: { id: job.id, title: job.title, slug: job.slug },
    isClosed,
    isAuthenticated: Boolean(user),
    userId: user?.id ?? null,
    existingApplication: existing
      ? { reference: existing.reference, status: existing.status, createdAt: existing.created_at }
      : null,
    prefill: {
      fullName: profile?.full_name ?? "",
      email: user?.email ?? "",
      phone: profile?.phone ?? "",
      linkedinUrl: profile?.linkedin_url ?? "",
      portfolioUrl: profile?.portfolio_url ?? "",
      githubUrl: profile?.github_url ?? "",
      resumePath: profile?.resume_path ?? null,
    },
  };

  return (
    <aside>
      <div className="lg:sticky lg:top-28">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#C2410C]">Apply</p>
          <h2 className="mt-2.5 font-display text-[19px] font-extrabold leading-[1.25] tracking-[-0.025em] text-[#0F172A]">
            Ready to take this on?
          </h2>
          <div className="mt-5"><ApplyButton {...applyProps} /></div>
          <dl className="mt-6 border-t border-slate-200 pt-5">
            {metaRows.map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-500">{row.label}</dt>
                <dd className="min-w-0 text-right text-[13.5px] font-semibold text-slate-900">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-5 px-1 text-[13px] leading-[1.6] text-slate-500">
          Questions about the role?{" "}
          <a
            href={`mailto:hr@example.com?subject=${encodeURIComponent(`Question about ${job.title}`)}`}
            className="font-semibold text-[#C2410C] underline-offset-4 transition-colors duration-200 hover:text-[#9A3412] hover:underline"
          >
            HR — hr@example.com
          </a>
          {" or "}
          <a
            href={`mailto:tech@example.com?subject=${encodeURIComponent(`Question about ${job.title}`)}`}
            className="font-semibold text-[#C2410C] underline-offset-4 transition-colors duration-200 hover:text-[#9A3412] hover:underline"
          >
            Technical — tech@example.com
          </a>
          .
        </p>
      </div>
    </aside>
  );
}
