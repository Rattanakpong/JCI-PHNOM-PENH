import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

const setPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = setPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { passwordResetToken: parsed.data.token } });
  if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
    return NextResponse.json(
      { error: "This link is invalid or has expired — ask a Super Admin for a new one" },
      { status: 400 }
    );
  }

  const passwordHash = await hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, passwordResetToken: null, passwordResetExpiresAt: null },
  });

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
