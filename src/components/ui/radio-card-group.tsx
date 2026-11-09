"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function RadioCardGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-2">
      {options.map((option) => {
        const checked = value === option.value;
        return (
          <label
            key={option.value}
            className={cn(
              "group flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-150",
              checked
                ? "border-brand-blue bg-brand-blue text-white shadow-sm"
                : "border-border bg-surface text-brand-navy/80 hover:border-brand-blue/50 hover:bg-brand-blue/5"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <Check
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-transform duration-150",
                checked ? "scale-100" : "scale-0"
              )}
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
