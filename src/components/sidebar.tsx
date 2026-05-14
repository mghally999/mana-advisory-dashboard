"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, KanbanSquare, ListChecks, List, Users, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/kanban", icon: KanbanSquare, label: "Kanban" },
  { href: "/dashboard/tasks", icon: ListChecks, label: "Tasks" },
  { href: "/dashboard/list", icon: List, label: "By Module" },
  { href: "/dashboard/employees", icon: Users, label: "Team" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function Sidebar({ user }: { user: { name: string; initials: string; role: string } }) {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:w-60 lg:w-64 flex-col border-r border-border bg-surface/60 backdrop-blur-md">
      <div className="p-5 border-b border-border">
        <Wordmark size="sm" />
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map((n) => {
          const active = pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition",
                active
                  ? "bg-gold-bg text-gold border-l-2 border-gold pl-[10px]"
                  : "text-muted hover:text-ink hover:bg-surface-2"
              )}
            >
              <n.icon size={16} strokeWidth={1.5} />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border space-y-2">
        <div className="flex items-center gap-3 p-2 rounded-md bg-surface-2">
          <div className="h-8 w-8 rounded-full bg-gold-bg text-gold flex items-center justify-center text-xs font-medium border border-gold/30">
            {user.initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-ink truncate font-medium">{user.name}</p>
            <p className="text-[10px] text-muted truncate uppercase tracking-wider">{user.role}</p>
          </div>
        </div>
        <button
          onClick={async () => {
            await fetch("/api/guest", { method: "DELETE" }).catch(() => {});
            await signOut({ callbackUrl: "/login" });
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted hover:text-danger transition"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}

export function MobileNav({ user }: { user: { name: string; initials: string; role: string } }) {
  const pathname = usePathname();
  return (
    <div className="md:hidden sticky bottom-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border">
      <div className="flex justify-around items-center py-1">
        {NAV.slice(0, 5).map((n) => {
          const active = pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] transition",
                active ? "text-gold" : "text-muted"
              )}
            >
              <n.icon size={18} strokeWidth={1.5} />
              {n.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
