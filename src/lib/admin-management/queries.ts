import "server-only";

import type { CareersServerClient } from "@/lib/supabase/server";
import { normalizePagination, type PaginationInput } from "@/lib/careers/types";
import { deriveAdminAccountStatus } from "./schema";
import type { AdminAccountPage, AdminAccountSummary } from "./types";
import type { AdminRole, Json } from "@/lib/supabase/database.types";

interface AdminListItemJson {
  userId: string;
  fullName: string | null;
  email: string;
  role: AdminRole;
  createdAt: string;
  invitedAt: string | null;
  confirmedAt: string | null;
  lastSignInAt: string | null;
  bannedUntil: string | null;
}

function isRecord(value: Json | undefined): value is { [key: string]: Json | undefined } {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseItem(value: Json): AdminAccountSummary | null {
  if (!isRecord(value)) return null;

  const role = value.role;
  if (role !== "super_admin" && role !== "admin" && role !== "recruiter") return null;
  if (
    typeof value.userId !== "string" ||
    typeof value.email !== "string" ||
    typeof value.createdAt !== "string"
  ) {
    return null;
  }

  const raw: AdminListItemJson = {
    userId: value.userId,
    fullName: typeof value.fullName === "string" ? value.fullName : null,
    email: value.email,
    role,
    createdAt: value.createdAt,
    invitedAt: typeof value.invitedAt === "string" ? value.invitedAt : null,
    confirmedAt: typeof value.confirmedAt === "string" ? value.confirmedAt : null,
    lastSignInAt: typeof value.lastSignInAt === "string" ? value.lastSignInAt : null,
    bannedUntil: typeof value.bannedUntil === "string" ? value.bannedUntil : null,
  };

  return { ...raw, status: deriveAdminAccountStatus(raw) };
}

export async function listAdminAccounts(
  supabase: CareersServerClient,
  input: PaginationInput & { query?: string } = {}
): Promise<AdminAccountPage> {
  const { page, pageSize } = normalizePagination(input);
  const { data, error } = await supabase.rpc("admin_management_list", {
    p_limit: pageSize,
    p_offset: (page - 1) * pageSize,
    p_query: input.query?.trim() || null,
  });

  if (error) throw new Error(`[admin-management] list failed: ${error.message}`);
  if (!isRecord(data)) throw new Error("[admin-management] list returned an invalid response");

  const items = Array.isArray(data.items)
    ? data.items.map(parseItem).filter((item): item is AdminAccountSummary => Boolean(item))
    : [];
  const total = typeof data.total === "number" ? data.total : Number(data.total ?? 0);

  return {
    items,
    page,
    pageSize,
    total: Number.isFinite(total) ? total : 0,
    totalPages: Math.max(1, Math.ceil((Number.isFinite(total) ? total : 0) / pageSize)),
  };
}
