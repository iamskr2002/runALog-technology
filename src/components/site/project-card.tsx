"use client";

import type { ReactNode } from "react";
import {
  ArrowRight,
  Database,
  FileText,
  Inbox,
  Info,
  ListChecks,
  Mail,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ConceptProject, ProjectVisualKind } from "@/lib/work-data";

import { Reveal } from "./reveal";

/* ── Hand-built mockup helpers (decorative, aria-hidden) ────────────────── */

function BrowserFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-white/10 bg-navy-800 shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-2.5 py-1">
        <span className="size-1.5 rounded-full bg-white/20" />
        <span className="size-1.5 rounded-full bg-white/20" />
        <span className="size-1.5 rounded-full bg-white/20" />
        <span className="ml-1.5 flex h-3 flex-1 items-center rounded-full bg-white/5 px-2">
          <span className="truncate text-[8px] leading-none text-navy-300">{label}</span>
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

const dashboardBars = [
  { height: 42 },
  { height: 64 },
  { height: 34 },
  { height: 82 },
  { height: 52 },
  { height: 96, highlight: true },
  { height: 66 },
];

function DashboardVisual() {
  return (
    <BrowserFrame label="ops-dashboard.example.com">
      <div className="flex h-full">
        {/* Mini sidebar */}
        <aside className="flex w-[22%] flex-col gap-1.5 border-r border-white/10 bg-navy-900/50 p-2">
          <div className="mb-1 flex items-center gap-1.5 px-0.5">
            <span className="size-2 rounded-full bg-teal-400" />
            <span className="h-1.5 w-7 rounded-full bg-white/25" />
          </div>
          <span className="h-3.5 rounded bg-teal-400/25" />
          <span className="h-3.5 rounded bg-white/10" />
          <span className="h-3.5 rounded bg-white/10" />
          <span className="h-3.5 rounded bg-white/10" />
          <span className="mt-auto h-3.5 rounded bg-white/10" />
        </aside>
        {/* Main panel */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-2.5">
          <div className="flex items-center justify-between">
            <span className="h-2 w-16 rounded-full bg-white/25" />
            <span className="rounded bg-teal-400 px-1.5 py-0.5 text-[8px] font-bold leading-none text-navy-900">
              + New job
            </span>
          </div>
          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-1.5">
            {["Jobs", "Revenue", "Active"].map((label) => (
              <div key={label} className="rounded-md border border-white/10 bg-white/5 p-1.5">
                <span className="block text-[9px] leading-none text-navy-300">{label}</span>
                <span className="mt-1.5 block h-1.5 w-8 rounded-full bg-teal-400/40" />
              </div>
            ))}
          </div>
          {/* Chart + table */}
          <div className="flex min-h-0 flex-1 gap-1.5">
            <div className="flex min-h-0 flex-[1.3] flex-col rounded-md border border-white/10 bg-white/5 p-1.5">
              <span className="mb-1 block text-[8px] leading-none text-navy-300">This week</span>
              <div className="flex min-h-0 flex-1 items-end gap-[3px]">
                {dashboardBars.map((bar, i) => (
                  <span
                    key={i}
                    className={`block w-full rounded-sm ${bar.highlight ? "bg-teal-400" : "bg-teal-400/70"}`}
                    style={{ height: `${bar.height}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-1 rounded-md border border-white/10 bg-white/5 p-1.5">
              <span className="block text-[8px] leading-none text-navy-300">Latest jobs</span>
              <div className="flex items-center justify-between rounded border border-white/10 bg-navy-900/40 px-1.5 py-0.5">
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-teal-400" />
                  <span className="h-1.5 w-9 rounded-full bg-white/20" />
                </span>
                <span className="rounded-sm bg-teal-400/20 px-1 py-0.5 text-[8px] font-medium leading-none text-teal-300">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between rounded border border-white/10 bg-navy-900/40 px-1.5 py-0.5">
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-white/30" />
                  <span className="h-1.5 w-9 rounded-full bg-white/20" />
                </span>
                <span className="rounded-sm bg-white/10 px-1 py-0.5 text-[8px] font-medium leading-none text-navy-300">
                  Queued
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function EcommerceVisual() {
  return (
    <BrowserFrame label="storefront.example.com">
      <div className="flex h-full flex-col">
        {/* Top nav */}
        <div className="flex items-center justify-between border-b border-white/10 px-2.5 py-1.5">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-teal-400" />
            <span className="h-1.5 w-9 rounded-full bg-white/25" />
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-5 rounded-full bg-white/15" />
            <span className="h-1 w-5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
          </span>
        </div>
        {/* Hero band */}
        <div className="mx-2.5 mt-1.5 flex items-center justify-between gap-2 rounded-md border border-white/10 bg-white/5 p-1.5">
          <div className="min-w-0 space-y-1">
            <span className="block h-2 w-20 rounded-full bg-white/30" />
            <span className="block h-1.5 w-14 rounded-full bg-white/15" />
          </div>
          <span className="shrink-0 rounded bg-teal-400 px-1.5 py-1 text-[8px] font-bold leading-none text-navy-900">
            Shop now
          </span>
        </div>
        {/* Product grid */}
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-1.5 p-2">
          {["Product", "Product", "Product"].map((label, i) => (
            <div key={`${label}-${i}`} className="flex flex-col gap-1 rounded-md border border-white/10 bg-white/5 p-1.5">
              <span className="block h-6 w-full rounded bg-white/10" />
              <span className="block h-1.5 w-10 rounded-full bg-white/20" />
              <span className="block h-1.5 w-6 rounded-full bg-teal-400/50" />
              {i === 0 ? (
                <span className="mt-auto w-fit rounded-sm bg-teal-400/20 px-1 py-0.5 text-[7px] font-semibold leading-none text-teal-300">
                  Add to cart
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

const workflowNodes: { label: string; icon: LucideIcon; left: string; top: string }[] = [
  { label: "Web Form", icon: Inbox, left: "17%", top: "24%" },
  { label: "Validation", icon: ListChecks, left: "50%", top: "22%" },
  { label: "CRM", icon: Database, left: "83%", top: "26%" },
  { label: "Email Alert", icon: Mail, left: "32%", top: "76%" },
  { label: "Report", icon: FileText, left: "69%", top: "74%" },
];

function WorkflowVisual() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-white/10 bg-navy-800 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-white/10 px-2.5 py-1">
        <span className="rounded bg-teal-400/15 px-1.5 py-0.5 text-[8px] font-bold leading-none text-teal-300">
          Automation
        </span>
        <span className="h-1.5 w-14 rounded-full bg-white/20" />
        <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[8px] leading-none text-navy-300">
          Live run
        </span>
      </div>
      {/* Node diagram */}
      <div className="relative min-h-0 flex-1">
        <svg
          className="absolute inset-0 size-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M17 24 Q 33 20 50 22"
            fill="none"
            stroke="#2DD4BF"
            strokeDasharray="5 6"
            strokeWidth={1.5}
            strokeOpacity={0.55}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="animate-flow"
          />
          <path
            d="M50 22 Q 67 20 83 26"
            fill="none"
            stroke="#2DD4BF"
            strokeDasharray="5 6"
            strokeWidth={1.5}
            strokeOpacity={0.55}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="animate-flow"
          />
          <path
            d="M50 22 C 44 40 36 56 32 76"
            fill="none"
            stroke="#2DD4BF"
            strokeDasharray="5 6"
            strokeWidth={1.5}
            strokeOpacity={0.55}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="animate-flow"
          />
          <path
            d="M32 76 Q 50 82 69 74"
            fill="none"
            stroke="#2DD4BF"
            strokeDasharray="5 6"
            strokeWidth={1.5}
            strokeOpacity={0.55}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="animate-flow"
          />
        </svg>
        {workflowNodes.map(({ label, icon: Icon, left, top }) => (
          <div
            key={label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left, top }}
          >
            <div className="flex items-center gap-1 rounded-md border border-white/15 bg-navy-800 px-1.5 py-1 shadow-lg">
              <Icon className="size-2.5 text-teal-300" />
              <span className="whitespace-nowrap text-[9px] font-medium leading-none text-white">
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampaignVisual() {
  return (
    <div className="flex h-full w-full items-stretch gap-2.5">
      {/* Desktop mini layout */}
      <div className="min-w-0 flex-[1.7]">
        <BrowserFrame label="launch.example.com">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-2 py-1.5">
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-teal-400" />
                <span className="h-1 w-7 rounded-full bg-white/25" />
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1 w-4 rounded-full bg-white/15" />
                <span className="h-1 w-4 rounded-full bg-white/15" />
              </span>
            </div>
            <div className="relative min-h-0 flex-1 p-2.5">
              <span className="absolute right-2 top-2 rounded border border-teal-400/30 bg-teal-400/15 px-1.5 py-0.5 text-[8px] font-bold leading-none text-teal-300">
                SEO
              </span>
              <div className="flex h-full flex-col justify-center gap-1.5">
                <span className="block h-2.5 w-3/4 rounded-full bg-white/30" />
                <span className="block h-2.5 w-1/2 rounded-full bg-white/20" />
                <span className="block h-1.5 w-2/3 rounded-full bg-white/10" />
                <span className="mt-1.5 block w-fit rounded bg-teal-400 px-2 py-1 text-[8px] font-bold leading-none text-navy-900">
                  Get started
                </span>
              </div>
            </div>
            {/* Analytics strip */}
            <div className="flex items-center gap-2 border-t border-white/10 px-2 py-1.5">
              <span className="text-[9px] leading-none text-navy-300">Visits</span>
              <svg viewBox="0 0 60 18" preserveAspectRatio="none" className="h-4 min-w-0 flex-1">
                <polyline
                  points="0,14 8,12 16,13 24,9 32,10 40,6 48,7 60,3"
                  fill="none"
                  stroke="#2DD4BF"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <span className="rounded-sm bg-teal-400/20 px-1 py-0.5 text-[8px] font-semibold leading-none text-teal-300">
                Trending up
              </span>
            </div>
          </div>
        </BrowserFrame>
      </div>
      {/* Phone frame */}
      <div className="flex w-[24%] shrink-0 flex-col rounded-xl border border-white/15 bg-navy-800 p-1 shadow-2xl">
        <span className="mx-auto my-1 block h-1 w-6 rounded-full bg-white/20" />
        <div className="min-h-0 flex-1 overflow-hidden rounded-lg bg-navy-900/70 p-1.5">
          <div className="flex h-full flex-col gap-1">
            <span className="block h-6 w-full rounded bg-white/10" />
            <span className="block h-1.5 w-3/4 rounded-full bg-white/30" />
            <span className="block h-1.5 w-1/2 rounded-full bg-white/15" />
            <span className="block h-1 w-2/3 rounded-full bg-white/10" />
            <span className="mt-auto block rounded bg-teal-400 py-1 text-center text-[7px] font-bold leading-none text-navy-900">
              Get started
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectVisual({ kind }: { kind: ProjectVisualKind }) {
  switch (kind) {
    case "dashboard":
      return <DashboardVisual />;
    case "ecommerce":
      return <EcommerceVisual />;
    case "workflow":
      return <WorkflowVisual />;
    case "campaign":
      return <CampaignVisual />;
  }
}

/* ── Project card (with per-card details dialog) ────────────────────────── */

export function ProjectCard({
  project,
  index = 0,
}: {
  project: ConceptProject;
  /** Grid position — staggers the reveal animation (delay = index * 80ms). */
  index?: number;
}) {
  return (
    <Reveal delay={index * 80}>
      <Dialog>
        <article className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
          {/* Decorative mockup visual */}
          <div
            aria-hidden="true"
            className="relative aspect-[16/9] overflow-hidden bg-navy-900"
          >
            <div className="absolute -right-8 -top-10 size-36 rounded-full bg-teal-400/10 blur-3xl" />
            <div className="absolute inset-3 transition-transform duration-500 group-hover:scale-[1.03]">
              <ProjectVisual kind={project.visual} />
            </div>
          </div>

          {/* Card content */}
          <div className="flex flex-1 flex-col gap-2.5 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-teal-600/20 bg-teal-600/10 text-teal-700">
                {project.category}
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                Concept project
              </Badge>
            </div>

            <h3 className="font-display text-base font-semibold text-navy-900">
              {project.title}
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {project.context}
            </p>

            <ul className="flex flex-wrap gap-1.5">
              {project.chips.map((chip) => (
                <li
                  key={chip}
                  className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-navy-600"
                >
                  {chip}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-3">
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="group/cta gap-1.5 px-0 text-teal-700 hover:bg-transparent hover:text-teal-600"
                >
                  View project details
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1"
                    aria-hidden="true"
                  />
                </Button>
              </DialogTrigger>
            </div>
          </div>
        </article>

        {/* Details dialog */}
        <DialogContent className="max-h-[85vh] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="pr-6 font-display text-lg font-semibold text-navy-900">
              {project.title}
            </DialogTitle>
            <DialogDescription>{project.context}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-navy-400">
                The challenge
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {project.challenge}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-navy-400">
                What we built
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {project.built}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-navy-400">
                Services involved
              </h4>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {project.chips.map((chip) => (
                  <li
                    key={chip}
                    className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-navy-600"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
              <p className="flex items-start gap-2.5">
                <Info className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
                <span>
                  This is a concept demonstration, not a client engagement. Real outcomes
                  are published only when verified and authorized.
                </span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Reveal>
  );
}
