/**
 * Authentication email, sent by Siddiona rather than by Supabase.
 *
 * Supabase's own mailer is switched off entirely. Instead it calls the
 * Send Email hook at `/api/auth/send-email`, which renders these
 * templates and sends them through Resend. That means confirmation and
 * recovery mail is composed, branded and delivered by the same system
 * as every application email, and there is no second sender identity
 * for a candidate to distrust.
 *
 * Every link routes through `/auth/confirm`, the app's own Route
 * Handler, which verifies the token and establishes the session. The
 * Supabase verify endpoint is never linked directly.
 *
 * Tone note: these are security emails. They say plainly what will
 * happen, how long the link lasts, and what to do if it was not you.
 */

import {
  button,
  codeBlock,
  escapeHtml,
  fallbackLink,
  INK,
  layout,
  paragraph,
  type EmailContent,
} from "./layout";

const IGNORE_NOTE =
  "If this was not you, ignore this message and nothing will change.";

// ---------------------------------------------------------------------
// Confirm signup
// ---------------------------------------------------------------------

export function confirmSignupEmail(actionUrl: string): EmailContent {
  const html = layout({
    preheader: "Confirm your email address to finish creating your Siddiona Careers account.",
    heading: "Confirm your email",
    body: [
      paragraph(
        "Welcome to Siddiona Careers. Confirm your email address and you can apply for roles and follow every application from your account."
      ),
      button(actionUrl, "Confirm email address"),
      fallbackLink(actionUrl),
      paragraph(
        `<span style="font-size:13px;">This link can be used once and expires in 24 hours. If you did not create an account, ignore this message and nothing will happen.</span>`
      ),
    ].join("\n"),
  });

  const text = [
    "Welcome to Siddiona Careers.",
    "",
    "Confirm your email address and you can apply for roles and follow every application from your account.",
    "",
    actionUrl,
    "",
    "This link can be used once and expires in 24 hours. If you did not create an account, ignore this message and nothing will happen.",
    "",
    "Siddiona Technologies",
  ].join("\n");

  return { subject: "Confirm your email address", html, text };
}

// ---------------------------------------------------------------------
// Reset password
// ---------------------------------------------------------------------

export function resetPasswordEmail(actionUrl: string): EmailContent {
  const html = layout({
    preheader: "Set a new password for your Siddiona Careers account.",
    heading: "Reset your password",
    body: [
      paragraph(
        "Use the link below to set a new password for your Siddiona Careers account."
      ),
      button(actionUrl, "Set a new password"),
      fallbackLink(actionUrl),
      paragraph(
        `<span style="font-size:13px;">This link can be used once and expires in one hour. If you did not ask to reset your password, ignore this message. Your existing password will keep working.</span>`
      ),
    ].join("\n"),
  });

  const text = [
    "Reset your Siddiona Careers password.",
    "",
    "Use the link below to set a new password:",
    "",
    actionUrl,
    "",
    "This link can be used once and expires in one hour. If you did not ask to reset your password, ignore this message. Your existing password will keep working.",
    "",
    "Siddiona Technologies",
  ].join("\n");

  return { subject: "Reset your password", html, text };
}

// ---------------------------------------------------------------------
// Magic link
// ---------------------------------------------------------------------

export function magicLinkEmail(actionUrl: string): EmailContent {
  const html = layout({
    preheader: "Your sign in link for Siddiona Careers.",
    heading: "Sign in to Siddiona Careers",
    body: [
      paragraph("Use the link below to sign in. No password needed."),
      button(actionUrl, "Sign in"),
      fallbackLink(actionUrl),
      paragraph(
        `<span style="font-size:13px;">This link can be used once and expires in one hour. ${IGNORE_NOTE}</span>`
      ),
    ].join("\n"),
  });

  const text = [
    "Sign in to Siddiona Careers.",
    "",
    actionUrl,
    "",
    `This link can be used once and expires in one hour. ${IGNORE_NOTE}`,
    "",
    "Siddiona Technologies",
  ].join("\n");

  return { subject: "Your sign in link", html, text };
}

// ---------------------------------------------------------------------
// Invite
// ---------------------------------------------------------------------

export function inviteEmail(actionUrl: string): EmailContent {
  const html = layout({
    preheader: "You have been invited to Siddiona Careers.",
    heading: "You have been invited",
    body: [
      paragraph(
        "Someone at Siddiona Technologies has invited you to create a Siddiona Careers account. Accept the invitation to set a password and get started."
      ),
      button(actionUrl, "Accept the invitation"),
      fallbackLink(actionUrl),
      paragraph(
        `<span style="font-size:13px;">This link can be used once. If you were not expecting it, ignore this message.</span>`
      ),
    ].join("\n"),
  });

  const text = [
    "You have been invited to Siddiona Careers.",
    "",
    "Accept the invitation to set a password and get started:",
    "",
    actionUrl,
    "",
    "This link can be used once. If you were not expecting it, ignore this message.",
    "",
    "Siddiona Technologies",
  ].join("\n");

  return { subject: "You have been invited to Siddiona Careers", html, text };
}

// ---------------------------------------------------------------------
// Email change
// ---------------------------------------------------------------------

/**
 * With Secure Email Change enabled, Supabase requires confirmation from
 * both addresses, so this renders two variants: one for the address
 * being left, one for the address being adopted.
 */
