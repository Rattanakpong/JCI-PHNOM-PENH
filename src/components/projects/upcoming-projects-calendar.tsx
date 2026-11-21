"use client";

import { useState } from "react";
import { CalendarPlus, ChevronLeft, ChevronRight, MapPin, CalendarDays } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CalendarProject {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverUrl: string | null;
  pillarLabel: string;
  pillarHex: string;
  pillarBadgeClassName: string;
  location: string | null;
  startKey: string; // "YYYY-MM-DD"
  endKey: string; // same as startKey for single-day projects
  dateLabel: string;
  upcoming: boolean;
  calendarUrl: string;
  href: string; // detail page — events and projects share this calendar
  linkLabel: string;
}

interface Labels {
  calendarTitle: string;
  listTitle: string;
  previousMonth: string;
  nextMonth: string;
  today: string;
  showAll: string;
  selectedDay: string; // contains "{date}"
  noneOnDay: string;
  empty: string;
  addToCalendar: string;
  // Formatted on the server so server and browser render identical text
  // (Node and browsers ship different ICU data, which caused hydration mismatches).
  monthNames: string[]; // 12, January first
  weekdayNames: string[]; // 7, Monday first
}

// All date math is in UTC on "YYYY-MM-DD" keys, matching how project dates
// are stored (see src/lib/project-dates.ts).
const keyOf = (d: Date) => d.toISOString().slice(0, 10);
const covers = (p: CalendarProject, key: string) => p.startKey <= key && key <= p.endKey;

function monthGrid(year: number, month: number): Date[] {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7; // Monday-first
  return Array.from({ length: 42 }, (_, i) => new Date(Date.UTC(year, month, 1 - offset + i)));
}

