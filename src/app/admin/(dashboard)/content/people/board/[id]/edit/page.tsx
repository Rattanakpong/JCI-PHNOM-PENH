import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { updateBoardMember } from "@/lib/actions/content-actions";

export default async function EditBoardMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "BOARD_ADMIN"])) notFound();

  const { id } = await params;
  const member = await prisma.boardMember.findUnique({ where: { id } });
  if (!member) notFound();

  const title = parseLocalizedText(member.title);

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Edit Board Member</h1>

      <Card>
        <CardHeader>
          <CardTitle>{member.name}</CardTitle>
          <CardDescription>Leave the photo field empty to keep the current photo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateBoardMember} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={member.id} />
            <input
              name="name"
              placeholder="Name"
              defaultValue={member.name}
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              name="titleEn"
              placeholder="Title (e.g. VP of Projects)"
              defaultValue={title.en}
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="sortOrder"
              type="number"
              placeholder="Sort order"
              defaultValue={member.sortOrder}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="committee"
              placeholder="Committee (blank = Executive Board)"
              defaultValue={member.committee ?? ""}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            />
            <label className="flex h-10 items-center gap-2 text-sm text-brand-navy/70 sm:col-span-2">
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
