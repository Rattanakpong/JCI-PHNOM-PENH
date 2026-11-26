import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { updatePastPresident } from "@/lib/actions/content-actions";

export default async function EditPastPresidentPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "ADMIN"])) notFound();

  const { id } = await params;
  const pastPresident = await prisma.pastPresident.findUnique({ where: { id } });
  if (!pastPresident) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Edit Past President</h1>

      <Card>
        <CardHeader>
          <CardTitle>{pastPresident.name}</CardTitle>
          <CardDescription>Leave the photo field empty to keep the current image.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePastPresident} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={pastPresident.id} />
            <input
              name="name"
              placeholder="Name"
              defaultValue={pastPresident.name}
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              name="year"
              placeholder="Year (e.g. 2019 or 2019–2020)"
              defaultValue={pastPresident.year}
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="sortOrder"
              type="number"
              placeholder="Sort order"
              defaultValue={pastPresident.sortOrder}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-brand-navy/70 sm:col-span-2">
              Replace photo (optional)
              <input name="photo" type="file" accept="image/*" className="text-sm" />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" size="sm">Save Changes</Button>
              <Button type="button" size="sm" variant="outline" asChild>
                <a href="/admin/content/people">Cancel</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
