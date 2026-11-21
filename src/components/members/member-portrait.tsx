import { cn } from "@/lib/utils";

const INITIALS_GRADIENTS = [
  "from-brand-blue to-brand-navy",
  "from-brand-teal to-brand-blue",
  "from-brand-navy to-brand-blue",
  "from-brand-navy to-brand-teal",
];

// Member photo used by the /members directory cards and profile pages.
// Uploaded photos are shown whole (never cropped), centered on white so
// typical white-backdrop studio portraits blend into the frame, and members
// without a photo get their initials (in a color stable per member) instead
// of a generic image icon.
// The caller sets size/shape via className; hover effects key off a parent
// `group`, so they're inert where there isn't one.
export function MemberPortrait({
  member,
  className,
  initialsClassName = "text-4xl sm:text-5xl",
}: {
  member: { id: string; name: string; photoUrl: string | null };
  className?: string;
  initialsClassName?: string;
}) {
  if (member.photoUrl) {
    return (
      <div
        className={cn(
          "overflow-hidden bg-white",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded URL, not worth next/image's remote-pattern config */}
        <img
          src={member.photoUrl}
          alt={member.name}
          loading="lazy"
          className="h-full w-full object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }

  let hash = 0;
  for (const ch of member.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const initials = member.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      role="img"
      aria-label={member.name}
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        INITIALS_GRADIENTS[hash % INITIALS_GRADIENTS.length],
        className
      )}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125" />
      <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-white/10" />
      <span
        className={cn(
          "relative font-black tracking-wide text-white/95 transition-transform duration-500 group-hover:scale-110",
          initialsClassName
        )}
      >
        {initials}
      </span>
    </div>
  );
}
