import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ImpactStat } from "@/components/impact-counter";
import { Slideshow, type SlideItem } from "@/components/home/slideshow";
import { ProjectCarousel, type ProjectCarouselItem } from "@/components/home/project-carousel";
import { EventCarousel, type EventCarouselItem } from "@/components/home/event-carousel";
import { MediaTile } from "@/components/ui/media-placeholder";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText, type LocalizedText } from "@/lib/json-field";
import { getTranslations } from "next-intl/server";

// Impact stats, events, projects, news, and the board roster are all
// editable via the admin CMS, so this page must re-query Prisma per
// request rather than being baked in at build time.
export const dynamic = "force-dynamic";

const STAT_KEYS = ["members", "projects", "events", "beneficiaries"] as const;
type Locale = "en" | "km";

function localize(text: LocalizedText, locale: string) {
  return text[locale as Locale] ?? text.en;
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [slideRows, statRows, projectRows, eventRows, president] = await Promise.all([
    prisma.slide.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.impactStat.findMany({ where: { key: { in: [...STAT_KEYS] } } }),
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { photos: { orderBy: [{ year: "desc" }, { sortOrder: "asc" }], take: 1 } },
    }),
    prisma.event.findMany({
      where: { published: true, startAt: { gte: new Date() } },
      include: { ticketTiers: true },
      orderBy: { startAt: "asc" },
    }),
    prisma.boardMember.findFirst({ orderBy: { sortOrder: "asc" } }),
  ]);

  const stats = STAT_KEYS.map((key) => ({
    key,
    value: statRows.find((r) => r.key === key)?.value ?? 0,
  }));

  const tPillars = await getTranslations("pillars");
  const tSlideshow = await getTranslations("home.slideshow");
  const categoryLabels: Record<string, string> = {
    NEWS: tSlideshow("news"),
    EVENT: tSlideshow("event"),
    SPONSOR: tSlideshow("sponsor"),
    MEMBER: tSlideshow("member"),
  };
  const slides: SlideItem[] = slideRows.map((s) => ({
    id: s.id,
    title: localize(parseLocalizedText(s.title), locale),
    description: s.description ? localize(parseLocalizedText(s.description), locale) : null,
    imageUrl: s.imageUrl,
    linkUrl: s.linkUrl,
    category: s.category,
  }));

  const projects: ProjectCarouselItem[] = projectRows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: localize(parseLocalizedText(p.title), locale),
    summary: localize(parseLocalizedText(p.summary), locale),
    coverUrl: p.photos[0]?.url ?? null,
    pillar: p.pillar,
    pillarLabel: tPillars(
      p.pillar as
        | "BUSINESS_ENTREPRENEURSHIP"
        | "INTERNATIONAL_COOPERATION"
        | "INDIVIDUAL_DEVELOPMENT"
        | "COMMUNITY_IMPACT",
    ),
  }));

  const events: EventCarouselItem[] = eventRows.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: localize(parseLocalizedText(e.title), locale),
    description: localize(parseLocalizedText(e.description), locale),
    location: e.location,
    dateLabel: e.startAt.toISOString().slice(0, 10),
    bannerUrl: e.bannerUrl,
    minPrice: e.ticketTiers.length ? Math.min(...e.ticketTiers.map((t) => t.priceUsd)) : 0,
  }));

  return (
    <>
      <Slideshow slides={slides} categoryLabels={categoryLabels} />
      <AboutBriefSection />
      <LeaderMessageSection president={president} locale={locale} />
      <OurProjectsSection projects={projects} />
      <UpcomingEventsSection events={events} />
      <ImpactSection stats={stats} />
      <CtaBanner />
    </>
  );
}

function AboutBriefSection() {
  const t = useTranslations("home.about");

  return (
    <section className="section-y section overflow-hidden">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="animate-slide-up">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-blue">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-5 leading-relaxed text-brand-navy/70">{t("body")}</p>
          <Button asChild className="mt-8">
            <Link href="/about">
              {t("cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="animate-fade-in [animation-delay:150ms]">
          <MediaTile
            alt={t("title")}
            seed="home-about-brief"
            aspect="aspect-[4/3]"
            className="w-full shadow-card"
          />
        </div>
      </div>
    </section>
  );
}

type PresidentSummary = {
  id: string;
  name: string;
  title: string;
  photoUrl: string | null;
} | null;

function LeaderMessageSection({ president, locale }: { president: PresidentSummary; locale: string }) {
  const t = useTranslations("leaderMessage");
  if (!president) return null;
  const presidentTitle = localize(parseLocalizedText(president.title), locale);

  return (
    <section className="section-y border-t border-border bg-brand-navy text-white">
      <div className="section grid gap-10 lg:grid-cols-2 lg:items-center">
        <MediaTile
          src={president.photoUrl}
          alt={president.name}
          seed={president.id}
          aspect="aspect-[4/5]"
          className="w-full lg:order-2"
        />
        <div className="lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
            {t("label")}
          </p>
          <p className="mt-6 text-2xl italic leading-relaxed text-white/90 sm:text-3xl">
            &ldquo;{t("quote")}&rdquo;
          </p>
          <div className="mt-8">
            <p className="text-lg font-bold text-white">{president.name}</p>
            <p className="text-sm text-white/60">{presidentTitle}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImpactSection({ stats }: { stats: { key: string; value: number }[] }) {
  const t = useTranslations("impact");

  return (
    <section className="section-y border-t border-border">
      <div className="section">
        <h2 className="mb-12 text-center text-sm font-semibold uppercase tracking-wider text-brand-navy/40">
          {t("title")}
        </h2>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {stats.map((stat) => (
            <ImpactStat
              key={stat.key}
              value={stat.value}
              label={t(stat.key as "members" | "projects" | "events" | "beneficiaries")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function OurProjectsSection({ projects }: { projects: ProjectCarouselItem[] }) {
  const t = useTranslations("home.projects");

  return (
    <section className="section-y overflow-hidden border-t border-border bg-surface">
      <div className="section">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
      </div>

      <ProjectCarousel
        projects={projects}
        labels={{
          viewProject: t("viewProject"),
          empty: t("empty"),
        }}
      />

      <div className="section mt-10 text-center">
        <Button asChild variant="outline">
          <Link href="/projects">{t("viewAll")}</Link>
        </Button>
      </div>
    </section>
  );
}

function UpcomingEventsSection({ events }: { events: EventCarouselItem[] }) {
  const t = useTranslations("home.events");

  return (
    <section className="section-y overflow-hidden border-t border-border">
      <div className="section">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
      </div>

      <EventCarousel
        events={events}
        labels={{
          viewDetails: t("viewDetails"),
          free: t("free"),
          from: t("from"),
          empty: t("empty"),
        }}
      />

      <div className="section mt-10 text-center">
        <Button asChild variant="outline">
          <Link href="/events">{t("viewAll")}</Link>
        </Button>
      </div>
    </section>
  );
}

function CtaBanner() {
  const t = useTranslations("home.cta");

  return (
    <section className="border-t border-border bg-brand-navy">
      <div className="section section-y text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">{t("title")}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/70">{t("subtitle")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" variant="gold">
            <Link href="/join">{t("join")}</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="border-white/20 text-white hover:bg-white/10">
            <Link href="/events">{t("event")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="text-2xl font-bold text-brand-navy sm:text-3xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-brand-navy/60">{subtitle}</p>
    </div>
  );
}
