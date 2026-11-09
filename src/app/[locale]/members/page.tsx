import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { MemberDirectory } from "@/components/members/member-directory";
import { prisma } from "@/lib/prisma";

// Member directory is editable via the admin CMS — don't bake it in at build time.
export const dynamic = "force-dynamic";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("membersPage");

  // Most recently added member first, so new entries surface at the top
  // instead of being buried alphabetically.
  const members = await prisma.member.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="section section-y">
        <MemberDirectory
          members={members}
          locale={locale}
          labels={{
            searchPlaceholder: t("searchPlaceholder"),
            allYears: t("allYears"),
            noResults: t("noResults"),
          }}
        />
      </div>
    </>
  );
}
