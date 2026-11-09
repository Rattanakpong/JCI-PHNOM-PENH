import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Step 3: visitor confirms they've paid. We mark the payment as SUBMITTED;
// admin verification still runs async (see Admin Tracking) and can later
// flip the record to VERIFIED or REJECTED.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const registration = await prisma.registration.findUnique({
    where: { id },
    include: { payment: true, event: true },
  });

  if (!registration || !registration.payment) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: registration.payment.id },
      data: { status: "SUBMITTED" },
    }),
    prisma.registration.update({
      where: { id },
      data: { status: "PAYMENT_SUBMITTED" },
    }),
    prisma.auditLog.create({
      data: {
        action: "registration.payment.submit",
        entityType: "Registration",
        entityId: id,
      },
    }),
  ]);

  return NextResponse.json({ telegramGroupUrl: registration.event.telegramGroupUrl });
}
