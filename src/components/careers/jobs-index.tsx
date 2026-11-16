"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, SlidersHorizontal } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS } from "@/lib/careers/constants";
import { formatPostedAge, indexLabel } from "@/lib/careers/format";
import type { JobSummary } from "@/lib/careers/types";
import type { EmploymentType } from "@/lib/supabase/database.types";
import styles from "./careers.module.css";

/**
 * The open roles index.
 *
 * An editorial index rather than a job board: a mono index number, a
 * display-weight title, a metadata line, and a hairline per row. The
 * construction is adapted from `services-experience.module.css`, which
 * is how /services already presents an ordered list of capabilities.
 *
 * Filtering is client-side on purpose. The full published set is
 * already in the payload, it is small by nature, and filtering locally
 * means the list responds instantly instead of round-tripping to the
 * server for a result it already has.
 */

type FilterKey = "role" | "location" | "employmentType";

interface Filters {
  role: string | null;
  location: string | null;
  employmentType: string | null;
}

const EMPTY_FILTERS: Filters = {
  role: null,
  location: null,
  employmentType: null,
};

export interface JobsIndexProps {
  jobs: JobSummary[];
  facets: {
    departments: string[];
    locations: string[];
    employmentTypes: string[];
  };
}

/**
 * Rows enter staggered at 55ms, inside the 30-80ms band that reads as
 * one group arriving rather than a queue of separate events. Capped so a
 * long list never leaves the last row waiting.
 */
const STAGGER_SECONDS = 0.055;
const MAX_STAGGER_INDEX = 8;

const rowVariants: Variants = {
  hidden: { opacity: 0, transform: "translate3d(0, 14px, 0)" },
  visible: (index: number) => ({
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
    transition: {
      duration: 0.5,
      delay: Math.min(index, MAX_STAGGER_INDEX) * STAGGER_SECONDS,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export function JobsIndex({ jobs, facets }: JobsIndexProps) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const reduceMotion = useReducedMotion();
  const roleTitles = useMemo(() => Array.from(new Set(jobs.map((job) => job.title))), [jobs]);

  const hasFacets =
    roleTitles.length > 1 ||
    facets.locations.length > 1 ||
    facets.employmentTypes.length > 1;

  const activeCount = Object.values(filters).filter(Boolean).length;

  const visibleJobs = useMemo(
    () =>
      jobs.filter((job) => {
        if (filters.role && job.title !== filters.role) return false;
        if (filters.location && job.location !== filters.location) return false;
        if (filters.employmentType && job.employment_type !== filters.employmentType) {
          return false;
        }
        return true;
      }),
    [jobs, filters]
  );

  const toggle = (key: FilterKey, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: current[key] === value ? null : value,
    }));
  };

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-14 text-center sm:px-10 sm:py-16">
        <p className="font-display text-xl font-extrabold tracking-[-0.03em] text-white sm:text-2xl">
          No roles are open at the moment
        </p>
        <p className="mx-auto mt-3 max-w-[46ch] text-[15.5px] leading-[1.65] text-slate-400">
          We hire in waves rather than continuously. If your work overlaps with what we do,
          write to us and we will keep you in mind for the next one.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a
            href="mailto:hr@example.com?subject=Speculative%20application"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-[14px] font-bold text-white transition-[background-color,border-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-white/35 hover:bg-white/[0.06] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1020]"
          >
            HR — hr@example.com
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href="mailto:tech@example.com?subject=Speculative%20application"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-[14px] font-bold text-white transition-[background-color,border-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-white/35 hover:bg-white/[0.06] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1020]"
          >
            Technical — tech@example.com
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      {hasFacets && (
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              aria-expanded={showFilters}
              aria-controls="careers-filters"
              className={cn(styles.filterChip, activeCount > 0 && styles.filterChipActive)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              Filter
              {activeCount > 0 && (
                <span className="font-mono text-[11px] font-bold tabular-nums">
                  {activeCount}
                </span>
              )}
            </button>

            <p
              className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white/40"
              aria-live="polite"
            >
              {visibleJobs.length} of {jobs.length} roles
            </p>
          </div>

          {/*
            Rendered but hidden rather than unmounted, so the filter
            state and the assistive-tech announcement survive a toggle.
          */}
          <div id="careers-filters" hidden={!showFilters} className="mt-6 space-y-5">
            <FilterGroup
              label="Role"
              options={roleTitles}
              selected={filters.role}
              onSelect={(value) => toggle("role", value)}
            />
            <FilterGroup
              label="Location"
              options={facets.locations}
              selected={filters.location}
              onSelect={(value) => toggle("location", value)}
            />
            <FilterGroup
              label="Employment type"
              options={facets.employmentTypes}
              selected={filters.employmentType}
              format={(value) => EMPLOYMENT_TYPE_LABELS[value as EmploymentType] ?? value}
              onSelect={(value) => toggle("employmentType", value)}
            />

            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="text-[13.5px] font-semibold text-[#FB923C] underline-offset-4 transition-colors duration-200 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1020]"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {visibleJobs.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-12 text-center">
          <p className="text-[15.5px] leading-[1.6] text-slate-400">
            No roles match that combination. Try widening the filters.
          </p>
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="mt-4 text-[13.5px] font-semibold text-[#FB923C] underline-offset-4 transition-colors duration-200 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1020]"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <ol className={styles.list}>
          {visibleJobs.map((job, index) => (
            <motion.li
              key={job.id}
              className={styles.row}
              custom={index}
              variants={rowVariants}
              initial={reduceMotion ? "visible" : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.3, margin: "0px 0px -60px 0px" }}
            >
              <div className={styles.rowContent}>
                <span className={styles.sequence} aria-hidden="true">
                  {indexLabel(index)}
                </span>

                <span className={styles.rowBody}>
                  <span className={styles.title}>{job.title}</span>

                  <span className={styles.meta}>
                    <span>{job.department}</span>
                    <span className={styles.metaDivider} aria-hidden="true" />
                    <span>
                      {job.location}
                      {job.work_mode ? `, ${WORK_MODE_LABELS[job.work_mode]}` : ""}
                    </span>
                    <span className={styles.metaDivider} aria-hidden="true" />
                    <span>{EMPLOYMENT_TYPE_LABELS[job.employment_type]}</span>
                    {job.experience && (
                      <>
                        <span className={styles.metaDivider} aria-hidden="true" />
                        <span>{job.experience}</span>
                      </>
                    )}
                  </span>

                  {job.published_at && (
                    <span className={styles.posted}>{formatPostedAge(job.published_at)}</span>
                  )}
                </span>

                <Link href={`/careers/${job.slug}`} className={styles.roleCta}>
                  View &amp; apply
                </Link>
              </div>
            </motion.li>
          ))}
        </ol>
      )}
    </div>
  );
}

interface FilterGroupProps {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
  format?: (value: string) => string;
}

function FilterGroup({ label, options, selected, onSelect, format }: FilterGroupProps) {
  if (options.length < 2) return null;

  return (
    <fieldset>
      <legend className={styles.filterGroupLabel}>{label}</legend>
      <div className={styles.filterBar}>
        {options.map((option) => {
          const isActive = selected === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(option)}
              className={cn(styles.filterChip, isActive && styles.filterChipActive)}
            >
              {format ? format(option) : option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default JobsIndex;
