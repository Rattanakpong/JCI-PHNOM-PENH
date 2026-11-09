"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";

export function MobileNav({
  links,
  joinLabel,
}: {
  links: Array<{ href: string; label: string }>;
  joinLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the panel on navigation so it never lingers after a link tap.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-brand-navy transition-colors hover:bg-muted"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-t border-border bg-surface shadow-lg">
          <nav className="section flex flex-col gap-1 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-brand-navy/80 transition-colors hover:bg-muted hover:text-brand-blue"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="section flex items-center justify-between gap-3 border-t border-border py-4">
            <LanguageSwitcher />
            <Button asChild size="sm">
              <Link href="/join">{joinLabel}</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
