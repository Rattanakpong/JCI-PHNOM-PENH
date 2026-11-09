import { prisma } from "@/lib/prisma";

// Contact info and social links, editable from /admin/settings instead of
// being hardcoded in page source. Falls back to these defaults for any key
// not yet present in the DB (e.g. before the first admin edit / seed run),
// so behavior is unchanged until someone edits a value.
export const DEFAULT_SITE_SETTINGS = {
  contactEmail: "jci.phnompenh@gmail.com",
  contactPhone: "+855 61 759 269",
  contactAddress: "JCI Cambodia Office (KY iCenter - 22nd Floor)",
  contactMapUrl: "https://maps.app.goo.gl/Scpqx6AUQwM3QfN27",
  facebookUrl: "https://www.facebook.com/JCIPhnomPenh",
  telegramUrl: "https://t.me/jciphnompenh",
} as const;

export type SiteSettingKey = keyof typeof DEFAULT_SITE_SETTINGS;
export const SITE_SETTING_KEYS = Object.keys(DEFAULT_SITE_SETTINGS) as SiteSettingKey[];

export type SiteSettings = Record<SiteSettingKey, string>;

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await prisma.siteSetting.findMany();
  const overrides = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULT_SITE_SETTINGS, ...overrides };
}

// Derives a tel: href from a freeform display phone number by stripping
// everything but digits and a leading "+".
export function phoneToTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
