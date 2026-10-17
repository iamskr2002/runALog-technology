"use client";

import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { HeroVisual } from "./hero-visual";
import { Reveal } from "./reveal";

const trustPoints = [
  "One accountable partner",
  "Business-first approach",
  "Built to scale",
] as const;

export function Hero() {
  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative overflow-hidden bg-navy-950 text-white"
    >
      {/* Background decoration — restrained glow + faint dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-44 right-[-10%] size-[700px] rounded-full bg-[radial-gradient(closest-side,rgba(45,212,191,0.10),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_65%_at_75%_15%,black,transparent)]"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:pb-32 lg:pt-28">
        {/* Left column — copy + conversion */}
        <div>
          <Reveal>
            <p className="inline-flex items-center rounded-full border border-teal-400/30 bg-teal-400/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
              Applications · Websites · Automation · Marketing
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
              Technology That Moves Your Business{" "}
              <span className="text-teal-300">Forward</span>.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-200">
              {siteConfig.description}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <a href="#contact">
                  Start a Project
                  <ArrowRight className="ml-1 size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button
                size="lg"
                asChild
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/15 hover:text-white"
              >
                <a href="#services">Explore Our Services</a>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-10 border-t border-white/10 pt-8">
              <ul className="flex flex-wrap gap-x-6 gap-y-3">
                {trustPoints.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-2 text-sm font-medium text-navy-100"
                  >
                    <Check className="size-4 shrink-0 text-teal-300" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-navy-300">
                From first sketch to launch and beyond — applications, websites,
                automation, and marketing under one roof.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Right column — hand-built product ecosystem visual */}
        <Reveal variant="fade" delay={200} className="relative">
          <p className="sr-only">
            Illustration: connected digital products — a web dashboard, a mobile
            app, and an automated workflow.
          </p>
          <HeroVisual />
        </Reveal>
      </div>
    </section>
  );
}
