import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Animated banner for the About pages: drifting colour blobs behind a
// shimmering title, with the organisation's logo floating on the right.
// `plain` swaps the effects for a calm navy-to-blue gradient banner with a
// solid-colour title.
export function AboutHero({
  eyebrow,
  title,
  description,
  logoUrl,
  logoClassName,
  plain = false,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  logoUrl: string;
  logoClassName?: string;
  plain?: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden text-white",
        // #0397D6 is the blue of the official JCI Cambodia logo.
        plain ? "bg-[linear-gradient(110deg,#0B132B_0%,#0B2C55_45%,#0397D6_100%)]" : "bg-brand-navy",
      )}
    >
      {!plain && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-blue/50 blur-3xl motion-safe:animate-blob" />
          <div className="absolute -right-16 top-10 h-80 w-80 rounded-full bg-brand-teal/30 blur-3xl motion-safe:animate-blob [animation-delay:-5s]" />
          <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-brand-gold/20 blur-3xl motion-safe:animate-blob [animation-delay:-9s]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.08)_1px,transparent_1px)] [background-size:22px_22px]" />
        </div>
      )}

      <div className="section grid items-center gap-10 pb-28 pt-16 sm:pt-20 lg:grid-cols-[1fr_auto] lg:pb-32">
        <div className="animate-slide-up [animation-duration:700ms]">
          {plain ? (
            <>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-gold">{eyebrow}</p>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">{title}</h1>
              <div aria-hidden className="mt-5 h-1 w-16 rounded-full bg-brand-gold" />
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-gold backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold motion-safe:animate-pulse" />
                {eyebrow}
              </span>
              <h1 className="mt-5 bg-[linear-gradient(90deg,#fff,#4ECDC4,#F4C430,#fff)] bg-[length:200%_auto] bg-clip-text text-4xl font-extrabold leading-tight text-transparent motion-safe:animate-shimmer sm:text-6xl">
                {title}
              </h1>
            </>
          )}
          <p className="mt-5 max-w-2xl text-lg text-white/75">{description}</p>
          {children}
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element -- local brand asset */}
        <img
          src={logoUrl}
          alt=""
          className={
            logoClassName ??
            "hidden w-72 drop-shadow-[0_20px_40px_rgb(0_136_206/0.45)] motion-safe:animate-float lg:block"
          }
        />
      </div>
    </section>
  );
}
