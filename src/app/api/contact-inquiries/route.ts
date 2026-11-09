import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  fullName: z.string().min(2).max(160),
  email: z.string().email(),
  message: z.string().min(5).max(2000),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.contactInquiry.create({ data: parsed.data });
  return NextResponse.json({ ok: true });
}
