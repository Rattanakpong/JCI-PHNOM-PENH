"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SlideItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  category: string;
}

const AUTO_ADVANCE_MS = 6000;
const SWIPE_THRESHOLD_PX = 40;

export function Slideshow({
  slides,
  categoryLabels,
}: {
  slides: SlideItem[];
  categoryLabels: Record<string, string>;
}) {
  const [index, setIndex] = useState(0);
  // Pause only while the tab is hidden — the slideshow fills the viewport, so
  // pausing on hover would stop it almost permanently on desktop.
  const [hidden, setHidden] = useState(false);
  // The slow zoom is a CSS transition, so it needs one post-mount frame at
  // scale(1) for the first slide to animate too.
  const [mounted, setMounted] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (i: number) => setIndex((i + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Re-armed on every index change, so manual navigation restarts the countdown.
  useEffect(() => {
    if (hidden || slides.length <= 1) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % slides.length), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [index, hidden, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) > SWIPE_THRESHOLD_PX) goTo(index + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="relative h-[75vh] min-h-[380px] w-full overflow-hidden bg-brand-navy sm:h-[calc(100vh-4rem)] sm:min-h-[420px] md:h-[calc(100vh-5rem)]">
        {slides.map((slide, i) => {
          const active = i === index;
          const isExternal = slide.linkUrl?.startsWith("http");

          const content = (
            <div className="relative h-full w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded local file, not worth next/image config */}
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className={cn(
                  "h-full w-full object-cover transition-transform motion-reduce:transition-none",
                  // Zoom in slowly while active; snap back only after the 1s fade-out finishes.
                  active && mounted
                    ? "scale-[1.08] [transition-duration:7000ms] ease-out"
                    : "scale-100 delay-1000 duration-0",
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/20 to-transparent" />
              <div
                className={cn(
                  "absolute inset-x-0 bottom-0 p-5 pb-11 transition-all duration-700 sm:p-10 sm:pb-16",
                  active ? "translate-y-0 opacity-100 delay-300" : "translate-y-4 opacity-0",
                )}
              >
                <Badge variant="teal" className="mb-2 w-fit bg-brand-teal sm:mb-3">
                  {categoryLabels[slide.category] ?? slide.category}
                </Badge>
                <h2 className="max-w-2xl text-xl font-bold text-brand-gold drop-shadow-md sm:text-2xl md:text-3xl">
                  {slide.title}
                </h2>
                {slide.description && (
                  <p className="mt-1.5 max-w-xl text-sm text-white drop-shadow line-clamp-2 sm:mt-2 sm:text-base">
                    {slide.description}
                  </p>
                )}
              </div>
            </div>
          );

          const linkProps = { className: "block h-full w-full", tabIndex: active ? 0 : -1 };

          return (
            <div
              key={slide.id}
              aria-hidden={!active}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
              )}
            >
              {slide.linkUrl ? (
                isExternal ? (
                  <a href={slide.linkUrl} target="_blank" rel="noopener noreferrer" {...linkProps}>
                    {content}
                  </a>
                ) : (
                  <Link href={slide.linkUrl} {...linkProps}>
                    {content}
                  </Link>
                )
              ) : (
                content
              )}
            </div>
          );
        })}

        {slides.length > 1 && (
          <>
            {/* Progress dots — the active one fills over AUTO_ADVANCE_MS */}
            <div className="absolute bottom-6 left-5 z-20 flex gap-1.5 sm:bottom-8 sm:left-10">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => goTo(i)}
                  className={cn(
                    "relative h-1.5 overflow-hidden rounded-full bg-white/40 transition-all duration-500 hover:bg-white/60",
                    i === index ? "w-10" : "w-1.5",
                  )}
                >
                  {i === index && (
                    <span
                      key={index}
                      className="absolute inset-y-0 left-0 rounded-full bg-white animate-slide-progress"
                      style={{
                        animationDuration: `${AUTO_ADVANCE_MS}ms`,
                        animationPlayState: hidden ? "paused" : "running",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => goTo(index - 1)}
              className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white transition-colors hover:bg-white/35 sm:h-10 sm:w-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => goTo(index + 1)}
              className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white transition-colors hover:bg-white/35 sm:h-10 sm:w-10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
