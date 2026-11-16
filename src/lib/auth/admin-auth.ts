import { z } from "zod";

const adminEmailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address")
  .email("Enter a valid email address")
  .max(254, "That email address is too long");

const adminPasswordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(72, "Passwords are limited to 72 characters")
  .refine((value) => /[a-zA-Z]/.test(value), "Include at least one letter")
  .refine((value) => /[0-9]/.test(value), "Include at least one number");

const adminSignInSchema = z.object({
  email: adminEmailSchema,
  password: z.string().min(1, "Enter your password"),
});

const adminPasswordSetupSchema = z
  .object({
    password: adminPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Both passwords need to match",
    path: ["confirmPassword"],
  });

function toFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

export type AdminAuthOutcome =
  | "invalid_credentials"
  | "forbidden"
  | "unavailable"
  | "session_expired"
  | "update_failed";

export function adminAuthOutcomeMessage(outcome: AdminAuthOutcome): string {
  const messages: Record<AdminAuthOutcome, string> = {
    invalid_credentials: "That email and password combination did not match.",
    forbidden: "That account does not have admin access.",
    unavailable: "Admin authentication is unavailable right now. Please try again shortly.",
    session_expired: "Your invitation has expired. Ask the Admin Manager for a new invitation.",
    update_failed: "We could not save your password. Please try again.",
  };
  return messages[outcome];
}

export function parseAdminSignIn(values: { email: FormDataEntryValue | null; password: FormDataEntryValue | null }) {
  const parsed = adminSignInSchema.safeParse(values);
  if (!parsed.success) return { ok: false as const, fieldErrors: toFieldErrors(parsed.error) };
  return { ok: true as const, data: parsed.data };
}

export function parseAdminPasswordSetup(values: {
  password: FormDataEntryValue | null;
  confirmPassword: FormDataEntryValue | null;
}) {
  const parsed = adminPasswordSetupSchema.safeParse(values);
  if (!parsed.success) return { ok: false as const, fieldErrors: toFieldErrors(parsed.error) };
  return { ok: true as const, data: parsed.data };
}
