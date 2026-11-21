import type { ReactNode } from "react";

export const inputClassName =
  "flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-normal text-brand-navy";
export const textareaClassName =
  "flex w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-normal text-brand-navy";

// One numbered section of a templated admin form (news, events): a number
// badge, a title, a one-line hint, then the inputs.
export function FormStep({
  number,
  title,
  hint,
  optional = false,
  children,
}: {
  number: number;
  title: string;
  hint: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      role="group"
      aria-label={title}
      className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 rounded-xl border border-border p-4"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
        {number}
      </span>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-brand-navy">
          {title}
          {optional && <span className="ml-1.5 font-normal text-brand-navy/50">(optional)</span>}
        </p>
        <p className="text-xs text-brand-navy/60">{hint}</p>
        {children}
      </div>
    </div>
  );
}
