import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { AuthPanel, type AuthMode } from "@/components/careers/auth-panel";
import { SystemDiagram } from "@/components/careers/system-diagram";
import { FormError, FormNotice } from "@/components/careers/form-fields";
import { getOptionalUser } from "@/lib/auth/guards";
import { safeNextPath } from "@/lib/auth/redirect";

/**
 * Standalone authentication page.
 *
 * The apply flow uses a dialog so a candidate never loses their place.
 * This page exists for the cases a dialog cannot cover: the OAuth error
 * return, an expired email link, and a direct or bookmarked visit.
 *
 * It renders the same `AuthPanel`, so there is exactly one
 * implementation of the flows and their error handling.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to apply for roles at Siddiona Technologies and track your applications.",
  robots: { index: false, follow: true },
};

/**
 * OAuth and email-link outcomes arrive as a query parameter, so the
 * messages are keyed rather than passed through. Echoing an arbitrary
 * query string into the page would be a reflected-content problem.
 *
 * Each outcome also chooses the mode the panel opens in, so the next
 * step is the one on screen: a dead confirmation link opens straight
 * into "send me a new one" rather than a sign-in form that will only
 * say the address is unconfirmed.
 */
const OUTCOMES: Record<string, { message: string; tone: "error" | "info"; mode: AuthMode }> = {
  oauth_failed: {
    message: "We could not complete Google sign in. Please try again, or use an email address and password.",
    tone: "error",
    mode: "sign-in",
  },
  oauth_cancelled: {
    message: "Google sign in was cancelled. You can try again or use an email address and password.",
    tone: "error",
    mode: "sign-in",
  },
  link_expired: {
    message: "That confirmation link has expired or has already been used. Enter your email below and we will send a new one.",
    tone: "error",
    mode: "resend",
  },
  link_invalid: {
    message: "That confirmation link could not be read. Enter your email below and we will send a new one.",
    tone: "error",
    mode: "resend",
  },
  reset_link_failed: {
    message: "That password reset link has expired, was already used, or was opened in a different browser from the one you requested it in. Request a new one below.",
    tone: "error",
    mode: "forgot",
  },
  confirmed_sign_in: {
    message: "Your email address is confirmed. Sign in below to continue.",
    tone: "info",
    mode: "sign-in",
  },
  session_expired: {
    message: "Your session has expired. Please sign in again.",
    tone: "error",
    mode: "sign-in",
  },
};

interface JoinPageProps {
  searchParams: Promise<{ next?: string; error?: string; mode?: string }>;
}

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const outcome = params.error ? OUTCOMES[params.error] : undefined;

  const user = await getOptionalUser();

  // Already signed in and nothing went wrong, so there is nothing to do
  // here. A problem is shown first, because arriving with an expired
  // link while holding a stale session is a real case.
  if (user && (!outcome || outcome.tone === "info")) {
    redirect(next);
  }

  const initialMode: AuthMode =
    outcome?.mode ?? (params.mode === "sign-up" ? "sign-up" : "sign-in");

  return (
    <section className="bg-[#070B14] py-14 sm:py-18 lg:py-24">
      <Container size="default">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16">
          {/* Editorial column. Hidden on small screens so the form is the
              first and only thing on a phone. */}
          <div className="hidden lg:block">
            <div className="mb-6 flex items-center gap-2.5">
              <span className="h-1 w-2.5 shrink-0 rounded-full bg-[#EA580C]" aria-hidden="true" />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#EA580C]">
                Careers at Siddiona
              </span>
            </div>

            <h1 className="max-w-[16ch] text-balance font-display text-[38px] font-extrabold leading-[1.02] tracking-[-0.04em] text-white xl:text-[46px]">
              One account, every application.
            </h1>

            <p className="mt-5 max-w-[48ch] text-pretty text-[17px] leading-[1.65] text-slate-400">
              Applications are tied to an account so you can see exactly where each one stands,
              and so we have a reliable way to reach you.
            </p>

            <SystemDiagram ready className="mt-12 w-full max-w-[440px] opacity-70" />
          </div>

          <div className="mx-auto w-full max-w-[460px] rounded-[18px] border border-slate-200/70 bg-white p-6 shadow-[0_24px_70px_rgba(2,6,23,0.4)] sm:p-8">
            {outcome && (
              <div className="mb-5">
                {outcome.tone === "info" ? (
                  <FormNotice tone="success">{outcome.message}</FormNotice>
                ) : (
                  <FormError message={outcome.message} />
                )}
              </div>
            )}

            <AuthPanel next={next} initialMode={initialMode} />
          </div>
        </div>
      </Container>
    </section>
  );
}
