import { getTranslations, setRequestLocale } from "next-intl/server";
import { Briefcase, HeartHandshake, Globe, Sparkles, CalendarCheck, ArrowRight } from "lucide-react";
import { AboutHero } from "@/components/about/about-hero";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/about/reveal";
import { ImpactStat } from "@/components/impact-counter";
import { MediaTile } from "@/components/ui/media-placeholder";
import { getOrgStructureImageUrl } from "@/lib/site-settings";
import { PILLAR_COLORS } from "@/lib/pillar-colors";
import { ProjectPillar } from "@/lib/enums";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { Link } from "@/i18n/navigation";

const VALUE_ICONS = [Briefcase, HeartHandshake, Globe, Sparkles] as const;
const VALUE_KEYS = ["business", "community", "international", "individual"] as const;
const VALUE_PILLARS = [
  ProjectPillar.BUSINESS_ENTREPRENEURSHIP,
  ProjectPillar.COMMUNITY_IMPACT,
  ProjectPillar.INTERNATIONAL_COOPERATION,
  ProjectPillar.INDIVIDUAL_DEVELOPMENT,
] as const;
// Pillars light enough that a hovered project row needs navy text instead of
// white to stay readable on the pillar color.
const ROW_TEXT_DARK = new Set<ProjectPillar>([
  ProjectPillar.BUSINESS_ENTREPRENEURSHIP,
  ProjectPillar.INTERNATIONAL_COOPERATION,
  ProjectPillar.INDIVIDUAL_DEVELOPMENT,
]);
// The hover panel stays compact — anything past this is reachable via "Show more".
const MAX_PROJECTS_PER_VALUE = 3;

// No confirmed historical record yet — add real { year, name, photoUrl } entries
// here (oldest first; one per year since the 2010 founding) once we have the
// actual list. The section shows an honest "coming soon" state until then
// rather than guessing at names. photoUrl is optional — leave it unset and
// MediaTile renders a nice placeholder until a real photo is uploaded to
// /public/past-presidents.
const PAST_PRESIDENTS: { year: string; name: string; photoUrl?: string }[] = [];

