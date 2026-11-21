import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Mail, Phone, Globe } from "lucide-react";
import { MemberPortrait } from "@/components/members/member-portrait";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("membersPage");

  const member = await prisma.member.findUnique({ where: { slug } });
  if (!member) notFound();

  const jobTitle = member.jobTitle ? parseLocalizedText(member.jobTitle) : null;
  const localizedJobTitle = jobTitle ? (jobTitle[locale as "en" | "km"] ?? jobTitle.en) : null;
  const bio = member.bio ? parseLocalizedText(member.bio) : null;
  const localizedBio = bio ? (bio[locale as "en" | "km"] ?? bio.en) : null;
  const jciExperience = member.jciExperience ? parseLocalizedText(member.jciExperience) : null;
  const localizedJciExperience = jciExperience ? (jciExperience[locale as "en" | "km"] ?? jciExperience.en) : null;
  // Admins enter one role per line; a leading year or range ("2024 – Vice
  // President", "2022-2023: Project Director") is pulled out for the timeline.
  // Joining the chapter is always the first milestone, so every profile has one.
  const experience = [
    ...(localizedJciExperience ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^(\d{4}(?:\s*[–—-]\s*(?:\d{4}|present|now))?)\s*[–—:-]\s*(.+)$/i);
        return match ? { year: match[1], text: match[2] } : { year: null, text: line };
      }),
    { year: String(member.joinYear), text: t("joinedChapter") },
  ];
  const subtitle = [localizedJobTitle, member.businessName].filter(Boolean).join(", ");
  const contacts = [
    member.email && { Icon: Mail, label: t("emailLabel"), value: member.email, href: `mailto:${member.email}` },
    member.phone && { Icon: Phone, label: t("phoneLabel"), value: member.phone, href: `tel:${member.phone}` },
    member.socialUrl && {
      Icon: Globe,
      label: t("websiteLabel"),
      value: member.socialUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
      href: member.socialUrl,
    },
  ].filter((c): c is { Icon: typeof Mail; label: string; value: string; href: string } => Boolean(c));

  return (
    <div className="section pb-16 pt-8 sm:pb-24">
      <Link
        href="/members"
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy/60 transition-colors hover:text-brand-blue"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToMembers")}
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
        {/* Photo and contact details */}
        <aside className="md:sticky md:top-28 md:self-start">
          <MemberPortrait
            member={member}
            className="mx-auto aspect-[4/5] w-56 rounded-xl border border-border md:w-full"
            initialsClassName="text-5xl sm:text-6xl"
          />

          {contacts.length > 0 && (
            <dl className="mt-6 space-y-3 text-sm">
              {contacts.map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-navy/40" />
                  <div className="min-w-0">
                    <dt className="text-xs text-brand-navy/50">{label}</dt>
                    <dd className="truncate">
                      <a
                        href={href}
                        {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                        className="font-medium text-brand-navy underline-offset-4 hover:text-brand-blue hover:underline"
                      >
                        {value}
                      </a>
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
        </aside>

        <div className="min-w-0">
          <p className="text-sm text-brand-navy/50">{t("memberSince", { year: member.joinYear })}</p>
          <h1 className="mt-1 text-3xl font-bold leading-tight text-brand-navy sm:text-4xl">{member.name}</h1>
          {subtitle && <p className="mt-2 text-lg text-brand-navy/70">{subtitle}</p>}
          {member.industry && <p className="mt-1 text-sm text-brand-navy/50">{member.industry}</p>}

          {localizedBio && (
            <section className="mt-10 border-t border-border pt-8">
              <h2 className="text-lg font-bold text-brand-navy">{t("aboutTitle")}</h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-brand-navy/75">{localizedBio}</p>
            </section>
          )}

          <section className="mt-10 border-t border-border pt-8">
            <h2 className="text-lg font-bold text-brand-navy">{t("jciExperienceTitle")}</h2>
            <dl className="mt-4 max-w-2xl divide-y divide-border">
              {experience.map((item, i) => (
                <div key={i} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 py-3">
                  <dt className="text-sm font-semibold tabular-nums text-brand-navy/60">{item.year ?? ""}</dt>
                  <dd className="text-brand-navy/80">{item.text}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
