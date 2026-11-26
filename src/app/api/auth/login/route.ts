import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const MAX_ATTEMPTS = 10;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again in a few minutes." },
      { status: 429 }
    );
  }

  const valid = await compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS) : null,
      },
    });
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
