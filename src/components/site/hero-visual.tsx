"use client";

import { useEffect, useRef } from "react";
import { Plug, Search, Sparkles, Workflow } from "lucide-react";

const LERP_FACTOR = 0.08;
const MAX_SHIFT = 14; // px — keeps the parallax restrained
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Hand-built "product ecosystem" composition: a browser-window dashboard,
 * a workflow automation card, and a mobile app card, linked by animated
 * dashed connectors. Layers carry a data-depth attribute and react to the
 * cursor with a small, smoothed parallax. Disabled for reduced motion and
 * coarse (touch) pointers — the composition renders fully static there.
 * Purely decorative: the whole tree is aria-hidden (see sr-only copy in hero.tsx).
 */
export function HeroVisual() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    if (reducedMotion.matches || !finePointer.matches) return;

    // Listen on the nearest positioned ancestor (the hero's right column).
    const area = root.parentElement ?? root;
    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-depth]"));

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;
    let running = false;

    const applyTransforms = () => {
      for (const layer of layers) {
        const depth = Number(layer.dataset.depth ?? "0") / 2;
        const dx = clamp(current.x * depth, -MAX_SHIFT, MAX_SHIFT);
        const dy = clamp(current.y * depth, -MAX_SHIFT, MAX_SHIFT);
        layer.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
      }
    };

    const tick = () => {
      current.x += (target.x - current.x) * LERP_FACTOR;
      current.y += (target.y - current.y) * LERP_FACTOR;
      applyTransforms();
      if (
        Math.abs(target.x - current.x) < 0.0015 &&
        Math.abs(target.y - current.y) < 0.0015
      ) {
        running = false; // settled — idle until the cursor moves again
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (event: MouseEvent) => {
      const rect = area.getBoundingClientRect();
      target.x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      target.y = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
      start();
    };

    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      start();
    };

    area.addEventListener("mousemove", onMove);
    area.addEventListener("mouseleave", onLeave);
    return () => {
      area.removeEventListener("mousemove", onMove);
      area.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[560px] select-none"
    >
      {/* Workflow node card */}
      <div
        data-depth="16"
        className="absolute -left-4 top-6 z-20 will-change-transform sm:-left-8"
      >
        <div className="rounded-lg border border-white/10 bg-navy-800/95 px-3.5 py-3 shadow-xl">
          <div className="flex items-center gap-2">
            <Workflow className="size-4 text-teal-300" aria-hidden="true" />
            <span className="text-xs font-medium text-white">Automation</span>
          </div>
          <p className="mt-1 text-[10px] text-navy-300">Form → CRM → Invoice</p>
        </div>
      </div>

      {/* Main browser-window mockup */}
      <div data-depth="10" className="relative z-10 mt-8 will-change-transform">
        <div className="animate-float overflow-hidden rounded-xl border border-white/10 bg-navy-800/90 shadow-2xl shadow-black/40">
          {/* Chrome bar */}
          <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/20" />
            <div className="flex flex-1 justify-center">
              <span className="rounded-md bg-white/5 px-2.5 py-1 text-[10px] leading-none text-navy-300">
                app.runalog.example
              </span>
            </div>
            <span className="w-[42px]" aria-hidden="true" />
          </div>

          {/* Body */}
          <div className="flex">
            {/* Sidebar */}
            <div className="w-[26%] shrink-0 space-y-1.5 border-r border-white/10 p-2.5">
              <div className="flex items-center gap-1.5 rounded-md bg-teal-400/20 px-2 py-1.5 text-[9px] font-medium text-teal-300">
                <span className="size-1.5 rounded-[3px] bg-current opacity-80" />
                Dashboard
              </div>
              {["Orders", "Reports", "Settings"].map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1.5 text-[9px] text-navy-300"
                >
                  <span className="size-1.5 rounded-[3px] bg-current opacity-50" />
                  {label}
                </div>
              ))}
            </div>

            {/* Main panel */}
            <div className="min-w-0 flex-1 space-y-2.5 p-3">
              {/* Mini stat cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md border border-white/5 bg-white/5 p-2">
                  <div className="h-1.5 w-9 rounded-full bg-white/15" />
                  <svg
                    viewBox="0 0 60 16"
                    preserveAspectRatio="none"
                    className="mt-1.5 h-4 w-full"
                  >
                    <path
                      d="M0 12L10 10L20 11L30 7L40 8L50 4L60 5"
                      fill="none"
                      stroke="#2DD4BF"
                      strokeOpacity="0.9"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <div className="rounded-md border border-white/5 bg-white/5 p-2">
                  <div className="h-1.5 w-9 rounded-full bg-white/15" />
                  <svg
                    viewBox="0 0 60 16"
                    preserveAspectRatio="none"
                    className="mt-1.5 h-4 w-full"
                  >
                    <path
                      d="M0 10L10 11L20 8L30 9L40 6L50 7L60 3"
                      fill="none"
                      stroke="#2DD4BF"
                      strokeOpacity="0.6"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <div className="rounded-md border border-white/5 bg-white/5 p-2">
                  <div className="h-1.5 w-9 rounded-full bg-white/15" />
                  <svg
                    viewBox="0 0 60 16"
                    preserveAspectRatio="none"
                    className="mt-1.5 h-4 w-full"
                  >
                    <path
                      d="M0 13L10 11L20 12L30 8L40 9L50 5L60 4"
                      fill="none"
                      stroke="#2DD4BF"
                      strokeOpacity="0.75"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>

              {/* Chart card — hand-drawn area/line + bars */}
              <div className="rounded-md border border-white/5 bg-white/5 p-2.5">
                <div className="h-1.5 w-12 rounded-full bg-white/15" />
                <svg
                  viewBox="0 0 200 64"
                  preserveAspectRatio="none"
                  className="mt-2 h-20 w-full"
                >
                  <line x1="0" y1="22" x2="200" y2="22" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <line x1="0" y1="42" x2="200" y2="42" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <path
                    d="M0 48C18 42 32 44 46 38C60 32 74 36 88 30C102 24 118 28 132 20C148 12 168 18 200 6L200 64L0 64Z"
                    fill="#2DD4BF"
                    fillOpacity="0.1"
                  />
                  <path
                    d="M0 48C18 42 32 44 46 38C60 32 74 36 88 30C102 24 118 28 132 20C148 12 168 18 200 6"
                    fill="none"
                    stroke="#2DD4BF"
                    strokeWidth="1.8"
                  />
                </svg>
                <svg
                  viewBox="0 0 200 24"
                  preserveAspectRatio="none"
                  className="mt-1.5 h-7 w-full"
                >
                  <rect x="4" y="16" width="14" height="8" fill="#2DD4BF" fillOpacity="0.3" />
                  <rect x="24" y="12" width="14" height="12" fill="#2DD4BF" fillOpacity="0.3" />
                  <rect x="44" y="14" width="14" height="10" fill="#2DD4BF" fillOpacity="0.3" />
                  <rect x="64" y="9" width="14" height="15" fill="#2DD4BF" fillOpacity="0.3" />
                  <rect x="84" y="13" width="14" height="11" fill="#2DD4BF" fillOpacity="0.3" />
                  <rect x="104" y="7" width="14" height="17" fill="#2DD4BF" fillOpacity="0.3" />
                  <rect x="124" y="4" width="14" height="20" fill="#2DD4BF" fillOpacity="0.85" />
                  <rect x="144" y="10" width="14" height="14" fill="#2DD4BF" fillOpacity="0.3" />
                  <rect x="164" y="6" width="14" height="18" fill="#2DD4BF" fillOpacity="0.3" />
                  <rect x="184" y="12" width="14" height="12" fill="#2DD4BF" fillOpacity="0.3" />
                </svg>
              </div>

              {/* Table rows */}
              <div className="flex items-center gap-2 rounded-md border border-white/5 bg-white/5 px-2.5 py-2">
                <span className="h-2 w-14 rounded-full bg-white/15" />
                <span className="size-1.5 rounded-full bg-teal-300" />
                <span className="ml-auto rounded-full bg-teal-400/10 px-1.5 py-0.5 text-[9px] leading-none text-teal-300">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-white/5 bg-white/5 px-2.5 py-2">
                <span className="h-2 w-14 rounded-full bg-white/15" />
                <span className="size-1.5 rounded-full bg-teal-400/70" />
                <span className="ml-auto rounded-full bg-teal-400/10 px-1.5 py-0.5 text-[9px] leading-none text-teal-300">
                  Synced
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile app card */}
      <div
        data-depth="20"
        className="absolute -right-3 bottom-4 z-20 w-32 will-change-transform sm:-right-6 sm:w-36"
      >
        <div className="rounded-2xl border border-white/10 bg-navy-800/95 p-3 shadow-2xl">
          <div className="mx-auto h-1 w-8 rounded-full bg-white/15" />
          <svg viewBox="0 0 40 40" className="mx-auto mt-2 size-14">
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="3.5"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="#2DD4BF"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="100.53"
              strokeDashoffset="22.12"
              transform="rotate(-90 20 20)"
            />
            <text
              x="20"
              y="23.5"
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="600"
              fill="#FFFFFF"
            >
              78%
            </text>
          </svg>
          <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-white/10" />
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1.5">
              <span className="size-1.5 rounded-full bg-teal-300/80" />
              <span className="h-1.5 flex-1 rounded-full bg-white/10" />
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1.5">
              <span className="size-1.5 rounded-full bg-teal-300/50" />
              <span className="h-1.5 flex-1 rounded-full bg-white/10" />
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1.5">
              <span className="size-1.5 rounded-full bg-teal-300/65" />
              <span className="h-1.5 flex-1 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating capability chips */}
      <div data-depth="26" className="absolute inset-0 z-30 will-change-transform">
        <div className="absolute -top-4 right-4 sm:right-10">
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-navy-800/90 px-2.5 py-1.5 text-[10px] font-medium text-navy-100">
            <Plug className="size-3 text-teal-300" aria-hidden="true" />
            API Integration
          </span>
        </div>
        <div className="absolute -left-3 top-[42%] sm:-left-9">
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-navy-800/90 px-2.5 py-1.5 text-[10px] font-medium text-navy-100">
            <Sparkles className="size-3 text-teal-300" aria-hidden="true" />
            AI-assisted
          </span>
        </div>
        <div className="absolute -bottom-3 left-5 sm:left-12">
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-navy-800/90 px-2.5 py-1.5 text-[10px] font-medium text-navy-100">
            <Search className="size-3 text-teal-300" aria-hidden="true" />
            SEO
          </span>
        </div>
      </div>

      {/* Animated dashed connectors (decorative overlay) */}
      <svg
        viewBox="0 0 560 400"
        preserveAspectRatio="none"
        fill="none"
        className="pointer-events-none absolute inset-0 z-40 h-full w-full"
      >
        <path
          d="M140 58C195 34 245 26 298 30"
          stroke="#2DD4BF"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          strokeDasharray="7 7"
          className="animate-flow"
        />
        <circle cx="298" cy="30" r="2.5" fill="#5EEAD4" />
        <path
          d="M402 174C434 166 462 172 480 190"
          stroke="#2DD4BF"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          strokeDasharray="7 7"
          className="animate-flow"
        />
        <circle cx="480" cy="190" r="2.5" fill="#5EEAD4" />
        <path
          d="M452 338C430 348 418 352 404 358"
          stroke="#2DD4BF"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          strokeDasharray="7 7"
          className="animate-flow"
        />
        <circle cx="404" cy="358" r="2.5" fill="#5EEAD4" />
      </svg>
    </div>
  );
}
