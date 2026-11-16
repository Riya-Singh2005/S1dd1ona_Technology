/**
 * Maps nested Zod paths back to the single form control that owns them.
 * For example, `responsibilities.0` belongs to the responsibilities
 * textarea and `hiringProcess.0.title` belongs to the hiring-process
 * textarea.
 */
export function normalizeJobFieldErrors(
  errors: Record<string, string>
): Record<string, string> {
  const normalized: Record<string, string> = {};

  for (const [path, message] of Object.entries(errors)) {
    const [field] = path.split(".");
    if (field && !normalized[field]) normalized[field] = message;
  }

  return normalized;
}
