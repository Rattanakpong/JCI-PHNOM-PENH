import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { updateSlide } from "@/lib/actions/content-actions";

const SLIDE_CATEGORIES = ["NEWS", "EVENT", "SPONSOR", "MEMBER"] as const;

export default async function EditSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "BOARD_ADMIN"])) notFound();

  const { id } = await params;
  const slide = await prisma.slide.findUnique({ where: { id } });
  if (!slide) notFound();

  const title = parseLocalizedText(slide.title);
  const description = slide.description ? parseLocalizedText(slide.description) : null;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Edit Slide</h1>

      <Card>
        <CardHeader>
          <CardTitle>{title.en}</CardTitle>
          <CardDescription>Leave the image field empty to keep the current image.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateSlide} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={slide.id} />
            <input
              name="titleEn"
              placeholder="Title (English)"
              defaultValue={title.en}
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            />
            <textarea
              name="descriptionEn"
              placeholder="Caption (optional)"
              defaultValue={description?.en ?? ""}
              rows={2}
              className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            />
            <select
              name="category"
              defaultValue={slide.category}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            >
              {SLIDE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0) + c.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <input
              name="sortOrder"
              type="number"
              placeholder="Sort order"
              defaultValue={slide.sortOrder}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="linkUrl"
              placeholder="Link when clicked (optional)"
              defaultValue={slide.linkUrl ?? ""}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            />
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              Replace image (optional)
              <input name="image" type="file" accept="image/*" className="text-sm" />
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              <input type="checkbox" name="isActive" defaultChecked={slide.isActive} />
              Active
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" size="sm">Save Changes</Button>
              <Button type="button" size="sm" variant="outline" asChild>
                <a href="/admin/content/homepage">Cancel</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
