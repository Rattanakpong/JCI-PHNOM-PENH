import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { updateImpactStats, createSlide, toggleSlideActive, deleteSlide } from "@/lib/actions/content-actions";

const SLIDE_CATEGORIES = ["NEWS", "EVENT", "SPONSOR", "MEMBER"] as const;

export default async function AdminHomepagePage() {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "BOARD_ADMIN"])) notFound();

  const [stats, slides] = await Promise.all([
    prisma.impactStat.findMany(),
    prisma.slide.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const statValue = (key: string) => stats.find((s) => s.key === key)?.value ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-brand-navy">Homepage</h1>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Slideshow</CardTitle>
          <CardDescription>
            Shown as a rotating banner at the top of the homepage. Each slide can spotlight a
            news story, event, sponsor, or member — pick a category, add an image, and
            optionally link it to a page on the site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={createSlide} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-2">
            <input
              name="titleEn"
              placeholder="Title (English)"
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            />
            <textarea
              name="descriptionEn"
              placeholder="Caption (optional)"
              rows={2}
              className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            />
            <select
              name="category"
              defaultValue="NEWS"
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
              defaultValue={slides.length}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="linkUrl"
              placeholder="Link when clicked (e.g. /events/gala-2026, optional)"
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            />
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              Image
              <input name="image" type="file" accept="image/*" required className="text-sm" />
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              <input type="checkbox" name="isActive" defaultChecked />
              Active
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm">Add Slide</Button>
            </div>
          </form>

          <ul className="space-y-2">
            {slides.map((slide) => {
              const title = parseLocalizedText(slide.title);
              return (
                <li key={slide.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-sm">
                  <span className="font-medium text-brand-navy">{title.en}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="teal">{slide.category}</Badge>
                    <Badge variant={slide.isActive ? "success" : "outline"}>
                      {slide.isActive ? "Active" : "Hidden"}
                    </Badge>
                    <form action={toggleSlideActive}>
                      <input type="hidden" name="id" value={slide.id} />
                      <Button type="submit" size="sm" variant="outline">
                        {slide.isActive ? "Hide" : "Show"}
                      </Button>
                    </form>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/content/homepage/slides/${slide.id}/edit`}>Edit</Link>
                    </Button>
                    <ConfirmDeleteForm
                      action={deleteSlide}
                      id={slide.id}
                      confirmMessage={`Delete the slide "${title.en}"? This cannot be undone.`}
                    />
                  </div>
                </li>
              );
            })}
            {slides.length === 0 && (
              <p className="py-4 text-center text-sm text-brand-navy/50">No slides yet.</p>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hero Impact Stats</CardTitle>
          <CardDescription>Shown as the animated counters on the landing page.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateImpactStats} className="grid gap-4 sm:grid-cols-4">
            {["members", "projects", "events", "beneficiaries"].map((key) => (
              <label key={key} className="space-y-1.5 text-sm">
                <span className="font-medium capitalize text-brand-navy">{key}</span>
                <input
                  type="number"
                  name={key}
                  defaultValue={statValue(key)}
                  className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                />
              </label>
            ))}
            <div className="sm:col-span-4">
              <Button type="submit">Save Stats</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
