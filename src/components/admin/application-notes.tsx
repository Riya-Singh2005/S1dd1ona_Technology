"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";
import { FormError, SubmitButton } from "@/components/careers/form-fields";
import { addApplicationNote, deleteApplicationNote } from "@/app/admin/actions";
import type { ActionResult } from "@/lib/careers/types";
import type { ApplicationNoteRow } from "@/lib/careers/types";
import { formatDateTime } from "@/lib/careers/format";

/**
 * Internal notes on an application.
 *
 * These live in `application_notes`, a table with admin-only policies
 * and no candidate-facing policy whatsoever. That separation is the
 * whole reason the table exists: Row Level Security is row-level, not
 * column-level, so an `admin_notes` column on `applications` would have
 * been readable by any candidate selecting their own row.
 *
 * Nothing here is ever rendered on a candidate surface.
 */

export interface ApplicationNotesProps {
  applicationId: string;
  notes: ApplicationNoteRow[];
  authorNames: Record<string, string>;
}

function NoteDeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={pending ? "Deleting note" : "Delete this note"}
      aria-busy={pending}
      className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-300 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
    </button>
  );
}

export function ApplicationNotes({
  applicationId,
  notes,
  authorNames,
}: ApplicationNotesProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [addState, addAction, addPending] = useActionState<ActionResult | null, FormData>(
    addApplicationNote,
    null
  );

  const [deleteState, deleteAction] = useActionState<ActionResult | null, FormData>(
    deleteApplicationNote,
    null
  );

  useEffect(() => {
    if (addState?.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [addState, router]);

  useEffect(() => {
    if (deleteState?.ok) router.refresh();
  }, [deleteState, router]);

  return (
    <div className="p-5">
      <form ref={formRef} action={addAction} className="space-y-3">
        <input type="hidden" name="applicationId" value={applicationId} />

        <FormError message={addState?.ok === false ? addState.message : undefined} />

        <label htmlFor="note-body" className="sr-only">
          Add an internal note
        </label>
        <textarea
          id="note-body"
          name="body"
          rows={3}
          required
          maxLength={4000}
          disabled={addPending}
          placeholder="Screening notes, interview feedback, anything the team should know."
          className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[14px] leading-[1.6] text-slate-900 placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 ease-out focus:border-[#EA580C] focus:shadow-[0_0_0_3px_rgba(234,88,12,0.14)] focus:outline-none disabled:bg-slate-50"
        />

        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] text-slate-500">
            Internal only. Never shown to the candidate.
          </p>
          <SubmitButton
            pending={addPending}
            pendingLabel="Saving"
            fullWidth={false}
            className="min-h-10 px-4 text-[13.5px]"
          >
            Add note
          </SubmitButton>
        </div>
      </form>

      {notes.length > 0 && (
        <ul className="mt-6 space-y-4 border-t border-slate-200 pt-5">
          {notes.map((note) => (
            <li key={note.id}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.11em] text-slate-500">
                  {(note.author_id && authorNames[note.author_id]) || "Team"}
                  <span className="mx-2 text-slate-300" aria-hidden="true">
                    /
                  </span>
                  <time dateTime={note.created_at} className="font-normal tracking-normal normal-case">
                    {formatDateTime(note.created_at)}
                  </time>
                </p>

                <form action={deleteAction}>
                  <input type="hidden" name="noteId" value={note.id} />
                  <input type="hidden" name="applicationId" value={applicationId} />
                  <NoteDeleteButton />
                </form>
              </div>

              <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-[1.6] text-slate-700">
                {note.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {deleteState?.ok === false && (
        <p role="alert" className="mt-4 text-[13px] font-medium text-red-600">
          {deleteState.message}
        </p>
      )}
    </div>
  );
}

export default ApplicationNotes;
