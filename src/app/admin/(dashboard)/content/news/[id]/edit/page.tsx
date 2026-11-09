import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { updateNewsPost } from "@/lib/actions/content-actions";

export default async function EditNewsPostPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "BOARD_ADMIN"])) notFound();

  const { id } = await params;
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) notFound();

  const title = parseLocalizedText(post.title);
  const body = parseLocalizedText(post.body);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Edit News Post</h1>

      <Card>
        <CardHeader>
          <CardTitle>{title.en}</CardTitle>
          <CardDescription>Leave the cover photo empty to keep the current one.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateNewsPost} encType="multipart/form-data" className="space-y-3">
            <input type="hidden" name="id" value={post.id} />
            <input
              name="titleEn"
              placeholder="Title (English)"
              defaultValue={title.en}
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <textarea
              name="bodyEn"
              placeholder="Body (Markdown, English)"
              defaultValue={body.en}
              required
              rows={8}
              className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              Replace cover photo (optional)
              <input name="coverImage" type="file" accept="image/*" className="text-sm" />
            </label>
            <input
              name="coverCaption"
              placeholder="Cover photo caption (optional)"
              defaultValue={post.coverCaption ?? ""}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              <input type="checkbox" name="published" defaultChecked={!!post.publishedAt} />
              Published
            </label>
            <div className="flex gap-2">
              <Button type="submit" size="sm">Save Changes</Button>
              <Button type="button" size="sm" variant="outline" asChild>
                <a href="/admin/content/news">Cancel</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
