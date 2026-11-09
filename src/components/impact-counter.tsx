"use client";

import { useEffect, useRef, useState } from "react";

interface CounterProps {
  value: number;
  label: string;
  suffix?: string;
}

function useCountUp(target: number, durationMs = 1400) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();

          const tick = (now: number) => {
            const progress = Math.min((now - start) / durationMs, 1);
            setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target, durationMs]);

  return { value, ref };
}

export function ImpactStat({ value, label, suffix = "+" }: CounterProps) {
  const { value: animated, ref } = useCountUp(value);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-extrabold text-brand-blue sm:text-5xl">
        {animated.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-2 text-sm font-medium text-brand-navy/70">{label}</p>
    </div>
  );
}
