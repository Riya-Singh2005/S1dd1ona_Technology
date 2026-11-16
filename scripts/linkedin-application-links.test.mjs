import test from "node:test";
import assert from "node:assert/strict";
import {
  LINKEDIN_JOB_MEDIUM,
  LINKEDIN_JOB_SOURCE,
  linkedInApplicationPath,
  linkedInApplicationUrl,
  linkedInJobDestinationPath,
} from "../src/lib/site.ts";
import {
  attributionFromVisit,
  captureCurrentAttribution,
  getStoredAttribution,
} from "../src/lib/analytics/attribution.ts";

const JOB_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_JOB_ID = "22222222-2222-4222-8222-222222222222";
const QUERY = "utm_source=linkedin&utm_medium=job_posting";

test("LinkedIn job links use the stable job ID and canonical production origin", () => {
  assert.equal(
    linkedInApplicationPath(JOB_ID),
    `/careers/jobs/${JOB_ID}?${QUERY}`
  );
  assert.equal(
    linkedInApplicationUrl(JOB_ID),
    `https://siddiona-demo.workers.dev/careers/jobs/${JOB_ID}?${QUERY}`
  );
  assert.notEqual(linkedInApplicationUrl(JOB_ID), linkedInApplicationUrl(OTHER_JOB_ID));
});

test("the stable link stays fixed while the redirect destination follows the current slug", () => {
  const stableLink = linkedInApplicationUrl(JOB_ID);

  assert.equal(linkedInJobDestinationPath("software-developer"), `/careers/software-developer?${QUERY}`);
  assert.equal(linkedInJobDestinationPath("lead-software-developer"), `/careers/lead-software-developer?${QUERY}`);
  assert.equal(linkedInApplicationUrl(JOB_ID), stableLink);
});

test("the real attribution parser accepts the LinkedIn campaign values", () => {
  const visit = attributionFromVisit(
    linkedInApplicationUrl(JOB_ID),
    "",
    new Date("2026-10-21T00:00:00.000Z")
  );

  assert.equal(visit?.touch.source, LINKEDIN_JOB_SOURCE);
  assert.equal(visit?.touch.medium, LINKEDIN_JOB_MEDIUM);
  assert.equal(visit?.touch.landingPath, `/careers/jobs/${JOB_ID}`);
  assert.equal(visit?.eligibleLatest, true);
});

test("a LinkedIn visit replaces latest touch without overwriting first touch", () => {
  const values = new Map();
  const localStorage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };

  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;

  try {
    globalThis.window = {
      location: { href: "https://siddiona.com/careers" },
      localStorage,
    };
    globalThis.document = { referrer: "" };

    captureCurrentAttribution(Date.parse("2026-10-20T00:00:00.000Z"));
    globalThis.window.location.href = linkedInApplicationUrl(JOB_ID);
    captureCurrentAttribution(Date.parse("2026-10-21T00:00:00.000Z"));

    const attribution = getStoredAttribution(Date.parse("2026-10-21T00:01:00.000Z"));
    assert.equal(attribution.firstTouch?.source, "direct");
    assert.equal(attribution.firstTouch?.medium, "(none)");
    assert.equal(attribution.latestTouch?.source, LINKEDIN_JOB_SOURCE);
    assert.equal(attribution.latestTouch?.medium, LINKEDIN_JOB_MEDIUM);
  } finally {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;

    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
  }
});
