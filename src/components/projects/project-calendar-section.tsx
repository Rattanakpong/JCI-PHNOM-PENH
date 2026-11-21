import { getTranslations } from "next-intl/server";
import { UpcomingProjectsCalendar, type CalendarProject } from "@/components/projects/upcoming-projects-calendar";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { PILLAR_COLORS } from "@/lib/pillar-colors";
import type { ProjectPillar } from "@/lib/enums";
import { dayKey, formatDateRange, googleCalendarUrl, isUpcoming, todayInPhnomPenh } from "@/lib/project-dates";

// Matches brand.blue in tailwind.config.ts — events aren't tied to a pillar.
const EVENT_HEX = "#0088CE";

export interface CalendarEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  bannerUrl: string | null;
  startAt: Date;
  endAt: Date;
}

// Calendar view on the Events page: published events plus scheduled
// projects. Callers must render fresh (force-dynamic) since both are edited
// in the admin CMS.
export async function ProjectCalendarSection({ locale, events }: { locale: string; events: CalendarEvent[] }) {
  const t = await getTranslations("upcomingProjectsPage");
  const tEvents = await getTranslations("eventsPage");
  const tPillars = await getTranslations("pillars");
  const today = todayInPhnomPenh();

  const intlLocale = locale === "km" ? "km-KH" : "en-GB";
  const monthFmt = new Intl.DateTimeFormat(intlLocale, { month: "long", timeZone: "UTC" });
  const weekdayFmt = new Intl.DateTimeFormat(intlLocale, { weekday: "short", timeZone: "UTC" });
  const monthNames = Array.from({ length: 12 }, (_, m) => monthFmt.format(new Date(Date.UTC(2024, m, 1))));
  // 2024-01-01 was a Monday.
  const weekdayNames = Array.from({ length: 7 }, (_, i) => weekdayFmt.format(new Date(Date.UTC(2024, 0, 1 + i))));

  const scheduled = await prisma.project.findMany({
    where: { startDate: { not: null } },
    orderBy: { startDate: "asc" },
  });

  // Every scheduled project goes on the calendar (past ones render muted);
  // only upcoming ones are listed.
  const projectItems: CalendarProject[] = scheduled.map((project) => {
    const title = parseLocalizedText(project.title);
    const summary = parseLocalizedText(project.summary);
    const localTitle = title[locale as "en" | "km"] ?? title.en;
    const localSummary = summary[locale as "en" | "km"] ?? summary.en;
    const pillar = project.pillar as ProjectPillar;
    const startDate = project.startDate!;

    return {
      id: project.id,
      slug: project.slug,
      title: localTitle,
      summary: localSummary,
      coverUrl: project.coverUrl,
      pillarLabel: tPillars(pillar),
      pillarHex: PILLAR_COLORS[pillar].hex,
      pillarBadgeClassName: PILLAR_COLORS[pillar].badgeClassName,
      location: project.location,
      startKey: dayKey(startDate),
      endKey: dayKey(project.endDate ?? startDate),
      dateLabel: formatDateRange(startDate, project.endDate, locale),
      upcoming: isUpcoming(startDate, project.endDate, today),
      calendarUrl: googleCalendarUrl({
        title: `${localTitle} — JCI Phnom Penh`,
        details: localSummary,
        location: project.location,
        startDate,
        endDate: project.endDate,
      }),
      href: `/projects/${project.slug}`,
      linkLabel: t("viewProject"),
    };
  });

  const eventItems: CalendarProject[] = events.map((event) => {
    const title = parseLocalizedText(event.title);
    const description = parseLocalizedText(event.description);
    const localTitle = title[locale as "en" | "km"] ?? title.en;
    const localDescription = description[locale as "en" | "km"] ?? description.en;
    const time = (d: Date) => d.toISOString().slice(11, 16);

    return {
      id: event.id,
      slug: event.slug,
      title: localTitle,
      summary: localDescription,
      coverUrl: event.bannerUrl,
      pillarLabel: tEvents("eventBadge"),
      pillarHex: EVENT_HEX,
      pillarBadgeClassName: "border-transparent bg-brand-blue/10 text-brand-blue",
      location: event.location,
      startKey: dayKey(event.startAt),
      endKey: dayKey(event.endAt),
      dateLabel: `${formatDateRange(event.startAt, event.endAt, locale)} · ${time(event.startAt)}–${time(event.endAt)}`,
      upcoming: isUpcoming(event.startAt, event.endAt, today),
      calendarUrl: googleCalendarUrl({
        title: `${localTitle} — JCI Phnom Penh`,
        details: localDescription,
        location: event.location,
        startDate: event.startAt,
        endDate: event.endAt,
      }),
      href: `/events/${event.slug}`,
      linkLabel: tEvents("viewDetails"),
    };
  });

  const items = [...eventItems, ...projectItems].sort((a, b) => a.startKey.localeCompare(b.startKey));

  return (
    <UpcomingProjectsCalendar
      projects={items}
      todayKey={dayKey(today)}
      labels={{
        monthNames,
        weekdayNames,
        calendarTitle: t("calendarTitle"),
        listTitle: t("listTitle"),
        previousMonth: t("previousMonth"),
        nextMonth: t("nextMonth"),
        today: t("today"),
        showAll: t("showAll"),
        selectedDay: t.raw("selectedDay") as string,
        noneOnDay: t("noneOnDay"),
        empty: t("empty"),
        addToCalendar: t("addToCalendar"),
      }}
    />
  );
}
