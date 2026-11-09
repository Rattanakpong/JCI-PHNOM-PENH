"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function QuickPickInput({
  id,
  value,
  onChange,
  suggestions,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
}) {
  return (
    <div className="space-y-2">
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((suggestion) => {
          const active = value === suggestion;
          return (
            <button
              key={suggestion}
              type="button"
              onClick={() => onChange(suggestion)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-150",
                active
                  ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                  : "border-border bg-surface text-brand-navy/60 hover:border-brand-blue/50 hover:text-brand-blue"
              )}
            >
              {suggestion}
            </button>
          );
        })}
      </div>
    </div>
  );
}
