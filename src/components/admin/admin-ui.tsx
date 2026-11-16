import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/lib/supabase/database.types";
import { JOB_STATUS_LABELS } from "@/lib/careers/constants";

/**
 * Admin presentation primitives.
 *
 * Server Components, so none of this ships JavaScript. The admin
 * console's job is to be fast and legible, and a dashboard that arrives
 * as rendered HTML beats one that arrives as a bundle which then
 * renders.
 *
 * Visually restrained on purpose: hairline borders, one weight of
 * shadow, Inter throughout, monospace reserved for identifiers and
 * counts. No display type, no editorial motion.
 */

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[24px] font-semibold tracking-[-0.025em] text-slate-900 sm:text-[28px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-[68ch] text-[14.5px] leading-[1.6] text-slate-600">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="w-full shrink-0 [&>*]:w-full sm:w-auto sm:[&>*]:w-auto">
          {action}
        </div>
      )}
    </header>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3.5">
          {title ? (
            <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-slate-900">{title}</h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-slate-500">
        {label}
      </p>
      <p className="mt-2.5 text-[30px] font-semibold leading-none tabular-nums tracking-[-0.02em] text-slate-900">
        {value}
      </p>
      {hint && <p className="mt-2 text-[12.5px] leading-[1.5] text-slate-500">{hint}</p>}
    </>
  );

  const shell =
    "rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)]";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          shell,
          "block transition-[border-color,box-shadow] duration-150 ease-out hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
        )}
      >
        {body}
      </Link>
    );
  }

  return <div className={shell}>{body}</div>;
}

/**
 * Shared results wrapper. Tables remain horizontally scrollable from
 * tablet widths upward and become labelled card rows on phones.
 */
export function TableScroller({
  children,
  label = "Results",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div
      className="admin-responsive-table overflow-x-auto"
      tabIndex={0}
      role="region"
      aria-label={`${label} table`}
    >
      {children}
    </div>
  );
}

export function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap border-b border-slate-200 px-5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-slate-500",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  mobileLabel,
}: {
  children?: React.ReactNode;
  className?: string;
  mobileLabel: string;
}) {
  return (
    <td
      className={cn(
        "border-b border-slate-100 px-5 py-3.5 align-middle text-[14px] text-slate-700",
        className
      )}
    >
      <span className="admin-mobile-cell-label" aria-hidden="true">
        {mobileLabel}
      </span>
      <div className="admin-mobile-cell-value">{children}</div>
    </td>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="text-[15px] font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-[48ch] text-[14px] leading-[1.6] text-slate-600">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const BUTTON_BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-[13.5px] font-semibold transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 sm:min-h-10";

export const adminFilterLabelClasses =
  "mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500";

export const adminFilterControlClasses =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-[13.5px] text-slate-900 transition-[border-color,box-shadow] duration-150 ease-out focus:border-[#EA580C] focus:shadow-[0_0_0_3px_rgba(234,88,12,0.14)] focus:outline-none sm:h-10";

export const adminFilterSearchClasses = cn(adminFilterControlClasses, "pl-9");

export const adminButtonClasses = {
  base: BUTTON_BASE,
  primary: cn(BUTTON_BASE, "bg-[#EA580C] text-white hover:bg-[#C2410C]"),
  dark: cn(BUTTON_BASE, "bg-slate-900 text-white hover:bg-slate-800"),
  outline: cn(
    BUTTON_BASE,
    "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
  ),
  danger: cn(BUTTON_BASE, "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500"),
};

/** A job's lifecycle state. Distinct from the application status chip. */
export function JobStatusBadge({ status }: { status: JobStatus }) {
  const styles = {
    draft: "border-slate-300 bg-slate-100 text-slate-600",
    pending_approval: "border-amber-200 bg-amber-50 text-amber-800",
    published: "border-emerald-200 bg-emerald-50 text-emerald-700",
    changes_requested: "border-rose-200 bg-rose-50 text-rose-700",
    closed: "border-slate-200 bg-white text-slate-500",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold whitespace-nowrap",
        styles[status]
      )}
    >
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}
