import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";

/**
 * Sign out.
 *
 * POST only. A GET sign-out is reachable from an `<img>` tag or a
 * prefetch on any site the user visits, which makes logging them out a
 * one-line CSRF. Next.js also prefetches links, so a GET route here
 * would eventually sign people out simply for hovering.
 *
 * The form that calls this is same-origin, and Supabase's cookies are
 * SameSite=Lax, so a cross-site POST cannot carry the session it would
 * need to succeed.
 */

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { origin } = new URL(request.url);

  const formData = await request.formData().catch(() => null);
  const next = safeNextPath(
    typeof formData?.get("next") === "string" ? (formData.get("next") as string) : null,
    "/careers"
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[auth] sign out failed:", error.message);
    }
  }

  return NextResponse.redirect(new URL(next, origin), {
    // 303 so the browser follows with GET rather than repeating the POST.
    status: 303,
  });
}
