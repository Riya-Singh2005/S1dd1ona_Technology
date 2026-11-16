"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  requestPasswordResetSchema,
  signInSchema,
  signUpSchema,
  toFieldErrors,
  type FieldErrors,
} from "@/lib/careers/validation";
import { FormError, FormNotice, SubmitButton, TextField } from "./form-fields";

/**
 * The Siddiona authentication experience.
 *
 * One component, rendered both inside the apply dialog and on the
 * standalone /careers/join page, so there is a single implementation of
 * the flows, the validation and the error states.
 *
 * Supabase Auth owns credentials end to end. Nothing here hashes a
 * password, stores one, or writes an application table row that
 * duplicates an auth record.
 */

export type AuthMode = "sign-in" | "sign-up" | "forgot" | "resend";

type Stage =
  | { kind: "form" }
  | { kind: "check-inbox"; email: string; resent: boolean }
  | { kind: "reset-sent"; email: string };

export interface AuthPanelProps {
  /** Where to return after authentication completes. */
  next?: string;
  /** Called after an in-place sign-in, so a dialog can move on. */
  onAuthenticated?: () => void;
  initialMode?: AuthMode;
  /** Suppresses the heading when a dialog already supplies one. */
  compact?: boolean;
}

const MODE_COPY: Record<AuthMode, { title: string; subtitle: string; submit: string }> = {
  "sign-in": {
    title: "Sign in",
    subtitle: "Welcome back. Sign in to apply and to track your applications.",
    submit: "Continue",
  },
  "sign-up": {
    title: "Join Siddiona",
    subtitle: "Create an account to apply for a role and follow its progress.",
    submit: "Create account",
  },
  forgot: {
    title: "Reset your password",
    subtitle: "We will email you a link to set a new password.",
    submit: "Send reset link",
  },
  resend: {
    title: "Get a new confirmation link",
    subtitle: "Enter the address you signed up with and we will send a fresh link.",
    submit: "Send new link",
  },
};

/**
 * Supabase rate limits confirmation email per address. Holding the
 * resend button for a minute keeps a hopeful double-click from turning
 * into a "too many requests" error the person cannot act on.
 */
const RESEND_COOLDOWN_MS = 60_000;

