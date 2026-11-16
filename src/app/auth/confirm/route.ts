import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";
import {
  isWellFormedTokenHash,
  parseEmailLinkType,
  RESET_PASSWORD_PATH,
} from "@/lib/auth/email-link";

/**
 * Where every emailed auth link lands.
 *
 * Three shapes of link can arrive here, and all of them have to work:
 *
 *   1. `?token_hash=...&type=...`
 *      Links our own Send Email hook writes. These are NOT verified on
 *      this GET. They are forwarded to `/careers/verify`, where the
 *      token is only spent when the person presses a button.
 *
 *   2. `?code=...`
 *      Links from Supabase's built-in mailer. Supabase has already
 *      verified the address on its own domain and hands back a one-time
 *      PKCE code to exchange for a session. This is what arrives when
 *      the Send Email hook is not enabled.
 *
 *   3. `?error=...&error_code=otp_expired`
 *      Supabase's verify step failed and it redirected here to say so.
 *
 * Why case 1 is not verified on GET: corporate mail security
 * (Microsoft Defender Safe Links, Mimecast, Proofpoint and similar)
 * opens every link in an incoming message to scan it. If opening the
 * link spent the one-time token, the scanner would use it up, and the
 * candidate's own first click would fail with "link not valid". A GET
 * that only renders a confirm button is harmless to a scanner.
 *
 * `src/proxy.ts` excludes `/auth/*` from session refresh, so nothing
 * touches the PKCE code-verifier cookie before case 2 reads it.
 */

export const dynamic = "force-dynamic";

function toJoin(origin: string, params: Record<string, string>) {
  const url = new URL("/careers/join", origin);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeNextPath(searchParams.get("next"));
  const isRecovery = next === RESET_PASSWORD_PATH;

  // ------------------------------------------------------------ case 3
  const supabaseError = searchParams.get("error_code") ?? searchParams.get("error");
  if (supabaseError) {
    console.warn(
      "[auth] email link returned an error:",
      supabaseError,
      searchParams.get("error_description") ?? ""
    );
    return toJoin(origin, {
      error: isRecovery ? "reset_link_failed" : "link_expired",
      next: isRecovery ? "/careers" : next,
    });
  }

  // ------------------------------------------------------------ case 2
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }

    console.warn("[auth] email link code exchange failed:", error.message);

    if (isRecovery) {
      return toJoin(origin, { error: "reset_link_failed", next: "/careers" });
    }

    /**
     * Supabase marks the address confirmed on its own domain before it
     * issues this code. So an exchange failure here does not mean the
     * email is unconfirmed. It almost always means the link was opened
     * in a different browser from the one used to sign up, which does
     * not hold the PKCE verifier cookie. The account is fine; the person
     * just needs to sign in.
     */
    return toJoin(origin, { error: "confirmed_sign_in", next });
  }

  // ------------------------------------------------------------ case 1
  const tokenHash = searchParams.get("token_hash");
  const type = parseEmailLinkType(searchParams.get("type"));

  if (isWellFormedTokenHash(tokenHash) && type) {
    const verify = new URL("/careers/verify", origin);
    verify.searchParams.set("token_hash", tokenHash);
    verify.searchParams.set("type", type);
    verify.searchParams.set("next", next);
    return NextResponse.redirect(verify, { status: 303 });
  }

  return toJoin(origin, { error: "link_invalid", next });
}
