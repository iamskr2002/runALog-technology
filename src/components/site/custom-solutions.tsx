"use client";

import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck,
  Smartphone,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

type Offering = {
  icon: LucideIcon;
  title: string;
  copy: string;
};

const offerings: Offering[] = [
  {
    icon: Building2,
    title: "Custom business management systems",
    copy: "One system for the operations that run your company.",
  },
  {
    icon: Users,
    title: "Internal employee portals",
    copy: "Give your team one place for tools, documents, and requests.",
  },
  {
    icon: Smartphone,
    title: "Customer-facing applications",
    copy: "Web and mobile apps your customers actually enjoy using.",
  },
  {
    icon: CalendarCheck,
    title: "Booking & management platforms",
    copy: "Scheduling, reservations, and resource management done right.",
  },
  {
    icon: Workflow,
    title: "Automated business workflows",
    copy: "Connect your tools and let the routine work run itself.",
  },
  {
    icon: BarChart3,
    title: "Integrated marketing & analytics systems",
    copy: "See what's working across every channel in one view.",
  },
];

/** Dispatch the shared prefill event, then bring the contact form into view. */
function prefillServiceAndScroll(slug?: string) {
  if (slug) {
    window.dispatchEvent(
      new CustomEvent("runa:prefill-service", { detail: { service: slug } })
    );
  }
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById("contact")
    ?.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
}

export function CustomSolutions() {
  return (
    <section
      aria-labelledby="custom-solutions-heading"
      className="relative overflow-hidden bg-navy-900 py-20 text-white sm:py-24 lg:py-28"
    >
      {/* Decorative radial teal glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[46rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400 opacity-[0.08] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="custom-solutions-heading"
          tone="on-navy"
          eyebrow="Custom Solutions"
          title="Built around the way your business actually works."
          description="When off-the-shelf tools fall short, we scope a solution around your objectives, complexity, integrations, and timeline — nothing more, nothing less."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offerings.map(({ icon: Icon, title, copy }, i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="h-full rounded-xl border border-white/10 bg-white/5 p-5 transition-colors duration-300 hover:bg-white/10">
                <Icon className="size-5 text-teal-300" aria-hidden="true" />
                <h3 className="mt-3 font-display text-[0.95rem] font-semibold text-white">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-200">{copy}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-12 flex flex-col items-center gap-3 text-center">
          <Button
            size="lg"
            className="group h-11 px-7"
            onClick={() => prefillServiceAndScroll("custom-solutions")}
          >
            Discuss Your Requirements
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Button>
          <p className="text-sm text-navy-300">
            Every engagement starts with a free scoping conversation.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
