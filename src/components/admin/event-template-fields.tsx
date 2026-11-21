import { FormStep as Step, inputClassName, textareaClassName } from "@/components/admin/form-step";
import type { EventPhoto } from "@/lib/event-extras";

export type EventFormValues = {
  title: string;
  description: string;
  startAt: string; // datetime-local value
  endAt: string;
  location: string;
  mapUrl: string;
  highlights: string[];
  agendaText: string; // "Time | Activity" per line
  speakersText: string; // "Name | Role" per line
  tiers: Array<{ name: string; price: string; capacity: string; saleEndsAt: string }>;
  telegramGroupUrl: string;
  photos: EventPhoto[];
};

// Every event page has the same sections, so the create and edit forms walk
// through them in page order. `editing` switches the banner and photo inputs
// to "replace" / "add more" wording and lists current photos for removal.
export function EventTemplateFields({ values, editing = false }: { values?: EventFormValues; editing?: boolean }) {
  const tiers = [0, 1].map((i) => values?.tiers[i] ?? { name: "", price: "", capacity: "", saleEndsAt: "" });

  return (
    <div className="space-y-4">
      <Step number={1} title="Event name" hint="The big title on the event banner.">
        <input
          name="titleEn"
          placeholder="e.g. GMM March 2026: Leading Through Change"
          defaultValue={values?.title}
          required
          className={inputClassName}
        />
      </Step>

      <Step number={2} title="About this event" hint="What the event is and who it's for. Shown under “About This Event”.">
        <textarea name="descriptionEn" required rows={4} defaultValue={values?.description} className={textareaClassName} />
      </Step>

      <Step number={3} title="Date & time" hint="Shown in the schedule box and on the events calendar.">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-xs text-brand-navy/60">
            Starts
            <input name="startAt" type="datetime-local" required defaultValue={values?.startAt} className={inputClassName} />
          </label>
          <label className="grid gap-1 text-xs text-brand-navy/60">
            Ends
            <input name="endAt" type="datetime-local" required defaultValue={values?.endAt} className={inputClassName} />
          </label>
        </div>
      </Step>

      <Step number={4} title="Location" hint="The venue name, plus a Google Maps link for the “View on Map” button.">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="location"
            placeholder="Venue, e.g. Raffles Hotel Le Royal"
            required
            defaultValue={values?.location}
            className={inputClassName}
          />
          <input
            name="mapUrl"
            placeholder="Map link (optional)"
            defaultValue={values?.mapUrl}
            className={inputClassName}
          />
        </div>
      </Step>

      <Step
        number={5}
        title="Banner photo"
        hint={editing ? "Leave empty to keep the current banner." : "The wide photo at the top of the event page."}
      >
        <input name="banner" type="file" accept="image/*" className="text-sm font-normal" />
      </Step>

      <Step number={6} title="What you'll gain" optional hint="One per line, shown as a checklist under the description.">
        <textarea
          name="highlights"
          rows={3}
          placeholder={"Practical tips on leading teams\nNetworking with 100+ young leaders"}
          defaultValue={values?.highlights.join("\n")}
          className={textareaClassName}
        />
      </Step>

      <Step number={7} title="Agenda" optional hint="One item per line as “Time | Activity”.">
        <textarea
          name="agenda"
          rows={4}
          placeholder={"11:00 | Registration & Welcome\n11:30 | Keynote"}
          defaultValue={values?.agendaText}
          className={textareaClassName}
        />
      </Step>

      <Step number={8} title="Speakers" optional hint="One speaker per line as “Name | Role”.">
        <textarea
          name="speakers"
          rows={3}
          placeholder={"Sok Dara | Founder, Dara Accounting"}
          defaultValue={values?.speakersText}
          className={textareaClassName}
        />
      </Step>

      <Step
        number={9}
        title="Tickets"
        hint={
          editing
            ? "Price 0 makes a ticket free. A blank ticket name leaves that ticket unchanged."
            : "At least one ticket type. Price 0 makes it free. Leave ticket 2 blank to skip it."
        }
      >
        {tiers.map((tier, i) => {
          const prefix = `tier${i + 1}`;
          return (
            <div key={prefix} className="grid gap-2 rounded-lg bg-muted/50 p-3 sm:grid-cols-4">
              <label className="grid gap-1 text-xs text-brand-navy/60">
                Ticket {i + 1} name{i === 1 && " (optional)"}
                <input
                  name={`${prefix}Name`}
                  placeholder={i === 0 ? "e.g. Member" : "e.g. Guest"}
                  required={i === 0 && !editing}
                  defaultValue={tier.name}
                  className={inputClassName}
                />
              </label>
              <label className="grid gap-1 text-xs text-brand-navy/60">
                Price (USD)
                <input
                  name={`${prefix}Price`}
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={tier.price}
                  className={inputClassName}
                />
              </label>
              <label className="grid gap-1 text-xs text-brand-navy/60">
                Seats
                <input name={`${prefix}Capacity`} type="number" min="1" defaultValue={tier.capacity} className={inputClassName} />
              </label>
              <label className="grid gap-1 text-xs text-brand-navy/60">
                Sale ends (optional)
                <input
                  name={`${prefix}SaleEndsAt`}
                  type="datetime-local"
                  defaultValue={tier.saleEndsAt}
                  className={inputClassName}
                />
              </label>
            </div>
          );
        })}
      </Step>

      <Step
        number={10}
        title="Telegram group"
        optional
        hint="Private: only shown to people after they register and pay. Not visible on the public page."
      >
        <input
          name="telegramGroupUrl"
          placeholder="https://t.me/..."
          defaultValue={values?.telegramGroupUrl}
          className={inputClassName}
        />
      </Step>

      <Step
        number={11}
        title="Event photos"
        optional
        hint="Add photos after the event; they appear as a gallery visitors can open full screen."
      >
        {editing && values && values.photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {values.photos.map((photo) => (
              <label key={photo.url} className="group relative block cursor-pointer text-xs text-brand-navy/70">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded URL, thumbnail only */}
                <img src={photo.url} alt={photo.caption} className="aspect-square w-full rounded-lg object-cover" />
                <span className="mt-1 flex items-center gap-1.5">
                  <input type="checkbox" name="removePhoto" value={photo.url} />
                  Remove
                </span>
              </label>
            ))}
          </div>
        )}
        <input name="eventPhotos" type="file" accept="image/*" multiple className="text-sm font-normal" />
        <textarea
          name="eventPhotoCaptions"
          rows={2}
          placeholder="Captions, one per line, in the same order as the photos (optional)"
          className={textareaClassName}
        />
      </Step>
    </div>
  );
}
