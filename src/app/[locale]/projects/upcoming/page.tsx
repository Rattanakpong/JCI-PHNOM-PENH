import { redirect } from "@/i18n/navigation";

// The project calendar now lives on the Events page; keep old links working.
export default async function UpcomingProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: { pathname: "/events", query: { view: "calendar" } }, locale });
}
