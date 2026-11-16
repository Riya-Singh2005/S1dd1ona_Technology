import React from "react";
import type { JobRow } from "@/lib/careers/types";

export interface JobDetailBodyProps { job: JobRow; }

const headingClass = "font-display text-[18px] font-bold leading-[1.3] tracking-[-0.02em] text-[#0F172A]";

/** Text formatting stays in escaped React elements, never executable HTML. */
function InlineCopy({ text }: { text: string }) {
  return text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).map((token, index) => {
    if (/^(\*\*[^*]+\*\*|__[^_]+__)$/.test(token)) return <strong key={index}>{token.slice(2, -2)}</strong>;
    if (/^(\*[^*\n]+\*|_[^_\n]+_)$/.test(token)) return <em key={index}>{token.slice(1, -1)}</em>;
    if (/^`[^`]+`$/.test(token)) return <code key={index}>{token.slice(1, -1)}</code>;
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = link[2].trim();
      return /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href) ? (
        <a key={index} href={href} className="font-semibold text-[#C2410C] underline underline-offset-4 break-words focus-visible:outline-2 focus-visible:outline-[#EA580C]">{link[1]}</a>
      ) : <React.Fragment key={index}>{link[1]}</React.Fragment>;
    }
    return <React.Fragment key={index}>{token}</React.Fragment>;
  });
}

/** The supported subset covers pasted job-post headings, paragraphs and lists.
 * Raw HTML stays escaped. No embeds or client-side Markdown dependency.
 */
function JobContent({ text, title, list = false }: { text: string; title: string; list?: boolean }) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (let index = 0; index < lines.length;) {
    const line = lines[index].trim();
    if (!line || /^(?:-{3,}|\*{3,}|_{3,})$/.test(line)) { index++; continue; }
    const heading = line.match(/^#{1,6}\s+(.+?)(?:\s+#+)?$/);
    if (heading) {
      const label = heading[1].replace(/\*\*|__/g, "");
      // Omit a pasted heading only when it repeats this field's own heading.
      if (label.toLowerCase().replace(/[^a-z0-9]/g, "") !== normalizedTitle) {
        blocks.push(<h3 key={index} className={`${headingClass} mt-5 first:mt-0`}><InlineCopy text={label} /></h3>);
      }
      index++;
      continue;
    }
    const marker = line.match(/^(?:[-*+]\s+|\d+[.)]\s+)(.+)$/);
    if (marker || list) {
      const start = index;
      const ordered = Boolean(marker && /^\d/.test(line));
      const items: React.ReactNode[] = [];
      while (index < lines.length) {
        const item = lines[index].trim();
        const match = item.match(/^(?:[-*+]\s+|\d+[.)]\s+)(.+)$/);
        if (!item || /^#{1,6}\s/.test(item) || (!list && !match) || (match && /^\d/.test(item) !== ordered)) break;
        items.push(<li key={index} className="pl-1"><InlineCopy text={match ? match[1] : item} /></li>);
        index++;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(<List key={start} className={`my-2 space-y-1.5 pl-5 ${ordered ? "list-decimal" : "list-disc marker:text-[#C2410C]"}`}>{items}</List>);
      continue;
    }
    blocks.push(<p key={index} className="my-2"><InlineCopy text={line} /></p>);
    index++;
  }
  return blocks;
}

function JobSection({ title, text, list = false }: { title: string; text: string; list?: boolean }) {
  if (!text.trim()) return null;
  const content = JobContent({ text, title, list });
  if (content.length === 0) return null;
  return (
    <section className="mt-6 first:mt-0">
      <h2 className={headingClass}>{title}</h2>
      <div className="mt-2">{content}</div>
    </section>
  );
}

export function JobDetailBody({ job }: JobDetailBodyProps) {
  return (
    <article aria-label="Job description" className="max-w-[72ch] break-words text-[15px] leading-[1.6] text-slate-700 sm:text-[16px]">
      <JobSection title="About the role" text={job.description} />
      <JobSection title="Key Responsibilities" text={job.responsibilities.join("\n")} list />
      <JobSection title="We're Looking For" text={job.requirements.join("\n")} list={job.requirements.length > 1} />
      <JobSection title="Nice to have" text={job.nice_to_have.join("\n")} list={job.nice_to_have.length > 1} />
      <JobSection title="What you will work on" text={job.what_you_will_work_on.join("\n")} list={job.what_you_will_work_on.length > 1} />
      <JobSection title="What we offer" text={job.benefits.join("\n")} list={job.benefits.length > 1} />
      {job.hiring_process.length > 0 && (
        <section className="mt-6">
          <h2 className={headingClass}>How we hire</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            {job.hiring_process.map((step, index) => (
              <li key={index} className="pl-1">
                <strong className="text-[#0F172A]"><InlineCopy text={step.title} /></strong>
                {step.description && <div><JobContent text={step.description} title={step.title} /></div>}
              </li>
            ))}
          </ol>
        </section>
      )}
      <p className="mt-6 border-t border-slate-200 pt-4">Interested candidates can apply for this position using the application option on this page.</p>
    </article>
  );
}

export default JobDetailBody;
