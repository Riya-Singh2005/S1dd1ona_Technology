/**
 * The shared shell for every Siddiona email.
 *
 * Both application email (`templates.ts`) and authentication email
 * (`auth-templates.ts`) build on this, so a candidate's confirmation
 * link and their application receipt look like they came from the same
 * company, because they did.
 *
 * Deliberately plain: table layout, inline styles, a web-safe font
 * stack, no external stylesheet, no web font, no background image.
 * Gmail, Outlook desktop and Apple Mail disagree about almost
 * everything more ambitious than this.
 *
 * The wordmark is text rather than an image. Most clients block remote
 * images by default, so a text lockup is the version people see.
 */

export const INK = "#0F172A";
export const INK_DEEP = "#070B14";
export const ACCENT = "#EA580C";
export const BODY_TEXT = "#334155";
export const MUTED = "#64748B";
export const HAIRLINE = "#E2E8F0";
export const SURFACE = "#F8FAFC";

export const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
export const MONO_STACK =
  "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

/**
 * Escapes interpolated values.
 *
 * Every field that reaches a template originates from user input: a
 * candidate's own name, their email address, a job title an admin
 * typed. Without this, a value containing markup would be injected into
 * the message body.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface LayoutOptions {
  preheader: string;
  heading: string;
  body: string;
  footerNote?: string;
}

/**
 * Dark masthead, orange rule, white content card. Fixed at 600px, which
 * every major client renders without reflowing.
 */
export function layout({ preheader, heading, body, footerNote }: LayoutOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:${SURFACE};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${SURFACE};">
<tr><td align="center" style="padding:32px 16px;">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;border-collapse:collapse;">

  <tr>
    <td style="background-color:${INK_DEEP};padding:28px 32px;border-radius:14px 14px 0 0;">
      <span style="font-family:${FONT_STACK};font-size:19px;font-weight:800;letter-spacing:-0.02em;color:#FFFFFF;">Siddiona</span>
      <span style="font-family:${FONT_STACK};font-size:19px;font-weight:800;letter-spacing:-0.02em;color:${ACCENT};">&nbsp;Technologies</span>
      <div style="font-family:${FONT_STACK};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#94A3B8;padding-top:7px;">Careers</div>
    </td>
  </tr>

  <tr><td style="height:3px;background-color:${ACCENT};font-size:0;line-height:0;">&nbsp;</td></tr>

  <tr>
    <td style="background-color:#FFFFFF;padding:36px 32px 32px 32px;">
      <h1 style="margin:0 0 20px 0;font-family:${FONT_STACK};font-size:25px;line-height:1.25;font-weight:800;letter-spacing:-0.02em;color:${INK};">${escapeHtml(heading)}</h1>
      ${body}
    </td>
  </tr>

  <tr>
    <td style="background-color:#FFFFFF;border-top:1px solid ${HAIRLINE};padding:24px 32px 30px 32px;border-radius:0 0 14px 14px;">
      ${
        footerNote
          ? `<p style="margin:0 0 14px 0;font-family:${FONT_STACK};font-size:13px;line-height:1.6;color:${MUTED};">${footerNote}</p>`
          : ""
      }
      <p style="margin:0;font-family:${FONT_STACK};font-size:13px;line-height:1.6;color:${MUTED};">
        Siddiona Technologies Services Pvt. Ltd.<br>
        123 Demo Business Park, New Delhi, India<br>
        <a href="mailto:sales@example.com" style="color:${ACCENT};text-decoration:none;">sales@example.com</a>
      </p>
    </td>
  </tr>

</table>

</td></tr>
</table>
</body>
</html>`;
}

export function paragraph(html: string): string {
  return `<p style="margin:0 0 16px 0;font-family:${FONT_STACK};font-size:15px;line-height:1.65;color:${BODY_TEXT};">${html}</p>`;
}

/** A bordered fact row, used for application and account summaries. */
export function detailRow(label: string, value: string, mono = false): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${HAIRLINE};font-family:${FONT_STACK};font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};width:42%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${HAIRLINE};font-family:${mono ? MONO_STACK : FONT_STACK};font-size:14px;font-weight:600;color:${INK};vertical-align:top;">${escapeHtml(value)}</td>
  </tr>`;
}

export function detailTable(rows: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:8px 0 26px 0;border-top:1px solid ${HAIRLINE};">${rows}</table>`;
}

/** Bulletproof-ish button. Outlook ignores border-radius; that is fine. */
export function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 8px 0;">
    <tr><td style="background-color:${ACCENT};border-radius:8px;">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 26px;font-family:${FONT_STACK};font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;letter-spacing:0.01em;">${escapeHtml(label)}</a>
    </td></tr>
  </table>`;
}

/**
 * The raw link, printed under a button.
 *
 * Some clients strip or rewrite anchors, and a security-sensitive link
 * that silently does not work is worse than an ugly one. `word-break`
 * keeps a long token from forcing horizontal scroll on a phone.
 */
export function fallbackLink(href: string): string {
  return `<p style="margin:14px 0 0 0;font-family:${FONT_STACK};font-size:12.5px;line-height:1.6;color:${MUTED};">
    If the button does not work, copy this link into your browser:<br>
    <span style="font-family:${MONO_STACK};font-size:12px;color:${BODY_TEXT};word-break:break-all;">${escapeHtml(href)}</span>
  </p>`;
}

/** A large, spaced one-time code, for flows that send a code not a link. */
export function codeBlock(code: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px 0;">
    <tr><td align="center" style="background-color:${SURFACE};border:1px solid ${HAIRLINE};border-radius:10px;padding:20px;">
      <span style="font-family:${MONO_STACK};font-size:30px;font-weight:700;letter-spacing:0.28em;color:${INK};">${escapeHtml(code)}</span>
    </td></tr>
  </table>`;
}
