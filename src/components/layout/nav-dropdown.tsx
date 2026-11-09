"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ArrowRight, Globe, Landmark } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const ICONS = { globe: Globe, landmark: Landmark } as const;

export function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: Array<{
    href: string;
    label: string;
    description?: string;
    icon?: keyof typeof ICONS;
  }>;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 border-b-2 border-transparent py-6 text-sm font-medium text-brand-navy/80 transition-colors hover:border-brand-blue hover:text-brand-blue"
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute left-1/2 top-full w-[340px] -translate-x-1/2 pt-3",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200",
          )}
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card-hover">
            <div className="h-1 w-full bg-gradient-to-r from-brand-blue via-brand-teal to-brand-gold" />
            <div className="p-2">
              {items.map((item, index) => {
                const Icon = item.icon ? ICONS[item.icon] : undefined;
                const accent = [
                  "bg-brand-blue/10 text-brand-blue",
                  "bg-brand-teal/10 text-brand-teal",
                  "bg-brand-gold/10 text-brand-gold",
                ][index % 3];

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
                  >
                    {Icon && (
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110",
                          accent,
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                    )}
                    <span className="flex-1">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-navy">
                        {item.label}
                        <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                      </span>
                      {item.description && (
                        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
