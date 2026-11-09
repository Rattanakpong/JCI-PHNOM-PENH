"use server";

import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { Role } from "@/lib/enums";
import { requireSuperAdmin, logContentChange } from "@/lib/actions/admin-guards";

export async function createUser(formData: FormData) {
  const actor = await requireSuperAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "EVENT_ORGANIZER");
  if (!name || !email || !password) throw new Error("Name, email, and password are required");
  if (password.length < 8) throw new Error("Password must be at least 8 characters");
  if (!(Object.values(Role) as string[]).includes(role)) throw new Error("Invalid role");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("A user with that email already exists");

  const passwordHash = await hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash, role } });

  await logContentChange(actor.id, "user.create", "User", user.id);
  revalidatePath("/admin/users");
  revalidatePath("/admin/audit-log");
}

export async function deleteUser(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");

  if (id === actor.id) throw new Error("You cannot delete your own account");

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new Error("User not found");

  if (target.role === "SUPER_ADMIN") {
    const otherSuperAdmins = await prisma.user.count({ where: { role: "SUPER_ADMIN", id: { not: id } } });
    if (otherSuperAdmins === 0) throw new Error("Cannot delete the last Super Admin");
  }

  const organizedEvents = await prisma.event.count({ where: { organizerId: id } });
  if (organizedEvents > 0) {
    throw new Error("Cannot delete a user who organized events — reassign or delete those events first");
  }

  await prisma.user.delete({ where: { id } });

  await logContentChange(actor.id, "user.delete", "User", id);
  revalidatePath("/admin/users");
  revalidatePath("/admin/audit-log");
}

export async function changeUserRole(userId: string, role: Role) {
  const actor = await getCurrentUser();
  if (!hasRole(actor, ["SUPER_ADMIN"])) throw new Error("Not authorized");

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { role } }),
    prisma.auditLog.create({
      data: {
        actorId: actor!.id,
        action: "user.role.change",
        entityType: "User",
        entityId: userId,
        metadata: JSON.stringify({ role }),
      },
    }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath("/admin/audit-log");
}
