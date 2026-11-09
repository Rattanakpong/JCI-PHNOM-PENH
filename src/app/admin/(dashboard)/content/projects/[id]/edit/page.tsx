import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText, parseStringArray } from "@/lib/json-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { updateProject } from "@/lib/actions/content-actions";

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
  const partnerLogoCount = parseStringArray(project.partnerLogos).length;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Edit Project</h1>

      <Card>
        <CardHeader>
          <CardTitle>{title.en}</CardTitle>
          <CardDescription>
            Uploaded logos ({partnerLogoCount}) and impact report carry over — new uploads add to
            the logos and replace the report.
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
            <label className="flex items-center gap-2 text-sm text-brand-navy/70">
              Add more partner logos (optional)
              <input name="partnerLogos" type="file" accept="image/*" multiple className="text-sm" />
            </label>
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
