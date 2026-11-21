import { existsSync } from "fs";
import path from "path";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Target, Eye, CheckCircle2, Building2 } from "lucide-react";
import { AboutHero } from "@/components/about/about-hero";
import { Reveal } from "@/components/about/reveal";
import { ImpactStat } from "@/components/impact-counter";
import { CambodiaTimeline } from "@/components/about/cambodia-timeline";
import { PhotoStack } from "@/components/about/photo-stack";
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

// Photos from jcicambodia.cc, stored under public/about/cambodia/.
const ABOUT_PHOTOS = [
  { src: "/about/cambodia/delegation-jakarta.jpg", alt: "JCI Cambodia delegation at the Asia-Pacific Conference in Jakarta" },
  { src: "/about/cambodia/members-group.jpg", alt: "JCI members group photo" },
  { src: "/about/cambodia/presidential-chain.jpg", alt: "Presidential chain ceremony of the 2024 National President" },
  { src: "/about/cambodia/general-assembly.jpg", alt: "JCI Cambodia delegates at a JCI general assembly" },
];

const HISTORY_PHOTOS = [
  { src: "/about/cambodia/vip-luncheon.jpg", alt: "Speaker at the JCI Cambodia VIP luncheon" },
  { src: "/about/cambodia/presidential-chain-stage.jpg", alt: "Guests on stage at the 2024 Presidential Chain and Oath ceremony" },
];

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
      <AboutHero
        eyebrow={t("chaptersTitle")}
        title={t("title")}
        description={t("description")}
        logoUrl="/brand/jci-cambodia-logo.png"
        logoClassName="hidden w-80 rounded-2xl bg-white px-8 py-10 lg:block"
        plain
      />

      <section className="section relative z-10 -mt-16">
        <Reveal>
          <div className="relative grid grid-cols-3 gap-3 overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-card-hover sm:gap-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0088CE,#4ECDC4,#F4C430,#0088CE)] bg-[length:200%_auto] motion-safe:animate-shimmer" />
            <ImpactStat value={200} label={t("statMembers")} />
            <ImpactStat value={100} label={t("statVolunteers")} />
            <ImpactStat value={7} suffix="" label={t("statChapters")} />
          </div>
        </Reveal>
      </section>

      <section className="section section-y">
        <Reveal>
          <h2 className="mb-6 text-3xl font-bold text-brand-navy">{t("historyTitle")}</h2>
          <p className="mb-10 max-w-3xl text-lg text-brand-navy/70">{t("historyLead")}</p>
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <CambodiaTimeline milestones={milestones} />

          {/* Photos beside the timeline; they stay in view while it scrolls */}
          <div className="grid grid-cols-2 gap-4 lg:sticky lg:top-28 lg:grid-cols-1 lg:gap-8">
            {HISTORY_PHOTOS.map((photo, i) => (
              <Reveal key={photo.src} delay={150 + i * 150}>
                <div
                  className={cn(
                    "rounded-lg bg-white p-2 shadow-card-hover",
                    i % 2 === 0 ? "-rotate-2" : "rotate-2 lg:ml-8",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- local file, not worth next/image config */}
                  <img src={photo.src} alt={photo.alt} className="aspect-[4/3] w-full rounded object-cover" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y overflow-hidden border-t border-border bg-surface">
        <div className="section grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="mb-6 text-3xl font-bold text-brand-navy">{t("aboutTitle")}</h2>
            <div className="space-y-4 border-l-4 border-brand-blue pl-6 text-brand-navy/70">
              <p>{t("aboutBody1")}</p>
              <p>{t("aboutBody2")}</p>
              <p>{t("aboutBody3")}</p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <PhotoStack photos={ABOUT_PHOTOS} />
          </Reveal>
        </div>
      </section>

      <section className="relative isolate overflow-hidden section-y bg-brand-blue text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-brand-teal/30 blur-3xl motion-safe:animate-blob" />
          <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-brand-gold/20 blur-3xl motion-safe:animate-blob [animation-delay:-7s]" />
        </div>
        <div className="section grid gap-6 sm:grid-cols-2">
          <Reveal className="h-full rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur transition-colors duration-300 hover:border-brand-gold/40 hover:bg-white/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/20">
              <Target className="h-6 w-6 text-brand-gold" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
              {t("missionTitle")}
            </p>
            <p className="mt-3 text-xl font-medium leading-relaxed text-white/90">
              {t("missionBody")}
            </p>
          </Reveal>
          <Reveal
            delay={150}
            className="h-full rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur transition-colors duration-300 hover:border-brand-gold/40 hover:bg-white/10"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/20">
              <Eye className="h-6 w-6 text-brand-gold" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
              {t("visionTitle")}
            </p>
            <p className="mt-3 text-xl font-medium leading-relaxed text-white/90">
              {t("visionBody")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section section-y">
        <Reveal className="mx-auto max-w-3xl rounded-2xl bg-[linear-gradient(135deg,#0088CE,#4ECDC4,#F4C430)] p-[2px] shadow-card-hover">
          <div className="rounded-[calc(1rem-2px)] bg-surface p-8">
            <h2 className="text-3xl font-bold text-brand-navy">{t("creedsTitle")}</h2>
            <p className="mt-1 mb-6 font-semibold text-brand-blue">{t("creedsIntro")}</p>
            <ul className="space-y-2">
              {creeds.map((creed, i) => (
                <li key={i}>
                  <Reveal delay={i * 90} className="flex gap-3 rounded-xl p-2 transition-colors hover:bg-brand-gold/10">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" />
                    <span className="text-brand-navy/80">{creed}</span>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <section className="section-y border-t border-border bg-surface">
        <div className="section">
          <Reveal>
            <h2 className="mb-2 text-3xl font-bold text-brand-navy">{t("chaptersTitle")}</h2>
            <p className="mb-10 max-w-2xl text-brand-navy/60">{t("chaptersSubtitle")}</p>
          </Reveal>

          <div className="flex flex-wrap justify-center gap-5">
            {chapters.map(({ name, logoUrl, website }, i) => {
              const isHome = i === 0;
              const isClickable = isHome || !!website;

              const cardClassName = cn(
                "group relative flex h-full w-full flex-col items-center gap-4 overflow-hidden rounded-2xl border bg-surface p-4 text-center transition-all duration-300 sm:p-6",
                isHome ? "border-brand-blue/50 shadow-card ring-1 ring-brand-blue/30" : "border-border shadow-card",
                isClickable && "hover:-translate-y-2 hover:border-brand-blue/50 hover:shadow-card-hover"
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
                      className="h-20 w-20 object-contain transition-transform duration-200 group-hover:scale-110 sm:h-28 sm:w-28 lg:h-32 lg:w-32"
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

              const card = isHome ? (
                <Link href="/about" className={cardClassName}>
                  {content}
                </Link>
              ) : website ? (
                <a href={website} target="_blank" rel="noopener noreferrer" className={cardClassName}>
                  {content}
                </a>
              ) : (
                <div className={cardClassName}>{content}</div>
              );

              return (
                <Reveal
                  key={name}
                  delay={i * 90}
                  className="w-[calc(50%-10px)] sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)]"
                >
                  {card}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
