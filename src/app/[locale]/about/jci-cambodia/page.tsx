import { existsSync } from "fs";
import path from "path";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Target, Eye, CheckCircle2, Building2, Globe } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ImpactStat } from "@/components/impact-counter";
import { CambodiaTimeline } from "@/components/about/cambodia-timeline";
import { MediaTile } from "@/components/ui/media-placeholder";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// Chapter order here must match the "chapters" translation array —
// slug is only used to look up a dropped-in logo file under
// public/chapters/<slug>.{png,jpg,jpeg,svg,webp}. No logo yet? The card
// falls back to a placeholder automatically — drop the file in and it
// appears on the next request, no code change needed.
const CHAPTER_SLUGS = [
  "phnom-penh",
  "chaktomuk",
  "mekong",
  "toul-kork",
  "chbar-ampov",
  "siem-reap",
  "neak-poan",
];
const LOGO_EXTENSIONS = ["png", "jpg", "jpeg", "svg", "webp"];

// JCI Phnom Penh links internally (handled separately below). The rest link
// out to their own chapter site once we have a confirmed URL — fill in as
// they come in; a chapter with no URL here just renders as a non-clickable
// card instead of guessing at a link.
const CHAPTER_WEBSITES: Record<string, string | null> = {
  "phnom-penh": null,
  chaktomuk: "https://jcichaktomuk.cc/",
  mekong: "https://jcimekong.cc/",
  "toul-kork": null,
  "chbar-ampov": null,
  "siem-reap": null,
  "neak-poan": null,
};

function findChapterLogo(slug: string): string | null {
  for (const ext of LOGO_EXTENSIONS) {
    const filePath = path.join(process.cwd(), "public", "chapters", `${slug}.${ext}`);
    if (existsSync(filePath)) return `/chapters/${slug}.${ext}`;
  }
  return null;
}

export default async function AboutJciCambodiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aboutCambodiaPage");
  const creeds = t.raw("creedsItems") as string[];
  const chapterNames = t.raw("chapters") as string[];
  const chapters = chapterNames.map((name, i) => {
    const slug = CHAPTER_SLUGS[i] ?? name;
    // JCI Phnom Penh already has a real logo on this site — use it until a
    // dedicated chapter-logo file is dropped into public/chapters/.
    const fallbackLogo = slug === "phnom-penh" ? "/brand/logo-main.png" : null;
    return {
      name,
      logoUrl: findChapterLogo(slug) ?? fallbackLogo,
      website: CHAPTER_WEBSITES[slug] ?? null,
    };
  });

  const milestones = [
    { year: t("milestone1Year"), title: t("milestone1Title"), body: t("historyBody2") },
    { year: t("milestone2Year"), title: t("milestone2Title"), body: t("historyBody3") },
    { year: t("milestone3Year"), title: t("milestone3Title"), body: t("historyBody4") },
  ];

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <section className="section pb-4 pt-10">
        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card sm:gap-6 sm:p-8">
          <ImpactStat value={200} label={t("statMembers")} />
          <ImpactStat value={100} label={t("statVolunteers")} />
          <ImpactStat value={7} suffix="" label={t("statChapters")} />
        </div>
      </section>

      <section className="section section-y">
        <h2 className="mb-6 text-2xl font-bold text-brand-navy">{t("historyTitle")}</h2>
        <p className="mb-10 max-w-3xl text-brand-navy/70">{t("historyLead")}</p>

        <CambodiaTimeline milestones={milestones} />
      </section>

      <section className="section-y overflow-hidden border-t border-border bg-surface">
        <div className="section grid items-center gap-10 lg:grid-cols-2">
          <div className="animate-slide-up">
            <h2 className="mb-6 text-2xl font-bold text-brand-navy">{t("aboutTitle")}</h2>
            <div className="space-y-4 text-brand-navy/70">
              <p>{t("aboutBody1")}</p>
              <p>{t("aboutBody2")}</p>
              <p>{t("aboutBody3")}</p>
            </div>
          </div>
          <div className="animate-fade-in [animation-delay:150ms]">
            <MediaTile
              alt={t("aboutTitle")}
              seed="jci-cambodia-about"
              icon={Globe}
              aspect="aspect-[4/3]"
              className="w-full shadow-card"
            />
          </div>
        </div>
      </section>

      <section className="section-y border-t border-border bg-brand-navy text-white">
        <div className="section grid gap-10 sm:grid-cols-2">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/20">
              <Target className="h-6 w-6 text-brand-gold" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
              {t("missionTitle")}
            </p>
            <p className="mt-3 text-xl font-medium leading-relaxed text-white/90">
              {t("missionBody")}
            </p>
          </div>
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/20">
              <Eye className="h-6 w-6 text-brand-gold" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
              {t("visionTitle")}
            </p>
            <p className="mt-3 text-xl font-medium leading-relaxed text-white/90">
              {t("visionBody")}
            </p>
          </div>
        </div>
      </section>

      <section className="section section-y">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-8 shadow-card">
          <h2 className="text-2xl font-bold text-brand-navy">{t("creedsTitle")}</h2>
          <p className="mt-1 mb-6 font-semibold text-brand-blue">{t("creedsIntro")}</p>
          <ul className="space-y-4">
            {creeds.map((creed, i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" />
                <span className="text-brand-navy/80">{creed}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-y border-t border-border bg-surface">
        <div className="section">
          <h2 className="mb-2 text-2xl font-bold text-brand-navy">{t("chaptersTitle")}</h2>
          <p className="mb-10 max-w-2xl text-brand-navy/60">{t("chaptersSubtitle")}</p>

          <div className="flex flex-wrap justify-center gap-5">
            {chapters.map(({ name, logoUrl, website }, i) => {
              const isHome = i === 0;
              const isClickable = isHome || !!website;

              const cardClassName = cn(
                "group relative flex w-[calc(50%-10px)] flex-col items-center gap-4 overflow-hidden rounded-2xl border bg-surface p-4 text-center transition-all duration-200 sm:w-[calc(33.333%-14px)] sm:p-6 lg:w-[calc(25%-15px)]",
                isHome ? "border-brand-blue/50 shadow-card ring-1 ring-brand-blue/30" : "border-border shadow-card",
                isClickable && "hover:-translate-y-1 hover:shadow-card-hover"
              );

              const content = (
                <>
                  {isHome && (
                    <span className="absolute -top-2.5 right-3 rounded-full bg-brand-blue px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-card">
                      {t("homeChapterLabel")}
                    </span>
                  )}
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- local/placeholder URLs, not worth next/image's remote-pattern config
                    <img
                      src={logoUrl}
                      alt={name}
                      className="h-20 w-20 object-contain transition-transform duration-200 group-hover:scale-105 sm:h-28 sm:w-28 lg:h-32 lg:w-32"
                    />
                  ) : (
                    <>
                      <MediaTile
                        alt={name}
                        seed={name}
                        icon={Building2}
                        aspect="aspect-square"
                        className="h-20 w-20 rounded-2xl transition-transform duration-200 group-hover:scale-105"
                      />
                      <p className="text-sm font-semibold text-brand-navy">{name}</p>
                    </>
                  )}
                </>
              );

              if (isHome) {
                return (
                  <Link key={name} href="/about" className={cardClassName}>
                    {content}
                  </Link>
                );
              }

              if (website) {
                return (
                  <a key={name} href={website} target="_blank" rel="noopener noreferrer" className={cardClassName}>
                    {content}
                  </a>
                );
              }

              return (
                <div key={name} className={cardClassName}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
