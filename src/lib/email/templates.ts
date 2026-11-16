/**
 * Application email for Siddiona Careers.
 *
 * The three messages the app itself sends about an application:
 * received, status changed, and the recruitment team notification.
 *
 * Authentication email (confirm signup, password reset, and the rest)
 * lives in `auth-templates.ts` and is triggered by Supabase through the
 * Send Email hook. Both build on the same shell in `layout.ts`, so the
 * whole sequence looks like one system.
 */

import {
  button,
  detailRow,
  detailTable,
  escapeHtml,
  INK,
  layout,
  MUTED,
  paragraph,
  type EmailContent,
} from "./layout";

export { escapeHtml };
export type { EmailContent };

// ---------------------------------------------------------------------
// 1. Application received
// ---------------------------------------------------------------------

export interface ApplicationReceivedInput {
  candidateName: string;
  jobTitle: string;
  reference: string;
  submittedAt: string;
  applicationUrl: string;
}

export function applicationReceivedEmail(input: ApplicationReceivedInput): EmailContent {
  const { candidateName, jobTitle, reference, submittedAt, applicationUrl } = input;
  const firstName = candidateName.split(" ")[0] || candidateName;

  const html = layout({
    preheader: `Your application for ${jobTitle} has been received. Reference ${reference}.`,
    heading: "Application received",
    body: [
      paragraph(`Hi ${escapeHtml(firstName)},`),
      paragraph(
        `We have received your application for <strong style="color:${INK};">${escapeHtml(jobTitle)}</strong>. Thank you for the time you put into it.`
      ),
      detailTable(
        [
          detailRow("Role", jobTitle),
          detailRow("Application ID", reference, true),
          detailRow("Submitted", submittedAt),
          detailRow("Current status", "Submitted"),
        ].join("")
      ),
      paragraph(
        "Our hiring team reads every application. We will get back to you if there is a next step, and we will tell you either way."
      ),
      button(applicationUrl, "View your application"),
    ].join("\n"),
    footerNote:
      "You are receiving this because you applied for a role at Siddiona Technologies.",
  });

  const text = [
    `Hi ${firstName},`,
    "",
    `We have received your application for ${jobTitle}. Thank you for the time you put into it.`,
    "",
    `Role: ${jobTitle}`,
    `Application ID: ${reference}`,
    `Submitted: ${submittedAt}`,
    "Current status: Submitted",
    "",
    "Our hiring team reads every application. We will get back to you if there is a next step, and we will tell you either way.",
    "",
    `View your application: ${applicationUrl}`,
    "",
    "Regards,",
    "Siddiona Technologies",
  ].join("\n");

  return {
    subject: `Application received: ${jobTitle} (${reference})`,
    html,
    text,
  };
}

// ---------------------------------------------------------------------
// 2. Application status updated
// ---------------------------------------------------------------------

export interface ApplicationStatusEmailInput {
  candidateName: string;
  jobTitle: string;
  reference: string;
  statusLabel: string;
  statusDescription: string;
  applicationUrl: string;
}

export function applicationStatusEmail(input: ApplicationStatusEmailInput): EmailContent {
  const {
    candidateName,
    jobTitle,
    reference,
    statusLabel,
    statusDescription,
    applicationUrl,
  } = input;
  const firstName = candidateName.split(" ")[0] || candidateName;

  const html = layout({
    preheader: `Your application for ${jobTitle} is now ${statusLabel}.`,
    heading: "Your application has an update",
    body: [
      paragraph(`Hi ${escapeHtml(firstName)},`),
      paragraph(
        `There is an update on your application for <strong style="color:${INK};">${escapeHtml(jobTitle)}</strong>.`
      ),
      detailTable(
        [
          detailRow("Role", jobTitle),
          detailRow("Application ID", reference, true),
          detailRow("Current status", statusLabel),
        ].join("")
      ),
      paragraph(escapeHtml(statusDescription)),
      button(applicationUrl, "View your application"),
    ].join("\n"),
    footerNote:
      "You are receiving this because you applied for a role at Siddiona Technologies.",
  });

  const text = [
    `Hi ${firstName},`,
    "",
    `There is an update on your application for ${jobTitle}.`,
    "",
    `Role: ${jobTitle}`,
    `Application ID: ${reference}`,
    `Current status: ${statusLabel}`,
    "",
    statusDescription,
    "",
    `View your application: ${applicationUrl}`,
    "",
    "Regards,",
    "Siddiona Technologies",
  ].join("\n");

  return {
    subject: `${jobTitle}: your application is now ${statusLabel}`,
    html,
    text,
  };
}

// ---------------------------------------------------------------------
// 3. New application, to the recruitment team
// ---------------------------------------------------------------------

export interface NewApplicationNotificationInput {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  jobTitle: string;
  department: string;
  reference: string;
  submittedAt: string;
  adminUrl: string;
}

export function newApplicationNotificationEmail(
  input: NewApplicationNotificationInput
): EmailContent {
  const {
    candidateName,
    candidateEmail,
    candidatePhone,
    jobTitle,
    department,
    reference,
    submittedAt,
    adminUrl,
  } = input;

  const html = layout({
    preheader: `${candidateName} applied for ${jobTitle}.`,
    heading: "New application",
    body: [
      paragraph(
        `<strong style="color:${INK};">${escapeHtml(candidateName)}</strong> has applied for <strong style="color:${INK};">${escapeHtml(jobTitle)}</strong>.`
      ),
      detailTable(
        [
          detailRow("Candidate", candidateName),
          detailRow("Email", candidateEmail),
          detailRow("Phone", candidatePhone),
          detailRow("Role", jobTitle),
          detailRow("Department", department),
          detailRow("Application ID", reference, true),
          detailRow("Submitted", submittedAt),
        ].join("")
      ),
      button(adminUrl, "Open in admin"),
      paragraph(
        `<span style="color:${MUTED};font-size:13px;">The resume is available from the admin console. Resumes are stored privately and are not attached to this email.</span>`
      ),
    ].join("\n"),
  });

  const text = [
    `${candidateName} has applied for ${jobTitle}.`,
    "",
    `Candidate: ${candidateName}`,
    `Email: ${candidateEmail}`,
    `Phone: ${candidatePhone}`,
    `Role: ${jobTitle}`,
    `Department: ${department}`,
    `Application ID: ${reference}`,
    `Submitted: ${submittedAt}`,
    "",
    `Open in admin: ${adminUrl}`,
    "",
    "The resume is available from the admin console. Resumes are stored privately and are not attached to this email.",
  ].join("\n");

  return {
    subject: `New application: ${jobTitle} (${candidateName})`,
    html,
    text,
  };
}

