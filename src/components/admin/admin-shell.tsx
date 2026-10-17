"use client";

/**
 * Admin application shell — fixed desktop sidebar (lg+), sticky mobile top
 * bar with a Sheet navigation drawer, and the shared logout action.
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  CalendarClock,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

type AdminNavItem = { href: string; label: string; icon: LucideIcon };

const NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/calls", label: "Calls & Meetings", icon: CalendarClock },
  { href: "/admin/clients", label: "Clients", icon: Briefcase },
];

function isNavItemActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-teal-50 font-medium text-teal-700"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            )}
          >
            <Icon
              className={cn("size-4 shrink-0", active && "text-teal-600")}
              aria-hidden="true"
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Clearing the client state and redirecting regardless.
    }
    onNavigate?.();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="space-y-1 border-t border-zinc-100 p-3">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      >
        <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
        View website
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loggingOut ? (
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
        ) : (
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
        )}
        {loggingOut ? "Signing out…" : "Log out"}
      </button>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-zinc-200 bg-white lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-zinc-100 px-5">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavList />
        </div>
        <SidebarFooter />
      </aside>

      {/* Mobile top bar + navigation sheet */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-zinc-200 bg-white px-4 lg:hidden">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open admin menu"
              className="text-zinc-600"
            >
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="h-16 justify-center border-b border-zinc-100 px-5 py-0">
              <SheetTitle asChild>
                <div>
                  <Logo />
                </div>
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-3">
              <NavList onNavigate={closeMobileNav} />
            </div>
            <SidebarFooter onNavigate={closeMobileNav} />
          </SheetContent>
        </Sheet>
        <Logo />
      </header>

      {/* Main content region */}
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
