"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { updateProfile, updateProfileResume } from "@/app/careers/actions";
import type { ActionResult } from "@/lib/careers/types";
import type { ProfileRow } from "@/lib/careers/types";
import { useTransientSuccess } from "@/lib/careers/use-transient-success";
import { FormError, SubmitButton, TextAreaField, TextField } from "./form-fields";
import { ResumeUpload } from "./resume-upload";

/**
 * Candidate profile editor.
 *
 * Holds application data only. Email and password live in Supabase Auth
 * and are not duplicated here: the email field is read-only and points
 * people at the right place to change it, rather than pretending this
 * form owns their identity.
 *
 * Two independent actions rather than one. The resume uploads to
 * storage and is saved the moment it lands, so a candidate who uploads
 * a CV and then closes the tab has not lost it to an unsubmitted form.
 */

export interface ProfileFormProps {
  profile: ProfileRow;
  email: string;
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updateProfile,
    null
  );
  const [resumeState, resumeAction, resumePending] = useActionState<
    ActionResult | null,
    FormData
  >(updateProfileResume, null);

  const [resumePath, setResumePath] = useState<string | null>(profile.resume_path);

  const fieldErrors = state?.ok === false ? (state.fieldErrors ?? {}) : {};

  // The confirmation clears itself. A success banner that stays put
  // starts describing a change the user made minutes ago.
  const saved = useTransientSuccess(state);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <div className="space-y-10">
      <form action={formAction} noValidate className="space-y-5">
        <FormError message={state?.ok === false ? state.message : undefined} />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Full name"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            defaultValue={profile.full_name ?? ""}
            error={fieldErrors.fullName}
            disabled={pending}
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            readOnly
            disabled
            hint="Managed by your sign in method."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            optionalLabel
            placeholder="+91 98765 43210"
            defaultValue={profile.phone ?? ""}
            error={fieldErrors.phone}
            disabled={pending}
          />

          <TextField
            label="Location"
            name="location"
            type="text"
            optionalLabel
            placeholder="New Delhi, India"
            defaultValue={profile.location ?? ""}
            error={fieldErrors.location}
            disabled={pending}
          />
        </div>

        <fieldset className="space-y-5 border-t border-slate-200 pt-6">
          <legend className="font-mono text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500">
            Links
          </legend>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="LinkedIn"
              name="linkedinUrl"
              type="url"
              inputMode="url"
              optionalLabel
              placeholder="https://linkedin.com/in/..."
              defaultValue={profile.linkedin_url ?? ""}
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
              defaultValue={profile.portfolio_url ?? ""}
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
            defaultValue={profile.github_url ?? ""}
            error={fieldErrors.githubUrl}
            disabled={pending}
            containerClassName="sm:max-w-[50%]"
          />
        </fieldset>

        <TextAreaField
          label="About you"
          name="bio"
          rows={4}
          optionalLabel
          placeholder="A short summary of what you do and what you are looking for."
          hint="Shown to our hiring team alongside your applications."
          defaultValue={profile.bio ?? ""}
          error={fieldErrors.bio}
          disabled={pending}
        />

        <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6">
          <SubmitButton pending={pending} pendingLabel="Saving" fullWidth={false}>
            Save profile
          </SubmitButton>

          {saved && (
            <span
              role="status"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Saved
            </span>
          )}
        </div>
      </form>

      {/*
        A separate form. The resume is saved on upload rather than
        bundled into the profile submission, so it survives a closed tab.
      */}
      <form action={resumeAction} className="border-t border-slate-200 pt-8">
        <input type="hidden" name="resumePath" value={resumePath ?? ""} />

        <ResumeUpload
          userId={profile.id}
          onChange={(path) => setResumePath(path)}
          initialPath={profile.resume_path}
          initialFileName={profile.resume_path ? "Resume on file" : null}
          error={resumeState?.ok === false ? resumeState.message : undefined}
          disabled={resumePending}
        />

        <p className="mt-3 text-[12.5px] leading-[1.6] text-slate-500">
          Saved here so it is ready to attach the next time you apply. Stored privately and
          visible only to the Siddiona hiring team.
        </p>

        {resumePath !== profile.resume_path && (
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <SubmitButton
              pending={resumePending}
              pendingLabel="Saving"
              fullWidth={false}
              variant="outline"
              disabled={!resumePath}
            >
              Save resume
            </SubmitButton>
          </div>
        )}

        {resumeState?.ok && (
          <p
            role="status"
            className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-emerald-700"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Resume saved
          </p>
        )}
      </form>
    </div>
  );
}

export default ProfileForm;
