"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, Lock } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUS_LABELS } from "@/lib/careers/constants";
import { formatDate } from "@/lib/careers/format";
import type { ApplicationStatus } from "@/lib/supabase/database.types";

/**
 * The sign-in and application forms are loaded on demand.
 *
 * Between them they pull in the Supabase browser client, the Zod
 * schemas and the resume uploader, roughly 165 KB compressed. Almost
 * every visitor to a job page reads it and never presses Apply, so that
 * code used to slow down the page for people who would never run it.
 *
 * Loading starts on intent (pointer over, focus or touch on the Apply
 * button), so for most people it has already finished by the time they
 * click.
 */
const loadAuthPanel = () => import("./auth-panel");
const loadApplyDialog = () => import("./apply-dialog");

const AuthPanel = dynamic(() => loadAuthPanel().then((module) => module.AuthPanel), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[280px] items-center justify-center" role="status">
      <Loader2 className="h-5 w-5 animate-spin text-[#EA580C]" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </div>
  ),
});

const ApplyDialog = dynamic(() => loadApplyDialog().then((module) => module.ApplyDialog), {
  ssr: false,
  loading: () => (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgb(2_6_23/0.55)]"
      role="status"
    >
      <Loader2 className="h-6 w-6 animate-spin text-white" aria-hidden="true" />
      <span className="sr-only">Opening the application form</span>
    </div>
  ),
});

/**
 * The Apply control, and everything behind it.
 *
 * Four states, decided on the server and passed in:
 *   - closed        the role no longer accepts applications
 *   - applied       this candidate already has an application on file
 *   - signed out    clicking opens authentication, in place
 *   - signed in     clicking opens the application form
 *
 * The "already applied" state is a convenience. The real guarantee is
 * the UNIQUE (user_id, job_id) constraint, so removing this component
 * entirely would still not let anybody apply twice.
 *
 * Authenticating does not lose the user's place. The auth dialog hands
 * straight to the application form for the same role, which is the
 * whole reason it is a dialog rather than a redirect to a login page.
 */

/** Matches the dialog's exit transition, so the handoff does not overlap. */
const AUTH_HANDOFF_MS = 190;

export interface ApplyButtonProps {
  job: { id: string; title: string; slug: string };
  isClosed: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  existingApplication: {
    reference: string;
    status: ApplicationStatus;
    createdAt: string;
  } | null;
  prefill: {
    fullName: string;
    email: string;
    phone: string;
    linkedinUrl: string;
    portfolioUrl: string;
    githubUrl: string;
    resumePath: string | null;
  };
  className?: string;
  /** Compact rendering for the mobile sticky bar. */
  variant?: "default" | "bar";
}

