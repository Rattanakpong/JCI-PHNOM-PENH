import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { PILLAR_COLORS } from "@/lib/pillar-colors";
import type { ProjectPillar } from "@/lib/enums";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import {
  createProject,
  addProjectPhotos,
  deleteProject,
  deleteProjectPhoto,
} from "@/lib/actions/content-actions";

const PROJECT_PILLARS = [
  { value: "BUSINESS_ENTREPRENEURSHIP", label: "Business & Entrepreneurship" },
  { value: "INTERNATIONAL_COOPERATION", label: "International Cooperation" },
  { value: "INDIVIDUAL_DEVELOPMENT", label: "Individual Development" },
  { value: "COMMUNITY_IMPACT", label: "Community Impact" },
] as const;

export default async function AdminProjectsPage() {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "BOARD_ADMIN"])) notFound();

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { photos: { orderBy: [{ year: "desc" }, { sortOrder: "asc" }] } },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-brand-navy">Projects</h1>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={createProject} encType="multipart/form-data" className="space-y-3">
            <input
              name="titleEn"
              placeholder="Title (English)"
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <textarea
              name="summaryEn"
              placeholder="Summary (English)"
              required
              rows={2}
              className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              Partner logos
              <input name="partnerLogos" type="file" accept="image/*" multiple className="text-sm" />
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              Impact report (PDF or image)
              <input name="impactReport" type="file" accept="image/*,application/pdf" className="text-sm" />
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              JCI Pillar
              <select
                name="pillar"
                defaultValue="COMMUNITY_IMPACT"
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
              >
                {PROJECT_PILLARS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" size="sm">Add Project</Button>
          </form>

          <ul className="space-y-2">
            {projects.map((project) => {
              const title = parseLocalizedText(project.title);
              const pillarLabel =
                PROJECT_PILLARS.find((p) => p.value === project.pillar)?.label ?? project.pillar;
              const years = [...new Set(project.photos.map((p) => p.year))].sort((a, b) => b - a);
              return (
                <li key={project.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm">
                  <div>
                    <span className="font-medium text-brand-navy">{title.en}</span>
                    <span className="ml-2 text-xs text-brand-navy/50">
                      {project.photos.length > 0
                        ? `${project.photos.length} photo${project.photos.length === 1 ? "" : "s"} · ${years.join(", ")}`
                        : "No photos yet"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={PILLAR_COLORS[project.pillar as ProjectPillar].badgeClassName}>
                      {pillarLabel}
                    </Badge>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/content/projects/${project.id}/edit`}>Edit</Link>
                    </Button>
                    <ConfirmDeleteForm
                      action={deleteProject}
                      id={project.id}
                      confirmMessage={`Delete the project "${title.en}"? This cannot be undone.`}
                    />
                  </div>
                </li>
              );
            })}
            {projects.length === 0 && (
              <p className="py-4 text-center text-sm text-brand-navy/50">No projects yet.</p>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Photos</CardTitle>
          <CardDescription>
            Upload photos for a project, tagged by year — shown as a dedicated section per year on the project page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={addProjectPhotos} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-3">
            <label className="flex h-10 items-center text-sm text-brand-navy/70 sm:col-span-1">
              <select
                name="projectId"
                required
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
              >
                <option value="">Select a project...</option>
                {projects.map((project) => {
                  const title = parseLocalizedText(project.title);
                  return (
                    <option key={project.id} value={project.id}>
                      {title.en}
                    </option>
                  );
                })}
              </select>
            </label>
            <input
              name="year"
              type="number"
              placeholder="Year (e.g. 2024)"
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <label className="flex h-10 items-center gap-2 text-sm text-brand-navy/70">
              Photos
              <input name="photos" type="file" accept="image/*" multiple required className="text-sm" />
            </label>
            <div className="sm:col-span-3">
              <Button type="submit" size="sm">Add Photos</Button>
            </div>
          </form>

          {projects.some((p) => p.photos.length > 0) && (
            <div className="space-y-4 border-t border-border pt-4">
              {projects.filter((p) => p.photos.length > 0).map((project) => {
                const title = parseLocalizedText(project.title);
                return (
                  <div key={project.id}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-navy/50">
                      {title.en}
                    </p>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {project.photos.map((photo) => (
                        <li key={photo.id} className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-xs">
                          <span className="truncate text-brand-navy/70">{photo.year} · {photo.url}</span>
                          <ConfirmDeleteForm
                            action={deleteProjectPhoto}
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
