import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, ChevronRight, Clock, Home, MapPin } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { NewsPhoto, NewsPost } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { MediaTile } from "@/components/ui/media-placeholder";
import { Reveal } from "@/components/about/reveal";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { parseNewsBody, type ArticleBlock, type NewsTemplate } from "@/lib/news-article";
import { PhotoGallery } from "@/components/ui/photo-gallery";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PostWithPhotos = NewsPost & { photos: NewsPhoto[]; publishedAt: Date };

function formatIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatLongDate(d: Date, locale: string, withWeekday = false) {
  return new Intl.DateTimeFormat(locale === "km" ? "km-KH" : "en-GB", {
    ...(withWeekday && { weekday: "long" }),
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Phnom_Penh",
  }).format(d);
}

function readingMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await prisma.newsPost.findUnique({
    where: { slug },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
  if (!post || !post.publishedAt) notFound();

  // Posts created before the article builder keep their original layout;
  // posts built from blocks in the admin use the press-release layout.
  const body = parseNewsBody(post.body);
  if (body.layout === "template" && body.template) {
    return <TemplateArticle post={post as PostWithPhotos} template={body.template} locale={locale} />;
  }
  return body.layout === "press" ? (
    <PressArticle post={post as PostWithPhotos} blocks={body.blocks} locale={locale} />
  ) : (
    <ClassicArticle post={post as PostWithPhotos} bodyText={body.text[locale as "en" | "km"] ?? body.text.en} locale={locale} />
  );
}

// ---------------------------------------------------------------------------
// Classic layout — full-width cover with the title overlaid, then plain text.
// ---------------------------------------------------------------------------

async function ClassicArticle({ post, bodyText, locale }: { post: PostWithPhotos; bodyText: string; locale: string }) {
  const t = await getTranslations("newsPage");
  const title = parseLocalizedText(post.title);
  const localizedTitle = title[locale as "en" | "km"] ?? title.en;
  const paragraphs = bodyText.split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      <div className="section pt-8">
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-navy/60 transition-colors hover:text-brand-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToNews")}
        </Link>
      </div>

      <div className="section mt-4">
        <div className="relative overflow-hidden rounded-2xl">
          <MediaTile
            src={post.coverUrl}
            alt={localizedTitle}
            seed={post.id}
            aspect="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
            className="rounded-2xl"
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8">
            <Badge variant="gold" className="mb-2 sm:mb-3">
              {formatIsoDate(post.publishedAt)}
            </Badge>
            <h1 className="max-w-3xl text-xl font-extrabold text-white sm:text-2xl lg:text-4xl">
              {localizedTitle}
            </h1>
          </div>
        </div>
      </div>

      <div className="section section-y max-w-3xl">
        {post.coverCaption && (
          <p className="mb-6 text-sm italic text-brand-navy/50">{post.coverCaption}</p>
        )}

        <div className="mb-8 flex items-center gap-4 text-sm text-brand-navy/50">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatIsoDate(post.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {t("minRead", { count: readingMinutes(bodyText) })}
          </span>
        </div>

        <div className="space-y-5 text-base leading-relaxed text-brand-navy/80">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {post.photos.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-lg font-bold text-brand-navy">{t("gallery")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {post.photos.map((photo) => (
                <figure key={photo.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded local file, not worth next/image config */}
                  <img
                    src={photo.url}
                    alt={photo.caption ?? localizedTitle}
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                  />
                  {photo.caption && (
                    <figcaption className="mt-1.5 text-xs text-brand-navy/50">
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Press-release layout — title, dated lead, blocks in order (text, headings,
// images, quotes), a photo grid, and a related-news sidebar.
// ---------------------------------------------------------------------------

// Text inside straight or curly double quotes is set in bold italic, the way
// press releases highlight a speaker's words.
function renderQuotedText(text: string): ReactNode {
  return text.split(/(“[^”]+”|"[^"]+")/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold italic">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

function ArticleImage({ src, caption, alt }: { src: string; caption: string | null; alt: string }) {
  return (
    <figure>
      <a href={src} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded URL, not worth next/image config */}
        <img
          src={src}
          alt={caption || alt}
          className="mx-auto h-auto max-h-[85vh] w-auto max-w-full transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
      </a>
      {caption && <figcaption className="mt-2 text-left text-sm italic text-brand-navy/50">{caption}</figcaption>}
    </figure>
  );
}

async function PressArticle({ post, blocks, locale }: { post: PostWithPhotos; blocks: ArticleBlock[]; locale: string }) {
  const t = await getTranslations("newsPage");
  const title = parseLocalizedText(post.title);
  const localizedTitle = title[locale as "en" | "km"] ?? title.en;

  // The cover photo sits right after the opening text block, like a press
  // release's lead image (or at the top if there's no text block).
  const firstTextIndex = blocks.findIndex((block) => block.type === "text");

  // "Phnom Penh, 14 February 2026 —" dateline, unless the author already wrote one.
  const firstText = firstTextIndex === -1 ? "" : (blocks[firstTextIndex] as { text: string }).text.trimStart();
  const dateline = datelineFor(firstText, post.publishedAt, locale, t("datelineCity"));

  const renderBlock = (block: ArticleBlock, index: number): ReactNode => {
    switch (block.type) {
      case "heading":
        return <h2 className="pt-4 text-left text-xl font-bold text-brand-navy sm:text-2xl">{block.text}</h2>;
      case "quote":
        return (
          <blockquote className="border-l-4 border-brand-blue pl-5 text-left text-lg font-bold italic leading-relaxed text-brand-navy">
            {block.text}
          </blockquote>
        );
      case "image":
        return <ArticleImage src={block.url} caption={block.caption || null} alt={localizedTitle} />;
      case "text":
        return <Paragraphs text={block.text} dateline={index === firstTextIndex ? dateline : null} />;
    }
  };

  const cover = post.coverUrl ? (
    <Reveal>
      <ArticleImage src={post.coverUrl} caption={post.coverCaption} alt={localizedTitle} />
    </Reveal>
  ) : null;

  return (
    <ArticleShell post={post} locale={locale}>
      <div className="mt-10 space-y-6 text-justify text-base leading-[1.8] text-brand-navy/90">
        {firstTextIndex === -1 && cover}
        {blocks.map((block, i) => (
          <div key={i} className="space-y-6">
            <Reveal>{renderBlock(block, i)}</Reveal>
            {i === firstTextIndex && cover}
          </div>
        ))}
      </div>

      {post.photos.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3">
          {post.photos.map((photo, i) => (
            <Reveal key={photo.id} delay={(i % 2) * 120}>
              <a href={photo.url} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded URL, not worth next/image config */}
                <img
                  src={photo.url}
                  alt={photo.caption ?? localizedTitle}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover object-[50%_30%] transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </a>
            </Reveal>
          ))}
        </div>
      )}
    </ArticleShell>
  );
}

// ---------------------------------------------------------------------------
// Template layout — every section in a fixed order: event facts, opening
// summary, cover photo, story, quote, highlights, closing, gallery.
// ---------------------------------------------------------------------------

function formatEventDate(key: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "km" ? "km-KH" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${key}T00:00:00Z`));
}

async function TemplateArticle({ post, template, locale }: { post: PostWithPhotos; template: NewsTemplate; locale: string }) {
  const t = await getTranslations("newsPage");
  const title = parseLocalizedText(post.title);
  const localizedTitle = title[locale as "en" | "km"] ?? title.en;
  const dateline = datelineFor(template.summary, post.publishedAt, locale, t("datelineCity"));

  return (
    <ArticleShell post={post} locale={locale}>
      {(template.eventDate || template.location) && (
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-y border-border py-3 text-sm text-brand-navy/70">
          {template.eventDate && (
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-blue" />
              {formatEventDate(template.eventDate, locale)}
            </span>
          )}
          {template.location && (
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-blue" />
              {template.location}
            </span>
          )}
        </div>
      )}

      <div className="mt-8 space-y-8 text-base leading-[1.8] text-brand-navy/90">
        <Reveal>
          <p className="text-lg leading-relaxed text-brand-navy">
            {dateline && <strong className="font-bold italic">{dateline} </strong>}
            {renderQuotedText(template.summary)}
          </p>
        </Reveal>

        {post.coverUrl && (
          <Reveal>
            <ArticleImage src={post.coverUrl} caption={post.coverCaption} alt={localizedTitle} />
          </Reveal>
        )}

        <Reveal>
          <Paragraphs text={template.story} dateline={null} />
        </Reveal>

        {template.quote && (
          <Reveal>
            <figure className="border-l-4 border-brand-blue py-1 pl-5">
              <blockquote className="text-xl font-semibold italic leading-relaxed text-brand-navy">
                “{template.quote.text.replace(/^[“"]|[”"]$/g, "")}”
              </blockquote>
              {(template.quote.name || template.quote.role) && (
                <figcaption className="mt-3 text-sm text-brand-navy/60">
                  {template.quote.name && <span className="font-semibold text-brand-navy">{template.quote.name}</span>}
                  {template.quote.name && template.quote.role && ", "}
                  {template.quote.role}
                </figcaption>
              )}
            </figure>
          </Reveal>
        )}

        {template.highlights.length > 0 && (
          <Reveal>
            <section className="rounded-xl bg-muted p-5 sm:p-6">
              <h2 className="text-lg font-bold text-brand-navy">{t("highlightsTitle")}</h2>
              <ul className="mt-3 space-y-2">
                {template.highlights.map((highlight, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-brand-blue" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}

        {template.closing && (
          <Reveal>
            <div className="border-t border-border pt-6 text-brand-navy/75">
              <Paragraphs text={template.closing} dateline={null} />
            </div>
          </Reveal>
        )}
      </div>

      {post.photos.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold text-brand-navy">{t("gallery")}</h2>
          <PhotoGallery photos={post.photos} alt={localizedTitle} />
        </section>
      )}
    </ArticleShell>
  );
}

// ---------------------------------------------------------------------------
// Shared pieces for the press and template layouts.
// ---------------------------------------------------------------------------

// "Phnom Penh, 14 February 2026 —", or null if the text already starts with one.
function datelineFor(text: string, publishedAt: Date, locale: string, city: string) {
  const start = text.trimStart();
  if (start.startsWith(city) || start.startsWith("Phnom Penh")) return null;
  return `${city}, ${formatLongDate(publishedAt, locale)} —`;
}

function Paragraphs({ text, dateline }: { text: string; dateline: string | null }) {
  return (
    <div className="space-y-6">
      {text
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((paragraph, i) => (
          <p key={i}>
            {i === 0 && dateline && <strong className="font-bold italic text-brand-navy">{dateline} </strong>}
            {renderQuotedText(paragraph)}
          </p>
        ))}
    </div>
  );
}

// Breadcrumb, headline, date line, back link and the related-news sidebar.
async function ArticleShell({ post, locale, children }: { post: PostWithPhotos; locale: string; children: ReactNode }) {
  const t = await getTranslations("newsPage");
  const tNav = await getTranslations("nav");

  const relatedPosts = await prisma.newsPost.findMany({
    where: { publishedAt: { not: null }, id: { not: post.id } },
    orderBy: { publishedAt: "desc" },
    take: 5,
  });

  const title = parseLocalizedText(post.title);
  const localizedTitle = title[locale as "en" | "km"] ?? title.en;
  const hasSidebar = relatedPosts.length > 0;

  return (
    <div className="relative">
      {hasSidebar && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] bg-brand-blue/[0.04] [clip-path:polygon(22%_0,100%_0,100%_100%,0_100%)] lg:block"
        />
      )}

      <nav aria-label="Breadcrumb" className={cn("section relative pt-8", !hasSidebar && "max-w-4xl")}>
        <ol className="flex min-w-0 items-center gap-1.5 text-sm text-brand-navy/50">
          <li className="shrink-0">
            <Link href="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-blue">
              <Home className="h-4 w-4" />
              {tNav("home")}
            </Link>
          </li>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <li className="shrink-0">
            <Link href="/news" className="transition-colors hover:text-brand-blue">
              {tNav("news")}
            </Link>
          </li>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <li aria-current="page" className="min-w-0 truncate text-brand-blue">
            {localizedTitle}
          </li>
        </ol>
      </nav>

      <div
        className={cn(
          "section relative grid gap-14 pb-16 pt-8 sm:pb-24",
          hasSidebar ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" : "max-w-4xl"
        )}
      >
        <article className="min-w-0">
          <h1 className="text-2xl font-bold leading-normal text-brand-blue motion-safe:animate-slide-up sm:text-3xl lg:text-4xl lg:leading-snug">
            {localizedTitle}
          </h1>

          <div className="mt-4 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-4">
            <Link href="/news" className="font-medium text-brand-blue hover:underline">
              {tNav("news")}
            </Link>
            <span className="text-brand-navy/55">{formatLongDate(post.publishedAt, locale, true)}</span>
          </div>

          {children}

          <Link
            href="/news"
            className="mt-12 inline-flex items-center gap-1.5 text-sm font-medium text-brand-navy/60 transition-colors hover:text-brand-blue"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToNews")}
          </Link>
        </article>

        {hasSidebar && (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-5 text-lg font-bold text-brand-navy">{t("relatedNews")}</h2>
            <div className="space-y-5">
              {relatedPosts.map((related, i) => {
                const relatedTitle = parseLocalizedText(related.title);
                const localizedRelatedTitle = relatedTitle[locale as "en" | "km"] ?? relatedTitle.en;
                return (
                  <Reveal key={related.id} delay={i * 100}>
                    <Link
                      href={`/news/${related.slug}`}
                      className="group block rounded-xl bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
                    >
                      <p className="line-clamp-2 font-bold leading-snug text-brand-navy transition-colors group-hover:text-brand-blue">
                        {localizedRelatedTitle}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                        <span className="text-brand-blue">{tNav("news")}</span>
                        {related.publishedAt && (
                          <span className="rounded-md bg-muted px-2 py-1 font-medium text-brand-navy/70">
                            {formatLongDate(related.publishedAt, locale)}
                          </span>
                        )}
                      </div>
                      <span className="mt-2 flex items-center justify-end gap-1 text-sm font-medium text-brand-blue">
                        {t("readMore")}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
