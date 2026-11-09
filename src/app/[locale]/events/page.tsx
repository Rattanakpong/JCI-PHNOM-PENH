import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MediaTile } from "@/components/ui/media-placeholder";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";

// Events, tiers, and capacity change constantly (new registrations, admin
// edits) — don't bake this page in at build time.
export const dynamic = "force-dynamic";

type Speaker = { name: string; title: string };

function formatTimeRange(start: Date, end: Date) {
  const dateStr = start.toISOString().slice(0, 10);
  const fmt = (d: Date) => d.toISOString().slice(11, 16);
  return `${dateStr} · ${fmt(start)}–${fmt(end)}`;
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("eventsPage");

  const events = await prisma.event.findMany({
    where: { published: true },
    include: { ticketTiers: { orderBy: { sortOrder: "asc" } } },
    orderBy: { startAt: "asc" },
  });

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="section section-y">
        {events.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-brand-navy/50">
            {t("noUpcoming")}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const title = parseLocalizedText(event.title);
              const description = parseLocalizedText(event.description);
              const speakers: Speaker[] = JSON.parse(event.speakers || "[]");
              const minPrice = event.ticketTiers.length
                ? Math.min(...event.ticketTiers.map((t) => t.priceUsd))
                : 0;

              return (
                <Card key={event.id} className="flex h-full flex-col overflow-hidden">
                  <MediaTile src={event.bannerUrl} alt={title.en} seed={event.id} className="rounded-none" />
                  <CardHeader>
                    <Badge variant="teal" className="mb-2 w-fit">
                      {formatTimeRange(event.startAt, event.endAt)}
                    </Badge>
                    <CardTitle>{title[locale as "en" | "km"] ?? title.en}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {description[locale as "en" | "km"] ?? description.en}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-3">
                    <p className="text-sm text-brand-navy/60">
                      {event.location} ·{" "}
                      {minPrice === 0 ? t("free") : `${t("from")} $${minPrice.toFixed(2)}`}
                    </p>
                    {speakers.length > 0 && (
                      <p className="text-xs text-brand-navy/50">
                        {t("speakers")}: {speakers.slice(0, 3).map((s) => s.name).join(", ")}
                      </p>
                    )}
                    <Button asChild className="mt-auto w-full">
                      <Link href={`/events/${event.slug}`}>{t("viewDetails")}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
