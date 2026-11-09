import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { deleteEvent, toggleEventPublished } from "@/lib/actions/event-actions";

export default async function AdminEventsPage() {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "EVENT_ORGANIZER"])) notFound();

  const events = await prisma.event.findMany({
    orderBy: { startAt: "desc" },
    include: { _count: { select: { registrations: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">Events</h1>
        <Button asChild>
          <Link href="/admin/events/new">Create Event</Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs font-semibold uppercase text-brand-navy/60">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Registrations</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const title = parseLocalizedText(event.title);
              return (
                <tr key={event.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-brand-navy">{title.en}</td>
                  <td className="px-4 py-3 text-brand-navy/70">
                    {event.startAt.toISOString().slice(0, 10)} – {event.endAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 text-brand-navy/70">{event._count.registrations}</td>
                  <td className="px-4 py-3">
                    <Badge variant={event.published ? "success" : "outline"}>
                      {event.published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <form action={toggleEventPublished}>
                        <input type="hidden" name="id" value={event.id} />
                        <Button type="submit" size="sm" variant="outline">
                          {event.published ? "Unpublish" : "Publish"}
                        </Button>
                      </form>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/events/${event.id}/edit`}>Edit</Link>
                      </Button>
                      <ConfirmDeleteForm
                        action={deleteEvent}
                        id={event.id}
                        confirmMessage={`Delete the event "${title.en}"? This also removes its ticket tiers and registrations. This cannot be undone.`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-brand-navy/50">
                  No events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
