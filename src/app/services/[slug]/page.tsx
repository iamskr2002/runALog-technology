import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  Info,
} from "lucide-react";

import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getServiceDetail,
  serviceDetails,
  servicePageSlugs,
} from "@/lib/services-data";
import { siteConfig } from "@/lib/site-config";

export const dynamicParams = false;

export function generateStaticParams() {
  return servicePageSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceDetail(slug);
  if (!service) return {};

  return {
    title: `${service.title} Services & Packages`,
    description: service.heroDescription,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      type: "website",
      url: `/services/${service.slug}`,
      title: `${service.title} — ${siteConfig.shortName}`,
      description: service.heroDescription,
    },
  };
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const contactHref = (slug: string) => `/?service=${slug}#contact`;

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceDetail(slug);
  if (!service) notFound();

  const related = serviceDetails.filter((item) => item.slug !== service.slug);
  const Icon = service.icon;

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.title} — ${siteConfig.name}`,
    description: service.heroDescription,
    provider: {
      "@type": "ProfessionalService",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: "Worldwide",
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Progressive enhancement: keep scroll-reveal content visible without JS. */}
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      <Navbar />

      <main id="main" className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="service-heading"
          className="relative overflow-hidden bg-navy-900 text-white"
        >
          {/* Decorative animated flow lines */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full opacity-[0.14]"
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
          >
            <path
              d="M-10 24 Q 100 6 200 18 T 410 12"
              fill="none"
              stroke="#2DD4BF"
              strokeDasharray="4 7"
              strokeWidth={1.2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="animate-flow"
            />
            <path
              d="M-10 82 Q 130 96 240 78 T 410 84"
              fill="none"
              stroke="#2DD4BF"
              strokeDasharray="4 7"
              strokeWidth={1.2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="animate-flow"
            />
          </svg>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-teal-400/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <Reveal>
              <nav aria-label="Breadcrumb">
                <Link
                  href="/#services"
                  className={cnFocus(
                    "inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-navy-300 transition-colors hover:text-teal-300"
                  )}
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  All services
                </Link>
              </nav>

              <div className="mt-8 flex items-center gap-4">
                <span className="flex size-14 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300">
                  <Icon className="size-7" aria-hidden="true" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
                  Service {service.index}
                </p>
              </div>

              <h1
                id="service-heading"
                className="mt-6 max-w-3xl font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
              >
                {service.title}
              </h1>
              <p className="mt-4 max-w-2xl font-display text-lg font-medium text-teal-200 sm:text-xl">
                {service.tagline}
              </p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-navy-200 sm:text-lg">
                {service.heroDescription}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" asChild className="group h-11 px-7">
                  <a href={contactHref(service.slug)}>
                    Start a Project
                    <ArrowRight
                      className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-11 border-white/25 bg-white/5 px-7 text-white hover:bg-white/15 hover:text-white"
                >
                  <a href="#packages">View Packages</a>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── What we deliver ──────────────────────────────────────────── */}
        <section
          aria-labelledby="service-overview-heading"
          className="bg-background py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                <span
                  aria-hidden="true"
                  className="inline-block h-px w-6 bg-teal-600/60"
                />
                What we deliver
              </p>
              <h2
                id="service-overview-heading"
                className="mt-4 font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl"
              >
                The service, explained.
              </h2>
              {service.overview.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </Reveal>

            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {service.capabilities.map((capability, i) => (
                <Reveal
                  as="li"
                  key={capability.title}
                  delay={i * 60}
                  className="h-full"
                >
                  <div className="flex h-full flex-col rounded-xl border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-600/40 hover:shadow-card-hover">
                    <h3 className="flex items-start gap-2.5 font-display text-[0.95rem] font-semibold text-navy-900">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-teal-600"
                        aria-hidden="true"
                      />
                      {capability.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {capability.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Why it's useful ──────────────────────────────────────────── */}
        <section
          aria-labelledby="service-benefits-heading"
          className="bg-muted py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                <span
                  aria-hidden="true"
                  className="inline-block h-px w-6 bg-teal-600/60"
                />
                Why it&apos;s useful
              </p>
              <h2
                id="service-benefits-heading"
                className="mt-4 font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl"
              >
                What it gives your business.
              </h2>
            </Reveal>

            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {service.benefits.map((benefit, i) => (
                <Reveal
                  as="li"
                  key={benefit.title}
                  delay={i * 70}
                  className="h-full"
                >
                  <div className="flex h-full flex-col rounded-xl border bg-card p-5 shadow-card">
                    <span
                      aria-hidden="true"
                      className="font-display text-sm font-semibold tracking-wide text-navy-200"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-display text-[0.95rem] font-semibold text-navy-900">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Packages ─────────────────────────────────────────────────── */}
        <section
          id="packages"
          aria-labelledby="service-packages-heading"
          className="bg-background py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                <span
                  aria-hidden="true"
                  className="inline-block h-px w-6 bg-teal-600/60"
                />
                Packages
              </p>
              <h2
                id="service-packages-heading"
                className="mt-4 font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl"
              >
                Ways to get started.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Pick the shape that matches where you are today — every package
                is scoped precisely in a free conversation before anything
                starts.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {service.packages.map((pkg, i) => (
                <Reveal key={pkg.name} delay={i * 80} className="h-full">
                  <article
                    className={
                      pkg.highlighted
                        ? "relative flex h-full flex-col overflow-hidden rounded-xl border border-teal-600/30 bg-navy-900 p-6 text-white shadow-card-hover transition-all duration-300 hover:-translate-y-1 lg:p-7"
                        : "relative flex h-full flex-col rounded-xl border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover lg:p-7"
                    }
                  >
                    {pkg.highlighted && (
                      <>
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-teal-400/15 blur-3xl"
                        />
                        <Badge className="absolute right-5 top-5 border-teal-400/30 bg-teal-400/15 text-teal-300">
                          Most popular
                        </Badge>
                      </>
                    )}

                    <h3
                      className={
                        pkg.highlighted
                          ? "font-display text-xl font-semibold"
                          : "font-display text-xl font-semibold text-navy-900"
                      }
                    >
                      {pkg.name}
                    </h3>
                    <p
                      className={
                        pkg.highlighted
                          ? "mt-1.5 text-sm font-medium text-teal-300"
                          : "mt-1.5 text-sm font-medium text-teal-700"
                      }
                    >
                      {pkg.tagline}
                    </p>

                    <p
                      className={
                        pkg.highlighted
                          ? "mt-4 text-sm leading-relaxed text-navy-200"
                          : "mt-4 text-sm leading-relaxed text-muted-foreground"
                      }
                    >
                      <span
                        className={
                          pkg.highlighted
                            ? "font-semibold text-white"
                            : "font-semibold text-navy-900"
                        }
                      >
                        Best for:{" "}
                      </span>
                      {pkg.bestFor}
                    </p>

                    <ul
                      className={
                        pkg.highlighted
                          ? "mt-5 list-none space-y-2.5 border-t border-white/15 pt-5"
                          : "mt-5 list-none space-y-2.5 border-t border-border/80 pt-5"
                      }
                    >
                      {pkg.features.map((feature) => (
                        <li
                          key={feature}
                          className={
                            pkg.highlighted
                              ? "flex items-start gap-2.5 text-sm leading-snug text-navy-100"
                              : "flex items-start gap-2.5 text-sm leading-snug text-muted-foreground"
                          }
                        >
                          <Check
                            className={
                              pkg.highlighted
                                ? "mt-0.5 size-4 shrink-0 text-teal-300"
                                : "mt-0.5 size-4 shrink-0 text-teal-600"
                            }
                            aria-hidden="true"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-6">
                      <p
                        className={
                          pkg.highlighted
                            ? "flex items-center gap-1.5 text-[13px] font-medium text-navy-300"
                            : "flex items-center gap-1.5 text-[13px] font-medium text-navy-400"
                        }
                      >
                        <Clock3 className="size-3.5" aria-hidden="true" />
                        Typical timeline: {pkg.timeline}
                      </p>
                      <Button
                        asChild
                        className="group mt-4 h-10 w-full px-5"
                        variant={pkg.highlighted ? "default" : "outline"}
                      >
                        <a href={contactHref(service.slug)}>
                          Request this package
                          <ArrowRight
                            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </a>
                      </Button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal delay={120}>
              <p className="mt-8 flex items-start gap-2.5 rounded-lg border border-border bg-muted p-4 text-sm leading-relaxed text-muted-foreground">
                <Info
                  className="mt-0.5 size-4 shrink-0 text-teal-700"
                  aria-hidden="true"
                />
                <span>
                  Package scope and timelines above are indicative, not fixed
                  quotes. Final pricing is proposed in writing after a free
                  scoping conversation, based on your actual requirements.
                </span>
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="service-faq-heading"
          className="bg-muted py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <Reveal>
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                  <span
                    aria-hidden="true"
                    className="inline-block h-px w-6 bg-teal-600/60"
                  />
                  FAQ
                </p>
                <h2
                  id="service-faq-heading"
                  className="mt-4 font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl"
                >
                  Common questions.
                </h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                  Can&apos;t find your answer? Ask us directly —{" "}
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className={cnFocus(
                      "font-medium text-teal-700 underline underline-offset-2 hover:text-teal-600"
                    )}
                  >
                    {siteConfig.contact.email}
                  </a>
                </p>
              </Reveal>

              <Reveal delay={80}>
                <ul className="space-y-3">
                  {service.faqs.map((faq) => (
                    <li key={faq.question}>
                      <details className="group rounded-xl border bg-card shadow-card open:border-teal-600/40">
                        <summary
                          className={cnFocus(
                            "flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 text-[0.95rem] font-semibold text-navy-900 [&::-webkit-details-marker]:hidden"
                          )}
                        >
                          {faq.question}
                          <ChevronDown
                            aria-hidden="true"
                            className="size-4 shrink-0 text-teal-700 transition-transform duration-300 group-open:rotate-180"
                          />
                        </summary>
                        <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                          {faq.answer}
                        </p>
                      </details>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Related services ─────────────────────────────────────────── */}
        <section
          aria-labelledby="service-related-heading"
          className="bg-background py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="max-w-3xl">
              <h2
                id="service-related-heading"
                className="font-display text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl"
              >
                Explore our other services.
              </h2>
            </Reveal>

            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {related.map((item, i) => {
                const RelatedIcon = item.icon;
                return (
                  <Reveal as="li" key={item.slug} delay={i * 70} className="h-full">
                    <Link
                      href={`/services/${item.slug}`}
                      className={cnFocus(
                        "group flex h-full flex-col rounded-xl border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-600/40 hover:shadow-card-hover"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-teal-600/10 text-teal-700 transition-colors duration-300 group-hover:bg-teal-600 group-hover:text-white">
                          <RelatedIcon className="size-5" aria-hidden="true" />
                        </span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-4 text-navy-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal-700"
                        />
                      </div>
                      <h3 className="mt-4 font-display text-base font-semibold text-navy-900">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {item.tagline}
                      </p>
                    </Link>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ── CTA band ─────────────────────────────────────────────────── */}
        <section
          aria-labelledby="service-cta-heading"
          className="relative overflow-hidden bg-navy-900 py-20 text-white sm:py-24"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-72 w-[46rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400 opacity-[0.08] blur-3xl"
          />
          <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 text-center sm:px-6 lg:px-8">
            <Reveal>
              <h2
                id="service-cta-heading"
                className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
              >
                Ready to talk about {service.title.toLowerCase()}?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-navy-200 sm:text-lg">
                Every engagement starts with a free scoping conversation — tell
                us what you want to achieve and we&apos;ll map the realistic
                path to it.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <Button size="lg" asChild className="group h-11 px-7">
                <a href={contactHref(service.slug)}>
                  Start a Project
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              </Button>
              <p className="mt-4 text-sm text-navy-300">
                {siteConfig.contact.responseTime}
              </p>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </div>
  );
}

/* Tiny class combiner for the few focus-ring usages on this page. */
function cnFocus(...classes: string[]) {
  return classes.join(" ");
}
