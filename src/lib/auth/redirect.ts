/**
 * Open-redirect protection for `next` parameters.
 *
 * Every auth entry point carries a `next` so a candidate lands back on
 * the exact job they were applying to. That value travels through a URL
 * the user controls, so it is validated before it is ever used as a
 * redirect target.
 *
 * Rejected:
 *   - absolute URLs, which would send the user off-site
 *   - protocol-relative URLs (`//evil.com`), which a browser resolves
 *     against the current scheme and treats as absolute
 *   - backslashes, which several parsers normalise into forward slashes,
 *     so `/\evil.com` can become `//evil.com` downstream
 *   - control characters: a bare CR or LF in a value that reaches a
 *     Location header is a response-splitting primitive
 */

const DEFAULT_NEXT = "/careers";

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}

export function safeNextPath(
  value: string | null | undefined,
  fallback = DEFAULT_NEXT
): string {
  if (!value) return fallback;

  const candidate = value.trim();

  if (!candidate.startsWith("/")) return fallback;
  if (candidate.startsWith("//")) return fallback;
  if (candidate.includes("\\")) return fallback;
  if (hasControlCharacter(candidate)) return fallback;

  return candidate;
}
