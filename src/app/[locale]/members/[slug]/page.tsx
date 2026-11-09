import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Mail, Phone, Globe, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MediaTile } from "@/components/ui/media-placeholder";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("membersPage");

  const member = await prisma.member.findUnique({ where: { slug } });
  if (!member) notFound();

  const jobTitle = member.jobTitle ? parseLocalizedText(member.jobTitle) : null;
  const localizedJobTitle = jobTitle ? jobTitle[locale as "en" | "km"] ?? jobTitle.en : null;
  const bio = member.bio ? parseLocalizedText(member.bio) : null;
  const localizedBio = bio ? bio[locale as "en" | "km"] ?? bio.en : null;
  const jciExperience = member.jciExperience ? parseLocalizedText(member.jciExperience) : null;
  const localizedJciExperience = jciExperience ? jciExperience[locale as "en" | "km"] ?? jciExperience.en : null;
  const subtitle = [localizedJobTitle, member.businessName].filter(Boolean).join(" · ");
  const hasContact = member.email || member.phone || member.socialUrl;

  return (
    <>
      <div className="section pb-2 pt-8">
        <Link
          href="/members"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy/60 transition-colors hover:text-brand-blue"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToMembers")}
        </Link>
      </div>

      <div className="section pb-16 pt-6 sm:pb-24">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:items-center sm:text-left">
            <MediaTile
              src={member.photoUrl}
              alt={member.name}
              seed={member.id}
              aspect="aspect-square"
              className="w-28 shrink-0 rounded-full sm:w-36"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <h1 className="text-2xl font-extrabold text-brand-navy sm:text-3xl">{member.name}</h1>
                <Badge variant="gold">{t("memberSince", { year: member.joinYear })}</Badge>
              </div>

              {subtitle && <p className="mt-2 text-base text-brand-navy/70 sm:text-lg">{subtitle}</p>}

              {member.industry && (
                <Badge variant="outline" className="mt-3">
                  {member.industry}
                </Badge>
              )}

              {hasContact && (
                <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:border-brand-blue hover:text-brand-blue"
                    >
                      <Mail className="h-4 w-4" />
                      {t("emailLabel")}
                    </a>
                  )}
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:border-brand-blue hover:text-brand-blue"
                    >
                      <Phone className="h-4 w-4" />
                      {t("phoneLabel")}
                    </a>
                  )}
                  {member.socialUrl && (
                    <a
                      href={member.socialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-brand-navy transition-colors hover:border-brand-blue hover:text-brand-blue"
                    >
                      <Globe className="h-4 w-4" />
                      {t("websiteLabel")}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {localizedBio && (
            <div className="border-t border-border p-8">
              <h2 className="mb-3 text-lg font-bold text-brand-navy">{t("aboutTitle")}</h2>
              <p className="max-w-2xl leading-relaxed text-brand-navy/70">{localizedBio}</p>
            </div>
          )}

          {localizedJciExperience && (
            <div className="border-t border-border bg-brand-gold/5 p-8">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-brand-navy">
                <Award className="h-5 w-5 text-brand-gold" />
                {t("jciExperienceTitle")}
              </h2>
              <p className="max-w-2xl leading-relaxed text-brand-navy/70">{localizedJciExperience}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
