/**
 * Pure mapping from a Supabase Send Email hook payload to the messages
 * it should produce.
 *
 * Kept separate from the Route Handler, which owns transport and
 * signature verification, so that this logic (which address gets which
 * token, and where each link points) can be exercised directly. It has
 * no server-only imports and no I/O.
 */

import { safeNextPath } from "@/lib/auth/redirect";
import type { EmailContent } from "./layout";
import type { EmailKind } from "./send";
import {
  confirmSignupEmail,
  emailChangeEmail,
  inviteEmail,
  magicLinkEmail,
  reauthenticationEmail,
  resetPasswordEmail,
  securityNotificationEmail,
} from "./auth-templates";

export interface SendEmailHookPayload {
  user: {
    id: string;
    email: string;
    new_email?: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
}

export interface OutgoingMessage {
  kind: EmailKind;
  to: string;
  content: EmailContent;
  /** The link in the message, when it has one. Exposed for logging and tests. */
  actionUrl?: string;
}

/** Maps a hook action type onto the `verifyOtp` type `/auth/confirm` expects. */
const OTP_TYPE_BY_ACTION: Record<string, string> = {
  signup: "signup",
  email: "email",
  invite: "invite",
  magiclink: "magiclink",
  recovery: "recovery",
  email_change: "email_change",
};

function originOf(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Which origin an emailed link points at.
 *
 * `redirect_to` is honoured only when it matches an origin we already
 * trust: the project Site URL from the signed payload, or the app's own
 * configured origin. Supabase has already checked `redirect_to` against
 * its allowlist, so this is a second barrier rather than the only one,
 * but a loosely configured allowlist still cannot turn a confirmation
 * email into a link to somebody else's site.
 */
export function resolveActionOrigin(
  redirectTo: string,
  siteUrl: string,
  configuredOrigin: string
): string {
  const configured = originOf(configuredOrigin);
  const fromSite = originOf(siteUrl);
  const fromRedirect = originOf(redirectTo);

  const trusted = new Set([configured, fromSite].filter(Boolean) as string[]);

  if (fromRedirect && trusted.has(fromRedirect)) return fromRedirect;
  return fromSite ?? configured ?? configuredOrigin;
}

/** The post-verification destination, recovered from `redirect_to`. */
export function resolveNextPath(redirectTo: string): string {
  try {
    const url = new URL(redirectTo);
    const next = url.searchParams.get("next");
    if (next) return safeNextPath(next);
    return safeNextPath(url.pathname === "/auth/confirm" ? null : url.pathname);
  } catch {
    return "/careers";
  }
}

/** A link through our own `/auth/confirm` handler, never Supabase's verify URL. */
function buildActionUrl(
  tokenHash: string,
  otpType: string,
  emailData: SendEmailHookPayload["email_data"],
  configuredOrigin: string
): string {
  const url = new URL(
    "/auth/confirm",
    resolveActionOrigin(emailData.redirect_to, emailData.site_url, configuredOrigin)
  );
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", otpType);
  url.searchParams.set("next", resolveNextPath(emailData.redirect_to));
  return url.toString();
}

/**
 * Turns one hook call into the messages it implies.
 *
 * Returns null for an action we cannot render, and an empty list for an
 * informational type we deliberately acknowledge without sending.
 */
export function buildAuthMessages(
  payload: SendEmailHookPayload,
  configuredOrigin: string
): OutgoingMessage[] | null {
  const { user, email_data: emailData } = payload;
  const action = emailData.email_action_type;

  if (action === "reauthentication") {
    // A code rather than a link: the user is already signed in and is
    // confirming an action inside that session.
    return [
      {
        kind: "auth_reauthentication",
        to: user.email,
        content: reauthenticationEmail(emailData.token),
      },
    ];
  }

  if (action.endsWith("_notification")) {
    const content = securityNotificationEmail(action);
    if (!content) return [];
    return [{ kind: "auth_security_notification", to: user.email, content }];
  }

  const otpType = OTP_TYPE_BY_ACTION[action];
  if (!otpType) return null;

  const link = (tokenHash: string) =>
    buildActionUrl(tokenHash, otpType, emailData, configuredOrigin);

  if (action === "email_change") {
    /**
     * Supabase's field names are reversed here for backward
     * compatibility, and its documentation warns about exactly this:
     *
     *   current address (`user.email`)     gets `token_hash_new`
     *   new address     (`user.new_email`) gets `token_hash`
     *
     * `token_hash_new` is only present when Secure Email Change requires
     * confirmation from both sides. Without it, only the new address is
     * asked to confirm.
     */
    const newAddress = user.new_email ?? user.email;
    const newLink = link(emailData.token_hash);

    const messages: OutgoingMessage[] = [
      {
        kind: "auth_email_change",
        to: newAddress,
        content: emailChangeEmail(newLink, "new", newAddress),
        actionUrl: newLink,
      },
    ];

    if (emailData.token_hash_new && user.new_email && user.new_email !== user.email) {
      const currentLink = link(emailData.token_hash_new);
      messages.push({
        kind: "auth_email_change",
        to: user.email,
        content: emailChangeEmail(currentLink, "current", user.new_email),
        actionUrl: currentLink,
      });
    }

    return messages;
  }

  const href = link(emailData.token_hash);

  switch (action) {
    case "recovery":
      return [
        { kind: "auth_reset_password", to: user.email, content: resetPasswordEmail(href), actionUrl: href },
      ];
    case "magiclink":
      return [
        { kind: "auth_magic_link", to: user.email, content: magicLinkEmail(href), actionUrl: href },
      ];
    case "invite":
      return [{ kind: "auth_invite", to: user.email, content: inviteEmail(href), actionUrl: href }];
    default:
      // signup and email both confirm the address.
      return [
        { kind: "auth_confirm_signup", to: user.email, content: confirmSignupEmail(href), actionUrl: href },
      ];
  }
}
