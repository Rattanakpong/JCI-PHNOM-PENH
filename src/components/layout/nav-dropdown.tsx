"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ArrowRight, Globe, Landmark, FolderKanban, CalendarDays } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const ICONS = { globe: Globe, landmark: Landmark, folder: FolderKanban, calendar: CalendarDays } as const;

// Per-item accent, cycling through the brand palette.
const ACCENTS = [
  { chip: "from-brand-blue/15 to-brand-blue/5 text-brand-blue ring-brand-blue/20", bar: "bg-brand-blue" },
  { chip: "from-brand-teal/20 to-brand-teal/5 text-brand-teal ring-brand-teal/25", bar: "bg-brand-teal" },
  { chip: "from-brand-gold/20 to-brand-gold/5 text-brand-gold ring-brand-gold/25", bar: "bg-brand-gold" },
];

// Grace period before closing on mouse-leave, so crossing the small gap
// between trigger and panel (or a brief overshoot) doesn't snap it shut.
const CLOSE_DELAY_MS = 150;

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
    logo?: string; // shown instead of the icon when set
  }>;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const sectionActive = items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      cancelClose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={() => {
        cancelClose();
        closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1 whitespace-nowrap border-b-2 py-6 text-sm font-medium transition-colors hover:border-brand-blue hover:text-brand-blue xl:text-[15px]",
          open || sectionActive ? "border-brand-blue text-brand-blue" : "border-transparent text-brand-navy/80",
        )}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300 xl:h-4 xl:w-4", open && "rotate-180")} />
      </button>

      <div
        className={cn(
          "absolute left-1/2 top-full w-[390px] -translate-x-1/2 pt-3 transition-all duration-200 ease-out",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
        )}
      >
        {/* Caret pointing at the trigger */}
        <div className="absolute left-1/2 top-[7px] h-3 w-3 -translate-x-1/2 rotate-45 rounded-[3px] border-l border-t border-white/70 bg-white/80 backdrop-blur-xl" />

        <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-2 shadow-[0_20px_50px_-12px_rgb(11_19_43/0.25)] ring-1 ring-brand-navy/5 backdrop-blur-xl backdrop-saturate-150">
          {/* Soft brand glow behind the items */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-teal/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-brand-blue/10 blur-3xl" />

          {items.map((item, index) => {
            const Icon = item.icon ? ICONS[item.icon] : undefined;
            const accent = ACCENTS[index % ACCENTS.length];
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                tabIndex={open ? 0 : -1}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${60 + index * 50}ms` : "0ms" }}
                className={cn(
                  "group relative flex items-start gap-3.5 rounded-xl p-3 transition-all duration-300",
                  open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
                  active ? "bg-white shadow-sm" : "hover:bg-white/90 hover:shadow-sm",
                )}
              >
                {/* Accent bar: always shown on the current page, grows in on hover otherwise */}
                <span
                  className={cn(
                    "absolute left-0 top-1/2 w-1 -translate-y-1/2 rounded-full transition-all duration-300",
                    accent.bar,
                    active ? "h-8" : "h-0 group-hover:h-8",
                  )}
                />

                {/* Logo tile (wide, to fit horizontal lockups); falls back to the accent icon */}
                {item.logo ? (
                  <span className="relative flex h-12 w-[76px] shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-sm ring-1 ring-brand-navy/10 transition-transform duration-300 group-hover:scale-105">
                    {/* eslint-disable-next-line @next/next/no-img-element -- small static brand asset, path resolved at request time */}
                    <img src={item.logo} alt="" className="max-h-full max-w-full object-contain" />
                  </span>
                ) : (
                  Icon && (
                    <span
                      className={cn(
                        "relative flex h-12 w-[76px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 transition-transform duration-300 group-hover:scale-105",
                        accent.chip,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  )
                )}

                <span className="relative flex-1">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-navy">
                    {item.label}
                    <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-brand-blue opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
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
  );
}
