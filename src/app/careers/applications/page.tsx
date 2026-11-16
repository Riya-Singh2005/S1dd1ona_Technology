import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { StatusChip } from "@/components/careers/status-chip";
import { ApplicationTimeline } from "@/components/careers/application-timeline";
import { WithdrawApplication } from "@/components/careers/withdraw-application";
import { requireUser } from "@/lib/auth/guards";
import { listMyApplicationEvents, listMyApplications } from "@/lib/careers/queries";
import { formatDate } from "@/lib/careers/format";
import { isTerminalStatus } from "@/lib/careers/constants";

/**
 * A candidate's applications.
 *
 * `requireUser` sends a signed-out visitor to the join page with a
 * `next` that brings them back here. That is routing convenience. The
 * `applications_read_own` policy is what makes this page safe: even if
 * the guard were removed, the query would return only rows belonging to
 * the caller, because Postgres filters them.
 *
 * Nothing on this page reads `application_notes`. Internal commentary
 * lives in a table with no candidate-facing policy, so it cannot be
 * rendered here even by accident.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your applications",
  robots: { index: false, follow: false },
};

export default async function ApplicationsPage() {
  const { supabase } = await requireUser("/careers/applications");

  const applications = await listMyApplications(supabase);
  const eventsByApplication = await listMyApplicationEvents(
    supabase,
    applications.map((application) => application.id)
  );

  return (
    <>
      <section className="bg-[#070B14] pb-12 pt-10 sm:pb-14 sm:pt-12">
        <Container size="default">
          <div className="flex items-center gap-2.5">
            <span className="h-1 w-2.5 shrink-0 rounded-full bg-[#EA580C]" aria-hidden="true" />
            <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#EA580C]">
              Your account
            </span>
          </div>

          <h1 className="mt-4 text-balance font-display text-[32px] font-extrabold leading-[1.04] tracking-[-0.04em] text-white sm:text-[40px]">
            Your applications
          </h1>

          <p className="mt-4 max-w-[58ch] text-pretty text-[16.5px] leading-[1.65] text-slate-400">
            {applications.length === 0
              ? "You have not applied for anything yet."
              : "Every application you have submitted, and where each one currently stands."}
          </p>
        </Container>
      </section>

      <section className="min-h-[40svh] bg-[#F7F6F2] py-14 sm:py-16 lg:py-20">
        <Container size="default">
          {applications.length === 0 ? (
            <div className="mx-auto max-w-[52ch] rounded-[18px] border border-slate-200/80 bg-white px-6 py-14 text-center shadow-[0_18px_44px_rgba(15,23,42,0.06)] sm:px-10">
              <span
                className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"
                aria-hidden="true"
              >
                <FileText className="h-5 w-5" strokeWidth={1.75} />
              </span>

              <h2 className="font-display text-xl font-extrabold tracking-[-0.03em] text-[#0F172A]">
                Nothing here yet
              </h2>

              <p className="mt-3 text-[15.5px] leading-[1.65] text-slate-600">
                When you apply for a role, it will appear here with its current status.
              </p>

              <Link
                href="/careers#open-roles"
                className="group mt-7 inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg bg-[#EA580C] px-6 text-[14.5px] font-bold text-white shadow-[0_10px_26px_rgba(234,88,12,0.22)] transition-[background-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#C2410C] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
              >
                Browse open roles
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          ) : (
            <ol className="space-y-6 sm:space-y-7">
              {applications.map((application, index) => {
                const events = eventsByApplication[application.id] ?? [];
                const canWithdraw = !isTerminalStatus(application.status);

                return (
                  <Reveal as="li" key={application.id} delay={Math.min(index, 6) * 0.055}>
                    <article className="rounded-[18px] border border-slate-200/80 bg-white p-6 shadow-[0_14px_38px_rgba(15,23,42,0.06)] sm:p-8">
                      <header className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="font-display text-[21px] font-extrabold leading-[1.2] tracking-[-0.03em] text-[#0F172A] sm:text-[23px]">
                            {application.job ? (
                              <Link
                                href={`/careers/${application.job.slug}`}
                                className="underline-offset-4 transition-colors duration-200 hover:text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
                              >
                                {application.job.title}
                              </Link>
                            ) : (
                              application.full_name
                            )}
                          </h2>

                          {application.job && (
                            <p className="mt-1.5 text-[14px] text-slate-500">
                              {application.job.department}
                              <span className="mx-2 text-slate-300" aria-hidden="true">
                                /
                              </span>
                              {application.job.location}
                            </p>
                          )}
                        </div>

                        <StatusChip status={application.status} />
                      </header>

                      <dl className="mt-6 grid gap-x-8 gap-y-3 border-y border-slate-200 py-5 sm:grid-cols-2">
                        <div className="flex items-baseline justify-between gap-4 sm:justify-start sm:gap-3">
                          <dt className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-500">
                            Application ID
                          </dt>
                          <dd className="font-mono text-[13.5px] font-semibold tracking-[0.04em] text-slate-900">
                            {application.reference}
                          </dd>
                        </div>

                        <div className="flex items-baseline justify-between gap-4 sm:justify-start sm:gap-3">
                          <dt className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-500">
                            Submitted
                          </dt>
                          <dd className="text-[13.5px] font-semibold text-slate-900">
                            <time dateTime={application.created_at}>
                              {formatDate(application.created_at)}
                            </time>
                          </dd>
                        </div>
                      </dl>

                      <ApplicationTimeline
                        status={application.status}
                        events={events}
                        className="mt-7"
                      />

                      {canWithdraw && (
                        <div className="mt-7 border-t border-slate-200 pt-5">
                          <WithdrawApplication
                            applicationId={application.id}
                            jobTitle={application.job?.title ?? "this role"}
                          />
                        </div>
                      )}
                    </article>
                  </Reveal>
                );
              })}
            </ol>
          )}
        </Container>
      </section>
    </>
  );
}
