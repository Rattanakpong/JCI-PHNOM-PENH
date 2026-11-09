"use client";

import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { changeUserRole } from "@/lib/actions/user-actions";
import type { Role } from "@/lib/enums";

const ROLES: Role[] = ["SUPER_ADMIN", "BOARD_ADMIN", "EVENT_ORGANIZER"];

export function RoleSelect({ userId, role }: { userId: string; role: Role }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={role}
      disabled={isPending}
      onValueChange={(value) => startTransition(() => changeUserRole(userId, value as Role))}
    >
      <SelectTrigger className="h-8 w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {r.replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
