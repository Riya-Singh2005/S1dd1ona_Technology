/**
 * Shared rules for emailed auth links.
 *
 * Used by `/auth/confirm` (which routes a link), `/careers/verify` (which
 * shows the confirm step) and the server action behind it (which spends
 * the token), so all three agree on what a well-formed link looks like.
 */

/**
 * The email link types this app handles. A closed union on purpose:
 * supabase-js widens `EmailOtpType` with `string & {}`, which would let
 * an unknown type through the compiler unnoticed.
 */
export type EmailLinkType =
  | "signup"
  | "email"
  | "recovery"
  | "invite"
  | "magiclink"
  | "email_change";

export const EMAIL_LINK_TYPES: readonly EmailLinkType[] = [
  "signup",
  "email",
  "recovery",
  "invite",
  "magiclink",
  "email_change",
];

export function parseEmailLinkType(value: string | null | undefined): EmailLinkType | null {
  return EMAIL_LINK_TYPES.includes(value as EmailLinkType) ? (value as EmailLinkType) : null;
}

/**
 * Supabase token hashes are hex, and PKCE-flavoured ones carry a
 * `pkce_` prefix. Anything outside this shape is not a link Supabase
 * produced, so it is refused before any network call is made.
 */
const TOKEN_HASH_PATTERN = /^[A-Za-z0-9_-]{8,256}$/;

export function isWellFormedTokenHash(value: string | null | undefined): value is string {
  return typeof value === "string" && TOKEN_HASH_PATTERN.test(value);
}

/** Where a failed or finished link sends someone, per link type. */
export const RESET_PASSWORD_PATH = "/careers/reset-password";
