import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { Role } from "@/lib/enums";
import { createAdminUser, generatePasswordResetLink } from "@/lib/actions/user-actions";

const ROLES = [Role.SUPER_ADMIN, Role.ADMIN];

const ROLE_BADGE = {
  SUPER_ADMIN: "destructive",
  ADMIN: "teal",
} as const;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ setupToken?: string }>;
}) {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN"])) notFound();

  const { setupToken } = await searchParams;
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  const setupUrl = setupToken
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/admin/set-password?token=${setupToken}`
    : null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-brand-navy">Users & Roles</h1>

      {setupUrl && (
        <div className="rounded-xl border border-brand-blue/30 bg-brand-blue/5 p-4 text-sm">
          <p className="font-semibold text-brand-navy">
            Emailed to them. Here&apos;s the same one-time link in case you want to share it directly
            too — it won&apos;t be shown again:
          </p>
          <p className="mt-2 break-all rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs text-brand-navy">
            {setupUrl}
          </p>
          <p className="mt-2 text-xs text-brand-navy/50">Expires in 7 days and can only be used once.</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add Admin User</CardTitle>
          <CardDescription>
            Create a login for a new admin. You pick their name, email, and role — they pick their own
            password, through a one-time link emailed to them automatically. If someone forgets their
            password later, a Super Admin can send a fresh link from the list below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAdminUser} className="grid gap-3 sm:grid-cols-2">
            <input
              name="name"
              placeholder="Full name"
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <select
              name="role"
              defaultValue={Role.ADMIN}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace("_", " ")}
                </option>
              ))}
            </select>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm">Add User</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Change a role from Edit, or send a password reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm">
                <div>
                  <span className="font-medium text-brand-navy">{user.name}</span>
                  <span className="ml-2 text-brand-navy/60">{user.email}</span>
                  {user.id === currentUser?.id && (
                    <span className="ml-2 text-xs text-brand-navy/40">(you)</span>
                  )}
                  {!user.passwordHash && (
                    <Badge variant="warning" className="ml-2">Setup pending</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={ROLE_BADGE[user.role as keyof typeof ROLE_BADGE] ?? "outline"}>
                    {user.role.replace("_", " ")}
                  </Badge>
                  <form action={generatePasswordResetLink}>
                    <input type="hidden" name="id" value={user.id} />
                    <Button type="submit" size="sm" variant="outline">
                      {user.passwordHash ? "Reset Password" : "Resend Setup Link"}
                    </Button>
                  </form>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/users/${user.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </li>
            ))}
            {users.length === 0 && (
              <p className="py-4 text-center text-sm text-brand-navy/50">No users yet.</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
