import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  createClient,
  getCurrentUser,
  isSupabaseServerConfigured,
} from "@/lib/supabase/server";
import type { CareersServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/careers/types";
import type { AdminRole } from "@/lib/supabase/database.types";

/**
 * Routing guards.
 *
 * These decide where to send a browser. They are NOT the security
 * boundary. Row Level Security is: if every guard here were deleted, a
 * candidate still could not read another candidate's application and a
 * non-admin still could not list applications, because Postgres refuses.
 *
 * Next.js 16's own docs make the same point about proxy, and warn that a
 * Server Action is a POST to whatever route hosts it. So each action
 * re-authenticates rather than trusting anything upstream.
 */

export interface AuthContext {
  user: User;
  supabase: CareersServerClient;
}

/** The signed-in user, or null. Never redirects. */
export async function getOptionalUser(): Promise<User | null> {
  try {
    return await getCurrentUser();
  } catch {
    // Missing Supabase configuration should render a signed-out page,
    // not take the route down.
    return null;
  }
}

export async function requireUser(nextPath: string): Promise<AuthContext> {
  // Unconfigured is treated as signed out rather than as a crash. A
  // missing environment variable should send someone to a sign-in page
  // that explains itself, not to a stack trace.
  if (!isSupabaseServerConfigured()) {
    redirect(`/careers/join?next=${encodeURIComponent(nextPath)}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/careers/join?next=${encodeURIComponent(nextPath)}`);
  }

  return { user, supabase };
}

/**
 * Whether the given session is an admin.
 *
 * Reads `admin_users` through the user's own session. That table has a
 * SELECT policy gated on `is_admin()` and no INSERT or UPDATE policy at
 * all, so a signed-in user can confirm their own role but can never
 * grant themselves one.
 */
export async function isAdmin(supabase: CareersServerClient, userId: string): Promise<boolean> {
  return Boolean(await getAdminRole(supabase, userId));
}

export async function getAdminRole(
  supabase: CareersServerClient,
  userId: string
): Promise<AdminRole | null> {
  const { data, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`[auth] admin role lookup failed: ${error.message}`);
  return data?.role ?? null;
}

export interface AdminAuthContext extends AuthContext {
  adminRole: AdminRole;
}

type AdminPageContext =
  | { kind: "unconfigured" }
  | { kind: "signed-out" }
  | { kind: "forbidden" }
  | { kind: "authorized"; context: AdminAuthContext };

/** One authenticated admin lookup shared by the layout and page per request. */
const getAdminPageContext = cache(async (): Promise<AdminPageContext> => {
  if (!isSupabaseServerConfigured()) return { kind: "unconfigured" };

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && error.name !== "AuthSessionMissingError") {
    throw new Error(`[auth] admin session lookup failed: ${error.message}`);
  }
  if (!user) return { kind: "signed-out" };
  const adminRole = await getAdminRole(supabase, user.id);
  if (!adminRole) return { kind: "forbidden" };

  return { kind: "authorized", context: { user, supabase, adminRole } };
});

export async function requireAdmin(nextPath = "/admin"): Promise<AdminAuthContext> {
  const result = await getAdminPageContext();

  if (result.kind === "unconfigured" || result.kind === "signed-out") {
    redirect(`/admin/sign-in?next=${encodeURIComponent(nextPath)}`);
  }
  if (result.kind === "forbidden") {
    // Deliberately the same destination as "not signed in". Telling an
    // unauthorised visitor that the page exists and they merely lack a
    // role hands them information they have no use for.
    redirect("/admin/sign-in?error=forbidden");
  }
  return result.context;
}

export async function requireAdminManager(nextPath = "/admin/admins"): Promise<AdminAuthContext> {
  const context = await requireAdmin(nextPath);
  if (context.adminRole !== "super_admin") redirect("/admin");
  return context;
}

/**
 * The caller's candidate profile, created on demand.
 *
 * The `handle_new_user` trigger normally makes this row at signup. This
 * covers the case of a user who existed before the migration ran and
 * somehow missed the backfill.
 */
export async function requireProfile(
  supabase: CareersServerClient,
  user: User
): Promise<ProfileRow | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return data;

  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : null;

  const { data: created } = await supabase
    .from("profiles")
    .insert({ id: user.id, email: user.email ?? "", full_name: fullName })
    .select("*")
    .maybeSingle();

  return created ?? null;
}

/**
 * Admin check for Server Actions.
 *
 * `requireAdmin` redirects, which is right for a page render and wrong
 * inside an action: a redirect there throws a control-flow exception
 * and the form never receives a message it can display. This returns a
 * result instead.
 *
 * Every admin action calls this rather than trusting the layout that
 * rendered the form. A Server Action in Next.js 16 is a POST to the
 * route that hosts it, reachable by anyone who can construct the
 * request, so the guard has to sit inside the action itself.
 */
export type AdminActionContext =
  | { ok: true; supabase: CareersServerClient; user: User; adminRole: AdminRole }
  | { ok: false; message: string };

export async function getAdminContext(): Promise<AdminActionContext> {
  if (!isSupabaseServerConfigured()) {
    return { ok: false, message: "The server is not configured to handle that right now." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Your session has expired. Please sign in again." };
  }

  const adminRole = await getAdminRole(supabase, user.id);
  if (!adminRole) {
    return { ok: false, message: "You do not have permission to do that." };
  }

  return { ok: true, supabase, user, adminRole };
}

export async function getAdminManagerContext(): Promise<AdminActionContext> {
  const context = await getAdminContext();
  if (!context.ok) return context;
  if (context.adminRole !== "super_admin") {
    return { ok: false, message: "You do not have permission to manage administrators." };
  }
  return context;
}
