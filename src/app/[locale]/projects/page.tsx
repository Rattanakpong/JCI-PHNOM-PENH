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
import { ProjectPillar } from "@/lib/enums";
import { cn } from "@/lib/utils";

// Project list is editable via the admin CMS — don't bake it in at build time.
export const dynamic = "force-dynamic";

// Same order as the "Four Areas of Opportunity" cards on the About page.
const PILLARS = [
  ProjectPillar.BUSINESS_ENTREPRENEURSHIP,
  ProjectPillar.COMMUNITY_IMPACT,
  ProjectPillar.INTERNATIONAL_COOPERATION,
  ProjectPillar.INDIVIDUAL_DEVELOPMENT,
];

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ pillar?: string }>;
}) {
  const { locale } = await params;
  // Unknown values fall back to the unfiltered list rather than an empty page.
  const { pillar: pillarParam } = await searchParams;
  const activePillar = PILLARS.find((p) => p === pillarParam);
  setRequestLocale(locale);
  const t = await getTranslations("projectsPage");
  const tPillars = await getTranslations("pillars");

  const projects = await prisma.project.findMany({
    where: activePillar ? { pillar: activePillar } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <nav className="section flex flex-wrap gap-2 pt-10">
        {[undefined, ...PILLARS].map((pillar) => {
          const active = pillar === activePillar;
          return (
            <Link
              key={pillar ?? "all"}
              href={pillar ? `/projects?pillar=${pillar}` : "/projects"}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-border text-brand-navy/70 hover:border-brand-navy/30 hover:text-brand-navy",
              )}
            >
              {pillar && <span className={cn("h-2 w-2 rounded-full", PILLAR_COLORS[pillar].dotClassName)} />}
              {pillar ? tPillars(pillar) : t("filterAll")}
            </Link>
          );
        })}
      </nav>
      <div className="section section-y grid gap-6 !pt-8 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const title = parseLocalizedText(project.title);
          const summary = parseLocalizedText(project.summary);
          const partners = parseStringArray(project.partnerLogos);

          return (
            <Card key={project.id} className="overflow-hidden">
              <MediaTile src={project.coverUrl} alt={title.en} seed={project.id} className="rounded-none" />
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
