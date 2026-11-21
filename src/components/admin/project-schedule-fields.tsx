import { toDateInputValue } from "@/lib/project-dates";

const inputClassName = "flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm";

// Optional schedule shown on the public "Upcoming" calendar. Leave the start
// date empty for projects that aren't scheduled yet.
export function ProjectScheduleFields({
  startDate,
  endDate,
  location,
}: {
  startDate?: Date | null;
  endDate?: Date | null;
  location?: string | null;
}) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-border p-3">
      <legend className="px-1 text-sm font-medium text-brand-navy">Schedule (Upcoming calendar)</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm text-brand-navy/70">
          <span>Start date</span>
          <input name="startDate" type="date" defaultValue={toDateInputValue(startDate)} className={inputClassName} />
        </label>
        <label className="space-y-1 text-sm text-brand-navy/70">
          <span>End date (optional, for multi-day projects)</span>
          <input name="endDate" type="date" defaultValue={toDateInputValue(endDate)} className={inputClassName} />
        </label>
      </div>
      <input
        name="location"
        placeholder="Location (optional)"
        defaultValue={location ?? ""}
        className={inputClassName}
      />
      <p className="text-xs text-brand-navy/50">
        Projects with a start date appear on the public Upcoming page until their last day has passed.
      </p>
    </fieldset>
  );
}
