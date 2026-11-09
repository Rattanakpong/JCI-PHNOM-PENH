import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { parseLocalizedText } from "@/lib/json-field";
import { PaymentActions } from "@/components/admin/payment-actions";
import { getCurrentUser, hasRole } from "@/lib/auth";

const STATUS_VARIANT: Record<string, "success" | "warning" | "outline" | "destructive"> = {
  VERIFIED: "success",
  SUBMITTED: "warning",
  PENDING: "outline",
  REJECTED: "destructive",
};

export default async function AdminRegistrationsPage() {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "EVENT_ORGANIZER"])) notFound();

  const registrations = await prisma.registration.findMany({
    include: { event: true, ticketTier: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">Registrations & Payments</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/api/admin/export?format=xlsx">Export .xlsx</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/api/admin/export?format=csv">Export .csv</a>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs font-semibold uppercase text-brand-navy/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Payment Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => {
              const status = reg.payment?.status ?? "PENDING";
              return (
                <tr key={reg.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-brand-navy">{reg.fullName}</td>
                  <td className="px-4 py-3 text-brand-navy/70">
                    {parseLocalizedText(reg.event.title).en}
                  </td>
                  <td className="px-4 py-3 text-brand-navy/70">
                    {parseLocalizedText(reg.ticketTier.name).en}
                  </td>
                  <td className="px-4 py-3 text-brand-navy/70">
                    ${(reg.payment?.amountUsd ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {status === "SUBMITTED" && <PaymentActions registrationId={reg.id} />}
                  </td>
                </tr>
              );
            })}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-brand-navy/50">
                  No registrations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
