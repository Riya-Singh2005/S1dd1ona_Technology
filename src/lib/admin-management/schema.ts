import { z } from "zod";

const normalizedEmailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address")
  .email("Enter a valid email address")
  .max(254, "That email address is too long")
  .transform((value) => value.toLowerCase());

export const adminInviteSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter the administrator's full name")
      .max(120, "That name is too long"),
    email: normalizedEmailSchema,
  })
  .strict();

export type AdminInviteInput = z.infer<typeof adminInviteSchema>;

export type AdminAccountStatus = "pending" | "active" | "disabled";

export function deriveAdminAccountStatus(
  account: { confirmedAt: string | null; bannedUntil: string | null },
  now = new Date()
): AdminAccountStatus {
  if (account.bannedUntil && new Date(account.bannedUntil).getTime() > now.getTime()) {
    return "disabled";
  }
  return account.confirmedAt ? "active" : "pending";
}
