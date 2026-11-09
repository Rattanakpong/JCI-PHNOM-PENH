import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { RoleSelect } from "@/components/admin/role-select";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createUser, deleteUser } from "@/lib/actions/user-actions";
import type { Role } from "@/lib/enums";

const ROLES: Role[] = ["SUPER_ADMIN", "BOARD_ADMIN", "EVENT_ORGANIZER"];

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();
  if (!hasRole(currentUser, ["SUPER_ADMIN"])) notFound();

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-brand-navy">Users & Roles</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add User</CardTitle>
          <CardDescription>Creates a new admin login with local email + password auth.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createUser} className="grid gap-3 sm:grid-cols-2">
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
            <input
              name="password"
              type="password"
              placeholder="Password (min. 8 characters)"
              required
              minLength={8}
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
            <select
              name="role"
              defaultValue="EVENT_ORGANIZER"
              className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace("_", " ")}
                </option>
              ))}
            </select>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm">Create User</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs font-semibold uppercase text-brand-navy/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-brand-navy">{u.name}</td>
                <td className="px-4 py-3 text-brand-navy/70">{u.email}</td>
                <td className="px-4 py-3">
                  {u.id === currentUser?.id ? (
                    <span className="text-brand-navy/70">{u.role.replace("_", " ")} (you)</span>
                  ) : (
                    <RoleSelect userId={u.id} role={u.role as Role} />
                  )}
                </td>
                <td className="px-4 py-3">
                  {u.id !== currentUser?.id && (
                    <ConfirmDeleteForm
                      action={deleteUser}
                      id={u.id}
                      confirmMessage={`Delete the user "${u.name}"? This cannot be undone.`}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
