import "server-only";

import { Resend } from "resend";
import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { SITE_ORIGIN } from "@/lib/site";
import type { EmailContent } from "./layout";

/**
 * Outbound transactional email.
 *
 * Two rules govern this module:
 *
 *   1. It never throws into the request path. A candidate who has just
 *      submitted an application has done everything right; a Resend
 *      outage is not their problem, and it must not roll back their
 *      submission or show them an error.
 *
 *   2. Every attempt is recorded in `email_events`. Swallowing a failure
 *      silently would mean a recruiter never learns that notifications
 *      stopped arriving. The admin console surfaces this log.
 */

export type EmailKind =
  // Sent by the app about an application.
  | "application_received"
  | "application_status_updated"
  | "new_application_notification"
  // Sent on Supabase's behalf, through the Send Email hook. Supabase's
  // own mailer is switched off; these go out through Resend like
  // everything else, and land in the same delivery log.
  | "auth_confirm_signup"
  | "auth_reset_password"
  | "auth_magic_link"
  | "auth_invite"
  | "auth_email_change"
  | "auth_reauthentication"
  | "auth_security_notification";

export interface SendEmailInput {
  kind: EmailKind;
  to: string;
  content: EmailContent;
  applicationId?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  status: "sent" | "failed" | "skipped";
  id?: string;
  error?: string;
}

let resendClient: Resend | undefined;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * The From address.
 *
 * Must be on a domain verified in Resend, otherwise the API rejects the
 * send. Configurable so staging can point somewhere harmless.
 */
function fromAddress(): string {
  return process.env.CAREERS_FROM_EMAIL ?? "Siddiona Careers <careers@example.com>";
}

export function notificationRecipients(): string[] {
  const raw = process.env.CAREERS_NOTIFICATION_EMAIL ?? "";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

/**
 * Writes the delivery outcome.
 *
 * Uses the service-role client because `email_events` has no INSERT
 * policy: nothing reachable from a browser session should be able to
 * forge a delivery record. If the service role is not configured we
 * degrade to a console line rather than failing the send.
 */
async function recordEmailEvent(
  kind: EmailKind,
  to: string,
  result: SendEmailResult,
  applicationId?: string
): Promise<void> {
  if (!isServiceRoleConfigured()) {
    console.warn(
      `[email] ${kind} to ${to}: ${result.status}${result.error ? ` (${result.error})` : ""} (not logged, service role unset)`
    );
    return;
  }

  try {
    const admin = createAdminClient();
    await admin.from("email_events").insert({
      kind,
      to_email: to,
      application_id: applicationId ?? null,
      status: result.status,
      provider_id: result.id ?? null,
      error: result.error ?? null,
    });
  } catch (error) {
    console.error("[email] failed to record delivery event", error);
  }
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const { kind, to, content, applicationId, replyTo } = input;

  let result: SendEmailResult;

  const resend = getResend();
  if (!resend) {
    // A missing API key is a configuration state, not a failure. In
    // local development this keeps the whole flow testable without
    // pretending a message went out.
    result = { status: "skipped", error: "RESEND_API_KEY is not set" };
    console.info(`[email] skipped ${kind} to ${to}: RESEND_API_KEY is not set`);
  } else {
    try {
      const { data, error } = await resend.emails.send({
        from: fromAddress(),
        to,
        subject: content.subject,
        html: content.html,
        text: content.text,
        ...(replyTo ? { replyTo } : {}),
      });

      result = error
        ? { status: "failed", error: error.message }
        : { status: "sent", id: data?.id };

      if (error) {
        console.error(`[email] ${kind} to ${to} failed:`, error.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown email error";
      result = { status: "failed", error: message };
      console.error(`[email] ${kind} to ${to} threw:`, message);
    }
  }

  await recordEmailEvent(kind, to, result, applicationId);
  return result;
}

/**
 * Fan-out to the recruitment team.
 *
 * Sent individually rather than as one message with several recipients,
 * so one bad address in the list cannot suppress delivery to the rest,
 * and so each attempt gets its own audit row.
 */
export async function sendToRecruitment(
  kind: EmailKind,
  content: EmailContent,
  options: { applicationId?: string; replyTo?: string } = {}
): Promise<SendEmailResult[]> {
  const recipients = notificationRecipients();

  if (recipients.length === 0) {
    console.warn("[email] CAREERS_NOTIFICATION_EMAIL is not set, no team notification sent");
    return [{ status: "skipped", error: "CAREERS_NOTIFICATION_EMAIL is not set" }];
  }

  return Promise.all(
    recipients.map((to) =>
      sendEmail({ kind, to, content, applicationId: options.applicationId, replyTo: options.replyTo })
    )
  );
}

/**
 * The canonical public origin, used to build absolute links in email.
 *
 * Falls back through the Vercel-provided host so preview deployments
 * produce working links without extra configuration.
 */
export function siteOrigin(): string {
  const configured = normaliseOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) return configured;

  const vercel = normaliseOrigin(
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
  );
  if (vercel) return vercel;

  return SITE_ORIGIN;
}

/**
 * Turns whatever was typed into an environment variable into a usable
 * origin, or null.
 *
 * Tolerates the common slips: a missing `https://`, a trailing slash or
 * path, and several domains separated by commas (the first one wins).
 * Without this, a value like `siddiona.vercel.app` produced email links
 * such as `siddiona.vercel.app/careers/applications` that mail clients
 * do not treat as links at all.
 */
function normaliseOrigin(value: string | undefined): string | null {
  const first = value?.split(",")[0]?.trim();
  if (!first) return null;

  const withScheme = /^https?:\/\//i.test(first) ? first : `https://${first}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return null;
  }
}
