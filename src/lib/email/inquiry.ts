import "server-only";

import { Resend } from "resend";
import { escapeHtml, type EmailContent } from "./layout";
import type { z } from "zod";
import type { contactSchema } from "@/lib/contact/validation";
import type { AttributionTouch } from "@/lib/analytics/attribution";

type Inquiry = z.output<typeof contactSchema>;

function attributionFields(input: Inquiry): string[][] {
  const formatTouch = (prefix: string, touch?: AttributionTouch) => {
    if (!touch) {
      return [[`${prefix} attribution`, "Not captured"]];
    }
    return [
      [`${prefix} source / medium`, `${touch.source} / ${touch.medium}`],
      [`${prefix} campaign`, touch.campaign || "Not set"],
      [`${prefix} landing page`, touch.landingPath],
      [`${prefix} referrer`, touch.referrer || "Not available"],
      [`${prefix} captured`, touch.capturedAt],
    ];
  };

  return [
    ...formatTouch("First touch", input.attribution?.firstTouch),
    ...formatTouch("Latest touch", input.attribution?.latestTouch),
  ];
}

export function inquiryEmail(input: Inquiry, submittedAt: Date): EmailContent {
  const fields = [
    ["Name", input.fullName],
    ["Email", input.email],
    ["Phone", input.phone],
    ["Company", input.company || "Not provided"],
    ["Service Required", input.service],
    ["Requirement", input.requirement || "Not provided"],
    ["Submitted", submittedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST"],
    ...attributionFields(input),
  ];

  const rows = fields.map(([label, value]) =>
    `<tr><th scope="row" style="padding:12px 16px;text-align:left;vertical-align:top;border-bottom:1px solid #E2E8F0;color:#475569;font-size:13px;width:150px;">${escapeHtml(label)}</th><td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;color:#0F172A;font-size:14px;white-space:pre-wrap;overflow-wrap:anywhere;">${escapeHtml(value)}</td></tr>`
  ).join("");

  return {
    subject: `New Website Inquiry — ${input.service}`,
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:24px;background:#F8FAFC;font-family:Arial,Helvetica,sans-serif;"><main style="max-width:640px;margin:auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;"><div style="background:#0F172A;padding:24px 28px;color:#FFFFFF;"><p style="margin:0 0 8px;color:#FB923C;font-size:12px;font-weight:bold;letter-spacing:.1em;text-transform:uppercase;">Siddiona Technologies</p><h1 style="margin:0;font-size:24px;line-height:1.25;">New Website Inquiry</h1></div><table style="border-collapse:collapse;width:100%;" role="presentation">${rows}</table></main></body></html>`,
    text: ["New Website Inquiry", "", ...fields.map(([label, value]) => `${label}: ${value}`)].join("\n"),
  };
}

export async function sendInquiry(input: Inquiry): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || "sales@example.com";
  if (!apiKey || !from) {
    console.error("[contact] email delivery is not configured");
    return false;
  }

  try {
    const content = inquiryEmail(input, new Date());
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to,
      replyTo: input.email,
      subject: content.subject,
      html: content.html,
      text: content.text,
    });
    if (error) {
      console.error("[contact] Resend rejected the inquiry", error.name);
      return false;
    }
    return true;
  } catch {
    console.error("[contact] email delivery failed");
    return false;
  }
}
