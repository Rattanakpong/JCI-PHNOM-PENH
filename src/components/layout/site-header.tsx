import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavDropdown } from "@/components/layout/nav-dropdown";
import { Button } from "@/components/ui/button";

const navLinkClassName =
  "border-b-2 border-transparent py-6 text-sm font-medium text-brand-navy/80 transition-colors hover:border-brand-blue hover:text-brand-blue";

export function SiteHeader() {
  const t = useTranslations("nav");

  const aboutDropdownItems = [
    {
      href: "/about/jci-cambodia",
      label: t("jciCambodia"),
      description: t("jciCambodiaDesc"),
      icon: "globe" as const,
    },
    {
      href: "/about",
      label: t("jciPhnomPenh"),
      description: t("jciPhnomPenhDesc"),
      icon: "landmark" as const,
    },
  ];

  // Flat list for the mobile menu — the "About" dropdown group expands
  // inline into its destinations instead of nesting another level on touch.
  const mobileLinks: Array<{ href: string; label: string }> = [
    { href: "/", label: t("home") },
    ...aboutDropdownItems,
    { href: "/projects", label: t("projects") },
    { href: "/members", label: t("members") },
    { href: "/events", label: t("events") },
    { href: "/news", label: t("news") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="section relative flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="flex items-center">
          <Image
            src="/brand/logo-main.png"
            alt="JCI Phnom Penh"
            width={608}
            height={298}
            priority
            className="h-11 w-auto md:h-16"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/" className={navLinkClassName}>
            {t("home")}
          </Link>
          <NavDropdown label={t("about")} items={aboutDropdownItems} />
          <Link href="/projects" className={navLinkClassName}>
            {t("projects")}
          </Link>
          <Link href="/members" className={navLinkClassName}>
            {t("members")}
          </Link>
          <Link href="/events" className={navLinkClassName}>
            {t("events")}
          </Link>
          <Link href="/news" className={navLinkClassName}>
            {t("news")}
          </Link>
          <Link href="/contact" className={navLinkClassName}>
            {t("contact")}
          </Link>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <LanguageSwitcher />
          <div className="h-6 w-px bg-border" />
          <Button asChild size="sm">
            <Link href="/join">{t("join")}</Link>
          </Button>
        </div>

        <MobileNav links={mobileLinks} joinLabel={t("join")} />
      </div>
    </header>
  );
}