export function AuthPanel({
  next = "/careers",
  onAuthenticated,
  initialMode = "sign-in",
  compact = false,
}: AuthPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [stage, setStage] = useState<Stage>({ kind: "form" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [isTransitioning, startTransition] = useTransition();

  /** Carried across mode switches so nobody retypes their address. */
  const [lastEmail, setLastEmail] = useState("");
  /** Set when sign-in fails only because the address is unconfirmed. */
  const [unconfirmed, setUnconfirmed] = useState(false);

  const [resendCooling, setResendCooling] = useState(false);
  const [resendError, setResendError] = useState<string>();
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    },
    []
  );

  const copy = MODE_COPY[mode];

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setStage({ kind: "form" });
    setFieldErrors({});
    setFormError(undefined);
    setUnconfirmed(false);
  };

  /** Every emailed link returns through the app's own confirm handler. */
  const emailRedirectTo = () =>
    `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`;

  const startCooldown = () => {
    setResendCooling(true);
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    cooldownTimer.current = setTimeout(() => setResendCooling(false), RESEND_COOLDOWN_MS);
  };

  /**
   * Translates a Supabase auth error into something a candidate can act
   * on.
   *
   * Matches on `error.code` first. Supabase publishes these codes and
   * they are stable, whereas the message text is not. Message matching
   * remains as a fallback for errors that arrive without a code.
   *
   * The rate limits need distinguishing because they ask for different
   * waits. A per-address cooldown clears in seconds, the project's hourly
   * email cap does not, and telling someone to "wait a minute" when the
   * cap is hourly just sends them into the same wall again.
   */
  const describeAuthError = (error: { message: string; code?: string }): string => {
    const { message, code } = error;

    // The friendly text hides Supabase's real reason, which is exactly
    // what is needed when an email fails. Logged so it is one DevTools
    // glance away. It is Supabase's own error string, with no credentials.
    console.warn("[auth] Supabase returned:", code ?? "(no code)", message);

    const normalised = message.toLowerCase();

    // "For security purposes, you can only request this after 42 seconds."
    const cooldown = /after\s+(\d+)\s+seconds?/i.exec(message);
    if (cooldown) {
      const seconds = Number(cooldown[1]);
      return `Please wait ${seconds} second${seconds === 1 ? "" : "s"} before asking for another email.`;
    }

    if (code === "over_email_send_rate_limit" || normalised.includes("email rate limit")) {
      return "We have sent the maximum number of emails for now. Please try again in about an hour, and use the most recent email you already have in the meantime.";
    }

    if (code === "over_request_rate_limit" || normalised.includes("request rate limit")) {
      return "Too many attempts from this network. Please wait a few minutes and try again.";
    }

    if (code === "email_address_not_authorized" || normalised.includes("not authorized")) {
      return "We cannot send email to this address at the moment. Please try again later.";
    }

    if (code?.startsWith("hook_") || (normalised.includes("sending") && normalised.includes("email"))) {
      return "We could not send the email just now. Please try again in a moment.";
    }

    if (code === "invalid_credentials" || normalised.includes("invalid login credentials")) {
      return "That email and password combination did not match. Please check and try again.";
    }

    if (code === "email_not_confirmed" || normalised.includes("email not confirmed")) {
      return "This address has not been confirmed yet. Use the link we emailed you, or ask for a new one.";
    }

    if (
      code === "user_already_exists" ||
      code === "email_exists" ||
      normalised.includes("user already registered")
    ) {
      return "An account already exists for that address. Try signing in instead.";
    }

    if (normalised.includes("too many")) {
      return "Too many attempts. Please wait a few minutes and try again.";
    }

    if (code === "weak_password" || normalised.includes("password")) {
      return message;
    }

    return "We could not complete that just now. Please try again.";
  };

  /** Sends a fresh signup confirmation. Old links stop working. */
  const resendConfirmation = async (email: string): Promise<string | null> => {
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      return "Sign in is unavailable right now. Please try again shortly.";
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: emailRedirectTo() },
    });

    return error ? describeAuthError(error) : null;
  };

  const handleResendFromInbox = async () => {
    if (stage.kind !== "check-inbox" || resendCooling) return;

    setResendError(undefined);
    setPending(true);
    const problem = await resendConfirmation(stage.email);
    setPending(false);

    if (problem) {
      setResendError(problem);
      return;
    }

    setStage({ kind: "check-inbox", email: stage.email, resent: true });
    startCooldown();
  };

  const handleGoogle = async () => {
    setFormError(undefined);
    setGooglePending(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          // Forces the account chooser. Without it, a shared machine
          // silently reuses whichever Google account signed in last.
          queryParams: { prompt: "select_account" },
        },
      });

      if (error) {
        setFormError(
          "We could not start Google sign in. Please try again, or use an email address and password."
        );
        setGooglePending(false);
      }
      // On success the browser navigates to Google, so the pending state
      // is deliberately left on.
    } catch {
      setFormError("We could not reach Google sign in. Please check your connection.");
      setGooglePending(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    setFormError(undefined);
    setUnconfirmed(false);

    const formData = new FormData(event.currentTarget);
    const typedEmail = formData.get("email");
    if (typeof typedEmail === "string") setLastEmail(typedEmail.trim());

    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      // Missing configuration. Say something actionable rather than
      // letting an unhandled throw blank the dialog.
      setFormError("Sign in is unavailable right now. Please try again shortly.");
      return;
    }

    if (mode === "resend") {
      const parsed = requestPasswordResetSchema.safeParse({ email: typedEmail });
      if (!parsed.success) {
        setFieldErrors(toFieldErrors(parsed.error));
        return;
      }

      setPending(true);
      const problem = await resendConfirmation(parsed.data.email);
      setPending(false);

      if (problem) {
        setFormError(problem);
        return;
      }

      // Reported as sent whether or not the address has an unconfirmed
      // account. Saying otherwise would reveal which addresses exist.
      setStage({ kind: "check-inbox", email: parsed.data.email, resent: true });
      startCooldown();
      return;
    }

    if (mode === "forgot") {
      const parsed = requestPasswordResetSchema.safeParse({ email: typedEmail });
      if (!parsed.success) {
        setFieldErrors(toFieldErrors(parsed.error));
        return;
      }

      setPending(true);
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent("/careers/reset-password")}`,
      });
      setPending(false);

      if (error) {
        setFormError(describeAuthError(error));
        return;
      }

      // Always reports success, including for an address with no
      // account. Saying "no account found" would turn this form into an
      // account-enumeration oracle.
      setStage({ kind: "reset-sent", email: parsed.data.email });
      return;
    }

    if (mode === "sign-up") {
      const parsed = signUpSchema.safeParse({
        fullName: formData.get("fullName"),
        email: typedEmail,
        password: formData.get("password"),
      });
      if (!parsed.success) {
        setFieldErrors(toFieldErrors(parsed.error));
        return;
      }

      setPending(true);
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: { full_name: parsed.data.fullName },
          emailRedirectTo: emailRedirectTo(),
        },
      });
      setPending(false);

      if (error) {
        setFormError(describeAuthError(error));
        return;
      }

      // Supabase returns a user with an empty `identities` array when the
      // address is already registered. That is how it avoids confirming
      // an account's existence to an unauthenticated caller.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setFormError("An account already exists for that address. Try signing in instead.");
        setMode("sign-in");
        return;
      }

      if (data.session) {
        // Email confirmation is disabled on this project, so the user is
        // already signed in.
        startTransition(() => {
          router.refresh();
          onAuthenticated?.();
        });
        return;
      }

      setStage({ kind: "check-inbox", email: parsed.data.email, resent: false });
      startCooldown();
      return;
    }

    const parsed = signInSchema.safeParse({
      email: typedEmail,
      password: formData.get("password"),
    });
    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }

    setPending(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setPending(false);

    if (error) {
      setFormError(describeAuthError(error));
      setUnconfirmed(
        error.code === "email_not_confirmed" ||
          error.message.toLowerCase().includes("email not confirmed")
      );
      return;
    }

    startTransition(() => {
      router.refresh();
      onAuthenticated?.();
    });
  };

  const linkButtonClass =
    "font-semibold text-[#C2410C] underline-offset-4 transition-colors duration-200 hover:text-[#9A3412] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2";

  if (stage.kind === "check-inbox" || stage.kind === "reset-sent") {
    const isReset = stage.kind === "reset-sent";
    const wasResent = stage.kind === "check-inbox" && stage.resent;

    return (
      <div className="text-center">
        <span
          className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[#EA580C]"
          aria-hidden="true"
        >
          {isReset ? <Mail className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
        </span>

        <h3 className="font-display text-xl font-extrabold tracking-[-0.03em] text-slate-900">
          {isReset ? "Check your email" : wasResent ? "New link sent" : "Confirm your email"}
        </h3>

        <p className="mx-auto mt-3 max-w-[44ch] text-[14.5px] leading-[1.65] text-slate-600">
          {isReset
            ? "If an account exists for that address, a password reset link is on its way."
            : wasResent
              ? "If that address has an account waiting for confirmation, a fresh link is on its way. Use the newest email: links in earlier ones stop working."
              : "We sent a confirmation link to your inbox. Open it to finish creating your account, then come back here."}
        </p>

        <p className="mt-3 break-all font-mono text-[13px] font-semibold text-slate-900">
          {stage.email}
        </p>

        <p className="mx-auto mt-5 max-w-[44ch] text-[13px] leading-[1.6] text-slate-500">
          Nothing in your inbox after a couple of minutes? Check your spam folder.
        </p>

        {!isReset && (
          <div className="mt-5" aria-live="polite">
            {resendError && (
              <div className="mb-3 text-left">
                <FormError message={resendError} />
              </div>
            )}
            <button
              type="button"
              onClick={handleResendFromInbox}
              disabled={resendCooling || pending}
              className="text-[14px] font-semibold text-slate-600 underline-offset-4 transition-colors duration-200 hover:text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
            >
              {pending
                ? "Sending"
                : resendCooling
                  ? "You can ask for another link in a minute"
                  : "Send the link again"}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => switchMode("sign-in")}
          className={`mt-5 text-[14px] ${linkButtonClass}`}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  const busy = pending || isTransitioning;
  const emailOnly = mode === "forgot" || mode === "resend";

  return (
    <div>
      {!compact && (
        <div className="mb-6">
          <h2 className="font-display text-2xl font-extrabold tracking-[-0.035em] text-slate-900">
            {copy.title}
          </h2>
          <p className="mt-2 text-[14.5px] leading-[1.6] text-slate-600">{copy.subtitle}</p>
        </div>
      )}

      {!emailOnly && (
        <>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googlePending || busy}
            aria-busy={googlePending || undefined}
            className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-5 text-[14.5px] font-bold text-slate-800 transition-[border-color,background-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
          >
            <GoogleMark />
            {googlePending ? "Opening Google" : "Continue with Google"}
          </button>

          <div className="my-5 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              or
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormError message={formError} />

        {unconfirmed && (
          <button
            type="button"
            onClick={() => switchMode("resend")}
            className={`text-[13.5px] ${linkButtonClass}`}
          >
            Send me a new confirmation link
          </button>
        )}

        {mode === "sign-up" && (
          <TextField
            label="Full name"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="Your name"
            error={fieldErrors.fullName}
            disabled={busy}
          />
        )}

        {/* Keyed by mode so the carried-over address fills in when the
            field remounts after a mode switch. */}
        <TextField
          key={`email-${mode}`}
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="you@example.com"
          defaultValue={lastEmail}
          error={fieldErrors.email}
          disabled={busy}
        />

        {!emailOnly && (
          <div>
            <TextField
              label="Password"
              name="password"
              type="password"
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              required
              placeholder={mode === "sign-up" ? "At least 10 characters" : "Your password"}
              hint={
                mode === "sign-up"
                  ? "At least 10 characters, including a letter and a number."
                  : undefined
              }
              error={fieldErrors.password}
              disabled={busy}
            />

            {mode === "sign-in" && (
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="mt-2 text-[13px] font-semibold text-slate-500 underline-offset-4 transition-colors duration-200 hover:text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
              >
                Forgot your password?
              </button>
            )}
          </div>
        )}

        {mode === "forgot" && (
          <FormNotice>
            Enter the address you signed up with and we will send a link to set a new password.
          </FormNotice>
        )}

        {mode === "resend" && (
          <FormNotice>
            A new link replaces any you were sent before, so use the newest email.
          </FormNotice>
        )}

        <SubmitButton pending={busy} pendingLabel="Please wait">
          {copy.submit}
        </SubmitButton>
      </form>

      <div className="mt-5 text-center text-[14px] leading-[1.6] text-slate-600">
        {mode === "sign-in" && (
          <>
            Do not have an account?{" "}
            <button type="button" onClick={() => switchMode("sign-up")} className={linkButtonClass}>
              Create one
            </button>
          </>
        )}

        {mode === "sign-up" && (
          <>
            Already have an account?{" "}
            <button type="button" onClick={() => switchMode("sign-in")} className={linkButtonClass}>
              Sign in
            </button>
          </>
        )}

        {emailOnly && (
          <button type="button" onClick={() => switchMode("sign-in")} className={linkButtonClass}>
            Back to sign in
          </button>
        )}
      </div>
    </div>
  );
}

/** Google's mark, at its official four-colour spec. */
function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.583-5.036-3.71H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

export default AuthPanel;
