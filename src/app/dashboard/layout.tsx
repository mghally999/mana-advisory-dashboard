import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar, MobileNav } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme";
import { EMPLOYEES_BY_ID } from "@/lib/mock-data";
import { isGuest } from "@/lib/guest";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const guest = await isGuest();
  let user = {
    name: "Guest Viewer",
    initials: "GV",
    role: "READ-ONLY",
    id: "guest",
  };

  if (!guest) {
    const session = await auth().catch(() => null);
    if (!session?.user) redirect("/login");
    const userId = (session.user as any).id;
    const emp = EMPLOYEES_BY_ID[userId];
    user = {
      name: emp?.name ?? session.user.name ?? "User",
      initials: emp?.initials ?? "?",
      role: emp?.role ?? (session.user as any).systemRole ?? "USER",
      id: userId,
    };
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-surface/60 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          <div className="md:hidden">
            <span className="brand-wordmark gold-text text-lg">MANA</span>
          </div>
          <div className="flex-1 max-w-md mx-auto md:mx-0 md:max-w-none md:flex-none" id="dashboard-header-slot" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {guest && (
              <span className="hidden sm:inline-block text-[10px] tracking-[0.2em] uppercase text-gold border border-gold/40 bg-gold-bg px-2 py-1 rounded-md">
                Guest Mode
              </span>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
        <MobileNav user={user} />
      </main>
    </div>
  );
}
