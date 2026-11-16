import type { AdminRole } from "@/lib/supabase/database.types";
import type { AdminAccountStatus } from "./schema";

export interface AdminAccountSummary {
  userId: string;
  fullName: string | null;
  email: string;
  role: AdminRole;
  status: AdminAccountStatus;
  createdAt: string;
  invitedAt: string | null;
  confirmedAt: string | null;
  lastSignInAt: string | null;
  bannedUntil: string | null;
}

export type PrepareAdminOutcome =
  | { outcome: "duplicate"; userId: string }
  | { outcome: "existing_unconfirmed"; userId: string }
  | { outcome: "promoted_existing"; userId: string }
  | { outcome: "needs_invite" };

export interface AdminAccountPage {
  items: AdminAccountSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
