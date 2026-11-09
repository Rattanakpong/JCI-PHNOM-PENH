import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { InquiryStatusSelect } from "@/components/admin/inquiry-status-select";
import { updateMembershipStatus, updateSponsorStatus, updateContactStatus } from "@/lib/actions/inquiry-actions";

export default async function AdminInquiriesPage() {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN", "BOARD_ADMIN"])) notFound();

  const [applications, sponsors, contacts] = await Promise.all([
    prisma.membershipApplication.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.sponsorInquiry.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.contactInquiry.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-brand-navy">Inquiries</h1>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-navy/50">
          Membership Applications
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs font-semibold uppercase text-brand-navy/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Occupation</th>
                <th className="px-4 py-3">New / Former</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-t border-border align-top">
                  <td className="px-4 py-3 font-medium text-brand-navy">
                    {app.fullNameEnglish}
                    <div className="font-normal text-brand-navy/60">{app.fullNameKhmer}</div>
                  </td>
                  <td className="px-4 py-3 text-brand-navy/70">
                    {app.email}
                    <div>{app.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-brand-navy/70">
                    {app.occupation.replace("_", " ")}
                    {app.companyName && <div>{app.companyName}</div>}
                    {app.schoolName && <div>{app.schoolName}</div>}
                  </td>
                  <td className="px-4 py-3 text-brand-navy/70">
                    {app.membershipStatus === "FORMER_MEMBER"
                      ? `Former${app.formerMemberYear ? ` (${app.formerMemberYear})` : ""}`
                      : "New"}
                  </td>
                  <td className="px-4 py-3">
                    <InquiryStatusSelect id={app.id} status={app.status} action={updateMembershipStatus} />
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-brand-navy/50">
                    No applications yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-navy/50">
          Sponsor Inquiries
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs font-semibold uppercase text-brand-navy/60">
              <tr>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Proposal</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-brand-navy">{s.orgName}</td>
                  <td className="px-4 py-3 text-brand-navy/70">{s.contactEmail}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-brand-navy/70">{s.proposal}</td>
                  <td className="px-4 py-3">
                    <InquiryStatusSelect id={s.id} status={s.status} action={updateSponsorStatus} />
                  </td>
                </tr>
              ))}
              {sponsors.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-brand-navy/50">
                    No sponsor inquiries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-navy/50">
          Contact Messages
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs font-semibold uppercase text-brand-navy/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-brand-navy">{c.fullName}</td>
                  <td className="px-4 py-3 text-brand-navy/70">{c.email}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-brand-navy/70">{c.message}</td>
                  <td className="px-4 py-3">
                    <InquiryStatusSelect id={c.id} status={c.status} action={updateContactStatus} />
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-brand-navy/50">
                    No contact messages yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
