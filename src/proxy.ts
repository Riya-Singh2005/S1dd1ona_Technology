import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Legacy URLs from the former WordPress/WooCommerce site, and routes this
 * site has since renamed, are not redirected. They match no route, so the
 * router answers 404 with the custom not-found page (no navbar).
 *
 * The one exception is the WooCommerce AJAX endpoint, which hit the
 * homepage with a query string and would otherwise render it. Rewriting
 * to a path no route matches gives it the same 404.
 */
function isLegacyWooCommerceRequest(request: NextRequest): boolean {
  const { pathname, searchParams } = request.nextUrl;
  return pathname === "/" && searchParams.has("wc-ajax");
}

/**
 * Where a Supabase session is worth refreshing.
 *
 * Deliberately narrow. The marketing pages have a sub-1.2s LCP budget
 * and none of them read a session, so paying an auth round-trip on
 * `/about` would be pure cost.
 *
 * `/auth/*` is excluded on purpose: those Route Handlers own the PKCE
 * code-verifier cookie and complete the exchange themselves. Running a
 * refresh in front of them risks disturbing that handshake.
 */
const SESSION_PREFIXES = ["/careers", "/admin"];

function needsSession(pathname: string): boolean {
  return SESSION_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isLegacyWooCommerceRequest(request)) {
    return NextResponse.rewrite(new URL("/__not-found", request.url));
  }

  if (!needsSession(pathname)) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without credentials the careers routes still render; they just render
  // signed out. Failing the request here would take the whole site down
  // over a missing env var.
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  // This response object accumulates refreshed auth cookies. It must be
  // the one returned, or a rotated refresh token is written to a
  // response that never reaches the browser and the session dies.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  /**
   * `getClaims()` rather than `getUser()`.
   *
   * It still refreshes an expiring session (and writes the rotated
   * cookies through `setAll` above), but it verifies the access token's
   * signature locally against the project's published ES256 key, which
   * is cached across requests. `getUser()` made a round trip to Supabase
   * Auth on every careers and admin request for a signed-in visitor.
   */
  const { data: claimsData } = await supabase.auth.getClaims();
  const user = claimsData?.claims?.sub ? { id: claimsData.claims.sub } : null;

  /**
   * An optimistic redirect only. It reads the session that was just
   * refreshed and saves an unauthenticated visitor a wasted render.
   *
   * The Next.js 16 docs are explicit that proxy "should not be used as
   * a full session management or authorization solution", and that a
   * matcher change can silently drop Server Action coverage. So this is
   * a convenience: `requireAdmin()` re-checks on the server, and Row
   * Level Security refuses the data regardless.
   */
  if (!user && pathname.startsWith("/admin") && pathname !== "/admin/sign-in") {
    const signIn = new URL("/admin/sign-in", request.url);
    signIn.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(signIn);
    for (const cookie of response.cookies.getAll()) {
      redirect.cookies.set(cookie);
    }
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - brand (brand assets)
     * - images (capability images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|brand|images).*)",
  ],
};
