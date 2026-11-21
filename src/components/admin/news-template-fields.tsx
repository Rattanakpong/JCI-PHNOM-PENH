import type { NewsTemplate } from "@/lib/news-article";
import { FormStep as Step, inputClassName, textareaClassName } from "@/components/admin/form-step";

// Every news article follows the same template, so the form mirrors the
// article top to bottom: each numbered step is one section of the page.
// Shared by the "add" and "edit" forms; `editing` switches the cover and
// gallery inputs to "replace" / "add more" wording.
export function NewsTemplateFields({
  title = "",
  template,
  coverCaption = "",
  editing = false,
}: {
  title?: string;
  template?: NewsTemplate | null;
  coverCaption?: string;
  editing?: boolean;
}) {
  return (
    <div className="space-y-4">
      <Step number={1} title="Headline" hint="The big blue title at the top of the article.">
        <input
          name="titleEn"
          placeholder="e.g. JCI Phnom Penh hosts Sharing of Smile 2026"
          defaultValue={title}
          required
          className={inputClassName}
        />
      </Step>

      <Step number={2} title="Event details" hint="Shown as a small info bar under the headline. Both optional.">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-xs text-brand-navy/60">
            Event date
            <input name="eventDate" type="date" defaultValue={template?.eventDate ?? ""} className={inputClassName} />
          </label>
          <label className="grid gap-1 text-xs text-brand-navy/60">
            Location
            <input
              name="location"
              placeholder="e.g. Sofitel Phnom Penh Phokeethra"
              defaultValue={template?.location ?? ""}
              className={inputClassName}
            />
          </label>
        </div>
      </Step>

      <Step
        number={3}
        title="Cover photo"
        hint={editing ? "Leave empty to keep the current photo." : "The main photo, shown after the opening summary."}
      >
        <input name="coverImage" type="file" accept="image/*" className="text-sm font-normal" />
        <input
          name="coverCaption"
          placeholder="Caption (optional)"
          defaultValue={coverCaption}
          className={inputClassName}
        />
      </Step>

      <Step
        number={4}
        title="Opening summary"
        hint="One short paragraph: what happened, when, where and who. “Phnom Penh, [date] —” is added in front automatically."
      >
        <textarea
          name="summary"
          required
          rows={3}
          defaultValue={template?.summary ?? ""}
          className={textareaClassName}
        />
      </Step>

      <Step
        number={5}
        title="Main story"
        hint="The full story. Leave a blank line between paragraphs. Text in “double quotes” is shown in bold italic."
      >
        <textarea name="story" required rows={8} defaultValue={template?.story ?? ""} className={textareaClassName} />
      </Step>

      <Step number={6} title="Quote" optional hint="A highlighted quote from a speaker, guest or the President.">
        <textarea
          name="quoteText"
          rows={2}
          placeholder="What they said"
          defaultValue={template?.quote?.text ?? ""}
          className={textareaClassName}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="quoteName"
            placeholder="Speaker name"
            defaultValue={template?.quote?.name ?? ""}
            className={inputClassName}
          />
          <input
            name="quoteRole"
            placeholder="Role, e.g. 2026 Local President"
            defaultValue={template?.quote?.role ?? ""}
            className={inputClassName}
          />
        </div>
      </Step>

      <Step number={7} title="Key highlights" optional hint="One per line, shown as a checklist.">
        <textarea
          name="highlights"
          rows={4}
          placeholder={"120 students received school supplies\n35 volunteers took part"}
          defaultValue={template?.highlights.join("\n") ?? ""}
          className={textareaClassName}
        />
      </Step>

      <Step
        number={8}
        title="Thanks & closing"
        optional
        hint="Thank partners, sponsors and volunteers, or add a closing note."
      >
        <textarea name="closing" rows={3} defaultValue={template?.closing ?? ""} className={textareaClassName} />
      </Step>

      <Step
        number={9}
        title={editing ? "Add more gallery photos" : "Photo gallery"}
        optional
        hint={
          editing
            ? "New photos are added after the existing ones. Remove photos under “News Photos” on the News page."
            : "Select as many photos as you like. Visitors can open each one full screen."
        }
      >
        <input name="photos" type="file" accept="image/*" multiple className="text-sm font-normal" />
        <textarea
          name="captions"
          rows={2}
          placeholder="Captions, one per line, in the same order as the photos (optional)"
          className={textareaClassName}
        />
      </Step>
    </div>
  );
}
