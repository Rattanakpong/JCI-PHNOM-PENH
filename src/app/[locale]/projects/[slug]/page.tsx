import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MediaTile } from "@/components/ui/media-placeholder";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText, parseStringArray } from "@/lib/json-field";
import { PILLAR_COLORS } from "@/lib/pillar-colors";
import type { ProjectPillar } from "@/lib/enums";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projectsPage");
  const tPillars = await getTranslations("pillars");

  const project = await prisma.project.findUnique({
    where: { slug },
    include: { photos: { orderBy: [{ year: "desc" }, { sortOrder: "asc" }] } },
  });
  if (!project) notFound();

  const title = parseLocalizedText(project.title);
  const summary = parseLocalizedText(project.summary);
  const partners = parseStringArray(project.partnerLogos);
  const localizedTitle = title[locale as "en" | "km"] ?? title.en;
  const localizedSummary = summary[locale as "en" | "km"] ?? summary.en;

  // Most JCI projects run every year, so photos are grouped into one
  // section per year (most recent first) rather than a single flat gallery.
  const photosByYear = new Map<number, typeof project.photos>();
  for (const photo of project.photos) {
    const list = photosByYear.get(photo.year) ?? [];
    list.push(photo);
    photosByYear.set(photo.year, list);
  }
  const years = [...photosByYear.keys()].sort((a, b) => b - a);

  return (
    <>
      <div className="section pb-2 pt-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy/60 transition-colors hover:text-brand-blue"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToProjects")}
        </Link>
      </div>

      <div className="section pb-4 pt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold text-brand-navy sm:text-4xl">{localizedTitle}</h1>
          <Badge variant="outline" className={PILLAR_COLORS[project.pillar as ProjectPillar].badgeClassName}>
            {tPillars(project.pillar as ProjectPillar)}
          </Badge>
        </div>
        <p className="mt-3 max-w-2xl text-brand-navy/70">{localizedSummary}</p>
      </div>

      <div className="section section-y space-y-10 pt-6">
        <div>
          <h2 className="mb-4 text-lg font-bold text-brand-navy">{t("galleryTitle")}</h2>
          {years.length === 0 ? (
            <MediaTile alt={localizedTitle} seed={project.id} aspect="aspect-[16/9]" />
          ) : (
            <div className="space-y-8">
              {years.map((year) => (
                <div key={year}>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-gold">
                    {year}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {photosByYear.get(year)!.map((photo) => (
                      <MediaTile
                        key={photo.id}
                        src={photo.url}
                        alt={`${localizedTitle} ${year}`}
                        seed={photo.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {partners.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-bold text-brand-navy">{t("partnersTitle")}</h2>
            <div className="flex flex-wrap gap-4">
              {partners.map((logo, i) => (
                <MediaTile
                  key={i}
                  src={logo}
                  alt={`Partner ${i + 1}`}
                  seed={`${project.id}-partner-${i}`}
                  aspect="aspect-square"
                  className="w-20"
                />
              ))}
            </div>
          </div>
        )}

        {project.impactReportUrl && (
          <Button asChild variant="gold">
            <a href={project.impactReportUrl} download>
              {t("impactReport")}
            </a>
          </Button>
        )}
      </div>
    </>
  );
}
