/** Turns a job title into a URL-safe segment no longer than 120 characters. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    // Strip combining marks left behind by the NFKD decomposition.
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    // Truncation can land on the separator before the next word.
    .replace(/-+$/g, "");
}

/**
 * Keep a legacy or deliberately customized URL stable when an edit does not
 * change the title. Once the title changes, it becomes the source of truth.
 */
export function slugForJobUpdate(
  title: string,
  existingTitle: string,
  existingSlug: string
): string {
  return title.trim() === existingTitle.trim() ? existingSlug : slugify(title);
}
