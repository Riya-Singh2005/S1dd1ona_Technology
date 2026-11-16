import test from "node:test";
import assert from "node:assert/strict";
import { slugForJobUpdate, slugify } from "../src/lib/careers/slug.ts";

test("slugify creates the expected job URL segment", () => {
  assert.equal(slugify("Senior Full Stack Developer"), "senior-full-stack-developer");
});

test("slugify never leaves a trailing separator when truncating a long title", () => {
  const slug = slugify(`${"a".repeat(119)} another word`);

  assert.equal(slug, "a".repeat(119));
  assert.ok(slug.length <= 120);
  assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
});

test("job edits preserve a legacy slug when the title is unchanged", () => {
  assert.equal(
    slugForJobUpdate(
      "SAP S/4HANA Functional Consultant",
      "SAP S/4HANA Functional Consultant",
      "sap-s4hana-functional-consultant"
    ),
    "sap-s4hana-functional-consultant"
  );
});

test("job edits regenerate the slug when the title changes", () => {
  assert.equal(
    slugForJobUpdate(
      "Lead SAP S/4HANA Consultant",
      "SAP S/4HANA Functional Consultant",
      "sap-s4hana-functional-consultant"
    ),
    "lead-sap-s-4hana-consultant"
  );
});
