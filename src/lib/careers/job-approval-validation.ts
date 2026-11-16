import { z } from "zod";

export const jobIntentSchema = z.enum(["draft", "submit", "publish"]);

export const jobSubmissionSchema = z
  .object({
    jobId: z.string().uuid(),
  })
  .strict();

export const jobReviewSchema = z.discriminatedUnion("decision", [
  z.object({ jobId: z.string().uuid(), decision: z.literal("approve") }).strict(),
  z.object({
    jobId: z.string().uuid(),
    decision: z.literal("changes_requested"),
    reason: z.string().trim().min(1, "Enter the changes required").max(2000),
  }).strict(),
]);
