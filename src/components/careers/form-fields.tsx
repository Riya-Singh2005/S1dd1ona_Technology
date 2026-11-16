"use client";

import React, { useId } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Form primitives for the careers surfaces.
 *
 * Every field is a real `<label>` bound to its control, every error is
 * wired through `aria-describedby` and announced, and invalid controls
 * carry `aria-invalid`. Borders, radii and the orange focus ring follow
 * the tokens in `docs/design-system.md`.
 *
 * Focus state is a border colour change plus a soft ring rather than an
 * outline, so it reads at a glance without shifting layout by a pixel.
 */

const controlBase =
  "w-full rounded-lg border bg-white px-3.5 text-slate-900 placeholder:text-slate-400 transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const controlIdle =
  "border-slate-300 focus:border-[#EA580C] focus:shadow-[0_0_0_3px_rgba(234,88,12,0.14)]";

const controlInvalid =
  "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.14)]";

export interface FieldShellProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optionalLabel?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FieldShell({
  label,
  htmlFor,
  error,
  hint,
  required,
  optionalLabel,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-semibold tracking-[0.01em] text-slate-800"
        >
          {label}
          {required && (
            <span className="ml-1 text-[#EA580C]" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {optionalLabel && !required && (
          <span className="text-[11.5px] font-medium text-slate-400">Optional</span>
        )}
      </div>

      {children}

      {hint && (
        <p id={`${htmlFor}-hint`} className="mt-1.5 text-[12.5px] leading-[1.5] text-slate-500">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-[12.5px] font-medium leading-[1.5] text-red-600"
        >
          <AlertCircle className="mt-[1px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
  optionalLabel?: boolean;
  containerClassName?: string;
  surface?: "public" | "admin";
}

export function TextField({
  label,
  error,
  hint,
  optionalLabel,
  containerClassName,
  className,
  surface = "public",
  required,
  ...props
}: TextFieldProps) {
  const id = useId();

  return (
    <FieldShell
      label={label}
      htmlFor={id}
      error={error}
      hint={hint}
      required={required}
      optionalLabel={optionalLabel}
      className={containerClassName}
    >
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") ||
          undefined
        }
        className={cn(
          controlBase,
          surface === "admin"
            ? "h-10 text-[13.5px] transition-[border-color,box-shadow] duration-150 ease-out"
            : "h-11 text-base sm:text-[15px]",
          error ? controlInvalid : controlIdle,
          className
        )}
        {...props}
      />
    </FieldShell>
  );
}

export interface TextAreaFieldProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
  optionalLabel?: boolean;
  containerClassName?: string;
}

export function TextAreaField({
  label,
  error,
  hint,
  optionalLabel,
  containerClassName,
  className,
  required,
  rows = 5,
  ...props
}: TextAreaFieldProps) {
  const id = useId();

  return (
    <FieldShell
      label={label}
      htmlFor={id}
      error={error}
      hint={hint}
      required={required}
      optionalLabel={optionalLabel}
      className={containerClassName}
    >
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") ||
          undefined
        }
        className={cn(
          controlBase,
          "resize-y py-2.5 text-base leading-[1.6] sm:text-[15px]",
          error ? controlInvalid : controlIdle,
          className
        )}
        {...props}
      />
    </FieldShell>
  );
}

export interface SelectFieldProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
  optionalLabel?: boolean;
  containerClassName?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function SelectField({
  label,
  error,
  hint,
  optionalLabel,
  containerClassName,
  className,
  required,
  options,
  placeholder,
  ...props
}: SelectFieldProps) {
  const id = useId();

  return (
    <FieldShell
      label={label}
      htmlFor={id}
      error={error}
      hint={hint}
      required={required}
      optionalLabel={optionalLabel}
      className={containerClassName}
    >
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") ||
          undefined
        }
        className={cn(
          controlBase,
          "h-11 text-base sm:text-[15px]",
          error ? controlInvalid : controlIdle,
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/**
 * Primary submit control.
 *
 * The label stays in place while pending and a spinner appears beside
 * it, rather than swapping the text. Swapping causes the button to
 * change width mid-click, which reads as a glitch at the exact moment
 * the user wants reassurance.
 */
export interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pending?: boolean;
  pendingLabel?: string;
  fullWidth?: boolean;
  variant?: "primary" | "outline";
  surface?: "public" | "admin";
}

export function SubmitButton({
  pending,
  pendingLabel,
  fullWidth = true,
  variant = "primary",
  surface = "public",
  className,
  children,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
        surface === "admin"
          ? "min-h-10 gap-2 px-4 text-[13.5px] font-semibold transition-[background-color,border-color,transform] duration-150 ease-out"
          : "min-h-12 gap-2.5 px-6 text-[14.5px] font-bold transition-[background-color,border-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
        variant === "primary"
          ? cn(
              "bg-[#EA580C] text-white hover:bg-[#C2410C]",
              surface === "public" && "shadow-[0_10px_26px_rgba(234,88,12,0.22)]"
            )
          : "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50",
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {pending && (
        <Loader2
          className="h-4 w-4 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

/** Form-level error, distinct from the per-field messages. */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[13.5px] font-medium leading-[1.55] text-red-700"
    >
      <AlertCircle className="mt-[1px] h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export function FormNotice({
  tone = "info",
  children,
}: {
  tone?: "info" | "success";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3.5 py-3 text-[13.5px] font-medium leading-[1.55]",
        tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-slate-50 text-slate-700"
      )}
    >
      {children}
    </div>
  );
}
