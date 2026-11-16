import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { VerifyEmailButton } from "@/components/careers/verify-email-button";
import { confirmEmailLink } from "./actions";
import { safeNextPath } from "@/lib/auth/redirect";
import {
  isWellFormedTokenHash,
  parseEmailLinkType,
  type EmailLinkType,
} from "@/lib/auth/email-link";

/**
 * The confirm step for an emailed auth link.
 *
 * Opening this page spends nothing. The one-time token is only used when
 * the button is pressed, which is what keeps corporate mail scanners
 * (they open every link in an incoming message) from invalidating a
 * candidate's link before the candidate ever clicks it.
 *
 * The URL carries a live token, so the page is kept out of search
 * indexes, disallowed in robots.txt, and sends no Referer header.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirm",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

interface LinkCopy {
  eyebrow: string;
  heading: string;
  body: string;
  button: string;
  pending: string;
}

const COPY: Record<EmailLinkType, LinkCopy> = {
  signup: {
    eyebrow: "One last step",
    heading: "Confirm your email",
    body: "Confirm this address to finish creating your Siddiona Careers account.",
    button: "Confirm email",
    pending: "Confirming",
  },
  email: {
    eyebrow: "One last step",
    heading: "Confirm your email",
    body: "Confirm this address to finish creating your Siddiona Careers account.",
    button: "Confirm email",
    pending: "Confirming",
  },
  recovery: {
    eyebrow: "Password reset",
    heading: "Reset your password",
    body: "Continue to choose a new password for your Siddiona Careers account.",
    button: "Continue",
    pending: "Opening",
  },
  magiclink: {
    eyebrow: "Sign in",
    heading: "Sign in to Siddiona Careers",
    body: "Continue to sign in. No password needed.",
    button: "Sign in",
    pending: "Signing in",
  },
  invite: {
    eyebrow: "Invitation",
    heading: "Accept your invitation",
    body: "Continue to accept the invitation and set up your Siddiona Careers account.",
    button: "Accept invitation",
    pending: "Accepting",
  },
  email_change: {
    eyebrow: "Account",
    heading: "Confirm email change",
    body: "Confirm to finish changing the email address on your Siddiona Careers account.",
    button: "Confirm change",
    pending: "Confirming",
  },
};

interface VerifyPageProps {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const type = parseEmailLinkType(params.type);
  const next = safeNextPath(params.next);

  if (!isWellFormedTokenHash(params.token_hash) || !type) {
    redirect("/careers/join?error=link_invalid");
  }

  const copy = COPY[type];

  return (
    <section className="flex min-h-[62svh] items-center bg-[#070B14] py-16 sm:py-20 lg:py-24">
      <Container size="default">
        <div className="mx-auto w-full max-w-[460px] rounded-[18px] border border-slate-200/70 bg-white p-6 shadow-[0_24px_70px_rgba(2,6,23,0.4)] sm:p-8">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#C2410C]">
            {copy.eyebrow}
          </p>

          <h1 className="mt-3 font-display text-2xl font-extrabold tracking-[-0.035em] text-slate-900">
            {copy.heading}
          </h1>

          <p className="mt-3 text-[15px] leading-[1.65] text-slate-600">{copy.body}</p>

          <form action={confirmEmailLink} className="mt-7">
            <input type="hidden" name="token_hash" value={params.token_hash} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="next" value={next} />
            <VerifyEmailButton label={copy.button} pendingLabel={copy.pending} />
          </form>

          <p className="mt-5 text-[12.5px] leading-[1.6] text-slate-500">
            We ask for this click so that email security scanners, which open links
            automatically, cannot use up your link before you do.
          </p>
        </div>
      </Container>
    </section>
  );
}
