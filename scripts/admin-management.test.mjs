import test from "node:test";
import assert from "node:assert/strict";
import { adminInviteSchema, deriveAdminAccountStatus } from "../src/lib/admin-management/schema.ts";
import { inviteOutcomeError } from "../src/lib/admin-management/outcomes.ts";

test("administrator invitations trim names and normalize email addresses", () => {
  const parsed = adminInviteSchema.parse({
    fullName: "  Priya Raman  ",
    email: "  PRIYA.RAMAN@Example.COM ",
  });

  assert.deepEqual(parsed, {
    fullName: "Priya Raman",
    email: "priya.raman@example.com",
  });
});

test("administrator invitation validation reports invalid form values", () => {
  const parsed = adminInviteSchema.safeParse({ fullName: "P", email: "not-an-email" });
  assert.equal(parsed.success, false);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    assert.ok(fields.fullName?.length);
    assert.ok(fields.email?.length);
  }
});

test("browser-supplied roles are rejected rather than trusted", () => {
  const parsed = adminInviteSchema.safeParse({
    fullName: "Priya Raman",
    email: "priya@example.com",
    role: "super_admin",
  });
  assert.equal(parsed.success, false);
});

test("duplicate accounts receive a stable field-level error", () => {
  assert.deepEqual(inviteOutcomeError("duplicate"), {
    message: "An administrator with this email already exists.",
    fieldErrors: { email: "This email already has administrator access" },
  });
});

test("unfinished existing accounts receive a setup-specific error", () => {
  assert.equal(
    inviteOutcomeError("existing_unconfirmed").fieldErrors.email,
    "Account setup is not complete"
  );
});

test("account status is derived from Auth timestamps", () => {
  const now = new Date("2026-10-19T10:00:00.000Z");

  assert.equal(deriveAdminAccountStatus({ confirmedAt: null, bannedUntil: null }, now), "pending");
  assert.equal(
    deriveAdminAccountStatus(
      { confirmedAt: "2026-10-18T10:00:00.000Z", bannedUntil: null },
      now
    ),
    "active"
  );
  assert.equal(
    deriveAdminAccountStatus(
      {
        confirmedAt: "2026-10-18T10:00:00.000Z",
        bannedUntil: "2026-10-20T10:00:00.000Z",
      },
      now
    ),
    "disabled"
  );
  assert.equal(
    deriveAdminAccountStatus(
      {
        confirmedAt: "2026-10-18T10:00:00.000Z",
        bannedUntil: "2026-10-18T10:00:00.000Z",
      },
      now
    ),
    "active"
  );
});
