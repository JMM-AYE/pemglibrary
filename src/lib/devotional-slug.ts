/** Devotional slugs carry the language: rhapsody-<language>-<date>-<title>. */
export function slugifyPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function devotionalSlug(language: string, date: string, title: string) {
  return `rhapsody-${slugifyPart(language)}-${date}-${slugifyPart(title)}`.slice(0, 110);
}

export function languageFromSlug(slug: string): string | null {
  const match = /^rhapsody-([a-z0-9-]+?)-\d{4}-\d{2}-\d{2}-/.exec(slug);
  return match ? (match[1] ?? null) : null;
}
