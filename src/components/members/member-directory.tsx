"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaTile } from "@/components/ui/media-placeholder";
import { Link } from "@/i18n/navigation";
import { parseLocalizedText } from "@/lib/json-field";

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
  labels: { searchPlaceholder: string; allYears: string; noResults: string };
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
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((member) => {
            const jobTitle = member.jobTitle ? parseLocalizedText(member.jobTitle) : null;
            const localizedJobTitle = jobTitle ? jobTitle[locale as "en" | "km"] ?? jobTitle.en : null;
            const subtitle = [localizedJobTitle, member.businessName].filter(Boolean).join(", ");

            return (
              <Link
                key={member.id}
                href={`/members/${member.slug}`}
                className="group rounded-2xl border border-border bg-surface p-5 text-center shadow-card transition-shadow hover:shadow-card-hover"
              >
                <MediaTile
                  src={member.photoUrl}
                  alt={member.name}
                  seed={member.id}
                  aspect="aspect-square"
                  className="mx-auto w-20 rounded-full transition-transform group-hover:-translate-y-1"
                />
                <p className="mt-3 font-bold text-brand-navy">{member.name}</p>
                {subtitle && <p className="mt-1 text-sm text-brand-navy/60">{subtitle}</p>}
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-brand-gold">
                  {member.joinYear}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
