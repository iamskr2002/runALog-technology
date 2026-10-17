"use client";

import {
  AppWindow,
  ArrowRight,
  Check,
  Megaphone,
  MonitorSmartphone,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import type { ServiceSlug } from "@/lib/site-config";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

/**
 * Opens the project inquiry form (contact section) with the given service
 * pre-selected, then scrolls the visitor to it. Duplicated intentionally in
 * solutions-by-need.tsx so both files stay independent.
 */
function prefillServiceAndScroll(slug?: string) {
  if (slug) {
    window.dispatchEvent(
      new CustomEvent("runa:prefill-service", { detail: { service: slug } })
    );
  }
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  document.getElementById("contact")?.scrollIntoView({
    behavior: prefersReduced ? "auto" : "smooth",
  });
}

type Service = {
  slug: ServiceSlug;
  icon: LucideIcon;
  title: string;
  description: string;
  capabilities: string[];
};

const services: Service[] = [
  {
    slug: "application-development",
    icon: AppWindow,
    title: "Application Development",
    description: "Custom software built around how your business actually operates.",
    capabilities: [
      "Custom web and mobile apps",
      "Business systems and dashboards",
      "MVP development and prototyping",
      "API development and integrations",
      "Scalable, maintainable software",
    ],
  },
  {
    slug: "website-development",
    icon: MonitorSmartphone,
    title: "Website Development",
    description: "Fast, polished websites that turn visitors into inquiries.",
    capabilities: [
      "Corporate and business websites",
      "E-commerce and online stores",
      "Conversion-focused landing pages",
      "Responsive UI/UX implementation",
      "Ongoing maintenance and optimization",
    ],
  },
  {
    slug: "business-automation",
    icon: Workflow,
    title: "Business Automation",
    description: "Practical automation that removes repetitive manual work.",
    capabilities: [
      "Workflow and process automation",
      "API and software integrations",
      "Automated notifications and reports",
      "AI-assisted workflows",
      "Fewer repetitive manual tasks",
    ],
  },
  {
    slug: "digital-marketing",
    icon: Megaphone,
    title: "Digital Marketing",
    description: "Measurable campaigns that bring the right customers to you.",
    capabilities: [
      "Search engine optimization",
      "Social media management",
      "Digital advertising campaigns",
      "Content and campaign planning",
      "Analytics and conversion optimization",
    ],
  },
];

export function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="bg-background py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="services-heading"
          eyebrow="Services"
          title="Four disciplines. One accountable team."
          description="Everything you need to design, build, automate, and grow — delivered by specialists who understand the business behind the code."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={i * 70} className="h-full">
              <article className="group relative flex h-full flex-col rounded-xl border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-teal-600/40 hover:shadow-card-hover focus-within:border-teal-600/40 focus-within:shadow-card-hover">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-gradient-to-r from-teal-600 to-teal-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                />

                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-teal-600/10 text-teal-700 transition-colors duration-300 group-hover:bg-teal-600 group-hover:text-white">
                    <service.icon className="size-5" aria-hidden="true" />
                  </div>
                  <span
                    aria-hidden="true"
                    className="font-display text-sm font-semibold tracking-wide text-navy-200"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-base font-semibold leading-snug text-navy-900">
                  {service.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {service.description}
                </p>

                <ul className="mt-4 list-none space-y-2 border-t border-border/80 pt-4">
                  {service.capabilities.map((capability) => (
                    <li
                      key={capability}
                      className="flex items-start gap-2 text-[13px] leading-snug text-muted-foreground"
                    >
                      <Check
                        className="mt-[3px] size-3.5 shrink-0 text-teal-600"
                        aria-hidden="true"
                      />
                      {capability}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-5">
                  <button
                    type="button"
                    onClick={() => prefillServiceAndScroll(service.slug)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 transition-all duration-200 hover:gap-2.5 hover:text-teal-600 focus-visible:outline-2 focus-visible:outline-teal-600 rounded-sm"
                  >
                    Explore Service
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
