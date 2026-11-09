// Shared auth guards + audit logging for admin server actions. Deliberately
// NOT a "use server" file — everything exported from one of those becomes a
// directly client-callable server action, which these small helpers aren't
// meant to be.
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasRole } from "@/lib/auth";

export async function requireContentEditor() {
  const user = await getCurrentUser();
  if (!hasRole(user, ["SUPER_ADMIN", "BOARD_ADMIN"])) throw new Error("Not authorized");
  return user!;
}

export async function requireEventOrganizer() {
  const user = await getCurrentUser();
  if (!hasRole(user, ["SUPER_ADMIN", "EVENT_ORGANIZER"])) throw new Error("Not authorized");
  return user!;
}

export async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!hasRole(user, ["SUPER_ADMIN"])) throw new Error("Not authorized");
  return user!;
}

export async function logContentChange(actorId: string, action: string, entityType: string, entityId: string) {
  await prisma.auditLog.create({ data: { actorId, action, entityType, entityId } });
}
