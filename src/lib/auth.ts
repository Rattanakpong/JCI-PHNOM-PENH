import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { Role } from "@/lib/enums";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

// Resolves the signed-in user to our `User` row (which carries the RBAC
// role). Checks the local email+password session first (src/lib/session.ts
// — used for local dev / until Supabase is configured), then falls back to
// Supabase Auth when it's set up. Returns null when unauthenticated —
// callers should redirect to /admin/login or render a 403.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const localUserId = await getSessionUserId();
  if (localUserId) {
    const user = await prisma.user.findUnique({ where: { id: localUserId } });
    return user ? toCurrentUser(user) : null;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const user = await prisma.user.findUnique({ where: { id: data.user.id } });
  return user ? toCurrentUser(user) : null;
}

function toCurrentUser(user: { id: string; name: string; email: string; role: string }): CurrentUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role as Role };
}

export function hasRole(user: CurrentUser | null, allowed: Role[]): boolean {
  return !!user && allowed.includes(user.role);
}
