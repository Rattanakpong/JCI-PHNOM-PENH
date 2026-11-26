import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { updatePartner } from "@/lib/actions/content-actions";

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "ADMIN"])) notFound();

  const { id } = await params;
  const partner = await prisma.partner.findUnique({ where: { id } });
  if (!partner) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Edit Partner</h1>

      <Card>
        <CardHeader>
          <CardTitle>{partner.name}</CardTitle>
          <CardDescription>Leave the logo field empty to keep the current image.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePartner} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={partner.id} />
            <input
              name="name"
              placeholder="Partner / sponsor name"
              defaultValue={partner.name}
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              name="websiteUrl"
              placeholder="Website link (optional)"
              defaultValue={partner.websiteUrl ?? ""}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              name="sortOrder"
              type="number"
              placeholder="Sort order"
              defaultValue={partner.sortOrder}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              Replace logo (optional)
              <input name="logo" type="file" accept="image/*" className="text-sm" />
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              <input type="checkbox" name="isActive" defaultChecked={partner.isActive} />
              Active
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
