import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasRole } from "@/lib/auth";

export default async function AdminAuditLogPage() {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN"])) notFound();

  const logs = await prisma.auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-navy">Audit Log</h1>
      <ul className="space-y-3">
        {logs.map((log) => (
          <li key={log.id} className="rounded-xl border border-border bg-surface p-4 text-sm">
            <span className="font-semibold text-brand-navy">{log.actor?.name ?? "System"}</span>{" "}
            <span className="text-brand-navy/70">{log.action}</span>{" "}
            {log.entityId && (
              <span className="text-brand-navy/50">
                on {log.entityType} #{log.entityId.slice(0, 8)}
              </span>
            )}
            <div className="mt-1 text-xs text-brand-navy/40">
              {log.createdAt.toISOString().replace("T", " ").slice(0, 19)}
            </div>
          </li>
        ))}
        {logs.length === 0 && (
          <p className="text-sm text-brand-navy/50">No audit events yet.</p>
        )}
      </ul>
    </div>
  );
}
