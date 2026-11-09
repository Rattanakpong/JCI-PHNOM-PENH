"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { PaymentStatus, RegistrationStatus } from "@/lib/enums";

export async function verifyPayment(registrationId: string, approve: boolean) {
  const user = await getCurrentUser();
  if (!hasRole(user, ["SUPER_ADMIN", "EVENT_ORGANIZER"])) {
    throw new Error("Not authorized");
  }

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { payment: true },
  });
  if (!registration?.payment) throw new Error("Registration not found");

  const paymentStatus = approve ? PaymentStatus.VERIFIED : PaymentStatus.REJECTED;
  const registrationStatus = approve ? RegistrationStatus.CONFIRMED : RegistrationStatus.CANCELLED;

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: registration.payment.id },
      data: { status: paymentStatus, verifiedById: user!.id, verifiedAt: new Date() },
    }),
    prisma.registration.update({
      where: { id: registrationId },
      data: { status: registrationStatus },
    }),
    prisma.auditLog.create({
      data: {
        actorId: user!.id,
        action: approve ? "registration.payment.verify" : "registration.payment.reject",
        entityType: "Registration",
        entityId: registrationId,
      },
    }),
  ]);

  revalidatePath("/admin/events");
  revalidatePath("/admin/audit-log");
}
