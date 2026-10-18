import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ProjectCard } from "@/components/site/project-card";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { conceptProjects } from "@/lib/work-data";

export const metadata: Metadata = {
  title: { absolute: "Our Work — RunA Log Technologies" },
  description:
    "Concept and demonstration projects across application development, website development, business automation, and digital marketing — an honest look at how RunA Log Technologies approaches design and engineering.",
  alternates: { canonical: "/work" },
  openGraph: {
    type: "website",
    url: "/work",
    title: "Our Work — RunA Log Technologies",
    description:
      "Concept and demonstration projects across our four services — applications, websites, automation, and marketing. No fabricated client claims.",
  },
};

const heroTrustPoints = [
  "Real design & engineering approach",
  "No fabricated client claims",
  "Concepts across all 4 services",
] as const;

export default function WorkPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Progressive enhancement: keep scroll-reveal content visible without JS. */}
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      <Navbar />

      <main id="main" className="flex-1">
        {/* ── Hero band ─────────────────────────────────────────────────── */}
        <section
          aria-labelledby="work-hero-heading"
          className="relative overflow-hidden bg-navy-950 text-white"
        >
          {/* Decorative radial teal glow + faint dot grid (echoes the homepage hero) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 right-[-10%] size-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(45,212,191,0.10),transparent)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_65%_at_75%_15%,black,transparent)]"
          />

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
            <Reveal>
              <p className="inline-flex items-center rounded-full border border-teal-400/30 bg-teal-400/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
                Our Work
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h1
                id="work-hero-heading"
                className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl"
              >
                Concept work that shows how we <span className="text-teal-300">think</span>.
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-200">
                Every project below is a self-initiated concept or internal
                demonstration. They exist to show our approach and craft across
                applications, websites, automation, and marketing — with no
                invented clients or outcomes.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 border-t border-white/10 pt-8">
                <ul className="flex flex-wrap gap-x-6 gap-y-3">
                  {heroTrustPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-2 text-sm font-medium text-navy-100"
                    >
                      <Check className="size-4 shrink-0 text-teal-300" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── All concept projects ──────────────────────────────────────── */}
        <section aria-label="All concept projects" className="bg-background py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {conceptProjects.map((project, i) => (
                <ProjectCard key={project.title} project={project} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA band ───────────────────────────────────────────── */}
        <section
          aria-labelledby="work-cta-heading"
          className="relative overflow-hidden bg-navy-900 py-16 text-white md:py-20"
        >
          {/* Decorative radial teal glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-72 w-[46rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400 opacity-[0.08] blur-3xl"
          />

          <Reveal className="relative mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
              Next step
            </p>
            <h2
              id="work-cta-heading"
              className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            >
              Your project could be next.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-navy-200">
              Tell us what you want to achieve — we scope it together in a
              free, no-pressure conversation.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="group h-11 px-7">
                <Link href="/#contact">
                  Start a Project
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
              <Button
                size="lg"
                asChild
                variant="ghost"
                className="h-11 px-7 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/#services">Explore Services</Link>
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
