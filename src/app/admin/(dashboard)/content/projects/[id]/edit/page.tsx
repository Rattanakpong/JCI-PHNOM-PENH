import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText, parseStringArray } from "@/lib/json-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { updateProject } from "@/lib/actions/content-actions";
import { ProjectScheduleFields } from "@/components/admin/project-schedule-fields";

const PROJECT_PILLARS = [
  { value: "BUSINESS_ENTREPRENEURSHIP", label: "Business & Entrepreneurship" },
  { value: "INTERNATIONAL_COOPERATION", label: "International Cooperation" },
  { value: "INDIVIDUAL_DEVELOPMENT", label: "Individual Development" },
  { value: "COMMUNITY_IMPACT", label: "Community Impact" },
] as const;

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "BOARD_ADMIN"])) notFound();

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const title = parseLocalizedText(project.title);
  const summary = parseLocalizedText(project.summary);
  const partnerLogos = parseStringArray(project.partnerLogos);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Edit Project</h1>

      <Card>
        <CardHeader>
          <CardTitle>{title.en}</CardTitle>
          <CardDescription>
            Uploaded cover, logos ({partnerLogos.length}) and impact report carry over — new uploads
            add to the logos and replace the cover or report. Tick &ldquo;Remove&rdquo; to delete one
            when you save. Activity photos are managed separately on the Projects page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProject} encType="multipart/form-data" className="space-y-3">
            <input type="hidden" name="id" value={project.id} />
            <input
              name="titleEn"
              placeholder="Title (English)"
              defaultValue={title.en}
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <textarea
              name="summaryEn"
              placeholder="Summary (English)"
              defaultValue={summary.en}
              required
              rows={3}
              className="flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            {project.coverUrl && (
              <label className="flex items-center gap-3 rounded-xl border border-border bg-surface p-2 text-sm text-brand-navy/70 has-[:checked]:border-red-300 has-[:checked]:bg-red-50">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of an uploaded file */}
                <img src={project.coverUrl} alt="Current cover" className="h-16 w-24 rounded-lg object-cover" />
                <span className="flex-1">Current cover image</span>
                <span className="flex items-center gap-1 text-xs">
                  <input type="checkbox" name="removeCover" />
                  Remove
                </span>
              </label>
            )}
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              {project.coverUrl ? "Replace cover image (optional)" : "Cover image (optional)"}
              <input name="cover" type="file" accept="image/*" className="text-sm" />
            </label>
            {partnerLogos.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-brand-navy/70">Current partner logos</p>
                <div className="flex flex-wrap gap-3">
                  {partnerLogos.map((url) => (
                    <label
                      key={url}
                      className="flex w-28 flex-col items-center gap-2 rounded-xl border border-border bg-surface p-2 text-xs text-brand-navy/70 has-[:checked]:border-red-300 has-[:checked]:bg-red-50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of an uploaded file */}
                      <img src={url} alt="Partner logo" className="h-16 w-full object-contain" />
                      <span className="flex items-center gap-1">
                        <input type="checkbox" name="removeLogos" value={url} />
                        Remove
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              Add more partner logos (optional)
              <input name="partnerLogos" type="file" accept="image/*" multiple className="text-sm" />
            </label>
            {project.impactReportUrl && (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-2 text-sm text-brand-navy/70 has-[:checked]:border-red-300 has-[:checked]:bg-red-50">
                <a href={project.impactReportUrl} target="_blank" rel="noreferrer" className="flex-1 text-brand-blue underline">
                  View current impact report
                </a>
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" name="removeReport" />
                  Remove
                </label>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              Replace impact report (optional)
              <input name="impactReport" type="file" accept="image/*,application/pdf" className="text-sm" />
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              JCI Pillar
              <select
                name="pillar"
                defaultValue={project.pillar}
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
              >
                {PROJECT_PILLARS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <ProjectScheduleFields
              startDate={project.startDate}
              endDate={project.endDate}
              location={project.location}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm">Save Changes</Button>
              <Button type="button" size="sm" variant="outline" asChild>
                <a href="/admin/content/projects">Cancel</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
