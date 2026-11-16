import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Download, ExternalLink, Mail, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getAdminApplicationDetail } from "@/lib/careers/queries";
import { formatDate, formatDateTime } from "@/lib/careers/format";
import { APPLICATION_STATUS_LABELS } from "@/lib/careers/constants";
import { StatusChip } from "@/components/careers/status-chip";
import { ApplicationStatusForm } from "@/components/admin/application-status-form";
import { ApplicationNotes } from "@/components/admin/application-notes";
import { PageHeader, Panel } from "@/components/admin/admin-ui";
import {
  attributionTouchSchema,
  type AttributionTouch,
} from "@/lib/analytics/attribution";

/**
 * A single application, in full.
 *
 * The resume is reached through `/admin/applications/[id]/resume`,
 * which mints a 60-second signed URL at the moment of the click. The
 * file is never linked directly, because the bucket is private and has
 * no public read policy at all.
 */

export const dynamic = "force-dynamic";

interface AdminApplicationPageProps {
  params: Promise<{ id: string }>;
}

function readAttribution(value: unknown): AttributionTouch | null {
  const parsed = attributionTouchSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function AttributionDetails({ label, touch }: { label: string; touch: AttributionTouch }) {
  return (
    <div className="border-t border-slate-100 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <dl className="mt-2 space-y-1.5 text-[12.5px]">
        <Row label="Source / medium" value={`${touch.source} / ${touch.medium}`} />
        <Row label="Campaign" value={touch.campaign ?? "Not set"} />
        <Row label="Landing page" value={touch.landingPath} mono />
        <Row label="Referrer" value={touch.referrer ?? "Not available"} />
        <Row label="Captured" value={formatDateTime(touch.capturedAt)} />
      </dl>
    </div>
  );
}

export const metadata: Metadata = { title: "Application" };

export default async function AdminApplicationPage({ params }: AdminApplicationPageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin(`/admin/applications/${id}`);

  const application = await getAdminApplicationDetail(supabase, id);
  if (!application) notFound();

  // Resolve note authors to names in one read rather than per note.
  const authorIds = Array.from(
    new Set(application.notes.map((note) => note.author_id).filter(Boolean))
  ) as string[];

  const authorNames: Record<string, string> = {};
  if (authorIds.length > 0) {
    const { data: authors, error: authorsError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", authorIds);
    if (authorsError) {
      throw new Error(`[careers] application note authors failed: ${authorsError.message}`);
    }

    for (const author of authors ?? []) {
      authorNames[author.id] = author.full_name ?? author.email;
    }
  }

  const links = [
    { label: "LinkedIn", url: application.linkedin_url },
    { label: "Portfolio", url: application.portfolio_url },
    { label: "GitHub", url: application.github_url },
  ].filter((link): link is { label: string; url: string } => Boolean(link.url));
  const firstTouch = readAttribution(application.first_touch_attribution);
  const latestTouch = readAttribution(application.last_touch_attribution);

  return (
    <>
      <Link
        href="/admin/applications"
        className="group mb-5 inline-flex items-center gap-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-slate-500 transition-colors duration-150 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
      >
        <ChevronLeft
          className="h-3.5 w-3.5 transition-transform duration-150 ease-out group-hover:-translate-x-0.5"
          aria-hidden="true"
        />
        All applications
      </Link>

      <PageHeader
        eyebrow={application.reference}
        title={application.full_name}
        description={
          application.job
            ? `Applied for ${application.job.title} on ${formatDate(application.created_at)}.`
            : `Applied on ${formatDate(application.created_at)}. The role has since been removed.`
        }
        action={<StatusChip status={application.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel title="Cover letter">
            <div className="p-5">
              {application.cover_letter ? (
                <p className="whitespace-pre-wrap text-[14.5px] leading-[1.7] text-slate-700">
                  {application.cover_letter}
                </p>
              ) : (
                <p className="text-[14px] text-slate-500">
                  No cover letter was included with this application.
                </p>
              )}
            </div>
          </Panel>

          {application.additional_info && (
            <Panel title="Additional information">
              <div className="p-5">
                <p className="whitespace-pre-wrap text-[14.5px] leading-[1.7] text-slate-700">
                  {application.additional_info}
                </p>
              </div>
            </Panel>
          )}

          {application.profile?.bio && (
            <Panel title="Candidate profile">
              <div className="p-5">
                <p className="whitespace-pre-wrap text-[14.5px] leading-[1.7] text-slate-700">
                  {application.profile.bio}
                </p>
                {application.profile.location && (
                  <p className="mt-4 text-[13px] text-slate-500">
                    Based in {application.profile.location}
                  </p>
                )}
              </div>
            </Panel>
          )}

          <Panel title="Internal notes">
            <ApplicationNotes
              applicationId={application.id}
              notes={application.notes}
              authorNames={authorNames}
            />
          </Panel>

          <Panel title="History">
            <ol className="p-5">
              {application.events.map((event, index) => (
                <li
                  key={event.id}
                  className="flex items-baseline justify-between gap-4 border-t border-slate-100 py-2.5 first:border-t-0 first:pt-0"
                >
                  <span className="text-[14px] text-slate-700">
                    {index === 0 && event.old_status === null
                      ? "Application submitted"
                      : `${event.old_status ? APPLICATION_STATUS_LABELS[event.old_status] : "New"} to ${APPLICATION_STATUS_LABELS[event.new_status]}`}
                  </span>
                  <time
                    dateTime={event.created_at}
                    className="shrink-0 font-mono text-[11.5px] text-slate-500"
                  >
                    {formatDateTime(event.created_at)}
                  </time>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Update status">
            <ApplicationStatusForm
              applicationId={application.id}
              status={application.status}
              candidateName={application.full_name}
            />
          </Panel>

          <Panel title="Candidate">
            <div className="space-y-3 p-5">
              <a
                href={`mailto:${application.email}`}
                className="flex items-center gap-2.5 text-[14px] font-medium text-slate-800 underline-offset-4 transition-colors duration-150 hover:text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
              >
                <Mail className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <span className="min-w-0 truncate">{application.email}</span>
              </a>

              <a
                href={`tel:${application.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2.5 text-[14px] font-medium text-slate-800 underline-offset-4 transition-colors duration-150 hover:text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
              >
                <Phone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                {application.phone}
              </a>

              {links.length > 0 && (
                <ul className="space-y-2 border-t border-slate-200 pt-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-2.5 text-[14px] font-medium text-slate-800 underline-offset-4 transition-colors duration-150 hover:text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
                      >
                        <ExternalLink
                          className="h-4 w-4 shrink-0 text-slate-400"
                          aria-hidden="true"
                        />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>

          <Panel title="Resume">
            <div className="p-5">
              {/*
                A normal navigation, not a fetch. The route redirects to
                a freshly signed URL, so the link is only valid for the
                60 seconds after it is clicked.
              */}
              <a
                href={`/admin/applications/${application.id}/resume`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-[13.5px] font-semibold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-slate-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Open resume
              </a>

              <p className="mt-3 text-[12px] leading-[1.55] text-slate-500">
                Opens through a link that expires after 60 seconds. Resumes are stored privately
                and are never publicly reachable.
              </p>
            </div>
          </Panel>

          <Panel title="Application">
            <dl className="p-5 text-[13px]">
              <Row label="Reference" value={application.reference} mono />
              <Row
                label="Role"
                value={application.job?.title ?? "Removed"}
                href={
                  application.job
                    ? `/admin/applications?jobId=${application.job.id}`
                    : undefined
                }
              />
              <Row label="Department" value={application.job?.department ?? ""} />
              <Row label="Submitted" value={formatDateTime(application.created_at)} />
              <Row label="Last updated" value={formatDateTime(application.updated_at)} />
            </dl>
          </Panel>

          <Panel title="Attribution">
            <div className="p-5">
              {firstTouch || latestTouch ? (
                <>
                  {firstTouch && <AttributionDetails label="First touch" touch={firstTouch} />}
                  {latestTouch && <AttributionDetails label="Latest touch" touch={latestTouch} />}
                </>
              ) : (
                <p className="text-[13px] text-slate-500">No attribution captured.</p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  mono,
  href,
}: {
  label: string;
  value: string;
  mono?: boolean;
  href?: string;
}) {
  if (!value) return null;

  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-b-0">
      <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.11em] text-slate-500">
        {label}
      </dt>
      <dd
        className={`min-w-0 text-right font-medium text-slate-900 ${mono ? "font-mono tracking-[0.03em]" : ""}`}
      >
        {href ? (
          <Link
            href={href}
            className="underline-offset-4 transition-colors duration-150 hover:text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
          >
            {value}
          </Link>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
