import { ImageIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-brand-blue/15 to-brand-teal/15",
  "from-brand-gold/20 to-brand-blue/10",
  "from-brand-teal/15 to-brand-navy/10",
  "from-brand-navy/10 to-brand-gold/15",
];

function gradientFor(seed: string) {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

// Renders a real image when a URL is on hand, otherwise a styled gradient
// tile — so galleries/banners/covers never look broken while chapters have
// no real photography yet, and start showing real photos the moment an
// admin uploads one (no markup changes needed on either side).
export function MediaTile({
  src,
  alt,
  seed,
  icon: Icon = ImageIcon,
  aspect = "aspect-[4/3]",
  className,
}: {
  src?: string | null;
  alt: string;
  seed?: string;
  icon?: LucideIcon;
  aspect?: string;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- local/placeholder URLs, not worth next/image's remote-pattern config
      <img src={src} alt={alt} className={cn("w-full rounded-xl object-cover", aspect, className)} />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "flex w-full items-center justify-center rounded-xl bg-gradient-to-br",
        gradientFor(seed ?? alt),
        aspect,
        className
      )}
    >
      <Icon className="h-8 w-8 text-brand-navy/30" />
    </div>
  );
}
