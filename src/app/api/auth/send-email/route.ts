import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Webhook } from "standardwebhooks";
import { sendEmail, siteOrigin } from "@/lib/email/send";
import { buildAuthMessages, type SendEmailHookPayload } from "@/lib/email/auth-hook";

/**
 * Supabase Send Email hook.
 *
 * With this registered, Supabase stops sending authentication email
 * entirely and calls here instead. Confirmation, recovery and the rest
 * are composed from our own templates and delivered by Resend, the same
 * path every application email takes. One sender, one design, one
 * delivery log in `public.email_events`.
 *
 * This file owns transport and trust. What each payload turns into
 * (which address receives which token, where each link points) lives in
 * `src/lib/email/auth-hook.ts`.
 *
 * Safe to expose publicly because every request is verified as a
 * Standard Webhooks signature over `{webhook-id}.{webhook-timestamp}.{raw
 * body}` with the shared secret from the Supabase dashboard. The library
 * also rejects a timestamp outside its tolerance window, which is what
 * stops a captured request being replayed.
 *
 * `/api/*` is excluded from `src/proxy.ts`'s matcher, so no session
 * refresh or route allow-listing runs in front of this endpoint.
 *
 * Runs on the Node.js runtime, the Next.js 16 default, which `node:crypto`
 * requires. The `runtime` export is omitted on purpose; `'edge'` is
 * deprecated in this version and naming the default buys nothing.
 */

function hookError(message: string, status: number) {
  return NextResponse.json({ error: { http_code: status, message } }, { status });
}

export async function POST(request: NextRequest) {
  const secret = process.env.SUPABASE_AUTH_HOOK_SECRET;

  if (!secret) {
    console.error("[auth-hook] SUPABASE_AUTH_HOOK_SECRET is not set");
    return hookError("Email hook is not configured.", 500);
  }

  // The raw text, not a parsed body: the signature covers the exact
  // bytes Supabase sent, and re-serialising would invalidate it.
  const rawBody = await request.text();

  let payload: SendEmailHookPayload;
  try {
    // The dashboard shows `v1,whsec_<base64>`; the library wants the
    // base64 portion on its own.
    const webhook = new Webhook(secret.replace("v1,whsec_", ""));
    payload = webhook.verify(rawBody, Object.fromEntries(request.headers)) as SendEmailHookPayload;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Invalid signature";
    console.warn("[auth-hook] rejected an unverified request:", reason);
    return hookError("Invalid webhook signature.", 401);
  }

  if (!payload?.user?.email || !payload?.email_data?.email_action_type) {
    return hookError("The hook payload is missing required fields.", 400);
  }

  const action = payload.email_data.email_action_type;

  let messages: ReturnType<typeof buildAuthMessages>;
  try {
    messages = buildAuthMessages(payload, siteOrigin());
  } catch (error) {
    // Most likely a Site URL that is not a valid absolute URL. Answer in
    // the JSON shape Supabase expects, and log the reason, rather than
    // letting an uncaught throw become an opaque HTML 500.
    const reason = error instanceof Error ? error.message : String(error);
    console.error(
      `[auth-hook] could not build the ${action} email (check NEXT_PUBLIC_SITE_URL and the Supabase Site URL):`,
      reason
    );
    return hookError("We could not prepare that email. Please try again later.", 500);
  }

  if (messages === null) {
    console.warn(`[auth-hook] unsupported action type "${action}"`);
    return hookError(`Unsupported email action type: ${action}`, 400);
  }

  if (messages.length === 0) {
    // An informational type we have no copy for. Acknowledged so Supabase
    // does not treat the underlying account change as failed; logged so
    // the gap is visible.
    console.warn(`[auth-hook] no template for "${action}", acknowledged without sending`);
    return NextResponse.json({}, { status: 200 });
  }

  const results = await Promise.all(
    messages.map(({ kind, to, content }) => sendEmail({ kind, to, content }))
  );

  /**
   * Unlike application email, a failure here is reported rather than
   * swallowed.
   *
   * An application receipt that goes missing is an annoyance. A
   * confirmation link that goes missing leaves someone holding an
   * account they cannot use, with no explanation. Returning an error
   * lets Supabase surface it at the moment of signup, so they can retry
   * instead of waiting for a message that is never coming.
   */
  const failed = results.find((result) => result.status !== "sent");
  if (failed) {
    console.error(`[auth-hook] ${action} not delivered:`, failed.error);
    return hookError("We could not send that email just now. Please try again in a moment.", 500);
  }

  return NextResponse.json({}, { status: 200 });
}

/** Anything other than POST is a misconfiguration or a probe. */
export async function GET() {
  return hookError("Method not allowed.", 405);
}
