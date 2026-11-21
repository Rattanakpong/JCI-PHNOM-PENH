import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { updateEvent } from "@/lib/actions/event-actions";
import { EventTemplateFields, type EventFormValues } from "@/components/admin/event-template-fields";
import { parseEventExtras } from "@/lib/event-extras";

// Matches the datetime-local input format using the server runtime's local
// getters — consistent with how `new Date(startAt)` on create interprets a
// timezone-less datetime-local string in that same runtime.
function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "EVENT_ORGANIZER"])) notFound();

  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { ticketTiers: { orderBy: { sortOrder: "asc" } } },
  });
  if (!event) notFound();

  const title = parseLocalizedText(event.title);
  const description = parseLocalizedText(event.description);
  const extras = parseEventExtras(event.description);
  const speakers = JSON.parse(event.speakers) as { name: string; title: string }[];
  const agenda = JSON.parse(event.agenda) as { time: string; title: string }[];
  const speakersText = speakers.map((s) => `${s.name} | ${s.title}`).join("\n");
  const agendaText = agenda.map((a) => `${a.time} | ${a.title}`).join("\n");
  const values: EventFormValues = {
    title: title.en,
    description: description.en,
    startAt: toDatetimeLocalValue(event.startAt),
    endAt: toDatetimeLocalValue(event.endAt),
    location: event.location,
    mapUrl: event.mapUrl ?? "",
    highlights: extras.highlights,
    agendaText,
    speakersText,
    tiers: event.ticketTiers.slice(0, 2).map((tier) => ({
      name: parseLocalizedText(tier.name).en,
      price: String(tier.priceUsd),
      capacity: String(tier.capacity),
      saleEndsAt: tier.saleEndsAt ? toDatetimeLocalValue(tier.saleEndsAt) : "",
    })),
    telegramGroupUrl: event.telegramGroupUrl ?? "",
    photos: extras.photos,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Edit Event</h1>

      <Card>
        <CardHeader>
          <CardTitle>{title.en}</CardTitle>
          <CardDescription>
            Same sections as the event page, top to bottom. Leave the banner empty to keep the current one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateEvent} encType="multipart/form-data" className="space-y-3">
            <input type="hidden" name="id" value={event.id} />
            <EventTemplateFields values={values} editing />
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              <input type="checkbox" name="published" defaultChecked={event.published} />
              Published
            </label>
            <div className="flex gap-2">
              <Button type="submit" size="sm">Save Changes</Button>
              <Button type="button" size="sm" variant="outline" asChild>
                <a href="/admin/events">Cancel</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
