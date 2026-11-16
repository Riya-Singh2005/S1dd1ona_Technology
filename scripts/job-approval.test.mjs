import test from "node:test";
import assert from "node:assert/strict";
import {
  createdJobMessage,
  lifecycleErrorMessage,
  statusForCreateIntent,
  transitionOutcome,
} from "../src/lib/careers/job-approval.ts";
import { jobIntentSchema, jobReviewSchema } from "../src/lib/careers/job-approval-validation.ts";
import { JOB_STATUS_LABELS } from "../src/lib/careers/constants.ts";

test("create intents map to role-appropriate statuses", () => {
  assert.equal(statusForCreateIntent("draft", "admin"), "draft");
  assert.equal(statusForCreateIntent("submit", "admin"), "pending_approval");
  assert.equal(statusForCreateIntent("publish", "admin"), null);
  assert.equal(statusForCreateIntent("publish", "super_admin"), "published");
});

test("only supported create intents are accepted", () => {
  assert.equal(jobIntentSchema.safeParse("submit").success, true);
  assert.equal(jobIntentSchema.safeParse("published").success, false);
});

test("review validation requires a trimmed reason", () => {
  assert.equal(
    jobReviewSchema.safeParse({ jobId: crypto.randomUUID(), decision: "approve" }).success,
    true
  );
  assert.equal(
    jobReviewSchema.safeParse({
      jobId: crypto.randomUUID(),
      decision: "changes_requested",
      reason: "   ",
    }).success,
    false
  );
});

test("browser-supplied reviewer and role fields are rejected", () => {
  const parsed = jobReviewSchema.safeParse({
    jobId: crypto.randomUUID(),
    decision: "approve",
    reviewer: crypto.randomUUID(),
    role: "super_admin",
  });
  assert.equal(parsed.success, false);
});

test("new approval statuses have stable labels and outcome copy", () => {
  assert.equal(JOB_STATUS_LABELS.pending_approval, "Pending Approval");
  assert.equal(JOB_STATUS_LABELS.changes_requested, "Changes Requested");
  assert.match(createdJobMessage("pending_approval"), /submitted/i);
  assert.deepEqual(transitionOutcome("changes_requested"), {
    status: "changes_requested",
    message: "The requested changes were sent to the administrator.",
  });
  assert.match(lifecycleErrorMessage("This job is no longer pending approval"), /Refresh/i);
});
