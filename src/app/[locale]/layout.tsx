import type { Metadata } from "next";
import { Inter, Kantumruy_Pro, Noto_Sans_Khmer } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const kantumruyPro = Kantumruy_Pro({
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-kantumruy",
  display: "swap",
});

// Noto Sans Khmer backs up Kantumruy Pro for any glyphs it doesn't cover.
const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-khmer",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JCI Phnom Penh",
  description:
    "JCI Phnom Penh — Active Citizens Creating Impact across Cambodia.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${kantumruyPro.variable} ${notoSansKhmer.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