// The organization structure image is editable via the admin CMS, so this
// page must re-query per request rather than being baked in at build time.
export const dynamic = "force-dynamic";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aboutPage");

  const [orgStructureImageUrl, projects] = await Promise.all([
    getOrgStructureImageUrl(),
    prisma.project.findMany({
      select: { slug: true, title: true, pillar: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <>
      <AboutHero
        eyebrow="JCI Phnom Penh"
        title={t("title")}
        description={t("description")}
        logoUrl="/brand/logo-white.png"
        plain
      >
        <p className="mt-6 flex items-center gap-2 text-sm font-medium text-white/70">
          <CalendarCheck className="h-4 w-4 text-brand-teal" />
          {t("foundingNote")}
        </p>
      </AboutHero>

      <section className="section relative z-10 -mt-16">
        <Reveal>
          {/* Below lg: 3 on the first row, 2 centered on the second (6-column
              grid, each stat spans 2, the 4th starts at column 2). lg: 5 across. */}
          <div className="relative grid grid-cols-6 gap-x-2 gap-y-6 overflow-hidden rounded-2xl border border-border bg-surface px-4 py-6 shadow-card-hover sm:gap-6 sm:p-8 lg:grid-cols-5">
            <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0B132B,#0088CE)]" />
            {[
              { value: 4, suffix: "", label: t("statAreas") },
              { value: 70, label: t("statMembers") },
              { value: 250, label: t("statEventsProjects") },
              { value: 120, label: t("statPartners") },
              { value: 450, label: t("statAlumni") },
            ].map((stat, i) => (
              <div key={i} className={cn("col-span-2 lg:col-span-1", i === 3 && "col-start-2 lg:col-start-auto")}>
                <ImpactStat
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  valueClassName="text-3xl sm:text-5xl"
                  labelClassName="text-xs leading-tight sm:text-sm sm:leading-normal"
                />
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section section-y grid items-center gap-12 lg:grid-cols-[1fr_auto]">
        <Reveal>
          <h2 className="mb-6 text-3xl font-bold text-brand-navy">{t("historyTitle")}</h2>
          <div className="max-w-3xl space-y-4 border-l-4 border-brand-gold pl-6 text-lg text-brand-navy/70">
            <p>{t("historyBody1")}</p>
            <p>{t("historyBody2")}</p>
          </div>
        </Reveal>
        <Reveal delay={200} className="hidden lg:block">
          <p
            aria-hidden
            className="select-none bg-[linear-gradient(135deg,#0B132B,#0088CE)] bg-clip-text text-[10rem] font-black leading-none text-transparent"
          >
            2010
          </p>
        </Reveal>
      </section>

      <section className="section-y bg-[linear-gradient(135deg,#0B132B,#12305E)]">
        <div className="section">
          <Reveal>
            <h2 className="text-3xl font-bold text-white">{t("valuesTitle")}</h2>
            <p className="mt-2 max-w-2xl text-white/70">{t("valuesSubtitle")}</p>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_KEYS.map((key, i) => {
              const Icon = VALUE_ICONS[i];
              const pillar = VALUE_PILLARS[i];
              const color = PILLAR_COLORS[pillar].hex;
              const lightRow = ROW_TEXT_DARK.has(pillar);
              const pillarProjects = projects.filter((p) => p.pillar === pillar);
              return (
                <Reveal key={key} delay={i * 120} className="h-full">
                  {/* Projects live in a panel that slides over the card on hover —
                      or on tap/keyboard focus via the tabIndex, since touch screens
                      have no hover. */}
                  <div
                    tabIndex={0}
                    className="group relative flex h-full min-h-[17rem] flex-col overflow-hidden rounded-lg border-t-4 bg-white p-6 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    style={{ borderTopColor: color }}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="h-7 w-7" strokeWidth={1.75} style={{ color }} />
                      <span className="text-sm font-semibold tabular-nums text-brand-navy/30">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-brand-navy">{t(`value${capitalize(key)}Title`)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-navy/70">{t(`value${capitalize(key)}Body`)}</p>
                    <p className="mt-auto flex items-center gap-2 pt-5 text-xs font-semibold text-brand-navy/50">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                      {t("valueProjectCount", { count: pillarProjects.length })}
                    </p>

                    <div
                      className="invisible absolute inset-0 flex translate-y-4 flex-col bg-white p-6 text-brand-navy opacity-0 transition-all duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
                      style={{ "--pillar": color } as React.CSSProperties}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
                        {t("valueProjectsLabel")}
                      </p>
                      {pillarProjects.length === 0 ? (
                        <p className="mt-3 text-sm text-brand-navy/50">{t("valueNoProjects")}</p>
                      ) : (
                        <ul className="-mx-3 mt-2 space-y-0.5">
                          {pillarProjects.slice(0, MAX_PROJECTS_PER_VALUE).map((project) => {
                            const title = parseLocalizedText(project.title);
                            return (
                              <li key={project.slug}>
                                <Link
                                  href={`/projects/${project.slug}`}
                                  className={cn(
                                    "group/item flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--pillar)] focus-visible:bg-[var(--pillar)] focus-visible:outline-none",
                                    lightRow
                                      ? "hover:text-brand-navy focus-visible:text-brand-navy"
                                      : "hover:text-white focus-visible:text-white",
                                  )}
                                >
                                  {title[locale as "en" | "km"] ?? title.en}
                                  <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-40 transition-all group-hover/item:translate-x-0.5 group-hover/item:opacity-100" />
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      <Link
                        href={`/projects?pillar=${pillar}`}
                        className="mt-auto inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-brand-navy px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue"
                      >
                        {t("valueShowMore")}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-y">
        <Reveal>
          <h2 className="text-3xl font-bold text-brand-navy">{t("structureTitle")}</h2>
          <p className="mt-2 max-w-2xl text-brand-navy/60">{t("structureSubtitle")}</p>
        </Reveal>

        <Reveal delay={150} className="mt-10">
          {orgStructureImageUrl ? (
            <a
              href={orgStructureImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-shadow hover:shadow-card-hover"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded URL, not worth next/image's remote-pattern config */}
              <img
                src={orgStructureImageUrl}
                alt={t("structureTitle")}
                className="block h-auto max-h-[calc(100svh-8rem)] w-full object-contain"
              />
              <span className="block border-t border-border py-2 text-center text-xs font-medium text-brand-navy/50 group-hover:text-brand-blue">
                {t("structureViewFull")}
              </span>
            </a>
          ) : (
            <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-brand-navy/50">
              {t("structureEmpty")}
            </p>
          )}
        </Reveal>
      </section>

      <section className="section-y border-t border-border bg-surface">
        <div className="section">
          <Reveal>
            <h2 className="text-3xl font-bold text-brand-navy">{t("pastPresidentsTitle")}</h2>
            <p className="mt-2 max-w-2xl text-brand-navy/60">{t("pastPresidentsSubtitle")}</p>
          </Reveal>

          {PAST_PRESIDENTS.length === 0 ? (
            <p className="mt-10 rounded-2xl border border-dashed border-border py-12 text-center text-sm text-brand-navy/50">
              {t("pastPresidentsEmpty")}
            </p>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {[...PAST_PRESIDENTS].reverse().map((p) => (
                <div key={p.year} className="group flex flex-col items-center text-center">
                  <MediaTile
                    src={p.photoUrl}
                    alt={p.name}
                    seed={p.year}
                    aspect="aspect-square"
                    className="w-20 rounded-full ring-4 ring-surface shadow-card transition-transform group-hover:-translate-y-1 sm:w-24"
                  />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-brand-gold">
                    {p.year}
                  </p>
                  <p className="mt-1 text-sm font-bold leading-snug text-brand-navy">{p.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}