export function emailChangeEmail(
  actionUrl: string,
  audience: "current" | "new",
  newEmail?: string
): EmailContent {
  const destination = newEmail
    ? `<strong style="color:${INK};">${escapeHtml(newEmail)}</strong>`
    : "a new address";

  const isCurrent = audience === "current";

  const heading = isCurrent ? "Confirm your email change" : "Confirm your new email";
  const intro = isCurrent
    ? `A request was made to move your Siddiona Careers account from this address to ${destination}. Confirm below to approve the change from this side.`
    : "A request was made to use this address for a Siddiona Careers account. Confirm below to complete the change.";
  const cta = isCurrent ? "Approve email change" : "Confirm new email";
  const warning = isCurrent
    ? "If you did not request this, do not click the link. Write to us straight away so we can secure the account."
    : "If you did not request this, ignore this message and nothing will change.";

  const html = layout({
    preheader: isCurrent
      ? "Approve the email change on your Siddiona Careers account."
      : "Confirm the new email address on your Siddiona Careers account.",
    heading,
    body: [
      paragraph(intro),
      button(actionUrl, cta),
      fallbackLink(actionUrl),
      paragraph(
        `<span style="font-size:13px;">This link can be used once and expires in 24 hours. ${warning}</span>`
      ),
    ].join("\n"),
  });

  const plainIntro = isCurrent
    ? `A request was made to move your Siddiona Careers account from this address${newEmail ? ` to ${newEmail}` : ""}.`
    : "A request was made to use this address for a Siddiona Careers account.";

  const text = [
    heading,
    "",
    plainIntro,
    "",
    actionUrl,
    "",
    `This link can be used once and expires in 24 hours. ${warning}`,
    "",
    "Siddiona Technologies",
  ].join("\n");

  return {
    subject: isCurrent ? "Approve your email change" : "Confirm your new email address",
    html,
    text,
  };
}

// ---------------------------------------------------------------------
// Reauthentication
//
// This flow sends a code rather than a link, because the user is
// already in a session and is confirming an action inside it.
// ---------------------------------------------------------------------

export function reauthenticationEmail(code: string): EmailContent {
  const html = layout({
    preheader: "Your Siddiona Careers confirmation code.",
    heading: "Confirm it is you",
    body: [
      paragraph("Enter this code to confirm the action you started:"),
      codeBlock(code),
      paragraph(
        `<span style="font-size:13px;">The code expires in one hour. ${IGNORE_NOTE} Never share it with anyone, including anyone claiming to be from Siddiona.</span>`
      ),
    ].join("\n"),
  });

  const text = [
    "Confirm it is you.",
    "",
    `Your Siddiona Careers confirmation code is: ${code}`,
    "",
    `The code expires in one hour. ${IGNORE_NOTE} Never share it with anyone, including anyone claiming to be from Siddiona.`,
    "",
    "Siddiona Technologies",
  ].join("\n");

  return { subject: `${code} is your Siddiona confirmation code`, html, text };
}

// ---------------------------------------------------------------------
// Security notifications
//
// Informational, no token and no action. Supabase emits these after a
// sensitive change has already happened. They are worth sending: an
// unexpected "your password was changed" is often the first signal a
// person gets that something is wrong.
// ---------------------------------------------------------------------

const NOTIFICATION_COPY: Record<string, { heading: string; subject: string; body: string }> = {
  password_changed_notification: {
    heading: "Your password was changed",
    subject: "Your Siddiona Careers password was changed",
    body: "The password on your Siddiona Careers account was just changed.",
  },
  email_changed_notification: {
    heading: "Your email address was changed",
    subject: "The email on your Siddiona Careers account was changed",
    body: "The email address on your Siddiona Careers account was just changed.",
  },
  phone_changed_notification: {
    heading: "Your phone number was changed",
    subject: "The phone number on your Siddiona Careers account was changed",
    body: "The phone number on your Siddiona Careers account was just changed.",
  },
  identity_linked_notification: {
    heading: "A sign in method was added",
    subject: "A sign in method was added to your Siddiona Careers account",
    body: "A new way of signing in was just linked to your Siddiona Careers account.",
  },
  identity_unlinked_notification: {
    heading: "A sign in method was removed",
    subject: "A sign in method was removed from your Siddiona Careers account",
    body: "A way of signing in was just removed from your Siddiona Careers account.",
  },
  mfa_factor_enrolled_notification: {
    heading: "Two factor authentication was enabled",
    subject: "Two factor authentication was enabled on your Siddiona Careers account",
    body: "A two factor authentication method was just added to your Siddiona Careers account.",
  },
  mfa_factor_unenrolled_notification: {
    heading: "Two factor authentication was removed",
    subject: "Two factor authentication was removed from your Siddiona Careers account",
    body: "A two factor authentication method was just removed from your Siddiona Careers account.",
  },
};

export function securityNotificationEmail(actionType: string): EmailContent | null {
  const copy = NOTIFICATION_COPY[actionType];
  if (!copy) return null;

  const html = layout({
    preheader: copy.body,
    heading: copy.heading,
    body: [
      paragraph(escapeHtml(copy.body)),
      paragraph(
        "If you made this change, there is nothing to do. If you did not, reply to this message or write to sales@example.com straight away and we will secure the account."
      ),
    ].join("\n"),
  });

  const text = [
    copy.heading,
    "",
    copy.body,
    "",
    "If you made this change, there is nothing to do. If you did not, reply to this message or write to sales@example.com straight away and we will secure the account.",
    "",
    "Siddiona Technologies",
  ].join("\n");

  return { subject: copy.subject, html, text };
}
