"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";
import { requireSuperAdmin, logContentChange } from "@/lib/actions/admin-guards";
import { RESET_TOKEN_TTL_MS, generateResetToken } from "@/lib/password-reset";
import { sendEmail } from "@/lib/email";
import { setupPasswordEmailHtml } from "@/lib/email-templates";

const VALID_ROLES = Object.values(Role) as string[];

function parseRole(input: FormDataEntryValue | null, fallback: string): string {
  const value = String(input ?? "");
  return VALID_ROLES.includes(value) ? value : fallback;
}

async function sendSetupLinkEmail(email: string, name: string, token: string, isNewAccount: boolean) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/set-password?token=${token}`;
  const subject = isNewAccount ? "Set up your JCI Phnom Penh admin account" : "Reset your JCI Phnom Penh admin password";

  await sendEmail({
    to: email,
    subject,
    html: setupPasswordEmailHtml({ name, url, isNewAccount }),
    includeLogo: true,
  });
}

// Only a Super Admin can trigger this — but it never sets the password
// itself. It hands back a one-time link that the account owner opens to
// choose their own password, so nobody but them ever knows it.
export async function createAdminUser(formData: FormData) {
  const actor = await requireSuperAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = parseRole(formData.get("role"), Role.ADMIN);

  if (!name || !email) throw new Error("Name and email are required");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("A user with that email already exists");

  const passwordResetToken = generateResetToken();
  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
      passwordResetToken,
      passwordResetExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  await sendSetupLinkEmail(email, name, passwordResetToken, true);

  await logContentChange(actor.id, "user.create", "User", user.id);
  revalidatePath("/admin/users");
  redirect(`/admin/users?setupToken=${passwordResetToken}`);
}

export async function updateUserRoleAndEmail(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new Error("User not found");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!name || !email) throw new Error("Name and email are required");

  const role = parseRole(formData.get("role"), target.role);
  if (actor.id === id && role !== Role.SUPER_ADMIN) {
    throw new Error("You can't remove your own Super Admin role");
  }

  if (email !== target.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("A user with that email already exists");
  }

  await prisma.user.update({ where: { id }, data: { name, email, role } });

  await logContentChange(actor.id, "user.update", "User", id);
  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

// Generates a fresh one-time link for a user to set/reset their own
// password — used both for a brand-new account and for "I forgot my
// password." The Super Admin never sees or picks the actual password.
export async function generatePasswordResetLink(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new Error("User not found");

  const passwordResetToken = generateResetToken();
  await prisma.user.update({
    where: { id },
    data: { passwordResetToken, passwordResetExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
  });

  await sendSetupLinkEmail(target.email, target.name, passwordResetToken, !target.passwordHash);

  revalidatePath("/admin/users");
  redirect(`/admin/users?setupToken=${passwordResetToken}`);
}
