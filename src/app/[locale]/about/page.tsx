import { getTranslations, setRequestLocale } from "next-intl/server";
import { Briefcase, HeartHandshake, Globe, Sparkles, CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImpactStat } from "@/components/impact-counter";
import { BoardRoster } from "@/components/board/board-roster";
import { MediaTile } from "@/components/ui/media-placeholder";
import { prisma } from "@/lib/prisma";

const VALUE_ICONS = [Briefcase, HeartHandshake, Globe, Sparkles] as const;
const VALUE_KEYS = ["business", "community", "international", "individual"] as const;

// No confirmed historical record yet — add real { year, name, photoUrl } entries
// here (oldest first; one per year since the 2010 founding) once we have the
// actual list. The section shows an honest "coming soon" state until then
// rather than guessing at names. photoUrl is optional — leave it unset and
// MediaTile renders a nice placeholder until a real photo is uploaded to
// /public/past-presidents.
const PAST_PRESIDENTS: { year: string; name: string; photoUrl?: string }[] = [];

// Board roster is editable via the admin CMS, so this page must re-query
// Prisma per request rather than being baked in at build time.
export const dynamic = "force-dynamic";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aboutPage");

  const members = await prisma.boardMember.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <section className="section pb-4 pt-10">
        <p className="mb-6 flex items-center gap-2 text-sm font-medium text-brand-navy/60">
          <CalendarCheck className="h-4 w-4 text-brand-blue" />
          {t("foundingNote")}
        </p>
        <div className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-surface p-8 shadow-card sm:grid-cols-3 lg:grid-cols-5">
          <ImpactStat value={4} suffix="" label={t("statAreas")} />
          <ImpactStat value={70} label={t("statMembers")} />
          <ImpactStat value={250} label={t("statEventsProjects")} />
          <ImpactStat value={120} label={t("statPartners")} />
          <ImpactStat value={450} label={t("statAlumni")} />
        </div>
      </section>

      <section className="section section-y">
        <h2 className="mb-6 text-2xl font-bold text-brand-navy">{t("historyTitle")}</h2>
        <div className="max-w-3xl space-y-4 text-brand-navy/70">
          <p>{t("historyBody1")}</p>
          <p>{t("historyBody2")}</p>
        </div>
      </section>

      <section className="section-y border-t border-border bg-surface">
        <div className="section">
          <h2 className="text-2xl font-bold text-brand-navy">{t("valuesTitle")}</h2>
          <p className="mt-2 max-w-2xl text-brand-navy/60">{t("valuesSubtitle")}</p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_KEYS.map((key, i) => {
              const Icon = VALUE_ICONS[i];
              return (
                <Card key={key}>
                  <CardHeader>
                    <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10">
                      <Icon className="h-5 w-5 text-brand-blue" />
                    </div>
                    <CardTitle className="text-base">
                      {t(`value${capitalize(key)}Title`)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-brand-navy/60">
                    {t(`value${capitalize(key)}Body`)}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-y">
        <h2 className="text-2xl font-bold text-brand-navy">{t("structureTitle")}</h2>
        <p className="mt-2 max-w-2xl text-brand-navy/60">{t("structureSubtitle")}</p>

        <div className="mt-10">
          <BoardRoster
            members={members}
            locale={locale}
            theme={t("structureTermTheme")}
            labels={{
              presidentLabel: t("structurePresidentLabel"),
              executiveBoard: t("structureExecutiveBoard"),
              noMembers: t("structureNoMembers"),
            }}
          />
        </div>
      </section>

      <section className="section-y border-t border-border bg-surface">
        <div className="section">
          <h2 className="text-2xl font-bold text-brand-navy">{t("pastPresidentsTitle")}</h2>
          <p className="mt-2 max-w-2xl text-brand-navy/60">{t("pastPresidentsSubtitle")}</p>

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
