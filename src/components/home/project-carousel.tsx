"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MediaTile } from "@/components/ui/media-placeholder";
import { PILLAR_COLORS } from "@/lib/pillar-colors";
import type { ProjectPillar } from "@/lib/enums";

export interface ProjectCarouselItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverUrl: string | null;
  pillar: string;
  pillarLabel: string;
}

export function ProjectCarousel({
  projects,
  labels,
}: {
  projects: ProjectCarouselItem[];
  labels: { viewProject: string; empty: string };
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const node = scrollerRef.current;
    if (!node) return;
    const card = node.querySelector<HTMLElement>("[data-card]");
    const amount = (card?.offsetWidth ?? 320) + 24;
    node.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  if (projects.length === 0) {
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
        {projects.map((project) => (
          <Card
            key={project.id}
            data-card
            className="w-[260px] shrink-0 snap-start overflow-hidden sm:w-[320px]"
          >
            <MediaTile
              src={project.coverUrl}
              alt={project.title}
              seed={project.id}
              className="rounded-none"
            />
            <CardHeader>
              <Badge
                variant="outline"
                className={`mb-2 w-fit ${PILLAR_COLORS[project.pillar as ProjectPillar].badgeClassName}`}
              >
                {project.pillarLabel}
              </Badge>
              <CardTitle className="line-clamp-1">{project.title}</CardTitle>
              <CardDescription className="line-clamp-3">{project.summary}</CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <Link
                href={`/projects/${project.slug}`}
                className="text-sm font-medium text-brand-blue hover:underline"
              >
                {labels.viewProject}
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {projects.length > 1 && (
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
