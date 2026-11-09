import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    upcomingEvents,
    recentRegistrations,
    pendingPayments,
    totalProjects,
    newMembershipApplications,
    newSponsorInquiries,
    newContactInquiries,
  ] = await Promise.all([
    prisma.event.count({ where: { startAt: { gte: new Date() } } }),
    prisma.registration.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.payment.count({ where: { status: "SUBMITTED" } }),
    prisma.project.count(),
    prisma.membershipApplication.count({ where: { status: "NEW" } }),
    prisma.sponsorInquiry.count({ where: { status: "NEW" } }),
    prisma.contactInquiry.count({ where: { status: "NEW" } }),
  ]);
  const newInquiries = newMembershipApplications + newSponsorInquiries + newContactInquiries;

  const stats = [
    { label: "Upcoming Events", value: upcomingEvents },
    { label: "Registrations (30d)", value: recentRegistrations },
    { label: "Payments Pending Review", value: pendingPayments },
    { label: "Projects", value: totalProjects },
    { label: "New Inquiries", value: newInquiries },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-navy">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </div>
  );
}