export function UpcomingProjectsCalendar({
  projects,
  todayKey,
  labels,
}: {
  projects: CalendarProject[];
  todayKey: string;
  labels: Labels;
}) {
  const upcoming = projects.filter((p) => p.upcoming);

  // Open on the month of the next upcoming project, or the current month.
  const initial = new Date(`${upcoming[0]?.startKey ?? todayKey}T00:00:00Z`);
  const [view, setView] = useState({ year: initial.getUTCFullYear(), month: initial.getUTCMonth() });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const monthLabel = `${labels.monthNames[view.month]} ${view.year}`;
  const weekdays = labels.weekdayNames;
  const days = monthGrid(view.year, view.month);

  function shiftMonth(delta: number) {
    setView(({ year, month }) => {
      const d = new Date(Date.UTC(year, month + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });
  }

  function goToToday() {
    const d = new Date(`${todayKey}T00:00:00Z`);
    setView({ year: d.getUTCFullYear(), month: d.getUTCMonth() });
    setSelectedKey(null);
  }

  const listed = selectedKey ? projects.filter((p) => covers(p, selectedKey)) : upcoming;
  const selectedLabel = selectedKey
    ? labels.selectedDay.replace(
        "{date}",
        `${Number(selectedKey.slice(8, 10))} ${labels.monthNames[Number(selectedKey.slice(5, 7)) - 1]}`,
      )
    : null;

  return (
    <div className="space-y-10">
      {/* Calendar — full width, with the list below */}
      <section className="rounded-2xl border border-border bg-surface p-3 shadow-card sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2 sm:mb-6">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-brand-blue sm:h-6 sm:w-6" />
            <h2 className="text-lg font-bold capitalize text-brand-navy sm:text-2xl">{monthLabel}</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToToday}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-navy/70 sm:px-3 sm:py-2 sm:text-sm transition-colors hover:bg-muted"
            >
              {labels.today}
            </button>
            <button
              type="button"
              aria-label={labels.previousMonth}
              onClick={() => shiftMonth(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-navy/70 transition-colors hover:bg-muted sm:h-10 sm:w-10"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              type="button"
              aria-label={labels.nextMonth}
              onClick={() => shiftMonth(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-navy/70 transition-colors hover:bg-muted sm:h-10 sm:w-10"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center sm:gap-2">
          {weekdays.map((w) => (
            <div key={w} className="pb-1 text-[11px] font-semibold uppercase text-brand-navy/40 sm:pb-2 sm:text-sm">
              {w}
            </div>
          ))}

          {days.map((day) => {
            const key = keyOf(day);
            const inMonth = day.getUTCMonth() === view.month;
            const dayProjects = projects.filter((p) => covers(p, key));
            const hasProjects = dayProjects.length > 0;
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;

            return (
              <button
                key={key}
                type="button"
                disabled={!hasProjects}
                aria-pressed={isSelected}
                aria-label={hasProjects ? `${key}: ${dayProjects.map((p) => p.title).join(", ")}` : key}
                onClick={() => setSelectedKey(isSelected ? null : key)}
                className={cn(
                  // Phones: compact square cells with dots. md+: tall cells listing event names.
                  "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors sm:text-base md:aspect-auto md:h-20 md:items-stretch md:justify-start md:gap-0.5 md:p-1.5 md:text-left lg:h-24",
                  inMonth ? "text-brand-navy" : "text-brand-navy/25",
                  hasProjects && "cursor-pointer font-semibold hover:bg-brand-blue/10",
                  hasProjects && !isSelected && "bg-brand-blue/5",
                  isSelected && "bg-brand-blue text-white hover:bg-brand-blue",
                  isToday && !isSelected && "ring-2 ring-inset ring-brand-blue/60",
                )}
              >
                <span className="md:px-1">{day.getUTCDate()}</span>
                {hasProjects && (
                  <span className="hidden min-w-0 flex-col gap-1 md:flex">
                    {dayProjects.slice(0, 1).map((p) => (
                      <span
                        key={p.id}
                        className={cn(
                          "truncate rounded-md px-1.5 py-0.5 text-xs font-medium",
                          isSelected ? "bg-white/20 text-white" : "text-brand-navy",
                          !p.upcoming && "opacity-60",
                        )}
                        style={isSelected ? undefined : { backgroundColor: `${p.pillarHex}26` }}
                      >
                        {p.title}
                      </span>
                    ))}
                    {dayProjects.length > 1 && (
                      <span className={cn("px-1.5 text-xs", isSelected ? "text-white/80" : "text-brand-navy/50")}>
                        +{dayProjects.length - 1}
                      </span>
                    )}
                  </span>
                )}
                {hasProjects && (
                  <span className="absolute bottom-1.5 flex gap-0.5 md:hidden">
                    {dayProjects.slice(0, 3).map((p) => (
                      <span
                        key={p.id}
                        className={cn("h-1.5 w-1.5 rounded-full", !p.upcoming && "opacity-40", isSelected && "ring-1 ring-white")}
                        style={{ backgroundColor: p.pillarHex }}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* List */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-brand-navy">{selectedLabel ?? labels.listTitle}</h2>
          {selectedKey && (
            <button
              type="button"
              onClick={() => setSelectedKey(null)}
              className="text-sm font-medium text-brand-blue hover:underline"
            >
              {labels.showAll}
            </button>
          )}
        </div>

        {listed.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center text-brand-navy/60">
            {selectedKey ? labels.noneOnDay : labels.empty}
          </p>
        ) : (
          <ul className="space-y-4">
            {listed.map((p) => (
              <li
                key={p.id}
                className={cn(
                  "flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card sm:flex-row",
                  !p.upcoming && "opacity-70",
                )}
              >
                <div
                  className="relative aspect-[16/9] w-full shrink-0 sm:aspect-auto sm:w-48"
                  style={{ backgroundColor: `${p.pillarHex}22` }}
                >
                  {p.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded local file
                    <img src={p.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <CalendarDays className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2" style={{ color: p.pillarHex }} />
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-5">
                  <Badge variant="outline" className={cn("w-fit", p.pillarBadgeClassName)}>
                    {p.pillarLabel}
                  </Badge>
                  <h3 className="text-lg font-semibold text-brand-navy">{p.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-brand-navy/70">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-brand-blue" />
                      {p.dateLabel}
                    </span>
                    {p.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-brand-blue" />
                        {p.location}
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-sm text-brand-navy/60">{p.summary}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    <Button asChild size="sm">
                      <Link href={p.href}>{p.linkLabel}</Link>
                    </Button>
                    {p.upcoming && (
                      <Button asChild size="sm" variant="outline">
                        <a href={p.calendarUrl} target="_blank" rel="noopener noreferrer">
                          <CalendarPlus className="mr-1.5 h-4 w-4" />
                          {labels.addToCalendar}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
