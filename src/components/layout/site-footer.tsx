import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("nav");

  return (
    <footer className="bg-brand-navy text-white/80">
      {/* Logo + three link columns in one row; on phones the logo takes its own row above the columns */}
      <div className="section grid grid-cols-3 gap-x-6 gap-y-8 py-14 sm:grid-cols-4 sm:gap-10">
        <div className="col-span-3 sm:col-span-1">
          <Image
            src="/brand/logo-white.png"
            alt="JCI Phnom Penh"
            width={1100}
            height={500}
            className="h-9 w-auto"
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-white">{t("about")}</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-brand-teal">
                {t("about")}
              </Link>
            </li>
            <li>
              <Link href="/about/jci-cambodia" className="hover:text-brand-teal">
                {t("jciCambodia")}
              </Link>
            </li>
            <li>
              <Link href="/members" className="hover:text-brand-teal">
                {t("members")}
              </Link>
            </li>
            <li>
              <Link href="/projects" className="hover:text-brand-teal">
                {t("projects")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-white">{t("eventsAndNews")}</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/events" className="hover:text-brand-teal">
                {t("events")}
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-brand-teal">
                {t("news")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand-teal">
                {t("contact")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-white">{t("join")}</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/join" className="hover:text-brand-teal">
                {t("join")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="section border-t border-white/10 py-6 text-xs text-white/50">
        © {new Date().getFullYear()} JCI Phnom Penh. All rights reserved.
      </div>
    </footer>
  );
}
