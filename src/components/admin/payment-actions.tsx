"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyPayment } from "@/lib/actions/payment-actions";

export function PaymentActions({ registrationId }: { registrationId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function act(approve: boolean) {
    setError(null);
    startTransition(async () => {
      try {
        await verifyPayment(registrationId, approve);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button size="sm" variant="outline" disabled={isPending} onClick={() => act(true)}>
        <Check className="h-3.5 w-3.5" />
        Verify
      </Button>
      <Button size="sm" variant="ghost" disabled={isPending} onClick={() => act(false)}>
        <X className="h-3.5 w-3.5" />
        Reject
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
