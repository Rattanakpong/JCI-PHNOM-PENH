// SQLite has no native Json or array column type, so localized text and
// string[] fields are stored as JSON-encoded `String` columns
// (prisma/schema.prisma). These helpers keep the encode/decode in one place.

export type LocalizedText = { en: string; km: string };

export function toJsonField(value: unknown): string {
  return JSON.stringify(value);
}

export function parseLocalizedText(raw: string): LocalizedText {
  return JSON.parse(raw) as LocalizedText;
}

export function parseStringArray(raw: string): string[] {
  return JSON.parse(raw) as string[];
}
