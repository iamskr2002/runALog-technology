"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu } from "lucide-react";

import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navItems, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/** Ordered section ids — the furthest-down intersecting section wins. */
const SECTION_IDS = ["home", "services", "solutions", "work", "about", "contact"];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>(isHome ? "home" : "");
  const [open, setOpen] = useState(false);
  const visibleRef = useRef<Set<string>>(new Set());

  // Solidify the bar once the page is scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track which section currently sits in the middle band of the viewport.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleRef.current.add(entry.target.id);
          else visibleRef.current.delete(entry.target.id);
        }
        let next: string | null = null;
        for (const id of SECTION_IDS) {
          if (visibleRef.current.has(id)) next = id;
        }
        if (next) setActive(next);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Skip to content
      </a>

      <div
        className={cn(
          "mx-auto flex h-16 max-w-7xl items-center justify-between border-b bg-white/85 px-4 backdrop-blur-md sm:px-6 md:h-[4.5rem] lg:px-8",
          scrolled ? "border-border shadow-sm" : "border-transparent"
        )}
      >
        <a
          href="/#home"
          aria-label="RunA Log Technologies — back to top"
          className={cn("inline-flex rounded-md", focusRing)}
        >
          <Logo />
        </a>

        {/* Desktop navigation */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const id = item.href.split("#")[1] ?? "";
              const isActive = isHome && active === id;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "relative block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-navy-900",
                      focusRing,
                      isActive ? "font-semibold text-teal-700" : "font-medium text-navy-600"
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-3 bottom-0.5 h-0.5 origin-left rounded-full bg-teal-600 transition-all duration-300",
                        isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button size="sm" asChild className="hidden sm:inline-flex">
            <a href="/#contact">Start a Project</a>
          </Button>

          {/* Mobile navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
                aria-expanded={open}
                className="size-11 text-navy-700 hover:text-navy-900 lg:hidden"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[85vw] max-w-xs overflow-y-auto p-6 sm:max-w-xs"
            >
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <SheetDescription className="sr-only">
                Links to the main sections of the RunA Log Technologies website.
              </SheetDescription>

              <a
                href="/#home"
                aria-label="RunA Log Technologies — back to top"
                onClick={() => setOpen(false)}
                className={cn("inline-flex rounded-md", focusRing)}
              >
                <Logo />
              </a>

              <nav aria-label="Mobile" className="mt-4">
                <ul>
                  {navItems.map((item) => {
                    const id = item.href.split("#")[1] ?? "";
                    const isActive = isHome && active === id;
                    return (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          aria-current={isActive ? "true" : undefined}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center justify-between border-b border-border/60 py-3 text-base font-medium transition-colors last:border-0",
                            focusRing,
                            isActive
                              ? "text-teal-700"
                              : "text-navy-700 hover:text-teal-700"
                          )}
                        >
                          {item.label}
                          <ChevronRight
                            className={cn(
                              "size-4 shrink-0",
                              isActive ? "text-teal-600" : "text-navy-300"
                            )}
                            aria-hidden="true"
                          />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <Button
                asChild
                size="lg"
                className="mt-6 h-11 w-full"
                onClick={() => setOpen(false)}
              >
                <a href="/#contact">Start a Project</a>
              </Button>

              <p className="mt-4 text-sm text-muted-foreground">
                {siteConfig.contact.email}
              </p>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
