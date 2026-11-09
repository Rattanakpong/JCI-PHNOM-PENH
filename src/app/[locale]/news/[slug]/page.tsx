import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { MediaTile } from "@/components/ui/media-placeholder";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
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
  const t = await getTranslations("newsPage");

  const post = await prisma.newsPost.findUnique({
    where: { slug },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
  if (!post || !post.publishedAt) notFound();

  const title = parseLocalizedText(post.title);
  const body = parseLocalizedText(post.body);
  const localizedTitle = title[locale as "en" | "km"] ?? title.en;
  const localizedBody = body[locale as "en" | "km"] ?? body.en;
  const paragraphs = localizedBody.split(/\n\s*\n/).filter(Boolean);

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
              {formatDate(post.publishedAt)}
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
            {formatDate(post.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {t("minRead", { count: readingMinutes(localizedBody) })}
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
