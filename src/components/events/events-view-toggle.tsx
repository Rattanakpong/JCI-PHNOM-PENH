"use client";

import { useState, type ReactNode } from "react";
import { CalendarDays, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export type EventsView = "list" | "calendar";

// Both views are server-rendered; the inactive one is only hidden, so the
// calendar keeps its month/selected day when switching back and forth.
export function EventsViewToggle({
  initialView,
  list,
  calendar,
  labels,
}: {
  initialView: EventsView;
  list: ReactNode;
  calendar: ReactNode;
  labels: { list: string; calendar: string };
}) {
  const [view, setView] = useState<EventsView>(initialView);

  function select(next: EventsView) {
    setView(next);
    // Keep the choice in the URL so refresh/share lands on the same view.
    const url = new URL(window.location.href);
    if (next === "calendar") url.searchParams.set("view", "calendar");
    else url.searchParams.delete("view");
    window.history.replaceState(window.history.state, "", url);
  }

  const options = [
    { value: "list" as const, label: labels.list, Icon: LayoutGrid },
    { value: "calendar" as const, label: labels.calendar, Icon: CalendarDays },
  ];

  return (
    <>
      <div role="group" className="mb-8 inline-flex rounded-xl border border-border bg-surface p-1 shadow-card">
        {options.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={view === value}
            onClick={() => select(value)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              view === value ? "bg-brand-blue text-white" : "text-brand-navy/70 hover:bg-muted",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div hidden={view !== "list"}>{list}</div>
      <div hidden={view !== "calendar"}>{calendar}</div>
    </>
  );
}
