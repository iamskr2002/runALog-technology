"use client";

import { useEffect, useRef } from "react";
import {
  Code2,
  Compass,
  ListChecks,
  PenTool,
  Rocket,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

type ProcessStep = {
  icon: LucideIcon;
  title: string;
  copy: string;
};

const steps: ProcessStep[] = [
  {
    icon: Compass,
    title: "Discover",
    copy: "Understand the business, goals, users, and challenges.",
  },
  {
    icon: ListChecks,
    title: "Plan",
    copy: "Define requirements, scope, priorities, and milestones.",
  },
  {
    icon: PenTool,
    title: "Design",
    copy: "Create the user experience, interface, and solution architecture.",
  },
  {
    icon: Code2,
    title: "Build",
    copy: "Develop, integrate, and test the solution.",
  },
  {
    icon: Rocket,
    title: "Launch",
    copy: "Deploy, validate, and prepare the solution for real users.",
  },
  {
    icon: TrendingUp,
    title: "Improve",
    copy: "Monitor, maintain, and refine the product as needs evolve.",
  },
];

export function Process() {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timeline = timelineRef.current;
    const progressLine = progressRef.current;
    if (!timeline || !progressLine) return;

    // Reduced motion: render the full line immediately, no scroll-driven fill.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      progressLine.style.height = "100%";
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = timeline.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const raw = (viewportHeight * 0.75 - rect.top) / (rect.height || 1);
      const progress = Math.min(1, Math.max(0, raw));
      progressLine.style.height = `${(progress * 100).toFixed(2)}%`;
    };

    // rAF-throttled scroll/resize handler.
    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="bg-background py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="process-heading"
          align="center"
          eyebrow="Our Process"
          title="A clear path from first idea to working solution."
          description="Six structured phases keep projects predictable — and keep you involved at every step."
        />

        <div ref={timelineRef} className="relative mx-auto mt-16 max-w-3xl">
          {/* Track line */}
          <div
            aria-hidden="true"
            className="absolute left-[19px] lg:left-1/2 lg:-translate-x-1/2 top-1 bottom-1 w-[2px] -translate-x-1/2 bg-border"
          />
          {/* Scroll-progress line */}
          <div
            ref={progressRef}
            aria-hidden="true"
            className="absolute left-[19px] lg:left-1/2 lg:-translate-x-1/2 top-1 w-[2px] -translate-x-1/2 bg-teal-500"
            style={{ height: "0%" }}
          />

          <ol className="relative list-none space-y-10 sm:space-y-12">
            {steps.map((step, i) => {
              const alignsRight = i % 2 === 0;
              return (
                <li
                  key={step.title}
                  className="relative pl-14 lg:grid lg:grid-cols-2 lg:gap-16 lg:pl-0"
                >
                  {/* Node dot on the line */}
                  <span
                    aria-hidden="true"
                    className="absolute left-[19px] lg:left-1/2 top-6 size-[14px] -translate-x-1/2 rounded-full border-[3px] border-background bg-teal-500 shadow-[0_0_0_1px_rgba(13,148,136,0.25)]"
                  />
                  <Reveal
                    delay={i * 80}
                    className={cn(
                      alignsRight
                        ? "lg:col-start-1 lg:text-right"
                        : "lg:col-start-2"
                    )}
                  >
                    <div className="rounded-xl border bg-card p-5 shadow-card sm:p-6">
                      <p className="text-xs font-bold tracking-widest text-teal-700">
                        {(i + 1).toString().padStart(2, "0")}
                      </p>
                      <div
                        className={cn(
                          "mt-3 flex items-center gap-3",
                          alignsRight && "lg:justify-end"
                        )}
                      >
                        <step.icon
                          className="size-5 text-teal-600"
                          aria-hidden="true"
                        />
                        <h3 className="font-display text-lg font-semibold text-navy-900">
                          {step.title}
                        </h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {step.copy}
                      </p>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
