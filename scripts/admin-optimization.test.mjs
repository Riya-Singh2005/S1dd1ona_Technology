import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { shouldLoadSiteAnalytics } from "../src/lib/analytics/routes.ts";
import {
  adminAuthOutcomeMessage,
  parseAdminPasswordSetup,
  parseAdminSignIn,
} from "../src/lib/auth/admin-auth.ts";

test("admin routes exclude marketing analytics while public routes retain them", () => {
  assert.equal(shouldLoadSiteAnalytics("/admin"), false);
  assert.equal(shouldLoadSiteAnalytics("/admin/sign-in"), false);
  assert.equal(shouldLoadSiteAnalytics("/admin/jobs/123"), false);
  assert.equal(shouldLoadSiteAnalytics("/careers"), true);
  assert.equal(shouldLoadSiteAnalytics("/careers/software-engineer"), true);
  assert.equal(shouldLoadSiteAnalytics("/"), true);
});

test("admin sign-in validation is server-ready and trims safe values", () => {
  assert.deepEqual(parseAdminSignIn({ email: "  admin@example.com  ", password: "secret" }), {
    ok: true,
    data: { email: "admin@example.com", password: "secret" },
  });

  const invalid = parseAdminSignIn({ email: "wrong", password: "" });
  assert.equal(invalid.ok, false);
  if (!invalid.ok) {
    assert.equal(invalid.fieldErrors.email, "Enter a valid email address");
    assert.equal(invalid.fieldErrors.password, "Enter your password");
  }
});

test("admin password setup reports field-specific validation outcomes", () => {
  const mismatch = parseAdminPasswordSetup({
    password: "securepass1",
    confirmPassword: "securepass2",
  });
  assert.equal(mismatch.ok, false);
  if (!mismatch.ok) {
    assert.equal(mismatch.fieldErrors.confirmPassword, "Both passwords need to match");
  }

  assert.equal(
    parseAdminPasswordSetup({ password: "securepass1", confirmPassword: "securepass1" }).ok,
    true
  );
});

test("admin auth provider outcomes map to safe, non-enumerating messages", () => {
  assert.equal(
    adminAuthOutcomeMessage("invalid_credentials"),
    "That email and password combination did not match."
  );
  assert.equal(
    adminAuthOutcomeMessage("session_expired"),
    "Your invitation has expired. Ask the Admin Manager for a new invitation."
  );
});

test("admin auth client components do not import browser Supabase or Zod schemas", async () => {
  const sources = await Promise.all([
    readFile(new URL("../src/components/admin/admin-sign-in-form.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../src/components/admin/admin-password-setup-form.tsx", import.meta.url),
      "utf8"
    ),
  ]);

  for (const source of sources) {
    assert.doesNotMatch(source, /supabase\/client/);
    assert.doesNotMatch(source, /careers\/validation/);
    assert.doesNotMatch(source, /from ["']zod["']/);
  }
});
