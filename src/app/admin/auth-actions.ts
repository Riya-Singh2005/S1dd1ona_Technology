"use server";

import { redirect } from "next/navigation";
import {
  adminAuthOutcomeMessage,
  parseAdminPasswordSetup,
  parseAdminSignIn,
} from "@/lib/auth/admin-auth";
import { getAdminContext, getAdminRole } from "@/lib/auth/guards";
import { safeNextPath } from "@/lib/auth/redirect";
import { actionError, type ActionResult } from "@/lib/careers/types";
import { createClient } from "@/lib/supabase/server";

export async function signInAdmin(
  requestedNext: string,
  _previous: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseAdminSignIn({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.ok) return actionError("Check the highlighted fields.", parsed.fieldErrors);

  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
  } catch {
    return actionError(adminAuthOutcomeMessage("unavailable"));
  }

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    return actionError(adminAuthOutcomeMessage("invalid_credentials"));
  }

  try {
    const role = await getAdminRole(supabase, data.user.id);
    if (!role) {
      await supabase.auth.signOut();
      return actionError(adminAuthOutcomeMessage("forbidden"));
    }
  } catch {
    await supabase.auth.signOut();
    return actionError(adminAuthOutcomeMessage("unavailable"));
  }

  const next = safeNextPath(requestedNext, "/admin");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function setupAdminPassword(
  _previous: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseAdminPasswordSetup({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.ok) return actionError("Check the highlighted fields.", parsed.fieldErrors);

  const context = await getAdminContext();
  if (!context.ok) return actionError(context.message);

  const { error } = await context.supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return actionError(
      adminAuthOutcomeMessage(
        error.message.toLowerCase().includes("session") ? "session_expired" : "update_failed"
      )
    );
  }

  redirect("/admin");
}
