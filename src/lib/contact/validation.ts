import { z } from "zod";
import { attributionPairSchema } from "@/lib/analytics/attribution";

export const serviceOptions = [
  "IT Consulting & Services",
  "Data Center Solutions",
  "Cloud & Multicloud Solutions",
  "SAP ERP Consulting",
  "ELV & Smart Automation",
  "Software / Application Development",
  "Other",
] as const;

const singleLine = (max: number, requiredMessage: string) =>
  z.string().trim().min(1, requiredMessage).max(max, `Keep this under ${max} characters`).refine(
    (value) => !/[\r\n\u0000-\u001F\u007F]/.test(value),
    "Use a single line of text"
  );

export const contactSchema = z.strictObject({
  fullName: singleLine(100, "Enter your full name"),
  email: z.string().trim().pipe(z.email("Enter a valid email address").max(254, "Email address is too long")),
  phone: z.string().trim().min(1, "Enter your phone number").max(30, "Phone number is too long")
    .regex(/^[+\d][\d\s().-]{5,29}$/, "Enter a valid phone number"),
  company: z.string().trim().max(120, "Keep this under 120 characters")
    .refine((value) => !/[\r\n\u0000-\u001F\u007F]/.test(value), "Use a single line of text"),
  service: z.enum(serviceOptions, { error: "Select a service" }),
  requirement: z.string().trim().max(3000, "Keep this under 3000 characters"),
  website: z.string().max(200).default(""),
  attribution: attributionPairSchema.optional(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactField = keyof Omit<ContactInput, "website" | "attribution">;
