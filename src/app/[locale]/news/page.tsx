import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MediaTile } from "@/components/ui/media-placeholder";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";

// News posts are editable via the admin CMS — don't bake them in at build time.
export const dynamic = "force-dynamic";

function excerpt(text: string, max = 160) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("newsPage");

  const posts = await prisma.newsPost.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="section section-y grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const title = parseLocalizedText(post.title);
          const body = parseLocalizedText(post.body);
          const localizedTitle = title[locale as "en" | "km"] ?? title.en;
          const localizedBody = body[locale as "en" | "km"] ?? body.en;

          return (
            <Card key={post.id} className="overflow-hidden">
              <MediaTile src={post.coverUrl} alt={localizedTitle} seed={post.id} className="rounded-none" />
              <CardHeader>
                <CardDescription>{post.publishedAt?.toISOString().slice(0, 10)}</CardDescription>
                <CardTitle className="line-clamp-2">{localizedTitle}</CardTitle>
                <CardDescription className="line-clamp-3">{excerpt(localizedBody)}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/news/${post.slug}`} className="text-sm font-medium text-brand-blue hover:underline">
                  {t("readMore")}
                </Link>
              </CardContent>
            </Card>
          );
        })}

        <Card className="bg-brand-navy text-white">
          <CardHeader>
            <CardTitle className="text-white">{t("pressKitTitle")}</CardTitle>
            <CardDescription className="text-white/70">{t("pressKitDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="gold">
              <a href="/press-kit/jci-phnom-penh-media-kit.md" download>
                {t("pressKitDownload")}
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
