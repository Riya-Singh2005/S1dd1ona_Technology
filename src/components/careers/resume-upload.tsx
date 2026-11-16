"use client";

import React, { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  formatBytes,
  RESUME_ACCEPT_ATTRIBUTE,
  RESUME_ACCEPTED_MIME_TYPES,
  RESUME_BUCKET,
  RESUME_MAX_BYTES,
  resumeExtensionFor,
} from "@/lib/careers/constants";

/**
 * Resume upload, straight from the browser to Supabase Storage.
 *
 * This bypasses the Next.js server entirely, and that is the point. A
 * Server Action caps its request body at 1MB by default, so a 3MB CV
 * would be rejected before any of our code ran. Raising the cap would
 * only push the same bytes through the Next server for no benefit.
 *
 * What protects the upload instead:
 *   - a storage policy that only permits writes inside `{auth.uid()}/`
 *   - bucket-level `file_size_limit` and `allowed_mime_types`, which
 *     Supabase enforces server-side
 *   - the submit action re-reading the object's real size and MIME type
 *     before it writes an application row
 *
 * The checks in this component are for speed of feedback, not security.
 */

export interface ResumeUploadProps {
  userId: string;
  /** Emits the storage path, or null when the selection is cleared. */
  onChange: (path: string | null, fileName: string | null) => void;
  initialPath?: string | null;
  initialFileName?: string | null;
  error?: string;
  disabled?: boolean;
}

type UploadState =
  | { kind: "empty" }
  | { kind: "uploading"; fileName: string }
  | { kind: "ready"; fileName: string; size: number | null; path: string }
  | { kind: "error"; message: string };

export function ResumeUpload({
  userId,
  onChange,
  initialPath,
  initialFileName,
  error,
  disabled,
}: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>(() =>
    initialPath
      ? {
          kind: "ready",
          fileName: initialFileName ?? initialPath.split("/").pop() ?? "Your resume",
          size: null,
          path: initialPath,
        }
      : { kind: "empty" }
  );
  const [isDragging, setIsDragging] = useState(false);

  const uploadFile = async (file: File) => {
    if (!RESUME_ACCEPTED_MIME_TYPES.includes(file.type as (typeof RESUME_ACCEPTED_MIME_TYPES)[number])) {
      setState({ kind: "error", message: "Resumes need to be a PDF, DOC or DOCX file." });
      onChange(null, null);
      return;
    }

    if (file.size > RESUME_MAX_BYTES) {
      setState({
        kind: "error",
        message: `That file is ${formatBytes(file.size)}. Resumes need to be ${formatBytes(RESUME_MAX_BYTES)} or smaller.`,
      });
      onChange(null, null);
      return;
    }

    if (file.size === 0) {
      setState({ kind: "error", message: "That file is empty. Please choose another." });
      onChange(null, null);
      return;
    }

    const extension = resumeExtensionFor(file.type);
    if (!extension) {
      setState({ kind: "error", message: "Resumes need to be a PDF, DOC or DOCX file." });
      onChange(null, null);
      return;
    }

    setState({ kind: "uploading", fileName: file.name });
    onChange(null, null);

    try {
      const supabase = createClient();

      // The first path segment must be the caller's user id: the storage
      // policy keys off it, and a mismatch is rejected by the database
      // rather than by this line.
      const objectName = `${userId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(RESUME_BUCKET)
        .upload(objectName, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        const message = uploadError.message.toLowerCase();
        setState({
          kind: "error",
          message: message.includes("exceeded") || message.includes("size")
            ? "That file is larger than the 5 MB limit."
            : message.includes("mime") || message.includes("type")
              ? "Resumes need to be a PDF, DOC or DOCX file."
              : "We could not upload that file. Please check your connection and try again.",
        });
        onChange(null, null);
        return;
      }

      setState({ kind: "ready", fileName: file.name, size: file.size, path: objectName });
      onChange(objectName, file.name);
    } catch {
      setState({
        kind: "error",
        message: "We could not upload that file. Please check your connection and try again.",
      });
      onChange(null, null);
    }
  };

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so selecting the same file twice still fires a change event.
    event.target.value = "";
    if (file) void uploadFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  };

  const clear = () => {
    setState({ kind: "empty" });
    onChange(null, null);
    inputRef.current?.focus();
  };

  const displayError = error ?? (state.kind === "error" ? state.message : undefined);
  const isBusy = state.kind === "uploading";

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-semibold tracking-[0.01em] text-slate-800">
          Resume
          <span className="ml-1 text-[#EA580C]" aria-hidden="true">
            *
          </span>
        </span>
        <span className="text-[11.5px] font-medium text-slate-400">
          PDF, DOC or DOCX, up to 5 MB
        </span>
      </div>

      {state.kind === "ready" ? (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3.5 py-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-slate-900">{state.fileName}</p>
            <p className="text-[12.5px] text-emerald-700">
              Uploaded{state.size !== null ? ` · ${formatBytes(state.size)}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={clear}
            disabled={disabled}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition-[background-color,color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white hover:text-slate-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Remove uploaded resume"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "rounded-lg border border-dashed px-4 py-6 text-center transition-[border-color,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
            displayError
              ? "border-red-300 bg-red-50/50"
              : isDragging
                ? "border-[#EA580C] bg-orange-50/70"
                : "border-slate-300 bg-slate-50/60"
          )}
        >
          {isBusy ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-[#EA580C]" aria-hidden="true" />
              <p className="text-[14px] font-semibold text-slate-800">Uploading</p>
              <p className="max-w-full truncate text-[12.5px] text-slate-500">{state.fileName}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5">
              <FileText className="h-6 w-6 text-slate-400" strokeWidth={1.5} aria-hidden="true" />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-[13.5px] font-bold text-slate-800 transition-[border-color,background-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Choose a file
              </button>
              <p className="text-[12.5px] text-slate-500">or drop it here</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={RESUME_ACCEPT_ATTRIBUTE}
        onChange={handleSelect}
        disabled={disabled}
        className="sr-only"
        aria-label="Upload your resume"
      />

      {displayError && (
        <p
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-[12.5px] font-medium leading-[1.5] text-red-600"
        >
          <AlertCircle className="mt-[1px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {displayError}
        </p>
      )}
    </div>
  );
}

export default ResumeUpload;
