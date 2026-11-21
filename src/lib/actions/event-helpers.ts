// Shared parsing helpers for the event create/update forms. Plain module
// (not "use server") — exporting non-action helpers from a "use server" file
// would be rejected by Next.js, which requires every export of such a file
// to be an async server action.
import { saveUploadedFile } from "@/lib/storage";
import type { EventExtras, EventPhoto } from "@/lib/event-extras";
export function parseSpeakers(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, title] = line.split("|").map((part) => part.trim());
      return { name: name ?? line, title: title ?? "" };
    });
}

export function parseAgenda(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [time, title] = line.split("|").map((part) => part.trim());
      return { time: time ?? "", title: title ?? line };
    });
}

// "What you'll gain" (one per line) and the event photo gallery: keeps the
// existing photos minus any ticked for removal, then appends new uploads.
// Captions for new photos are one per line, in the order they were selected.
export async function readEventExtras(formData: FormData, existingPhotos: EventPhoto[] = []): Promise<EventExtras> {
  const highlights = String(formData.get("highlights") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const removed = new Set(formData.getAll("removePhoto").map(String));
  const kept = existingPhotos.filter((photo) => !removed.has(photo.url));

  const files = formData.getAll("eventPhotos").filter((f): f is File => f instanceof File && f.size > 0);
  const captions = String(formData.get("eventPhotoCaptions") ?? "")
    .split("\n")
    .map((c) => c.trim());
  const urls = await Promise.all(files.map((f) => saveUploadedFile(f, "events")));

  return { highlights, photos: [...kept, ...urls.map((url, i) => ({ url, caption: captions[i] ?? "" }))] };
}
