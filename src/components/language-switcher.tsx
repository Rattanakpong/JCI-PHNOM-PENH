"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  en: "English",
  km: "ខ្មែរ",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const activeIndex = locales.indexOf(locale as (typeof locales)[number]);

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface p-1 pl-2.5 shadow-sm">
      <Globe className="h-3.5 w-3.5 shrink-0 text-brand-navy/40" />

      {/* Fixed width so the two tracks are always exactly equal — required
          for the sliding highlight below to land under the right label,
          since "English" and "ខ្មែរ" render at very different widths. */}
      <div className="relative flex h-7 w-[148px]">
        <div
          className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-brand-blue transition-transform duration-200 ease-out"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {locales.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => router.replace(pathname, { locale: loc })}
            aria-current={locale === loc}
            className={cn(
              "relative z-10 flex w-1/2 items-center justify-center whitespace-nowrap rounded-full text-xs font-semibold transition-colors",
              loc === "km" && "font-khmer",
              locale === loc ? "text-white" : "text-brand-navy/60 hover:text-brand-navy"
            )}
          >
            {LABELS[loc]}
          </button>
        ))}
      </div>
    </div>
  );
}
