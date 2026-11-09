import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { InquiryForm } from "@/components/inquiry-form";

export default async function SponsorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("sponsorPage");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="section section-y max-w-xl">
        <InquiryForm
          endpoint="/api/sponsor-inquiries"
          submitLabel={t("submit")}
          successMessage={t("success")}
          fields={[
            { name: "orgName", label: t("orgName") },
            { name: "contactEmail", label: t("contactEmail"), type: "email" },
            {
              name: "proposal",
              label: t("proposal"),
              placeholder: t("proposalPlaceholder"),
            },
          ]}
        />
      </div>
    </>
  );
}
