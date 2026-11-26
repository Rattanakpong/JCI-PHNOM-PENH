import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { createEvent } from "@/lib/actions/content-actions";
import { EventTemplateFields } from "@/components/admin/event-template-fields";

export default async function NewEventPage() {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "ADMIN"])) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Create Event</h1>

      <Card>
        <CardHeader>
          <CardTitle>New Event</CardTitle>
          <CardDescription>
            Every event page uses the same layout: fill in the numbered sections and they appear on the page in that
            order. Optional sections left empty are skipped.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createEvent} encType="multipart/form-data" className="space-y-3">
            <EventTemplateFields />
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              <input type="checkbox" name="published" defaultChecked />
              Publish now
            </label>
            <Button type="submit" size="sm">Create Event</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
