"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";

export interface SlideItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  category: string;
}

const AUTO_ADVANCE_MS = 6000;

export function Slideshow({
  slides,
  categoryLabels,
}: {
  slides: SlideItem[];
  categoryLabels: Record<string, string>;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (i: number) => setIndex((i + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[index];
  const isExternal = slide.linkUrl?.startsWith("http");

  const content = (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded local file, not worth next/image config */}
      <img src={slide.imageUrl} alt={slide.title} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 pb-6 sm:p-10 sm:pb-8">
        <div>
          <Badge variant="gold" className="mb-2 w-fit sm:mb-3">
            {categoryLabels[slide.category] ?? slide.category}
          </Badge>
          <h2 className="max-w-2xl text-xl font-bold text-white sm:text-2xl md:text-3xl">
            {slide.title}
          </h2>
          {slide.description && (
            <p className="mt-1.5 max-w-xl text-sm text-white/80 line-clamp-2 sm:mt-2 sm:text-base">
              {slide.description}
            </p>
          )}
        </div>

        {slides.length > 1 && (
          <div className="flex gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goTo(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative h-[75vh] min-h-[380px] w-full overflow-hidden bg-brand-navy sm:h-[calc(100vh-4rem)] sm:min-h-[420px] md:h-[calc(100vh-5rem)]">
        {slide.linkUrl ? (
          isExternal ? (
            <a href={slide.linkUrl} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
              {content}
            </a>
          ) : (
            <Link href={slide.linkUrl} className="block h-full w-full">
              {content}
            </Link>
          )
        ) : (
          content
        )}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => goTo(index - 1)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white transition-colors hover:bg-white/35 sm:h-10 sm:w-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => goTo(index + 1)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white transition-colors hover:bg-white/35 sm:h-10 sm:w-10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
