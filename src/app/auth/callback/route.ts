import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";

/**
 * OAuth return target.
 *
 * Google sends the browser here with a PKCE `code`. Exchanging it sets
 * the session cookies, which is why this has to be a Route Handler:
 * Next.js 16 does not allow a Server Component to write cookies, and the
 * exchange is meaningless without them.
 *
 * `src/proxy.ts` deliberately excludes `/auth/*` from its session
 * refresh so nothing interferes with the code verifier cookie that this
 * exchange depends on.
 */

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  // Google reports a declined consent screen as an error parameter
  // rather than by omitting the code.
  const oauthError = searchParams.get("error");
  if (oauthError) {
    const description = searchParams.get("error_description");
    console.warn("[auth] OAuth provider returned an error:", oauthError, description);

    const failure = new URL("/careers/join", origin);
    failure.searchParams.set(
      "error",
      oauthError === "access_denied" ? "oauth_cancelled" : "oauth_failed"
    );
    failure.searchParams.set("next", next);
    return NextResponse.redirect(failure);
  }

  if (!code) {
    const failure = new URL("/careers/join", origin);
    failure.searchParams.set("error", "oauth_failed");
    failure.searchParams.set("next", next);
    return NextResponse.redirect(failure);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth] code exchange failed:", error.message);
    const failure = new URL("/careers/join", origin);
    failure.searchParams.set("error", "oauth_failed");
    failure.searchParams.set("next", next);
    return NextResponse.redirect(failure);
  }

  /**
   * `origin` comes from the request URL rather than a forwarded header,
   * so a spoofed `X-Forwarded-Host` cannot turn a successful sign in
   * into a redirect off-site. `next` is already validated as a relative
   * path by `safeNextPath`.
   */
  return NextResponse.redirect(new URL(next, origin));
}
