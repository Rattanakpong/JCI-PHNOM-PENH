import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateKhqrPayload } from "@/lib/khqr";

const createRegistrationSchema = z
  .object({
    eventId: z.string().min(1),
    ticketTierId: z.string().min(1),
    fullName: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().min(6).max(20),
    isJciMember: z.boolean(),
    jciChapter: z.string().min(1).max(60).optional(),
  })
  .refine((data) => !data.isJciMember || !!data.jciChapter, {
    message: "Select your JCI chapter",
    path: ["jciChapter"],
  });

// Step 1 -> Step 2: create the registration + its pending payment, and
// return a KHQR payload pre-filled with the chosen ticket's amount.
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { eventId, ticketTierId, jciChapter, ...contact } = parsed.data;

  const ticketTier = await prisma.ticketTier.findFirst({
    where: { id: ticketTierId, eventId },
  });

  if (!ticketTier) {
    return NextResponse.json({ error: "Invalid ticket tier" }, { status: 404 });
  }

  if (ticketTier.saleEndsAt && ticketTier.saleEndsAt < new Date()) {
    return NextResponse.json({ error: "This ticket type is no longer available" }, { status: 409 });
  }

  let confirmedCount: number;
  let registration: Awaited<ReturnType<typeof prisma.registration.create>>;
  try {
    [confirmedCount, registration] = await prisma.$transaction([
      prisma.registration.count({
        where: { ticketTierId: ticketTier.id, status: { not: "CANCELLED" } },
      }),
      prisma.registration.create({
        data: {
          eventId,
          ticketTierId: ticketTier.id,
          jciChapter: jciChapter ?? null,
          ...contact,
        },
      }),
    ]);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "You've already registered for this event with that email" },
        { status: 409 }
      );
    }
    throw err;
  }

  if (confirmedCount >= ticketTier.capacity) {
    await prisma.registration.delete({ where: { id: registration.id } });
    return NextResponse.json({ error: "This ticket tier is sold out" }, { status: 409 });
  }

  const amountUsd = Number(ticketTier.priceUsd);

  // Free tickets skip the QR/payment step entirely — nothing to collect, so
  // the registration is confirmed immediately instead of waiting on admin
  // verification.
  if (amountUsd === 0) {
    const [, event] = await prisma.$transaction([
      prisma.payment.create({
        data: { registrationId: registration.id, amountUsd, qrPayload: "", status: "VERIFIED" },
      }),
      prisma.event.findUniqueOrThrow({ where: { id: eventId } }),
    ]);
    await prisma.registration.update({ where: { id: registration.id }, data: { status: "CONFIRMED" } });

    return NextResponse.json({
      registrationId: registration.id,
      amountUsd,
      isFree: true,
      telegramGroupUrl: event.telegramGroupUrl,
    });
  }

  const qrPayload = generateKhqrPayload({
    accountId: process.env.ABA_ACCOUNT_ID!,
    merchantName: process.env.ABA_MERCHANT_NAME ?? "JCI Phnom Penh",
    merchantCity: process.env.ABA_MERCHANT_CITY ?? "Phnom Penh",
    amount: amountUsd,
    currency: "USD",
    billNumber: registration.id,
  });

  const payment = await prisma.payment.create({
    data: { registrationId: registration.id, amountUsd, qrPayload },
  });

  return NextResponse.json({
    registrationId: registration.id,
    paymentId: payment.id,
    amountUsd,
    qrPayload,
  });
}
