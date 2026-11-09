import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, Phone, MapPin, Facebook, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { InquiryForm } from "@/components/inquiry-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getSiteSettings, phoneToTelHref } from "@/lib/site-settings";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contactPage");
  const settings = await getSiteSettings();

  const infoRows = [
    { icon: Mail, label: t("emailLabel"), value: settings.contactEmail, href: `mailto:${settings.contactEmail}` },
    { icon: Phone, label: t("phoneLabel"), value: settings.contactPhone, href: phoneToTelHref(settings.contactPhone) },
    { icon: MapPin, label: t("addressLabel"), value: settings.contactAddress, href: settings.contactMapUrl, external: true },
  ];

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="section section-y grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <InquiryForm
          title={t("formTitle")}
          endpoint="/api/contact-inquiries"
          submitLabel={t("submit")}
          successMessage={t("success")}
          fields={[
            { name: "fullName", label: t("fullName") },
            { name: "email", label: t("email"), type: "email" },
            {
              name: "message",
              label: t("message"),
              placeholder: t("messagePlaceholder"),
            },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle>{t("infoTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {infoRows.map(({ icon: Icon, label, value, href, external }) => (
              <a
                key={label}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group flex items-start gap-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 pt-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-navy/40">
                    {label}
                  </p>
                  <p className="font-medium text-brand-navy transition-colors group-hover:text-brand-blue">
                    {value}
                  </p>
                </div>
              </a>
            ))}

            <div className="flex gap-3 border-t border-border pt-5">
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-brand-navy/70 transition-colors hover:border-brand-blue hover:bg-brand-blue hover:text-white"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={settings.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-brand-navy/70 transition-colors hover:border-brand-blue hover:bg-brand-blue hover:text-white"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
