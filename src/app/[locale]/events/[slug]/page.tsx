import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin, ExternalLink, Ticket } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaTile } from "@/components/ui/media-placeholder";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import {
  RegistrationModal,
  type RegistrationEvent,
} from "@/components/registration/registration-modal";

export const dynamic = "force-dynamic";

type Speaker = { name: string; title: string };
type AgendaItem = { time: string; title: string };

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatTime(d: Date) {
  return d.toISOString().slice(11, 16);
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("eventsPage");

  const event = await prisma.event.findUnique({
    where: { slug },
    include: { ticketTiers: { orderBy: { sortOrder: "asc" } } },
  });
  if (!event || !event.published) notFound();

  const title = parseLocalizedText(event.title);
  const description = parseLocalizedText(event.description);
  const speakers: Speaker[] = JSON.parse(event.speakers || "[]");
  const agenda: AgendaItem[] = JSON.parse(event.agenda || "[]");
  const localizedTitle = title[locale as "en" | "km"] ?? title.en;
  const localizedDescription = description[locale as "en" | "km"] ?? description.en;

  const registrationEvent: RegistrationEvent = {
    id: event.id,
    title,
    ticketTiers: event.ticketTiers.map((tier) => ({
      id: tier.id,
      name: parseLocalizedText(tier.name),
      priceUsd: tier.priceUsd,
      saleEndsAt: tier.saleEndsAt ? tier.saleEndsAt.toISOString() : null,
    })),
  };

  return (
    <>
      <div className="section pt-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-navy/60 transition-colors hover:text-brand-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToEvents")}
        </Link>
      </div>

      <div className="section mt-4">
        <div className="relative overflow-hidden rounded-2xl">
          <MediaTile
            src={event.bannerUrl}
            alt={localizedTitle}
            seed={event.id}
            aspect="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
            className="rounded-2xl"
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8">
            <Badge variant="teal" className="mb-2 sm:mb-3">
              {formatDate(event.startAt)}
            </Badge>
            <h1 className="text-xl font-extrabold text-white sm:text-2xl lg:text-4xl">
              {localizedTitle}
            </h1>
            <p className="mt-1.5 max-w-2xl text-xs text-white/80 line-clamp-1 sm:mt-2 sm:line-clamp-2 sm:text-sm lg:text-base">
              {localizedDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="section section-y grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-10">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-navy/50">
                  {t("schedule")}
                </p>
                <p className="mt-1 text-sm font-medium text-brand-navy">
                  {formatDate(event.startAt)}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-brand-navy/70">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(event.startAt)} – {formatTime(event.endAt)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-navy/50">
                  {t("location")}
                </p>
                <p className="mt-1 text-sm font-medium text-brand-navy">{event.location}</p>
                {event.mapUrl && (
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-sm text-brand-blue hover:underline"
                  >
                    {t("viewMap")} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-bold text-brand-navy">{t("about")}</h2>
            <p className="whitespace-pre-line text-brand-navy/70">{localizedDescription}</p>
          </div>

          {agenda.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-bold text-brand-navy">{t("agenda")}</h2>
              <ul className="space-y-0">
                {agenda.map((item, i) => (
                  <li key={i} className="flex gap-4 border-l-2 border-brand-teal/30 py-3 pl-4 last:pb-0">
                    <span className="w-20 shrink-0 text-sm font-semibold text-brand-blue">
                      {item.time}
                    </span>
                    <span className="text-sm text-brand-navy/80">{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {speakers.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-bold text-brand-navy">{t("speakers")}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {speakers.map((speaker, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <MediaTile
                      alt={speaker.name}
                      seed={`${event.id}-speaker-${i}`}
                      aspect="aspect-square"
                      className="w-12"
                    />
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">{speaker.name}</p>
                      <p className="text-xs text-brand-navy/60">{speaker.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-4 z-40 space-y-4 self-start lg:top-24 lg:bottom-auto lg:rounded-2xl lg:border lg:border-border lg:bg-surface lg:p-6">
          <div className="hidden items-center gap-2 lg:flex">
            <Ticket className="h-5 w-5 text-brand-blue" />
            <h2 className="font-bold text-brand-navy">{t("ticketTiers")}</h2>
          </div>
          <ul className="hidden space-y-2 lg:block">
            {event.ticketTiers.map((tier) => {
              const tierName = parseLocalizedText(tier.name);
              const hasEnded = tier.saleEndsAt && tier.saleEndsAt < new Date();
              return (
                <li
                  key={tier.id}
                  className={`rounded-xl bg-muted/50 px-3 py-2 text-sm ${hasEnded ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-brand-navy/80">
                      {tierName[locale as "en" | "km"] ?? tierName.en}
                    </span>
                    <span className="font-semibold text-brand-navy">
                      {tier.priceUsd === 0 ? t("free") : `$${tier.priceUsd.toFixed(2)}`}
                    </span>
                  </div>
                  {tier.saleEndsAt && (
                    <p className="mt-0.5 text-xs text-brand-navy/50">
                      {hasEnded
                        ? t("saleEnded")
                        : `${t("saleEndsOn")} ${formatDate(tier.saleEndsAt)}`}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          <RegistrationModal event={registrationEvent}>
            <Button className="w-full shadow-card-hover lg:shadow-none" size="lg">
              {t("register")}
            </Button>
          </RegistrationModal>
        </div>
      </div>
    </>
  );
}
