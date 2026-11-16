import { EMPLOYMENT_TYPE_SCHEMA } from "./constants";
import { publishedSalary } from "./format";
import type { JobRow } from "./types";
export { serializeJsonLd } from "@/lib/structured-data";
import { OFFICE_ADDRESS } from "@/lib/structured-data";
import { SITE_ORIGIN } from "@/lib/site";

/**
 * JobPosting structured data for Google Jobs.
 *
 * The governing rule here is that nothing is invented. Every optional
 * field is emitted only when the row actually carries it:
 *
 *   - no salary on the record means no `baseSalary` at all, rather than
 *     a plausible-looking guess
 *   - no closing date means no `validThrough`
 *   - `jobLocationType: TELECOMMUTE` only when the role is genuinely
 *     marked remote
 *
 * Publishing a fabricated salary range to Google Jobs would be a
 * misrepresentation to candidates, and a structured-data violation on
 * top of that.
 */

export interface JobPostingSchemaInput {
  job: JobRow;
  origin: string;
}

interface MonetaryAmount {
  "@type": "MonetaryAmount";
  currency: string;
  value: {
    "@type": "QuantitativeValue";
    minValue?: number;
    maxValue?: number;
    value?: number;
    unitText: "YEAR";
  };
}

/**
 * Flattens the structured arrays back into readable prose.
 *
 * Google expects `description` to be a complete summary of the role.
 * Our content is stored as arrays so it can render as real lists, so it
 * is recomposed here rather than stored twice and left to drift.
 */
function buildDescription(job: JobRow): string {
  const sections: string[] = [job.description];

  const append = (heading: string, items: string[]) => {
    if (items.length === 0) return;
    sections.push(`${heading}: ${items.join("; ")}.`);
  };

  append("Responsibilities", job.responsibilities);
  append("Requirements", job.requirements);
  append("Nice to have", job.nice_to_have);
  append("What you will work on", job.what_you_will_work_on);
  append("Benefits", job.benefits);

  return sections.join("\n\n");
}

/**
 * Roles based at the office get its full address, which Google Jobs
 * recommends; any other location keeps the locality the role states.
 */
function jobAddress(location: string) {
  if (/new delhi|nehru place/i.test(location)) return OFFICE_ADDRESS;
  return { "@type": "PostalAddress", addressLocality: location, addressCountry: "IN" };
}

export function buildJobPostingSchema({ job, origin }: JobPostingSchemaInput) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: buildDescription(job),
    identifier: {
      "@type": "PropertyValue",
      name: "Siddiona Technologies",
      value: job.slug,
    },
    datePosted: job.published_at ?? job.created_at,
    employmentType: EMPLOYMENT_TYPE_SCHEMA[job.employment_type],
    hiringOrganization: {
      "@type": "Organization",
      name: "Siddiona Technologies Services Pvt. Ltd.",
      sameAs: SITE_ORIGIN,
      logo: `${origin}/brand/Siddionalogo-transparent.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: jobAddress(job.location),
    },
    directApply: true,
    url: `${origin}/careers/${job.slug}`,
  };

  if (job.closing_at) {
    schema.validThrough = job.closing_at;
  }

  if (job.department) {
    schema.occupationalCategory = job.department;
  }

  if (job.experience) {
    schema.experienceRequirements = {
      "@type": "OccupationalExperienceRequirements",
      description: job.experience,
    };
  }

  if (job.work_mode === "remote") {
    schema.jobLocationType = "TELECOMMUTE";
    schema.applicantLocationRequirements = {
      "@type": "Country",
      name: "India",
    };
  }

  // Emitted only when a real figure exists on the record.
  const salaryMin = publishedSalary(job.salary_min);
  const salaryMax = publishedSalary(job.salary_max);
  if (salaryMin !== null || salaryMax !== null) {
    const value: MonetaryAmount["value"] = { "@type": "QuantitativeValue", unitText: "YEAR" };

    if (salaryMin !== null) value.minValue = salaryMin;
    if (salaryMax !== null) value.maxValue = salaryMax;

    const baseSalary: MonetaryAmount = {
      "@type": "MonetaryAmount",
      currency: job.currency,
      value,
    };

    schema.baseSalary = baseSalary;
  }

  return schema;
}

/**
 * Serialises JSON-LD for a native `<script>` tag.
 *
 * `JSON.stringify` does not escape `<`, so a job description containing
 * a closing script tag would break out of the element. Replacing it
 * with its unicode escape is exactly what the Next.js docs prescribe
 * for this, and it stays valid JSON.
 */
