export interface InviteOutcomeError {
  message: string;
  fieldErrors: Record<string, string>;
}

export function inviteOutcomeError(
  outcome: "duplicate" | "existing_unconfirmed"
): InviteOutcomeError {
  if (outcome === "duplicate") {
    return {
      message: "An administrator with this email already exists.",
      fieldErrors: { email: "This email already has administrator access" },
    };
  }

  return {
    message:
      "This email already has an unfinished account. Ask the person to confirm that account, then try again.",
    fieldErrors: { email: "Account setup is not complete" },
  };
}
