import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { updateEvent } from "@/lib/actions/event-actions";

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
  const speakers = JSON.parse(event.speakers) as { name: string; title: string }[];
  const agenda = JSON.parse(event.agenda) as { time: string; title: string }[];
  const speakersText = speakers.map((s) => `${s.name} | ${s.title}`).join("\n");
  const agendaText = agenda.map((a) => `${a.time} | ${a.title}`).join("\n");
  const [tier1, tier2] = event.ticketTiers;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Edit Event</h1>

      <Card>
        <CardHeader>
          <CardTitle>{title.en}</CardTitle>
          <CardDescription>
            Leave the banner field empty to keep the current image. A blank tier name leaves that
            tier unchanged.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateEvent} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={event.id} />
            <input name="titleEn" placeholder="Title (English)" defaultValue={title.en} required className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2" />
            <textarea name="descriptionEn" placeholder="Description (English)" defaultValue={description.en} required rows={2} className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2" />
            <input name="location" placeholder="Location" defaultValue={event.location} required className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
            <input name="mapUrl" placeholder="Map URL (optional)" defaultValue={event.mapUrl ?? ""} className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
            <label className="space-y-1 text-sm text-brand-navy/70">
              Start
              <input name="startAt" type="datetime-local" defaultValue={toDatetimeLocalValue(event.startAt)} required className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-sm text-brand-navy/70">
              End
              <input name="endAt" type="datetime-local" defaultValue={toDatetimeLocalValue(event.endAt)} required className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
            </label>
            <input name="telegramGroupUrl" placeholder="Telegram group URL (optional)" defaultValue={event.telegramGroupUrl ?? ""} className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2" />
            <textarea name="speakers" placeholder={"Speakers, one per line: Name | Role"} defaultValue={speakersText} rows={2} className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2" />
            <textarea name="agenda" placeholder={"Agenda, one per line: Time | Activity"} defaultValue={agendaText} rows={3} className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2" />
            <label className="flex items-center gap-2 text-sm text-brand-navy/70 sm:col-span-2">
              Replace banner photo (optional)
              <input name="banner" type="file" accept="image/*" className="text-sm" />
            </label>

            <div className="grid gap-2 rounded-xl border border-border p-3 sm:col-span-2 sm:grid-cols-4">
              <input name="tier1Name" placeholder="Tier 1 name" defaultValue={tier1 ? parseLocalizedText(tier1.name).en : ""} className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
              <input name="tier1Price" type="number" step="0.01" min="0" placeholder="Price USD" defaultValue={tier1?.priceUsd} className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
              <input name="tier1Capacity" type="number" min="1" placeholder="Capacity" defaultValue={tier1?.capacity} className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
              <label className="space-y-1 text-xs text-brand-navy/60">
                Sale ends (optional)
                <input name="tier1SaleEndsAt" type="datetime-local" defaultValue={tier1?.saleEndsAt ? toDatetimeLocalValue(tier1.saleEndsAt) : ""} className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
              </label>
            </div>
            <div className="grid gap-2 rounded-xl border border-border p-3 sm:col-span-2 sm:grid-cols-4">
              <input name="tier2Name" placeholder="Tier 2 name (optional)" defaultValue={tier2 ? parseLocalizedText(tier2.name).en : ""} className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
              <input name="tier2Price" type="number" step="0.01" min="0" placeholder="Price USD" defaultValue={tier2?.priceUsd} className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
              <input name="tier2Capacity" type="number" min="1" placeholder="Capacity" defaultValue={tier2?.capacity} className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
              <label className="space-y-1 text-xs text-brand-navy/60">
                Sale ends (optional)
                <input name="tier2SaleEndsAt" type="datetime-local" defaultValue={tier2?.saleEndsAt ? toDatetimeLocalValue(tier2.saleEndsAt) : ""} className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              <input type="checkbox" name="published" defaultChecked={event.published} />
              Published
            </label>
            <div className="flex gap-2 sm:col-span-2">
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
