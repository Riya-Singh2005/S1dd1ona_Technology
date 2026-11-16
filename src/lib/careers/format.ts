import type { JobSummary } from "./types";
import type { JobStatus } from "@/lib/supabase/database.types";
import { EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS } from "./constants";
export { slugify, slugForJobUpdate } from "./slug";

/**
 * Shared formatting for the careers surfaces.
 *
 * Pure functions, no server-only import, so the public page, the
 * candidate dashboard, the admin console and the email templates all
 * render the same value the same way.
 *
 * Every formatter pins `en-IN` and `Asia/Kolkata`. Left to the runtime
 * default, a server in one region and a browser in another would
 * produce different text for the same timestamp and React would flag a
 * hydration mismatch.
 */

const LOCALE = "en-IN";
const TIME_ZONE = "Asia/Kolkata";

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: TIME_ZONE,
});

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return dateFormatter.format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return dateTimeFormatter.format(date);
}

/** ISO date for <time dateTime> and for structured data. */
export function toIsoDate(value: string | Date | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

/**
 * Relative posting age, used on the jobs index.
 *
 * Rendered on the server. That is fine because the value is coarse: it
 * changes at most once a day, so a cached page cannot show something
 * meaningfully wrong.
 */
export function formatPostedAge(value: string | null | undefined): string {
  if (!value) return "";
  const posted = new Date(value);
  if (Number.isNaN(posted.getTime())) return "";

  const days = Math.floor((Date.now() - posted.getTime()) / 86_400_000);

  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 7) return `Posted ${days} days ago`;
  if (days < 14) return "Posted last week";
  if (days < 31) return `Posted ${Math.floor(days / 7)} weeks ago`;
  if (days < 62) return "Posted last month";
  return `Posted ${Math.floor(days / 30)} months ago`;
}

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function currencyFormatter(currency: string): Intl.NumberFormat {
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    currencyFormatters.set(currency, formatter);
  }
  return formatter;
}

/**
 * A salary figure, or null when it is absent or zero. Older rows store 0
 * for "not published", which must never be shown as a real amount.
 */
export function publishedSalary(value: number | null): number | null {
  return value !== null && value > 0 ? value : null;
}

/**
 * Salary range, or null when the role has not published one.
 *
 * Returning null rather than a placeholder matters: the caller uses it
 * to decide whether to render the row at all, and the structured data
 * uses it to decide whether to emit `baseSalary`. An invented range
 * would end up in Google Jobs.
 */
export function formatSalaryRange(job: {
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
}): string | null {
  const { currency } = job;
  const min = publishedSalary(job.salary_min);
  const max = publishedSalary(job.salary_max);
  if (min === null && max === null) return null;

  const format = (value: number) => {
    try {
      return currencyFormatter(currency).format(value);
    } catch {
      return `${currency} ${value.toLocaleString(LOCALE)}`;
    }
  };

  if (min !== null && max !== null) {
    return min === max ? format(min) : `${format(min)} to ${format(max)}`;
  }
  if (min !== null) return `From ${format(min)}`;
  return `Up to ${format(max as number)}`;
}

/**
 * The metadata line under a job title, e.g.
 * "Technology / New Delhi, Hybrid / Full Time / 2-5 years".
 */
export function jobMetaParts(job: JobSummary): string[] {
  const location = job.work_mode
    ? `${job.location}, ${WORK_MODE_LABELS[job.work_mode]}`
    : job.location;

  return [
    job.department,
    location,
    EMPLOYMENT_TYPE_LABELS[job.employment_type],
    job.experience ?? "",
  ].filter(Boolean);
}

/** Zero-padded index for the editorial job rows. */
export function indexLabel(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/**
 * Whether a role has stopped accepting applications.
 *
 * Lives here rather than inline in a component because reading the
 * clock is impure, and the React Compiler treats an impure call in a
 * render body as a correctness hazard.
 *
 * This is presentation only. The real gate is the `applications_insert_own`
 * policy, which re-checks both the status and the closing date inside
 * the INSERT itself.
 */
export function isJobClosed(job: {
  status: JobStatus;
  closing_at: string | null;
}): boolean {
  if (job.status !== "published") return true;
  if (!job.closing_at) return false;
  const closesAt = new Date(job.closing_at).getTime();
  return Number.isFinite(closesAt) && closesAt <= Date.now();
}

/** ISO timestamp for "N days ago", used by the admin date filter. */
export function daysAgoIso(days: number): string | undefined {
  if (!Number.isFinite(days) || days <= 0) return undefined;
  return new Date(Date.now() - days * 86_400_000).toISOString();
}
