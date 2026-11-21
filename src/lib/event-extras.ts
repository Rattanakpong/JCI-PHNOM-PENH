import type { LocalizedText } from "@/lib/json-field";
import { isSafeImageUrl } from "@/lib/news-article";

// Optional event-page sections stored alongside the description in the
// `description` JSON column ({ en, km, highlights?, photos? }), so they need
// no schema change. Older events simply have neither.
export type EventPhoto = { url: string; caption: string };
export type EventExtras = { highlights: string[]; photos: EventPhoto[] };

type StoredDescription = LocalizedText & { highlights?: unknown; photos?: unknown };

export function parseEventExtras(rawDescription: string): EventExtras {
  const stored = JSON.parse(rawDescription) as StoredDescription;
  const highlights = Array.isArray(stored.highlights)
    ? stored.highlights.filter((h): h is string => typeof h === "string" && h.trim() !== "").map((h) => h.trim())
    : [];
  const photos = Array.isArray(stored.photos)
    ? stored.photos.flatMap((p) => {
        if (!p || typeof p !== "object") return [];
        const { url, caption } = p as Record<string, unknown>;
        if (typeof url !== "string" || !isSafeImageUrl(url)) return [];
        return [{ url, caption: typeof caption === "string" ? caption.trim() : "" }];
      })
    : [];
  return { highlights, photos };
}

export function serializeEventDescription(text: string, extras: EventExtras): string {
  const stored: StoredDescription = { en: text, km: text };
  if (extras.highlights.length > 0) stored.highlights = extras.highlights;
  if (extras.photos.length > 0) stored.photos = extras.photos;
  return JSON.stringify(stored);
}
