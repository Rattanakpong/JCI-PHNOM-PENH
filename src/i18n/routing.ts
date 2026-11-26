import { defineRouting } from "next-intl/routing";

// Khmer disabled for now — focusing on the English site first. Re-add "km"
// here (and its two <LanguageSwitcher /> call sites in site-header.tsx and
// mobile-nav.tsx) to bring it back; the content model and admin KM fields
// were left untouched.
export const locales = ["en"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
});