export function ApplyButton({
  job,
  isClosed,
  isAuthenticated,
  userId,
  existingApplication,
  prefill,
  className,
  variant = "default",
}: ApplyButtonProps) {
  const [authOpen, setAuthOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  // Latched true on first open, so each form's code is fetched once and
  // the dialog stays mounted afterwards, which keeps its close animation.
  const [authRequested, setAuthRequested] = useState(false);
  const [applyRequested, setApplyRequested] = useState(false);
  const wantsToApply = useRef(false);

  /**
   * After sign-in, `router.refresh()` re-renders this component's server
   * parent and `isAuthenticated` flips. That is the signal to continue
   * into the application form, rather than trying to chain off the auth
   * callback before the refreshed props have arrived.
   *
   * The two dialogs are sequenced rather than swapped in one frame.
   * Both are native `<dialog>` elements, so opening the second before
   * the first has closed puts two modals in the top layer at once and
   * the user sees them cross over. Waiting out the 180ms exit reads as
   * one step forward instead.
   */
  useEffect(() => {
    if (!isAuthenticated || !wantsToApply.current) return;

    wantsToApply.current = false;
    setAuthOpen(false);

    const timer = window.setTimeout(() => {
      setApplyRequested(true);
      setApplyOpen(true);
    }, AUTH_HANDOFF_MS);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated]);

  /** Starts fetching the form code as soon as someone shows intent. */
  const preloadForms = () => {
    void loadAuthPanel();
    if (isAuthenticated) void loadApplyDialog();
  };

  const buttonClass = cn(
    "group inline-flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#EA580C] px-6 text-[15px] font-bold text-white shadow-[0_12px_30px_rgba(234,88,12,0.24)] transition-[background-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#C2410C] hover:shadow-[0_16px_36px_rgba(234,88,12,0.28)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2",
    variant === "bar" ? "min-h-12" : "min-h-13",
    className
  );

  if (isClosed) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex min-h-13 w-full items-center justify-center gap-2.5 rounded-lg border border-slate-300 bg-slate-100 px-6 text-[15px] font-bold text-slate-500">
          <Lock className="h-4 w-4" aria-hidden="true" />
          Applications closed
        </div>
        {variant === "default" && (
          <p className="mt-3 text-center text-[13px] leading-[1.6] text-slate-500">
            This role is no longer accepting applications.{" "}
            <Link
              href="/careers#open-roles"
              className="font-semibold text-[#C2410C] underline-offset-4 hover:underline"
            >
              See what else is open
            </Link>
          </p>
        )}
      </div>
    );
  }

  if (existingApplication) {
    return (
      <div className={cn("w-full", className)}>
        <Link
          href="/careers/applications"
          className="flex min-h-13 w-full items-center justify-center gap-2.5 rounded-lg border border-emerald-300 bg-emerald-50 px-6 text-[15px] font-bold text-emerald-800 transition-[background-color,border-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-emerald-400 hover:bg-emerald-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          You have applied
        </Link>

        {variant === "default" && (
          <dl className="mt-4 space-y-2 text-[13px]">
            <div className="flex items-center justify-between gap-4">
              <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                Application ID
              </dt>
              <dd className="font-mono font-semibold tracking-[0.04em] text-slate-900">
                {existingApplication.reference}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                Applied
              </dt>
              <dd className="font-semibold text-slate-900">
                {formatDate(existingApplication.createdAt)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                Status
              </dt>
              <dd className="font-semibold text-slate-900">
                {APPLICATION_STATUS_LABELS[existingApplication.status]}
              </dd>
            </div>
          </dl>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <button
        type="button"
        onPointerEnter={preloadForms}
        onFocus={preloadForms}
        onTouchStart={preloadForms}
        onClick={() => {
          if (isAuthenticated) {
            setApplyRequested(true);
            setApplyOpen(true);
            return;
          }
          wantsToApply.current = true;
          setAuthRequested(true);
          setAuthOpen(true);
        }}
        className={buttonClass}
      >
        Apply for this role
        <ArrowRight
          className="h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1"
          aria-hidden="true"
        />
      </button>

      {variant === "default" && !isAuthenticated && (
        <p className="mt-3 text-center text-[13px] leading-[1.6] text-slate-500">
          You will be asked to sign in first, so you can track your application.
        </p>
      )}

      <Dialog
        open={authOpen}
        onOpenChange={(next) => {
          setAuthOpen(next);
          if (!next) wantsToApply.current = false;
        }}
        title="Join Siddiona"
        eyebrow={`Applying for ${job.title}`}
        description="Applications are tied to an account so you can follow their progress and we can reach you."
      >
        {authRequested && (
          <AuthPanel
            compact
            initialMode="sign-up"
            next={`/careers/${job.slug}`}
            onAuthenticated={() => {
              // The effect above takes over once the refreshed props land.
              wantsToApply.current = true;
            }}
          />
        )}
      </Dialog>

      {isAuthenticated && userId && applyRequested && (
        <ApplyDialog
          open={applyOpen}
          onOpenChange={setApplyOpen}
          job={{ id: job.id, title: job.title }}
          userId={userId}
          prefill={prefill}
        />
      )}
    </div>
  );
}

export default ApplyButton;
