import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { MembershipApplicationForm } from "@/components/membership/membership-application-form";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("joinPage");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="section section-y max-w-3xl">
        <MembershipApplicationForm />
      </div>
    </>
  );
}
