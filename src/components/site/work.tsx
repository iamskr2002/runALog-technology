"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { conceptProjects } from "@/lib/work-data";

import { ProjectCard } from "./project-card";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

/** Bring the contact form into view (respecting reduced-motion preferences). */
function scrollToContact() {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  document.getElementById("contact")?.scrollIntoView({
    behavior: prefersReduced ? "auto" : "smooth",
  });
}

/* ── Section ───────────────────────────────────────────────────────────── */

export function Work() {
  return (
    <section id="work" aria-labelledby="work-heading" className="bg-background py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="work-heading"
          eyebrow="Our Work"
          title="Selected solutions, clearly labeled."
          description="These are concept and demonstration projects that show the kinds of solutions we build. Live case studies with verified client outcomes will be published here as they're authorized."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {conceptProjects.slice(0, 4).map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}

          {/* Conversion CTA — completes the desktop 3-column grid */}
          <Reveal delay={100} className="h-full md:col-span-2">
            <div className="relative flex h-full flex-col justify-center gap-5 overflow-hidden rounded-xl border border-navy-800 bg-navy-900 p-6 text-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover sm:p-7 lg:flex-row lg:items-center lg:justify-between">
              {/* Decorative animated flow lines (echoes the brand workflow motif) */}
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 size-full opacity-20"
                viewBox="0 0 400 100"
                preserveAspectRatio="none"
              >
                <path
                  d="M-10 22 Q 90 4 190 16 T 410 10"
                  fill="none"
                  stroke="#2DD4BF"
                  strokeDasharray="4 7"
                  strokeWidth={1.2}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="animate-flow"
                />
                <path
                  d="M-10 80 Q 120 96 230 78 T 410 84"
                  fill="none"
                  stroke="#2DD4BF"
                  strokeDasharray="4 7"
                  strokeWidth={1.2}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="animate-flow"
                />
              </svg>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-[47%] top-[16%] size-1.5 rounded-full bg-teal-400/60"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[20%] right-[16%] size-1.5 rounded-full bg-teal-400/60"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-12 size-40 rounded-full bg-teal-400/15 blur-3xl"
              />

              <div className="relative max-w-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
                  Next step
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold text-white sm:text-xl">
                  Your project could be next.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-200">
                  Tell us what you want to achieve — we scope it together in a
                  free, no-pressure conversation.
                </p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {["Free scoping call", "Clear proposal", "No obligation"].map(
                    (item) => (
                      <li
                        key={item}
                        className="flex items-center gap-1.5 text-[13px] font-medium text-navy-200"
                      >
                        <Check
                          className="size-3.5 shrink-0 text-teal-300"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <Button
                className="group relative h-11 shrink-0 px-6"
                onClick={scrollToContact}
              >
                Start a Project
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Button>
            </div>
          </Reveal>
        </div>

        {/* View all concept work — dedicated page */}
        <Reveal delay={120} className="mt-12 flex flex-col items-center gap-3 text-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="group h-11 border-navy-200 px-7 text-navy-900 hover:border-navy-950 hover:bg-navy-950 hover:text-white"
          >
            <Link href="/work">
              View All Work
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            More concept work across applications, websites, automation and marketing.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
