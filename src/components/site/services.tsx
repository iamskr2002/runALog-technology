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
    description:
      "Custom software built around your operations — from internal tools to customer-facing products.",
    capabilities: [
      "Custom web and mobile applications",
      "Business management systems and dashboards",
      "MVP development and product prototyping",
      "API development and third-party integrations",
      "Scalable, maintainable software solutions",
    ],
  },
  {
    slug: "website-development",
    icon: MonitorSmartphone,
    title: "Website Development",
    description:
      "Fast, polished websites that earn trust and turn visitors into inquiries.",
    capabilities: [
      "Corporate and business websites",
      "E-commerce websites and online stores",
      "Landing pages and conversion-focused websites",
      "Responsive UI/UX implementation",
      "Website maintenance and performance optimization",
    ],
  },
  {
    slug: "business-automation",
    icon: Workflow,
    title: "Business Automation",
    description:
      "Practical automation that removes repetitive work and keeps your systems in sync.",
    capabilities: [
      "Workflow and process automation",
      "API and software integrations",
      "Automated notifications, reporting, and data handling",
      "AI-assisted workflows where appropriate",
      "Reduction of repetitive manual work",
    ],
  },
  {
    slug: "digital-marketing",
    icon: Megaphone,
    title: "Digital Marketing",
    description:
      "Measurable campaigns and search visibility that bring the right customers to you.",
    capabilities: [
      "Search engine optimization",
      "Social media strategy and management",
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

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={i * 80} className="h-full">
              <article className="group relative flex h-full flex-col rounded-xl border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-teal-600/40 hover:shadow-card-hover focus-within:border-teal-600/40 focus-within:shadow-card-hover sm:p-8">
                <div className="size-12 rounded-lg bg-teal-600/10 text-teal-700 flex items-center justify-center transition-colors duration-300 group-hover:bg-teal-600 group-hover:text-white">
                  <service.icon className="size-6" aria-hidden="true" />
                </div>

                <h3 className="mt-6 font-display text-xl font-semibold text-navy-900">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>

                <ul className="mt-5 list-none space-y-2.5">
                  {service.capabilities.map((capability) => (
                    <li
                      key={capability}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <Check
                        className="size-4 shrink-0 text-teal-600 mt-0.5"
                        aria-hidden="true"
                      />
                      {capability}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
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
