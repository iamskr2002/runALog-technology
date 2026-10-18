"use client";

/**
 * Staff application shell — fixed desktop sidebar (lg+), sticky mobile top
 * bar with a Sheet navigation drawer. Mirrors the admin shell with the
 * signed-in member's identity in the footer.
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarClock,
  ExternalLink,
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
import type { StaffProfile } from "@/components/staff/shared";

type StaffNavItem = { href: string; label: string; icon: LucideIcon };

const NAV_ITEMS: StaffNavItem[] = [
  { href: "/staff", label: "My Dashboard", icon: LayoutDashboard },
  { href: "/staff/leads", label: "My Leads", icon: Users },
  { href: "/staff/calls", label: "My Calls & Meetings", icon: CalendarClock },
];

function isNavItemActive(pathname: string, href: string): boolean {
  return href === "/staff" ? pathname === "/staff" : pathname.startsWith(href);
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Staff sections" className="space-y-1">
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

function SidebarFooter({
  profile,
  onNavigate,
}: {
  profile: StaffProfile;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/staff/logout", { method: "POST" });
    } catch {
      // Clearing the client state and redirecting regardless.
    }
    onNavigate?.();
    router.replace("/staff/login");
    router.refresh();
  }

  return (
    <div className="space-y-1 border-t border-zinc-100 p-3">
      <div className="flex items-center gap-3 rounded-md px-3 py-2">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700"
          aria-hidden="true"
        >
          {profile.name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "?"}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-900">
            {profile.name}
          </p>
          <p className="truncate text-xs text-zinc-500">
            {profile.role === "admin" ? "Admin" : "Staff member"}
          </p>
        </div>
      </div>
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

export function StaffShell({
  profile,
  children,
}: {
  profile: StaffProfile;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-zinc-200 bg-white lg:flex">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-100 px-5">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavList />
        </div>
        <SidebarFooter profile={profile} />
      </aside>

      {/* Mobile top bar + navigation sheet */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-zinc-200 bg-white px-4 lg:hidden">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open staff menu"
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
            <SidebarFooter profile={profile} onNavigate={closeMobileNav} />
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
