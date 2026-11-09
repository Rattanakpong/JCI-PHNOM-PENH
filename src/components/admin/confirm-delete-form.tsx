"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmDeleteForm({
  action,
  id,
  label = "Delete",
  confirmMessage = "Delete this item? This cannot be undone.",
  size = "sm",
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label?: string;
  confirmMessage?: string;
  size?: "sm" | "default";
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (!window.confirm(confirmMessage)) return;
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            await action(formData);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed");
          }
        });
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        size={size}
        variant="ghost"
        disabled={isPending}
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        {label}
      </Button>
      {error && <span className="ml-2 text-xs text-red-600">{error}</span>}
    </form>
  );
}
