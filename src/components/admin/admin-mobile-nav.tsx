"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";
import type { AdminNavGroup } from "@/components/admin/admin-nav-links";

export function AdminMobileNav({
  groups,
  userName,
  userRole,
}: {
  groups: AdminNavGroup[];
  userName: string;
  userRole: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the panel on navigation so it never lingers after a link tap.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-surface lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Image src="/brand/mark.png" alt="JCI Phnom Penh" width={512} height={512} className="h-7 w-7" />
          <span className="font-bold text-brand-navy">Admin Panel</span>
        </div>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-brand-navy transition-colors hover:bg-muted"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-border px-4 pb-4">
          <nav className="space-y-4 pt-2">
            {groups.map((group) => (
              <div key={group.section}>
                <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-brand-navy/40">
                  {group.section}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={
                        pathname === item.href || pathname.startsWith(`${item.href}/`)
                          ? "flex items-center gap-3 rounded-xl bg-brand-blue/10 px-3 py-2.5 text-sm font-medium text-brand-blue"
                          : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-navy/80 transition-colors hover:bg-muted hover:text-brand-navy"
                      }
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-3 rounded-xl bg-muted px-3 py-2 text-xs text-brand-navy/60">
            Signed in as <span className="font-semibold">{userName}</span>
            <br />
            Role: {userRole}
          </div>
          <LogoutButton />
        </div>
      )}
    </div>
  );
}
