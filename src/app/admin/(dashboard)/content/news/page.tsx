import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import {
  createNewsPost,
  addNewsPhotos,
  toggleNewsPostPublished,
  deleteNewsPost,
  deleteNewsPhoto,
} from "@/lib/actions/content-actions";

export default async function AdminNewsPage() {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "BOARD_ADMIN"])) notFound();

  const posts = await prisma.newsPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-brand-navy">News</h1>

      <Card>
        <CardHeader>
          <CardTitle>News Posts</CardTitle>
          <CardDescription>New posts publish immediately when &ldquo;Publish now&rdquo; is checked.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={createNewsPost} encType="multipart/form-data" className="space-y-3">
            <input
              name="titleEn"
              placeholder="Title (English)"
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <textarea
              name="bodyEn"
              placeholder="Body (Markdown, English)"
              required
              rows={3}
              className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              Cover photo
              <input name="coverImage" type="file" accept="image/*" className="text-sm" />
            </label>
            <input
              name="coverCaption"
              placeholder="Cover photo caption (optional)"
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              <input type="checkbox" name="published" />
              Publish now
            </label>
            <Button type="submit" size="sm">Add News Post</Button>
          </form>

          <ul className="space-y-2">
            {posts.map((post) => {
              const title = parseLocalizedText(post.title);
              return (
                <li key={post.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm">
                  <div>
                    <span className="font-medium text-brand-navy">{title.en}</span>
                    <span className="ml-2 text-xs text-brand-navy/50">
                      {post.photos.length > 0
                        ? `${post.photos.length} gallery photo${post.photos.length === 1 ? "" : "s"}`
                        : "No gallery photos"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={post.publishedAt ? "success" : "outline"}>
                      {post.publishedAt ? "Published" : "Draft"}
                    </Badge>
                    <form action={toggleNewsPostPublished}>
                      <input type="hidden" name="id" value={post.id} />
                      <Button type="submit" size="sm" variant="outline">
                        {post.publishedAt ? "Unpublish" : "Publish"}
                      </Button>
                    </form>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/content/news/${post.id}/edit`}>Edit</Link>
                    </Button>
                    <ConfirmDeleteForm
                      action={deleteNewsPost}
                      id={post.id}
                      confirmMessage={`Delete the news post "${title.en}"? This cannot be undone.`}
                    />
                  </div>
                </li>
              );
            })}
            {posts.length === 0 && (
              <p className="py-4 text-center text-sm text-brand-navy/50">No news posts yet.</p>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>News Photos</CardTitle>
          <CardDescription>
            Upload gallery photos for an article — select as many files as you like (10+ is fine).
            Captions: one per line, matching the order you selected the files in (leave a blank line to skip one).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={addNewsPhotos} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-2">
            <label className="flex h-10 items-center text-sm text-brand-navy/70 sm:col-span-2">
              <select
                name="newsPostId"
                required
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
              >
                <option value="">Select a news post...</option>
                {posts.map((post) => {
                  const title = parseLocalizedText(post.title);
                  return (
                    <option key={post.id} value={post.id}>
                      {title.en}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="flex h-10 items-center gap-2 text-sm text-brand-navy/70 sm:col-span-2">
              Photos
              <input name="photos" type="file" accept="image/*" multiple required className="text-sm" />
            </label>
            <textarea
              name="captions"
              placeholder={"Captions, one per line, same order as the files selected above (optional)"}
              rows={3}
              className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            />
            <div className="sm:col-span-2">
              <Button type="submit" size="sm">Add Photos</Button>
            </div>
          </form>

          {posts.some((p) => p.photos.length > 0) && (
            <div className="space-y-4 border-t border-border pt-4">
              {posts.filter((p) => p.photos.length > 0).map((post) => {
                const title = parseLocalizedText(post.title);
                return (
                  <div key={post.id}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-navy/50">
                      {title.en}
                    </p>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {post.photos.map((photo) => (
                        <li key={photo.id} className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-xs">
                          <span className="truncate text-brand-navy/70">{photo.caption || photo.url}</span>
                          <ConfirmDeleteForm
                            action={deleteNewsPhoto}
                            id={photo.id}
                            confirmMessage="Delete this photo?"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
