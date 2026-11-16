"use client";

import { useRef, useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { FormError, SelectField, SubmitButton, TextAreaField, TextField } from "@/components/careers/form-fields";
import { contactSchema, serviceOptions, type ContactField } from "@/lib/contact/validation";
import { getStoredAttribution } from "@/lib/analytics/attribution";
import { sendAnalyticsEvent } from "@/lib/analytics/ga";
import styles from "./contact-form.module.css";

type Values = Record<ContactField, string>;
type Errors = Partial<Record<ContactField, string>>;

const initialValues: Values = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  requirement: "",
};

export function ContactForm({ inDialog = false }: { inDialog?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [formError, setFormError] = useState("");

  function update(field: ContactField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setFormError("");

    const website = new FormData(event.currentTarget).get("website")?.toString() ?? "";
    const result = contactSchema.safeParse({
      ...values,
      website,
      attribution: getStoredAttribution(),
    });
    if (!result.success) {
      const nextErrors: Errors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as ContactField;
        if (field in values && !nextErrors[field]) nextErrors[field] = issue.message;
      }
      setErrors(nextErrors);
      const first = Object.keys(nextErrors)[0];
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      if (!response.ok) throw new Error("Delivery failed");
      sendAnalyticsEvent("generate_lead", { lead_type: "contact_inquiry" });
      setStatus("success");
    } catch {
      setStatus("idle");
      setFormError("We couldn't submit your inquiry right now. Please try again or contact us directly.");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className={inDialog ? styles.success : "flex min-h-[360px] flex-col items-start justify-center rounded-2xl bg-white p-7 shadow-[0_14px_40px_rgba(15,23,42,0.07)] sm:p-10"}>
        <CheckCircle2 className="h-9 w-9 text-[#EA580C]" aria-hidden="true" />
        <h3 className="mt-6 font-jakarta text-2xl font-bold tracking-[-0.025em] text-slate-950">Thank you for contacting Siddiona Technologies.</h3>
        <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">We&apos;ve received your inquiry and our team will get back to you shortly.</p>
        <button type="button" onClick={() => { setValues(initialValues); setErrors({}); setStatus("idle"); }} className="mt-8 text-sm font-semibold text-[#C2410C] underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]">Submit another inquiry</button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className={inDialog ? styles.form : "rounded-2xl bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.07)] sm:p-8 lg:p-10"} aria-label="Contact Siddiona Technologies">
      <div className={inDialog ? styles.body : undefined}>
      <p className={inDialog ? styles.requiredNote : "mb-6 text-sm text-slate-600"}>Fields marked <span className="font-semibold text-[#C2410C]">*</span> are required.</p>
      <div className={inDialog ? styles.fields : "grid gap-5 sm:grid-cols-2"}>
        <TextField name="fullName" label="Full Name" required autoComplete="name" maxLength={100} value={values.fullName} onChange={(event) => update("fullName", event.target.value)} error={errors.fullName} />
        <TextField name="email" label="Email Address" type="email" required autoComplete="email" maxLength={254} value={values.email} onChange={(event) => update("email", event.target.value)} error={errors.email} />
        <TextField name="phone" label="Phone Number" type="tel" required autoComplete="tel" inputMode="tel" maxLength={30} value={values.phone} onChange={(event) => update("phone", event.target.value)} error={errors.phone} />
        <TextField name="company" label="Company Name" optionalLabel autoComplete="organization" maxLength={120} value={values.company} onChange={(event) => update("company", event.target.value)} error={errors.company} />
        <SelectField name="service" label="Service Required" required containerClassName="sm:col-span-2" placeholder="Select a service" options={serviceOptions.map((service) => ({ value: service, label: service }))} value={values.service} onChange={(event) => update("service", event.target.value)} error={errors.service} />
        <TextAreaField name="requirement" label="Briefly Tell Us About Your Requirement" optionalLabel containerClassName="sm:col-span-2" rows={5} maxLength={3000} placeholder="Share a brief overview of your project, requirement, or business need." value={values.requirement} onChange={(event) => update("requirement", event.target.value)} error={errors.requirement} />
      </div>
      </div>
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <div className={inDialog ? styles.actions : "mt-7 space-y-4"}>
        <FormError message={formError} />
        <SubmitButton pending={status === "submitting"} pendingLabel="Submitting inquiry" fullWidth={false} className={inDialog ? styles.submit : undefined}>Submit Inquiry</SubmitButton>
        {inDialog && (
          <p className={styles.mobileContact}>
            Prefer email? HR: <a href="mailto:hr@example.com">hr@example.com</a>
            {" · "}
            Technical: <a href="mailto:tech@example.com">tech@example.com</a>
          </p>
        )}
      </div>
    </form>
  );
}
