"use client";

import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["NEW", "CONTACTED", "APPROVED", "REJECTED"];

export function InquiryStatusSelect({
  id,
  status,
  action,
}: {
  id: string;
  status: string;
  action: (id: string, status: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      onValueChange={(value) => startTransition(() => action(id, value))}
    >
      <SelectTrigger className="h-8 w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
