import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MediaTile } from "@/components/ui/media-placeholder";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText, parseStringArray } from "@/lib/json-field";
import { PILLAR_COLORS } from "@/lib/pillar-colors";
import type { ProjectPillar } from "@/lib/enums";

// Project list is editable via the admin CMS — don't bake it in at build time.
export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projectsPage");
  const tPillars = await getTranslations("pillars");

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { photos: { orderBy: [{ year: "desc" }, { sortOrder: "asc" }], take: 1 } },
  });

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="section section-y grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const title = parseLocalizedText(project.title);
          const summary = parseLocalizedText(project.summary);
          const partners = parseStringArray(project.partnerLogos);
          const cover = project.photos[0]?.url ?? null;

          return (
            <Card key={project.id} className="overflow-hidden">
              <MediaTile src={cover} alt={title.en} seed={project.id} className="rounded-none" />
              <CardHeader>
                <Badge
                  variant="outline"
                  className={`mb-2 w-fit ${PILLAR_COLORS[project.pillar as ProjectPillar].badgeClassName}`}
                >
                  {tPillars(project.pillar as ProjectPillar)}
                </Badge>
                <CardTitle>{title[locale as "en" | "km"] ?? title.en}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {summary[locale as "en" | "km"] ?? summary.en}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {partners.length > 0 && (
                  <div className="flex -space-x-2">
                    {partners.slice(0, 4).map((logo, i) => (
                      <MediaTile
                        key={i}
                        src={logo}
                        alt={`Partner ${i + 1}`}
                        seed={`${project.id}-${i}`}
                        aspect="aspect-square"
                        className="w-9 rounded-full border-2 border-surface"
                      />
                    ))}
                  </div>
                )}
                <Button asChild variant="secondary" className="w-full">
                  <Link href={`/projects/${project.slug}`}>{t("viewProject")}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
