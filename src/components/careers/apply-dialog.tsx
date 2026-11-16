"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { submitApplication, type SubmittedApplication } from "@/app/careers/actions";
import type { ActionResult } from "@/lib/careers/types";
import { FormError, SubmitButton, TextAreaField, TextField } from "./form-fields";
import { ResumeUpload } from "./resume-upload";
import { ApplicationSuccess } from "./application-success";
import { getStoredAttribution } from "@/lib/analytics/attribution";
import { sendAnalyticsEvent } from "@/lib/analytics/ga";

/**
 * The application form.
 *
 * Progressive by construction: a real `<form action={...}>` bound to a
 * Server Action through `useActionState`, so the submission path is the
 * platform's rather than a hand-rolled fetch. Pending state comes from
 * the same hook instead of a second piece of state that can drift.
 *
 * The resume is the exception. It uploads to Supabase Storage before
 * submission and only its storage path travels through the action,
 * which keeps a multi-megabyte file out of the 1MB Server Action body
 * limit. The server re-verifies that object before writing the row.
 */

export interface ApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: { id: string; title: string };
  userId: string;
  prefill: {
    fullName: string;
    email: string;
    phone: string;
    linkedinUrl: string;
    portfolioUrl: string;
    githubUrl: string;
    resumePath: string | null;
  };
}

type SubmitState = ActionResult<SubmittedApplication> | null;

export function ApplyDialog({
  open,
  onOpenChange,
  job,
  userId,
  prefill,
}: ApplyDialogProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<SubmitState, FormData>(
    submitApplication,
    null
  );

  const [resumePath, setResumePath] = useState<string | null>(prefill.resumePath);
  const [resumeName, setResumeName] = useState<string | null>(
    prefill.resumePath ? "Resume on file" : null
  );
  const attributionInput = useRef<HTMLInputElement>(null);
  const conversionSent = useRef(false);

  const succeeded = state?.ok === true;
  const fieldErrors = state?.ok === false ? (state.fieldErrors ?? {}) : {};
  const formError = state?.ok === false ? state.message : undefined;

  /**
   * The submission timestamp comes back from the server rather than
   * being stamped here. Reading the clock during render is impure, and
   * using the server's value means the confirmation and the
   * confirmation email quote exactly the same time.
   */
  useEffect(() => {
    if (succeeded) {
      if (!conversionSent.current) {
        sendAnalyticsEvent("career_application_submitted", {
          form_name: "career_application",
        });
        conversionSent.current = true;
      }
      // Refresh so the job page swaps its Apply control for "already
      // applied" without a full navigation.
      router.refresh();
    }
  }, [succeeded, router]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next && succeeded) {
      router.refresh();
    }
  };

  if (succeeded && state.ok) {
    return (
      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Application received"
        eyebrow="Confirmed"
        size="wide"
      >
        <ApplicationSuccess
          reference={state.data.reference}
          jobTitle={job.title}
          submittedAt={state.data.submittedAt}
          onClose={() => handleOpenChange(false)}
        />
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title={job.title}
      eyebrow="Apply for this role"
      description="Tell us who you are. Everything marked with an asterisk is required."
      size="wide"
      dismissible={!pending}
    >
      <form
        action={formAction}
        className="space-y-5"
        noValidate
        onSubmit={() => {
          if (attributionInput.current) {
            attributionInput.current.value = JSON.stringify(getStoredAttribution());
          }
        }}
      >
        <input type="hidden" name="jobId" value={job.id} />
        <input type="hidden" name="resumePath" value={resumePath ?? ""} />
        <input ref={attributionInput} type="hidden" name="attribution" defaultValue="{}" />

        <FormError message={formError} />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Full name"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            defaultValue={prefill.fullName}
            error={fieldErrors.fullName}
            disabled={pending}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            defaultValue={prefill.email}
            error={fieldErrors.email}
            disabled={pending}
          />
        </div>

        <TextField
          label="Phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="+91 98765 43210"
          defaultValue={prefill.phone}
          error={fieldErrors.phone}
          disabled={pending}
          containerClassName="sm:max-w-[50%]"
        />

        <ResumeUpload
          userId={userId}
          onChange={(path, name) => {
            setResumePath(path);
            setResumeName(name);
          }}
          initialPath={prefill.resumePath}
          initialFileName={resumeName}
          error={fieldErrors.resumePath}
          disabled={pending}
        />

        <TextAreaField
          label="Cover letter"
          name="coverLetter"
          optionalLabel
          rows={7}
          placeholder="What draws you to this role, and what would you bring to it?"
          error={fieldErrors.coverLetter}
          disabled={pending}
        />

        <fieldset className="space-y-5 border-t border-slate-200 pt-5">
          <legend className="font-mono text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500">
            Optional links
          </legend>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="LinkedIn"
              name="linkedinUrl"
              type="url"
              inputMode="url"
              optionalLabel
              placeholder="https://linkedin.com/in/..."
              defaultValue={prefill.linkedinUrl}
              error={fieldErrors.linkedinUrl}
              disabled={pending}
            />
            <TextField
              label="Portfolio or website"
              name="portfolioUrl"
              type="url"
              inputMode="url"
              optionalLabel
              placeholder="https://..."
              defaultValue={prefill.portfolioUrl}
              error={fieldErrors.portfolioUrl}
              disabled={pending}
            />
          </div>

          <TextField
            label="GitHub"
            name="githubUrl"
            type="url"
            inputMode="url"
            optionalLabel
            placeholder="https://github.com/..."
            defaultValue={prefill.githubUrl}
            error={fieldErrors.githubUrl}
            disabled={pending}
            containerClassName="sm:max-w-[50%]"
          />

          <TextAreaField
            label="Anything else"
            name="additionalInfo"
            rows={3}
            optionalLabel
            placeholder="Notice period, work authorisation, or anything else we should know."
            error={fieldErrors.additionalInfo}
            disabled={pending}
          />
        </fieldset>

        <div className="border-t border-slate-200 pt-5">
          <SubmitButton pending={pending} pendingLabel="Submitting your application">
            Submit application
          </SubmitButton>

          <p className="mt-3 text-center text-[12.5px] leading-[1.6] text-slate-500">
            Your resume is stored privately and is only visible to the Siddiona hiring team.
          </p>
        </div>
      </form>
    </Dialog>
  );
}

export default ApplyDialog;
