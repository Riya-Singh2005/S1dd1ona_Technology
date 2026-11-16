import { cn } from "@/lib/utils";
import {
  APPLICATION_PIPELINE,
  APPLICATION_STATUS_DESCRIPTIONS,
  APPLICATION_STATUS_LABELS,
} from "@/lib/careers/constants";
import { formatDate } from "@/lib/careers/format";
import type { ApplicationEventRow } from "@/lib/careers/types";
import type { ApplicationStatus } from "@/lib/supabase/database.types";
import styles from "./careers.module.css";

/**
 * Candidate-facing status timeline.
 *
 * Renders on the server. There is no interaction here, and someone
 * checking whether they got an interview does not need the page to
 * animate at them.
 *
 * It shows only `application_events`, which by design carries no free
 * text: just old status, new status and a timestamp. Internal recruiter
 * commentary lives in `application_notes`, a separate table with no
 * candidate-facing policy at all, so there is nothing here that could
 * leak an internal note.
 *
 * `rejected` and `withdrawn` are exits rather than stages, so they end
 * the rail instead of appearing inside it.
 */

export interface ApplicationTimelineProps {
  status: ApplicationStatus;
  events: ApplicationEventRow[];
  className?: string;
}

export function ApplicationTimeline({ status, events, className }: ApplicationTimelineProps) {
  const isRejected = status === "rejected";
  const isWithdrawn = status === "withdrawn";
  const isTerminal = isRejected || isWithdrawn;

  /**
   * How far the candidate actually got.
   *
   * On a terminal status the current stage is not in the pipeline, so it
   * is recovered from the event history: the furthest pipeline stage
   * that was ever reached.
   */
  const currentIndex = isTerminal
    ? events.reduce((furthest, event) => {
        const index = APPLICATION_PIPELINE.indexOf(event.new_status);
        return index > furthest ? index : furthest;
      }, 0)
    : APPLICATION_PIPELINE.indexOf(status);

  return (
    <div className={className}>
      <ol className={styles.timeline} aria-label="Application progress">
        {APPLICATION_PIPELINE.map((stage, index) => {
          const reached = index <= currentIndex;
          const isCurrent = !isTerminal && index === currentIndex;

          return (
            <li
              key={stage}
              className={cn(styles.timelineStep, reached && styles.timelineStepReached)}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={cn(
                  styles.timelineMarker,
                  reached && styles.timelineMarkerReached,
                  isCurrent && styles.timelineMarkerCurrent
                )}
                aria-hidden="true"
              />
              <span
                className={cn(styles.timelineLabel, reached && styles.timelineLabelReached)}
              >
                {APPLICATION_STATUS_LABELS[stage]}
                {isCurrent && <span className="sr-only"> (current stage)</span>}
              </span>
            </li>
          );
        })}
      </ol>

      <p
        className={cn(
          "mt-6 text-[14.5px] leading-[1.65]",
          isTerminal ? "text-slate-500" : "text-slate-600"
        )}
      >
        {APPLICATION_STATUS_DESCRIPTIONS[status]}
      </p>

      {events.length > 1 && (
        <details className="group mt-5">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500 transition-colors duration-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2">
            <span className="transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-open:rotate-90">
              &rsaquo;
            </span>
            Full history
          </summary>

          <ul className="mt-4 space-y-2.5 border-l border-slate-200 pl-4">
            {events.map((event) => (
              <li key={event.id} className="text-[13.5px] leading-[1.55] text-slate-600">
                <span className="font-semibold text-slate-900">
                  {APPLICATION_STATUS_LABELS[event.new_status]}
                </span>
                <span className="mx-2 text-slate-300" aria-hidden="true">
                  /
                </span>
                <time dateTime={event.created_at}>{formatDate(event.created_at)}</time>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export default ApplicationTimeline;
