import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { Role } from "@/lib/enums";
import { updateUserRoleAndEmail, generatePasswordResetLink } from "@/lib/actions/user-actions";

const ROLES = [Role.SUPER_ADMIN, Role.ADMIN];

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN"])) notFound();

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  const isSelf = currentUser?.id === user.id;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Edit User</h1>

      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>Passwords are set by the account owner, not here — use the button below to send them a link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateUserRoleAndEmail} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={user.id} />
            <input
              name="name"
              placeholder="Full name"
              defaultValue={user.name}
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              defaultValue={user.email}
              required
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <select
              name="role"
              defaultValue={user.role}
              disabled={isSelf}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm disabled:opacity-50 sm:col-span-2"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace("_", " ")}
                </option>
              ))}
            </select>
            {isSelf && <input type="hidden" name="role" value={user.role} />}
            {isSelf && (
              <p className="text-xs text-brand-navy/50 sm:col-span-2">
                You can&apos;t change your own role here, to avoid accidentally locking yourself out.
              </p>
            )}
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" size="sm">Save Changes</Button>
              <Button type="button" size="sm" variant="outline" asChild>
                <a href="/admin/users">Cancel</a>
              </Button>
            </div>
          </form>

          <form action={generatePasswordResetLink} className="mt-4 border-t border-border pt-4">
            <input type="hidden" name="id" value={user.id} />
            <Button type="submit" size="sm" variant="outline">
              {user.passwordHash ? "Send Password Reset Link" : "Send Setup Link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
