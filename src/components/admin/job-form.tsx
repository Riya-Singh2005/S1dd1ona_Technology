"use client";

import React, { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  FormError,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "@/components/careers/form-fields";
import { createJob, updateJob } from "@/app/admin/actions";
import type { ActionResult } from "@/lib/careers/types";
import type { JobRow } from "@/lib/careers/types";
import type { AdminRole } from "@/lib/supabase/database.types";
import {
  EMPLOYMENT_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
} from "@/lib/careers/constants";
import { useTransientSuccess } from "@/lib/careers/use-transient-success";

/**
 * Create and edit a job.
 *
 * List fields are plain textareas, one entry per line, rather than a
 * repeater with add and remove buttons. A recruiter writing seven
 * responsibilities can paste them from a document in one action; a
 * repeater turns that into seven clicks and seven focus changes for no
 * gain. The server splits on newlines and drops blanks.
 *
 * The hiring process uses "Title | Description" per line, which is the
 * smallest syntax that carries two fields without becoming a form
 * builder.
 *
 * Everything is stored and rendered as plain text, so nothing typed
 * here can inject markup into a public page.
 */

export interface JobFormProps {
  job?: JobRow;
  /** Application count, so the edit view can warn before disruptive edits. */
  applicationCount?: number;
  adminRole: AdminRole;
}

function toDateInputValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

interface JobFormValues {
  title: string;
  department: string;
  location: string;
  workMode: string;
  employmentType: string;
  experience: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  shortDescription: string;
  description: string;
  responsibilities: string;
  requirements: string;
  niceToHave: string;
  whatYouWillWorkOn: string;
  benefits: string;
  hiringProcess: string;
  closingAt: string;
}

function initialJobFormValues(job?: JobRow): JobFormValues {
  return {
    title: job?.title ?? "",
    department: job?.department ?? "",
    location: job?.location ?? "",
    workMode: job?.work_mode ?? "",
    employmentType: job?.employment_type ?? "full_time",
    experience: job?.experience ?? "",
    salaryMin: job?.salary_min === null || job?.salary_min === undefined ? "" : String(job.salary_min),
    salaryMax: job?.salary_max === null || job?.salary_max === undefined ? "" : String(job.salary_max),
    currency: job?.currency ?? "INR",
    shortDescription: job?.short_description ?? "",
    description: job?.description ?? "",
    responsibilities: (job?.responsibilities ?? []).join("\n"),
    requirements: (job?.requirements ?? []).join("\n"),
    niceToHave: (job?.nice_to_have ?? []).join("\n"),
    whatYouWillWorkOn: (job?.what_you_will_work_on ?? []).join("\n"),
    benefits: (job?.benefits ?? []).join("\n"),
    hiringProcess: (job?.hiring_process ?? [])
      .map((step) => `${step.title} | ${step.description}`)
      .join("\n"),
    closingAt: toDateInputValue(job?.closing_at ?? null),
  };
}

export function JobForm({ job, applicationCount = 0, adminRole }: JobFormProps) {
  const router = useRouter();
  const isEdit = Boolean(job);
  const formRef = useRef<HTMLFormElement>(null);

  const [createState, createAction, createPending] = useActionState<
    ActionResult<{ jobId: string }> | null,
    FormData
  >(createJob, null);

  const [updateState, updateAction, updatePending] = useActionState<
    ActionResult | null,
    FormData
  >(updateJob, null);

  const state = isEdit ? updateState : createState;
  const pending = isEdit ? updatePending : createPending;
  const fieldErrors = state?.ok === false ? (state.fieldErrors ?? {}) : {};

  // Controlled values keep every successful field intact when a Server
  // Action returns a validation error. React may reset uncontrolled form
  // elements after an action resolves, which would otherwise make an admin
  // re-enter the entire job for one missed field.
  const [values, setValues] = useState<JobFormValues>(() => initialJobFormValues(job));
  const updateValue =
    (field: keyof JobFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const saved = useTransientSuccess(updateState);

  useEffect(() => {
    if (updateState?.ok) router.refresh();
  }, [updateState, router]);

  useEffect(() => {
    if (state?.ok !== false || !state.fieldErrors) return;
    const form = formRef.current;
    if (!form) return;
    const invalidFields = new Set(Object.keys(state.fieldErrors));
    const control = Array.from(form.elements).find(
      (element) =>
        (element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement ||
          element instanceof HTMLSelectElement) &&
        invalidFields.has(element.name)
    );

    if (control instanceof HTMLElement) {
      control.focus({ preventScroll: true });
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      control.scrollIntoView({
        block: "center",
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }, [state]);

  const action = isEdit ? updateAction : createAction;

  return (
    <form ref={formRef} action={action} className="space-y-8" noValidate>
      {job && <input type="hidden" name="jobId" value={job.id} />}

      <FormError
        message={
          state?.ok === false && !state.fieldErrors ? state.message : undefined
        }
      />

      {isEdit && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-[13.5px] font-medium leading-[1.55] text-amber-800">
          {applicationCount > 0 && (
            <>
              {applicationCount} candidate{applicationCount === 1 ? " has" : "s have"} already
              applied for this role. {" "}
            </>
          )}
          Changing the job title will update its public URL, and the previous link will no longer
          open this role.
          {adminRole !== "super_admin" && job?.status === "published" && (
            <> Saving an actual content change will immediately unpublish this role. Submit it for approval when it is ready.</>
          )}
          {adminRole !== "super_admin" && job?.status === "pending_approval" && (
            <> Saving an actual content change will return this submission to Draft so it can be reviewed again.</>
          )}
        </p>
      )}

      <Fieldset legend="Basics">
        <div className="grid gap-5">
          <TextField
            label="Job title"
            name="title"
            required
            value={values.title}
            onChange={updateValue("title")}
            placeholder="Senior Full Stack Developer"
            error={fieldErrors.title}
            disabled={pending}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Department"
            name="department"
            required
            value={values.department}
            onChange={updateValue("department")}
            placeholder="Technology"
            error={fieldErrors.department}
            disabled={pending}
          />

          <TextField
            label="Location"
            name="location"
            required
            value={values.location}
            onChange={updateValue("location")}
            placeholder="New Delhi"
            error={fieldErrors.location}
            disabled={pending}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField
            label="Work mode"
            name="workMode"
            optionalLabel
            placeholder="Not specified"
            options={WORK_MODE_OPTIONS}
            value={values.workMode}
            onChange={updateValue("workMode")}
            error={fieldErrors.workMode}
            disabled={pending}
          />

          <SelectField
            label="Employment type"
            name="employmentType"
            required
            options={EMPLOYMENT_TYPE_OPTIONS}
            value={values.employmentType}
            onChange={updateValue("employmentType")}
            error={fieldErrors.employmentType}
            disabled={pending}
          />

          <TextField
            label="Experience"
            name="experience"
            optionalLabel
            value={values.experience}
            onChange={updateValue("experience")}
            placeholder="2-5 years"
            error={fieldErrors.experience}
            disabled={pending}
          />
        </div>
      </Fieldset>

      <Fieldset
        legend="Compensation"
        hint="Leave blank if the range is not being published. Nothing is shown or sent to Google Jobs unless a real figure is entered here."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            label="Minimum"
            name="salaryMin"
            type="number"
            inputMode="numeric"
            min={0}
            optionalLabel
            value={values.salaryMin}
            onChange={updateValue("salaryMin")}
            placeholder="900000"
            error={fieldErrors.salaryMin}
            disabled={pending}
          />

          <TextField
            label="Maximum"
            name="salaryMax"
            type="number"
            inputMode="numeric"
            min={0}
            optionalLabel
            value={values.salaryMax}
            onChange={updateValue("salaryMax")}
            placeholder="1500000"
            error={fieldErrors.salaryMax}
            disabled={pending}
          />

          <TextField
            label="Currency"
            name="currency"
            maxLength={3}
            value={values.currency}
            onChange={updateValue("currency")}
            placeholder="INR"
            hint="Three letter code."
            error={fieldErrors.currency}
            disabled={pending}
          />
        </div>
      </Fieldset>

      <Fieldset legend="Description">
        <TextAreaField
          label="Short summary"
          name="shortDescription"
          required
          rows={2}
          maxLength={400}
          value={values.shortDescription}
          onChange={updateValue("shortDescription")}
          hint="One or two sentences. Shown on the jobs index and used as the page description."
          error={fieldErrors.shortDescription}
          disabled={pending}
        />

        <TextAreaField
          label="About the role"
          name="description"
          required
          rows={7}
          value={values.description}
          onChange={updateValue("description")}
          hint="The full narrative. Blank lines become paragraphs."
          error={fieldErrors.description}
          disabled={pending}
        />
      </Fieldset>

      <Fieldset legend="Detail" hint="One entry per line. Blank lines are ignored.">
        <ListField
          label="Responsibilities"
          name="responsibilities"
          value={values.responsibilities}
          onChange={updateValue("responsibilities")}
          error={fieldErrors.responsibilities}
          disabled={pending}
        />
        <ListField
          label="Requirements"
          name="requirements"
          value={values.requirements}
          onChange={updateValue("requirements")}
          error={fieldErrors.requirements}
          disabled={pending}
        />
        <ListField
          label="Nice to have"
          name="niceToHave"
          value={values.niceToHave}
          onChange={updateValue("niceToHave")}
          error={fieldErrors.niceToHave}
          disabled={pending}
        />
        <ListField
          label="What you will work on"
          name="whatYouWillWorkOn"
          value={values.whatYouWillWorkOn}
          onChange={updateValue("whatYouWillWorkOn")}
          error={fieldErrors.whatYouWillWorkOn}
          disabled={pending}
        />
        <ListField
          label="Benefits"
          name="benefits"
          value={values.benefits}
          onChange={updateValue("benefits")}
          error={fieldErrors.benefits}
          disabled={pending}
        />
      </Fieldset>

      <Fieldset legend="Hiring process">
        <TextAreaField
          label="Steps"
          name="hiringProcess"
          rows={6}
          optionalLabel
          value={values.hiringProcess}
          onChange={updateValue("hiringProcess")}
          hint='One step per line, as "Title | Description". For example: Introductory call | A 30 minute conversation about your work.'
          error={fieldErrors.hiringProcess}
          disabled={pending}
          className="font-mono text-[13.5px]"
        />
      </Fieldset>

      <Fieldset legend="Availability">
        <TextField
          label="Applications close"
          name="closingAt"
          type="date"
          optionalLabel
          value={values.closingAt}
          onChange={updateValue("closingAt")}
          hint="After this date the role stops accepting applications automatically. Leave blank for no deadline."
          error={fieldErrors.closingAt}
          disabled={pending}
          containerClassName="sm:max-w-[50%]"
        />
      </Fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
        {isEdit ? (
          <>
            <SubmitButton pending={pending} pendingLabel="Saving" fullWidth={false}>
              Save changes
            </SubmitButton>

            {saved && (
              <span
                role="status"
                className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Saved
              </span>
            )}
          </>
        ) : (
          <>
            <SubmitButton
              pending={pending}
              pendingLabel="Creating"
              fullWidth={false}
              name="intent"
              value="draft"
              variant="outline"
            >
              Save as draft
            </SubmitButton>

            {adminRole === "super_admin" ? (
              <SubmitButton
                pending={pending}
                pendingLabel="Publishing"
                fullWidth={false}
                name="intent"
                value="publish"
              >
                Create and publish
              </SubmitButton>
            ) : (
              <SubmitButton
                pending={pending}
                pendingLabel="Submitting"
                fullWidth={false}
                name="intent"
                value="submit"
              >
                Submit for approval
              </SubmitButton>
            )}
          </>
        )}
      </div>
    </form>
  );
}

function Fieldset({
  legend,
  hint,
  children,
}: {
  legend: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)] sm:p-6">
      <legend className="px-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-slate-500">
        {legend}
      </legend>
      {hint && <p className="mb-5 mt-1 text-[13px] leading-[1.55] text-slate-500">{hint}</p>}
      <div className={hint ? "space-y-5" : "mt-2 space-y-5"}>{children}</div>
    </fieldset>
  );
}

function ListField({
  label,
  name,
  value,
  onChange,
  error,
  disabled,
}: {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <TextAreaField
      label={label}
      name={name}
      rows={5}
      optionalLabel
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
    />
  );
}

export default JobForm;
