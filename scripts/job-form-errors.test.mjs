import test from "node:test";
import assert from "node:assert/strict";
import { normalizeJobFieldErrors } from "../src/lib/careers/job-form-errors.ts";

test("an overlong responsibilities entry maps to its visible textarea", () => {
  assert.deepEqual(
    normalizeJobFieldErrors({
      "responsibilities.0": "Keep each entry under 600 characters",
    }),
    { responsibilities: "Keep each entry under 600 characters" }
  );
});

test("a malformed hiring-process line maps to its visible textarea", () => {
  assert.deepEqual(
    normalizeJobFieldErrors({
      "hiringProcess.0.title": "Each step needs a title",
      "hiringProcess.0.description": "Keep each step description under 600 characters",
    }),
    { hiringProcess: "Each step needs a title" }
  );
});

test("normalization keeps the first message for each visible field", () => {
  assert.deepEqual(
    normalizeJobFieldErrors({
      title: "Enter a job title",
      "requirements.0": "First requirements error",
      "requirements.1": "Second requirements error",
    }),
    {
      title: "Enter a job title",
      requirements: "First requirements error",
    }
  );
});
