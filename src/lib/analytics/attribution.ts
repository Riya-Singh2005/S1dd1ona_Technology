import { z } from "zod";

export const ATTRIBUTION_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const FIRST_TOUCH_KEY = "siddiona_attribution_first";
const LATEST_TOUCH_KEY = "siddiona_attribution_latest";
const MAX_VALUE_LENGTH = 200;

const optionalValue = z.string().trim().max(MAX_VALUE_LENGTH).optional();

export const attributionTouchSchema = z.object({
  source: z.string().trim().min(1).max(MAX_VALUE_LENGTH),
  medium: z.string().trim().min(1).max(MAX_VALUE_LENGTH),
  campaign: optionalValue,
  campaignId: optionalValue,
  content: optionalValue,
  term: optionalValue,
  referrer: optionalValue,
  landingPath: z.string().trim().min(1).max(500),
  capturedAt: z.string().datetime(),
});

export const attributionPairSchema = z.object({
  firstTouch: attributionTouchSchema.optional(),
  latestTouch: attributionTouchSchema.optional(),
});

export type AttributionTouch = z.infer<typeof attributionTouchSchema>;
export type AttributionPair = z.infer<typeof attributionPairSchema>;

type StoredTouch = { value: AttributionTouch; expiresAt: number };

function normalize(value: string | null): string | undefined {
  const normalized = value?.trim().toLowerCase().slice(0, MAX_VALUE_LENGTH);
  if (normalized && (/\S+@\S+\.\S+/.test(normalized) || /(?:\+?\d[\s().-]*){7,}/.test(normalized))) {
    return undefined;
  }
  return normalized || undefined;
}

function safePath(url: URL): string {
  return url.pathname.slice(0, 500) || "/";
}

function externalReferrer(current: URL, rawReferrer: string): URL | null {
  if (!rawReferrer) return null;
  try {
    const referrer = new URL(rawReferrer);
    return referrer.origin === current.origin ? null : referrer;
  } catch {
    return null;
  }
}

function classifyReferrer(referrer: URL): Pick<AttributionTouch, "source" | "medium"> {
  const hostname = referrer.hostname.toLowerCase().replace(/^www\./, "");
  const searchEngines: Record<string, string> = {
    "google.com": "google",
    "google.co.in": "google",
    "bing.com": "bing",
    "search.yahoo.com": "yahoo",
    "duckduckgo.com": "duckduckgo",
  };
  return searchEngines[hostname]
    ? { source: searchEngines[hostname], medium: "organic" }
    : { source: hostname.slice(0, MAX_VALUE_LENGTH), medium: "referral" };
}

export function attributionFromVisit(
  rawUrl: string,
  rawReferrer: string,
  capturedAt = new Date()
): { touch: AttributionTouch; eligibleLatest: boolean } | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const params = url.searchParams;
  const source = normalize(params.get("utm_source"));
  const medium = normalize(params.get("utm_medium"));
  const campaign = normalize(params.get("utm_campaign"));
  const campaignId = normalize(params.get("utm_id"));
  const content = normalize(params.get("utm_content"));
  const term = normalize(params.get("utm_term"));
  const tagged = Boolean(source || medium || campaign || campaignId || content || term);
  const referrer = externalReferrer(url, rawReferrer);
  const classified = referrer ? classifyReferrer(referrer) : null;

  const touch: AttributionTouch = {
    source: source ?? classified?.source ?? "direct",
    medium: medium ?? classified?.medium ?? "(none)",
    campaign,
    campaignId,
    content,
    term,
    referrer: referrer?.origin.slice(0, MAX_VALUE_LENGTH),
    landingPath: safePath(url),
    capturedAt: capturedAt.toISOString(),
  };

  return { touch, eligibleLatest: tagged || Boolean(referrer) };
}

function readStored(key: string, now = Date.now()): AttributionTouch | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "null") as StoredTouch | null;
    if (!parsed || parsed.expiresAt <= now) {
      window.localStorage.removeItem(key);
      return undefined;
    }
    return attributionTouchSchema.parse(parsed.value);
  } catch {
    window.localStorage.removeItem(key);
    return undefined;
  }
}

function writeStored(key: string, value: AttributionTouch, expiresAt: number): void {
  try {
    window.localStorage.setItem(key, JSON.stringify({ value, expiresAt } satisfies StoredTouch));
  } catch {
    // Attribution is optional; storage restrictions must never break the site.
  }
}

export function captureCurrentAttribution(now = Date.now()): AttributionPair {
  if (typeof window === "undefined") return {};
  const visit = attributionFromVisit(window.location.href, document.referrer, new Date(now));
  if (!visit) return getStoredAttribution(now);

  let firstTouch = readStored(FIRST_TOUCH_KEY, now);
  let latestTouch = readStored(LATEST_TOUCH_KEY, now);

  if (!firstTouch) {
    firstTouch = visit.touch;
    writeStored(FIRST_TOUCH_KEY, firstTouch, now + ATTRIBUTION_TTL_MS);
  }
  if (!latestTouch || visit.eligibleLatest) {
    latestTouch = visit.touch;
    writeStored(LATEST_TOUCH_KEY, latestTouch, now + ATTRIBUTION_TTL_MS);
  }
  return { firstTouch, latestTouch };
}

export function getStoredAttribution(now = Date.now()): AttributionPair {
  return {
    firstTouch: readStored(FIRST_TOUCH_KEY, now),
    latestTouch: readStored(LATEST_TOUCH_KEY, now),
  };
}

export function parseAttributionJson(raw: string): AttributionPair | undefined {
  if (!raw || raw.length > 5_000) return undefined;
  try {
    const parsed = attributionPairSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}
