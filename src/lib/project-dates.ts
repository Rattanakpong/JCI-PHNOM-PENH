// Project schedules are date-only (no time of day). They're stored as UTC
// midnight of the chosen day and always read back in UTC, so a project set
// for 15 March shows as 15 March regardless of the server's or visitor's
// timezone.

/** "2026-03-15" (from <input type="date">) → Date at 2026-03-15T00:00:00Z, or null. */
export function parseDateInput(value: FormDataEntryValue | null): Date | null {
  const raw = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = new Date(`${raw}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Date → "2026-03-15" for an <input type="date"> defaultValue. */
export function toDateInputValue(date: Date | null | undefined): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

/** Day key used to match projects to calendar cells: "2026-03-15". */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Today's date as UTC midnight, in Phnom Penh time (UTC+7). */
export function todayInPhnomPenh(): Date {
  const local = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
}

/** A project is upcoming until its last day has passed. */
export function isUpcoming(startDate: Date | null, endDate: Date | null, today = todayInPhnomPenh()): boolean {
  const last = endDate ?? startDate;
  return !!last && last.getTime() >= today.getTime();
}

export function formatDateRange(startDate: Date, endDate: Date | null, locale: string): string {
  const fmt = new Intl.DateTimeFormat(locale === "km" ? "km-KH" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  if (!endDate || dayKey(endDate) === dayKey(startDate)) return fmt.format(startDate);
  return `${fmt.format(startDate)} – ${fmt.format(endDate)}`;
}

/** "Add to Google Calendar" link for an all-day project (end date is exclusive in Google's format). */
export function googleCalendarUrl({
  title,
  details,
  location,
  startDate,
  endDate,
}: {
  title: string;
  details?: string;
  location?: string | null;
  startDate: Date;
  endDate: Date | null;
}): string {
  const compact = (d: Date) => dayKey(d).replace(/-/g, "");
  const exclusiveEnd = new Date((endDate ?? startDate).getTime() + 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${compact(startDate)}/${compact(exclusiveEnd)}`,
  });
  if (details) params.set("details", details);
  if (location) params.set("location", location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
