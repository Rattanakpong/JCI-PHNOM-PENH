import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { createEvent } from "@/lib/actions/content-actions";

export default async function NewEventPage() {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "EVENT_ORGANIZER"])) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Create Event</h1>

      <Card>
        <CardHeader>
          <CardTitle>New Event</CardTitle>
          <CardDescription>
            Speakers: one &ldquo;Name | Role&rdquo; per line. Agenda: one &ldquo;Time | Activity&rdquo; per line.
            Tier 2 is optional — leave its name blank to skip it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createEvent} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-2">
            <input name="titleEn" placeholder="Title (English)" required className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2" />
            <textarea name="descriptionEn" placeholder="Description (English)" required rows={2} className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2" />
            <input name="location" placeholder="Location" required className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
            <input name="mapUrl" placeholder="Map URL (optional)" className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
            <label className="space-y-1 text-sm text-brand-navy/70">
              Start
              <input name="startAt" type="datetime-local" required className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-sm text-brand-navy/70">
              End
              <input name="endAt" type="datetime-local" required className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
            </label>
            <input name="telegramGroupUrl" placeholder="Telegram group URL (optional)" className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2" />
            <textarea name="speakers" placeholder={"Speakers, one per line: Name | Role"} rows={2} className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2" />
            <textarea name="agenda" placeholder={"Agenda, one per line: Time | Activity (e.g. 11:00 | Registration & Welcome)"} rows={3} className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2" />
            <label className="flex items-center gap-2 text-sm text-brand-navy/70 sm:col-span-2">
              Banner photo
              <input name="banner" type="file" accept="image/*" className="text-sm" />
            </label>

            <div className="grid gap-2 rounded-xl border border-border p-3 sm:col-span-2 sm:grid-cols-4">
              <input name="tier1Name" placeholder="Tier 1 name" required className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
              <input name="tier1Price" type="number" step="0.01" min="0" placeholder="Price USD" className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
              <input name="tier1Capacity" type="number" min="1" placeholder="Capacity" className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
              <label className="space-y-1 text-xs text-brand-navy/60">
                Sale ends (optional)
                <input name="tier1SaleEndsAt" type="datetime-local" className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
              </label>
            </div>
            <div className="grid gap-2 rounded-xl border border-border p-3 sm:col-span-2 sm:grid-cols-4">
              <input name="tier2Name" placeholder="Tier 2 name (optional)" className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
              <input name="tier2Price" type="number" step="0.01" min="0" placeholder="Price USD" className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
              <input name="tier2Capacity" type="number" min="1" placeholder="Capacity" className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
              <label className="space-y-1 text-xs text-brand-navy/60">
                Sale ends (optional)
                <input name="tier2SaleEndsAt" type="datetime-local" className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              <input type="checkbox" name="published" defaultChecked />
              Publish now
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm">Create Event</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
