"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MediaTile } from "@/components/ui/media-placeholder";

export interface EventCarouselItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  dateLabel: string;
  bannerUrl: string | null;
  minPrice: number;
}

export function EventCarousel({
  events,
  labels,
}: {
  events: EventCarouselItem[];
  labels: { viewDetails: string; free: string; from: string; empty: string };
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const node = scrollerRef.current;
    if (!node) return;
    const card = node.querySelector<HTMLElement>("[data-card]");
    const amount = (card?.offsetWidth ?? 320) + 24;
    node.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  if (events.length === 0) {
    return (
      <div className="section">
        <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-brand-navy/50">
          {labels.empty}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="section flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {events.map((event) => (
          <Card
            key={event.id}
            data-card
            className="w-[260px] shrink-0 snap-start overflow-hidden sm:w-[320px]"
          >
            <MediaTile
              src={event.bannerUrl}
              alt={event.title}
              seed={event.id}
              className="rounded-none"
            />
            <CardHeader>
              <Badge variant="teal" className="mb-2 w-fit">
                {event.dateLabel}
              </Badge>
              <CardTitle className="line-clamp-1">{event.title}</CardTitle>
              <CardDescription className="line-clamp-2">{event.description}</CardDescription>
            </CardHeader>
            <div className="space-y-3 px-6 pb-6">
              <p className="text-sm text-brand-navy/60">
                {event.location} ·{" "}
                {event.minPrice === 0 ? labels.free : `${labels.from} $${event.minPrice.toFixed(2)}`}
              </p>
              <Button asChild variant="secondary" className="w-full">
                <Link href={`/events/${event.slug}`}>{labels.viewDetails}</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {events.length > 1 && (
        <div className="section mt-4 flex justify-end gap-2">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollByCard(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-brand-navy/60 transition-colors hover:text-brand-navy"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollByCard(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-brand-navy/60 transition-colors hover:text-brand-navy"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
