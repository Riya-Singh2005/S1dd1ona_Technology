"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminManagerContext } from "@/lib/auth/guards";
import { adminInviteSchema } from "@/lib/admin-management/schema";
import { inviteOutcomeError } from "@/lib/admin-management/outcomes";
import type { PrepareAdminOutcome } from "@/lib/admin-management/types";
import { toFieldErrors } from "@/lib/careers/validation";
import { actionError, actionOk, type ActionResult } from "@/lib/careers/types";
import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import { inviteEmail } from "@/lib/email/auth-templates";
import { sendEmail, siteOrigin } from "@/lib/email/send";

const revokeSchema = z.object({ userId: z.string().uuid() });

export interface CreateAdminResult {
  email: string;
  outcome: "invited" | "promoted_existing";
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parsePrepareOutcome(value: Json | undefined): PrepareAdminOutcome | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const outcome = value.outcome;
  const userId = typeof value.userId === "string" ? value.userId : undefined;

  if (outcome === "needs_invite") return { outcome };
  if (
    (outcome === "duplicate" ||
      outcome === "existing_unconfirmed" ||
      outcome === "promoted_existing") &&
    userId
  ) {
    return { outcome, userId };
  }
  return null;
}

async function cancelPreparedInvite(email: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.rpc("cancel_admin_invite", { p_email: email });
    if (error) console.error("[admin-management] invite rollback failed", error.message);
  } catch (error) {
    console.error("[admin-management] invite rollback threw", error);
  }
}

export async function createAdministrator(
  _previous: ActionResult<CreateAdminResult> | null,
  formData: FormData
): Promise<ActionResult<CreateAdminResult>> {
  const context = await getAdminManagerContext();
  if (!context.ok) return actionError(context.message);

  const parsed = adminInviteSchema.safeParse({
    fullName: readString(formData, "fullName"),
    email: readString(formData, "email"),
  });
  if (!parsed.success) {
    return actionError("Please check the highlighted fields.", toFieldErrors(parsed.error));
  }

  if (!isServiceRoleConfigured()) {
    return actionError("Administrator invitations are not configured on this server.");
  }

  const { data: withinLimit, error: rateLimitError } = await context.supabase.rpc(
    "consume_rate_limit",
    {
      p_bucket: `admin-invite:${context.user.id}`,
      p_limit: 10,
      p_window_seconds: 3600,
    }
  );
  if (rateLimitError) {
    console.error("[admin-management] rate limit check failed", rateLimitError.message);
    return actionError("We could not verify this request. Please try again.");
  }
  if (!withinLimit) {
    return actionError("Too many invitation attempts. Wait a while before trying again.");
  }

  const { fullName, email } = parsed.data;
  const { data: preparedData, error: prepareError } = await context.supabase.rpc(
    "prepare_admin_invite",
    { p_email: email, p_full_name: fullName }
  );

  if (prepareError) {
    console.error("[admin-management] prepare invite failed", prepareError.message);
    return actionError("We could not prepare that administrator account. Please try again.");
  }

  const prepared = parsePrepareOutcome(preparedData);
  if (!prepared) {
    console.error("[admin-management] prepare invite returned an invalid response");
    return actionError("We could not prepare that administrator account. Please try again.");
  }

  if (prepared.outcome === "duplicate") {
    const duplicate = inviteOutcomeError(prepared.outcome);
    return actionError(duplicate.message, duplicate.fieldErrors);
  }

  if (prepared.outcome === "existing_unconfirmed") {
    const unfinished = inviteOutcomeError(prepared.outcome);
    return actionError(unfinished.message, unfinished.fieldErrors);
  }

  if (prepared.outcome === "promoted_existing") {
    revalidatePath("/admin/admins");
    return actionOk({ email, outcome: "promoted_existing" });
  }

  const admin = createAdminClient();
  const setupPath = "/admin/setup-password";
  const redirectTo = new URL("/auth/confirm", siteOrigin());
  redirectTo.searchParams.set("next", setupPath);

  const { data: generated, error: generateError } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      data: { full_name: fullName },
      redirectTo: redirectTo.toString(),
    },
  });

  if (generateError || !generated.user || !generated.properties?.hashed_token) {
    console.error(
      "[admin-management] invite link generation failed",
      generateError?.message ?? "missing invite token"
    );
    await cancelPreparedInvite(email);
    return actionError("We could not create that invitation. Please try again.");
  }

  const actionUrl = new URL("/auth/confirm", siteOrigin());
  actionUrl.searchParams.set("token_hash", generated.properties.hashed_token);
  actionUrl.searchParams.set("type", "invite");
  actionUrl.searchParams.set("next", setupPath);

  const delivery = await sendEmail({
    kind: "auth_invite",
    to: email,
    content: inviteEmail(actionUrl.toString()),
  });

  if (delivery.status !== "sent") {
    await cancelPreparedInvite(email);
    const { error: deleteError } = await admin.auth.admin.deleteUser(generated.user.id);
    if (deleteError) {
      console.error(
        "[admin-management] failed to remove undelivered invited user",
        deleteError.message
      );
    }
    return actionError("The invitation email could not be delivered. No admin access was granted.");
  }

  revalidatePath("/admin/admins");
  return actionOk({ email, outcome: "invited" });
}

export async function revokeAdministrator(
  _previous: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const context = await getAdminManagerContext();
  if (!context.ok) return actionError(context.message);

  const parsed = revokeSchema.safeParse({ userId: readString(formData, "userId") });
  if (!parsed.success) return actionError("That administrator could not be identified.");
  if (parsed.data.userId === context.user.id) {
    return actionError("You cannot revoke your own administrator access.");
  }

  const { data, error } = await context.supabase.rpc("revoke_admin_access", {
    p_target_user_id: parsed.data.userId,
  });

  if (error) {
    console.error("[admin-management] revoke failed", error.message);
    return actionError(
      error.code === "42501"
        ? "You do not have permission to revoke administrator access."
        : "We could not revoke that administrator's access. Please try again."
    );
  }
  if (!data) return actionError("That administrator no longer has access.");

  revalidatePath("/admin/admins");
  return actionOk();
}
