"use client";

import { ArrowRight } from "lucide-react";

import type { ServiceSlug } from "@/lib/site-config";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

/**
 * Opens the project inquiry form (contact section) with the given service
 * pre-selected, then scrolls the visitor to it. Duplicated intentionally in
 * services.tsx so both files stay independent.
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

type NeedOption = {
  need: string;
  slug?: ServiceSlug;
  serviceLabel: string;
};

const needOptions: NeedOption[] = [
  {
    need: "I need a professional online presence",
    slug: "website-development",
    serviceLabel: "Website Development",
  },
  {
    need: "I want to launch a digital product",
    slug: "application-development",
    serviceLabel: "Application Development",
  },
  {
    need: "My team spends too much time on repetitive tasks",
    slug: "business-automation",
    serviceLabel: "Business Automation",
  },
  {
    need: "I want to reach more customers online",
    slug: "digital-marketing",
    serviceLabel: "Digital Marketing",
  },
  {
    need: "I need multiple systems to work together",
    slug: "custom-solutions",
    serviceLabel: "Integrations & Custom Solutions",
  },
  {
    need: "I'm not sure what I need yet",
    serviceLabel: "Talk it through with us",
  },
];

export function SolutionsByNeed() {
  return (
    <section
      id="solutions"
      aria-labelledby="solutions-heading"
      className="bg-muted py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="solutions-heading"
          eyebrow="Solutions"
          title="Start from where you are."
          description="Tell us the outcome you're after — we'll map it to the right service."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {needOptions.map((option, i) => (
            <Reveal key={option.need} delay={i * 60} className="h-full">
              <button
                type="button"
                onClick={() => prefillServiceAndScroll(option.slug)}
                className="group flex min-h-[7.5rem] w-full flex-col justify-between rounded-xl border bg-card p-5 text-left shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-600/40 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 h-full"
              >
                <span className="text-[0.95rem] font-medium leading-snug text-navy-900">
                  “{option.need}”
                </span>
                <span className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-teal-700">
                    {option.serviceLabel}
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-teal-700 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </button>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Selecting an option opens the project inquiry form with the relevant
          service pre-filled.
        </p>
      </div>
    </section>
  );
}
