import Image from "next/image";
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  Image as ImageIcon,
  Newspaper,
  FolderKanban,
  UsersRound,
  Inbox,
  Settings,
  Users,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";
import { hasRole, type CurrentUser } from "@/lib/auth";
import type { Role } from "@/lib/enums";
import { LogoutButton } from "@/components/admin/logout-button";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminNavLinks, type AdminNavGroup } from "@/components/admin/admin-nav-links";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; roles: Role[] };

const NAV_GROUPS: Array<{ section: string; items: NavItem[] }> = [
  {
    section: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "BOARD_ADMIN", "EVENT_ORGANIZER"] },
    ],
  },
  {
    section: "Events",
    items: [
      { href: "/admin/events", label: "Events", icon: CalendarDays, roles: ["SUPER_ADMIN", "EVENT_ORGANIZER"] },
      { href: "/admin/events/registrations", label: "Registrations & Payments", icon: Ticket, roles: ["SUPER_ADMIN", "EVENT_ORGANIZER"] },
    ],
  },
  {
    section: "Content",
    items: [
      { href: "/admin/content/homepage", label: "Homepage", icon: ImageIcon, roles: ["SUPER_ADMIN", "BOARD_ADMIN"] },
      { href: "/admin/content/news", label: "News", icon: Newspaper, roles: ["SUPER_ADMIN", "BOARD_ADMIN"] },
      { href: "/admin/content/projects", label: "Projects", icon: FolderKanban, roles: ["SUPER_ADMIN", "BOARD_ADMIN"] },
      { href: "/admin/content/people", label: "People", icon: UsersRound, roles: ["SUPER_ADMIN", "BOARD_ADMIN"] },
    ],
  },
  {
    section: "Engagement",
    items: [
      { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, roles: ["SUPER_ADMIN", "BOARD_ADMIN"] },
    ],
  },
  {
    section: "Settings",
    items: [
      { href: "/admin/settings", label: "Site Settings", icon: Settings, roles: ["SUPER_ADMIN", "BOARD_ADMIN"] },
    ],
  },
  {
    section: "Administration",
    items: [
      { href: "/admin/users", label: "Users & Roles", icon: Users, roles: ["SUPER_ADMIN"] },
      { href: "/admin/audit-log", label: "Audit Log", icon: ShieldCheck, roles: ["SUPER_ADMIN"] },
      { href: "/admin/guide", label: "Admin Operation Guide", icon: ClipboardList, roles: ["SUPER_ADMIN", "BOARD_ADMIN", "EVENT_ORGANIZER"] },
    ],
  },
];

function visibleGroups(user: CurrentUser): AdminNavGroup[] {
  return NAV_GROUPS.map((group) => ({
    section: group.section,
    items: group.items
      .filter((item) => hasRole(user, item.roles))
      .map((item) => ({
        href: item.href,
        label: item.label,
        icon: <item.icon className="h-4 w-4" />,
      })),
  })).filter((group) => group.items.length > 0);
}

export function AdminSidebar({ user }: { user: CurrentUser }) {
  const groups = visibleGroups(user);

  return (
    <>
      <AdminMobileNav groups={groups} userName={user.name} userRole={user.role.replace("_", " ")} />

      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface p-4 lg:flex lg:flex-col">
        <div className="mb-6 flex items-center gap-2 px-2">
          <Image src="/brand/mark.png" alt="JCI Phnom Penh" width={512} height={512} className="h-8 w-8" />
          <span className="font-bold text-brand-navy">Admin Panel</span>
        </div>

        <AdminNavLinks groups={groups} />

        <div className="mt-6 rounded-xl bg-muted px-3 py-2 text-xs text-brand-navy/60">
          Signed in as <span className="font-semibold">{user.name}</span>
          <br />
          Role: {user.role.replace("_", " ")}
        </div>
        <LogoutButton />
      </aside>
    </>
  );
}
