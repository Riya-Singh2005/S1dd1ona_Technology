"use server";

import { redirect } from "next/navigation";
import { createClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";
import {
  isWellFormedTokenHash,
  parseEmailLinkType,
  RESET_PASSWORD_PATH,
} from "@/lib/auth/email-link";

/**
 * Spends an emailed auth token.
 *
 * Runs only when the person presses the button on `/careers/verify`,
 * never on a page load, so a mail scanner that opens the link cannot
 * use the token up first.
 *
 * `verifyOtp` sets the session cookies, which Next.js 16 allows in a
 * Server Action but not during a Server Component render. That is why
 * this is an action rather than code in the page.
 */
export async function confirmEmailLink(formData: FormData): Promise<void> {
  const tokenHash = formData.get("token_hash");
  const type = parseEmailLinkType(
    typeof formData.get("type") === "string" ? (formData.get("type") as string) : null
  );
  const nextRaw = formData.get("next");
  const next = safeNextPath(typeof nextRaw === "string" ? nextRaw : null);

  if (!isWellFormedTokenHash(typeof tokenHash === "string" ? tokenHash : null) || !type) {
    redirect(`/careers/join?error=link_invalid`);
  }

  if (!isSupabaseServerConfigured()) {
    redirect(`/careers/join?error=link_invalid`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash as string,
  });

  if (error) {
    console.warn(`[auth] verifyOtp failed for ${type}:`, error.message);

    if (type === "recovery") {
      redirect(`/careers/join?error=reset_link_failed`);
    }
    redirect(`/careers/join?error=link_expired&next=${encodeURIComponent(next)}`);
  }

  // A recovery session exists only so a new password can be set, so it
  // always lands on the reset screen whatever `next` says.
  redirect(type === "recovery" ? RESET_PASSWORD_PATH : next);
}
