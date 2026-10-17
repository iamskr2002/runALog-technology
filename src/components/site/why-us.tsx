import { Fragment } from "react";
import {
  CalendarClock,
  Code2,
  Layers,
  LifeBuoy,
  ListChecks,
  MessagesSquare,
  PenTool,
  Puzzle,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

type Differentiator = {
  icon: LucideIcon;
  title: string;
  copy: string;
};

const differentiators: Differentiator[] = [
  {
    icon: Target,
    title: "Business-first problem solving",
    copy: "We start from the outcome you need — more bookings, faster operations, better data — then choose the technology that gets you there.",
  },
  {
    icon: Puzzle,
    title: "Tailored to your organization",
    copy: "No forced templates. Solutions are shaped around your workflows, team size, and growth plans.",
  },
  {
    icon: MessagesSquare,
    title: "Clear communication",
    copy: "Plain-language updates, shared milestones, and honest timelines keep everyone aligned from kickoff to launch.",
  },
  {
    icon: Layers,
    title: "Scalable, maintainable foundations",
    copy: "Well-documented, standards-based technology means your product can grow without expensive rebuilds.",
  },
  {
    icon: Zap,
    title: "Automation with practical outcomes",
    copy: "We automate the tasks that actually drain your team's time — with measurable results, not gimmicks.",
  },
  {
    icon: LifeBuoy,
    title: "Support beyond launch",
    copy: "Monitoring, maintenance, and continuous improvement keep your product healthy as your needs evolve.",
  },
];

type FlowNode = {
  icon: LucideIcon;
  label: string;
};

const flowNodes: FlowNode[] = [
  { icon: Target, label: "Business goal" },
  { icon: ListChecks, label: "Requirements & scope" },
  { icon: PenTool, label: "Design & architecture" },
  { icon: Code2, label: "Build & integrate" },
  { icon: TrendingUp, label: "Measure & improve" },
];

export function WhyUs() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-muted py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="about-heading"
          eyebrow="Why RunA Log"
          title="A technology partner, not just a vendor."
          description="We measure our work by the outcomes it creates for your organization — not by deliverables checked off a list."
        />

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Differentiators */}
          <div className="grid gap-x-8 gap-y-9 sm:grid-cols-2">
            {differentiators.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div className="size-11 rounded-lg bg-white border border-border shadow-sm flex items-center justify-center text-teal-700">
                  <item.icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-navy-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.copy}
                </p>
              </Reveal>
            ))}
          </div>

          {/* Value-flow visual (decorative) */}
          <Reveal delay={160}>
            <div
              aria-hidden="true"
              className="relative rounded-xl border bg-card p-6 shadow-card sm:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-400">
                From business goal to working solution
              </p>

              <div className="mt-6">
                {flowNodes.map((node, i) => (
                  <Fragment key={node.label}>
                    {i > 0 && (
                      <svg
                        viewBox="0 0 2 16"
                        className="ml-[21px] block h-4 w-[2px]"
                      >
                        <line
                          x1="1"
                          y1="0"
                          x2="1"
                          y2="16"
                          stroke="#0D9488"
                          strokeWidth="1.5"
                          strokeDasharray="4 5"
                          className="animate-flow"
                        />
                      </svg>
                    )}
                    <div
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm font-medium text-navy-800 shadow-sm",
                        i === flowNodes.length - 1 &&
                          "border-teal-600/30 bg-teal-600/5"
                      )}
                    >
                      <node.icon className="size-4 text-teal-600" />
                      {node.label}
                    </div>
                  </Fragment>
                ))}
              </div>

              <div className="absolute -bottom-5 -right-3 sm:-right-5 rounded-lg border bg-navy-900 px-4 py-3 shadow-lg text-white text-xs font-medium flex items-center gap-2">
                <CalendarClock className="size-4 text-teal-300" />
                Weekly demos, no surprises
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
