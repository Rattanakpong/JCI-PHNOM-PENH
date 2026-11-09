"use client";

import { useEffect, useRef, useState } from "react";

interface Milestone {
  year: string;
  title: string;
  body: string;
}

// Plays once, the first time the timeline scrolls into view — numbered dots
// pop in, the connector line grows downward, then the copy fades up, each
// staggered a beat behind the last milestone.
export function CambodiaTimeline({ milestones }: { milestones: Milestone[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="max-w-3xl space-y-8">
      {milestones.map((m, i) => {
        const stepDelay = i * 150;
        return (
          <div
            key={i}
            className="flex gap-5 transition-all duration-700 ease-out"
            style={{
              transitionDelay: `${stepDelay}ms`,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
            }}
          >
            <div className="flex flex-col items-center">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white transition-transform duration-500 ease-out"
                style={{
                  transitionDelay: `${stepDelay}ms`,
                  transform: visible ? "scale(1)" : "scale(0.4)",
                }}
              >
                {i + 1}
              </div>
              {i < milestones.length - 1 && (
                <div
                  className="mt-1 w-px flex-1 origin-top bg-border transition-transform duration-700 ease-out"
                  style={{
                    transitionDelay: `${stepDelay + 200}ms`,
                    transform: visible ? "scaleY(1)" : "scaleY(0)",
                  }}
                />
              )}
            </div>
            <div className="pb-2">
              <span className="inline-flex items-center rounded-full bg-brand-gold/20 px-2.5 py-0.5 text-xs font-semibold text-brand-navy">
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
