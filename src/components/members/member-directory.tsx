"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "@/i18n/navigation";
import { parseLocalizedText } from "@/lib/json-field";
import { MemberPortrait } from "@/components/members/member-portrait";

export type MemberRow = {
  id: string;
  slug: string;
  name: string;
  photoUrl: string | null;
  businessName: string | null;
  jobTitle: string | null; // JSON string: { "en": "...", "km": "..." }
  industry: string | null;
  joinYear: number;
};

// Client-rendered: the directory can grow to dozens of members, and search +
// year filtering need to feel instant, so the full list is fetched once on
// the server and filtered in the browser rather than round-tripping per
// keystroke.
export function MemberDirectory({
  members,
  locale,
  labels,
}: {
  members: MemberRow[];
  locale: string;
  labels: { searchPlaceholder: string; allYears: string; noResults: string; viewProfile: string };
}) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("all");

  const years = useMemo(
    () => [...new Set(members.map((m) => m.joinYear))].sort((a, b) => b - a),
    [members]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (year !== "all" && String(m.joinYear) !== year) return false;
      if (!q) return true;
      const haystack = [m.name, m.businessName, m.industry].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [members, query, year]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-navy/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="pl-9"
          />
        </div>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{labels.allYears}</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border py-12 text-center text-sm text-brand-navy/50">
          {labels.noResults}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((member) => {
            const jobTitle = member.jobTitle ? parseLocalizedText(member.jobTitle) : null;
            const localizedJobTitle = jobTitle ? jobTitle[locale as "en" | "km"] ?? jobTitle.en : null;

            return (
              <Link
                key={member.id}
                href={`/members/${member.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-blue/40 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="relative">
                  <MemberPortrait member={member} className="aspect-square" />
                  {/* Join-year tab tucked against the left edge */}
                  <span className="absolute left-0 top-4 rounded-r-full bg-brand-gold py-1 pl-3 pr-3.5 text-[11px] font-extrabold tracking-wider text-brand-navy shadow-sm">
                    {member.joinYear}
                  </span>
                </div>
                <div className="relative flex flex-1 flex-col p-3 sm:p-4">
                  {/* Accent bar that sweeps across the card on hover */}
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 h-1 w-10 bg-brand-blue transition-all duration-500 ease-out group-hover:w-full"
                  />
                  {member.industry && (
                    <p className="mb-1 truncate text-[10px] font-bold uppercase tracking-widest text-brand-navy/45 sm:text-[11px]">
                      {member.industry}
                    </p>
                  )}
                  <p className="text-base font-extrabold leading-tight text-brand-navy transition-colors group-hover:text-brand-blue sm:text-lg">
                    {member.name}
                  </p>
                  {localizedJobTitle && (
                    <p className="mt-1 line-clamp-2 text-xs text-brand-navy/70 sm:text-sm">{localizedJobTitle}</p>
                  )}
                  {member.businessName && (
                    <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-brand-blue sm:text-sm">
                      {member.businessName}
                    </p>
                  )}
                  <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-bold text-brand-navy/60 transition-colors group-hover:text-brand-blue sm:text-sm">
                    {labels.viewProfile}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
