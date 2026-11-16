import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/guards";
import { createResumeSignedUrl } from "@/lib/careers/queries";

/**
 * Secure resume access.
 *
 * The `resumes` bucket is private and has no public read policy, so a
 * CV cannot be fetched by URL. This handler mints a signed URL on
 * demand and redirects to it.
 *
 * Signing on click rather than at render time matters. A URL generated
 * while the page was built could be minutes old by the time anyone
 * presses it, which would force a long expiry. Here the link is created
 * at the moment it is used, so 60 seconds is generous: long enough for
 * a browser to follow, short enough that a URL pasted into a chat is
 * dead before it travels.
 *
 * Signing runs through the administrator's own session, so storage RLS
 * still decides whether it is permitted. The admin check below is a
 * fast fail with a clear status code, not the security boundary.
 */

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!(await isAdmin(supabase, user.id))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { data: application } = await supabase
    .from("applications")
    .select("resume_path")
    .eq("id", id)
    .maybeSingle();

  if (!application?.resume_path) {
    return new NextResponse("Not found", { status: 404 });
  }

  const signedUrl = await createResumeSignedUrl(supabase, application.resume_path, 60);

  if (!signedUrl) {
    return new NextResponse("Could not generate a download link", { status: 502 });
  }

  const response = NextResponse.redirect(signedUrl, { status: 307 });
  // A signed URL is a bearer credential. Nothing should keep a copy.
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
