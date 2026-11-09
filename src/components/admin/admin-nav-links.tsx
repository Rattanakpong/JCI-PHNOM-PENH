"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface AdminNavGroup {
  section: string;
  items: Array<{ href: string; label: string; icon: React.ReactNode }>;
}

// Longest-matching-href wins so a parent route (e.g. /admin/content/news)
// doesn't light up while viewing a nested edit page under a sibling slug.
function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavLinks({ groups }: { groups: AdminNavGroup[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-5">
      {groups.map((group) => (
        <div key={group.section}>
          <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-brand-navy/40">
            {group.section}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-blue/10 text-brand-blue"
                      : "text-brand-navy/80 hover:bg-muted hover:text-brand-navy"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
