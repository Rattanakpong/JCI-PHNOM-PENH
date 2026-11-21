"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Milestone {
  year: string;
  title: string;
  body: string;
}

// Scroll-driven: the rail fills as the reader scrolls through the history,
// and the milestone level with the reading line (55% down the viewport)
// grows — bigger year, lifted card. Passed milestones stay lit; ones not yet
// reached are dimmed. Renders fully visible until JS has measured, so the
// section never sits blank while scripts load.
export function CambodiaTimeline({ milestones }: { milestones: Milestone[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [measured, setMeasured] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const container = containerRef.current;
      if (!container) return;
      const line = window.innerHeight * 0.55;
      const rect = container.getBoundingClientRect();
      setProgress(Math.min(1, Math.max(0, (line - rect.top) / rect.height)));

      let current = -1;
      itemRefs.current.forEach((item, i) => {
        if (item && item.getBoundingClientRect().top <= line) current = i;
      });
      setActive(current);
      setMeasured(true);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative max-w-3xl space-y-6">
      {/* Rail behind the dots, filling with scroll progress */}
      <div aria-hidden className="absolute bottom-5 left-5 top-5 w-1 -translate-x-1/2 rounded-full bg-border">
        <div
          className="w-full rounded-full bg-[linear-gradient(180deg,#0088CE,#4ECDC4,#F4C430)] transition-[height] duration-150 ease-out"
          style={{ height: measured ? `${progress * 100}%` : "100%" }}
        />
      </div>

      {milestones.map((m, i) => {
        const isActive = measured && i === active;
        const isReached = !measured || i <= active;

        return (
          <div
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={cn(
              "relative flex gap-5 transition-opacity duration-500",
              isReached ? "opacity-100" : "opacity-40"
            )}
          >
            <div
              className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white transition-all duration-500",
                isReached ? "bg-brand-blue" : "bg-brand-navy/30",
                isActive && "scale-125 ring-4 ring-brand-blue/25"
              )}
            >
              {isActive && (
                <span aria-hidden className="absolute inset-0 rounded-full bg-brand-blue/40 motion-safe:animate-ping" />
              )}
              <span className="relative">{i + 1}</span>
            </div>

            <div
              className={cn(
                "flex-1 origin-left rounded-2xl border p-5 transition-all duration-500 ease-out",
                isActive
                  ? "border-brand-blue/30 bg-surface shadow-card-hover motion-safe:sm:scale-[1.03]"
                  : "border-transparent"
              )}
            >
              <span
                className={cn(
                  "inline-block origin-left bg-[linear-gradient(90deg,#0088CE,#4ECDC4,#F4C430)] bg-clip-text font-black text-transparent transition-transform duration-500",
                  "text-2xl sm:text-3xl",
                  isActive && "motion-safe:scale-125"
                )}
              >
                {m.year}
              </span>
              <h3 className="mt-2 text-lg font-bold text-brand-navy">{m.title}</h3>
              <p className="mt-2 text-brand-navy/70">{m.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
