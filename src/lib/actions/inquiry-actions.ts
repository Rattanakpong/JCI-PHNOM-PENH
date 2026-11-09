"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasRole } from "@/lib/auth";

async function requireInquiryManager() {
  const user = await getCurrentUser();
  if (!hasRole(user, ["SUPER_ADMIN", "BOARD_ADMIN"])) throw new Error("Not authorized");
  return user!;
}

export async function updateMembershipStatus(id: string, status: string) {
  const actor = await requireInquiryManager();
  await prisma.$transaction([
    prisma.membershipApplication.update({ where: { id }, data: { status } }),
    prisma.auditLog.create({
      data: { actorId: actor.id, action: "membership_application.status", entityType: "MembershipApplication", entityId: id, metadata: JSON.stringify({ status }) },
    }),
  ]);
  revalidatePath("/admin/inquiries");
}

export async function updateSponsorStatus(id: string, status: string) {
  const actor = await requireInquiryManager();
  await prisma.$transaction([
    prisma.sponsorInquiry.update({ where: { id }, data: { status } }),
    prisma.auditLog.create({
      data: { actorId: actor.id, action: "sponsor_inquiry.status", entityType: "SponsorInquiry", entityId: id, metadata: JSON.stringify({ status }) },
    }),
  ]);
  revalidatePath("/admin/inquiries");
}

export async function updateContactStatus(id: string, status: string) {
  const actor = await requireInquiryManager();
  await prisma.$transaction([
    prisma.contactInquiry.update({ where: { id }, data: { status } }),
    prisma.auditLog.create({
      data: { actorId: actor.id, action: "contact_inquiry.status", entityType: "ContactInquiry", entityId: id, metadata: JSON.stringify({ status }) },
    }),
  ]);
  revalidatePath("/admin/inquiries");
}
