import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaTile } from "@/components/ui/media-placeholder";
import { parseLocalizedText } from "@/lib/json-field";

export type BoardMemberRow = {
  id: string;
  name: string;
  title: string; // JSON string: { "en": "...", "km": "..." }
  photoUrl: string | null;
  committee: string | null;
};

// Renders the live, admin-managed executive board roster on the
// "Organizational Structure" section of /about.
export function BoardRoster({
  members,
  locale,
  labels,
  theme,
}: {
  members: BoardMemberRow[];
  locale: string;
  labels: { presidentLabel: string; executiveBoard: string; noMembers: string };
  theme?: string;
}) {
  const president = members[0];
  const rest = members.slice(1);

  const committees = new Map<string, BoardMemberRow[]>();
  for (const member of rest) {
    const key = member.committee ?? labels.executiveBoard;
    committees.set(key, [...(committees.get(key) ?? []), member]);
  }

  if (!president) {
    return (
      <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-brand-navy/50">
        {labels.noMembers}
      </p>
    );
  }

  return (
    <div className="space-y-12">
      {theme && (
        <p className="text-center text-sm font-medium italic text-brand-navy/60">&ldquo;{theme}&rdquo;</p>
      )}
      <div className="flex justify-center">
        <BoardCard member={president} locale={locale} badge={labels.presidentLabel} wide />
      </div>

      {[...committees.entries()].map(([committee, committeeMembers]) => (
        <div key={committee}>
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-brand-navy/40">
            {committee}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {committeeMembers.map((member) => (
              <BoardCard key={member.id} member={member} locale={locale} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BoardCard({
  member,
  locale,
  badge,
  wide,
}: {
  member: BoardMemberRow;
  locale: string;
  badge?: string;
  wide?: boolean;
}) {
  const title = parseLocalizedText(member.title);
  const localizedTitle = title[locale as "en" | "km"] ?? title.en;

  return (
    <Card className={wide ? "w-full max-w-sm" : undefined}>
      <CardHeader className="items-center text-center">
        <MediaTile
          src={member.photoUrl}
          alt={member.name}
          seed={member.id}
          aspect="aspect-square"
          className="w-24"
        />
        {badge && (
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-brand-gold">
            {badge}
          </p>
        )}
        <CardTitle>{member.name}</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-sm text-brand-navy/70">
        {localizedTitle}
      </CardContent>
    </Card>
  );
}
