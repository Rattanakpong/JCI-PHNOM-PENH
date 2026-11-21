import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { updateNewsPost } from "@/lib/actions/content-actions";
import { parseNewsBody, toTemplateDraft } from "@/lib/news-article";
import { NewsTemplateFields } from "@/components/admin/news-template-fields";

export default async function EditNewsPostPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "BOARD_ADMIN"])) notFound();

  const { id } = await params;
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) notFound();

  const title = parseLocalizedText(post.title);
  const body = parseNewsBody(post.body);
  const imageBlockCount = body.blocks.filter((block) => block.type === "image").length;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Edit News Post</h1>

      <Card>
        <CardHeader>
          <CardTitle>{title.en}</CardTitle>
          <CardDescription>Leave the cover photo empty to keep the current one.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateNewsPost} encType="multipart/form-data" className="space-y-3">
            <input type="hidden" name="id" value={post.id} />
            {body.layout !== "template" && (
              <div className="rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-4 py-3 text-sm text-brand-navy/80">
                <p className="font-semibold text-brand-navy">This article was written before the news template.</p>
                <p className="mt-1">
                  Its text has been placed into the template below — the first paragraph as the opening summary and the
                  rest as the main story. Check each section and fill in anything missing, then save to switch it to
                  the new layout.
                  {imageBlockCount > 0 &&
                    ` Its ${imageBlockCount} in-article photo${imageBlockCount === 1 ? "" : "s"} will move to the photo gallery.`}
                </p>
              </div>
            )}
            <NewsTemplateFields
              title={title.en}
              template={toTemplateDraft(body)}
              coverCaption={post.coverCaption ?? ""}
              editing
            />
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              <input type="checkbox" name="published" defaultChecked={!!post.publishedAt} />
              Published
            </label>
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Save Changes
              </Button>
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
