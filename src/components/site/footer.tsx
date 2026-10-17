"use client";

import type { ReactNode } from "react";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { serviceOptions, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const columnHeading =
  "text-sm font-semibold uppercase tracking-[0.16em] text-white";

const footerLink =
  "block py-2 text-sm text-navy-300 transition-colors hover:text-teal-300";

const companyLinks = [
  { label: "Home", href: "/#home" },
  { label: "Services", href: "/#services" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Our Work", href: "/work" },
  { label: "Our Process", href: "/#process" },
  { label: "About Us", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

function LegalDialog({
  trigger,
  title,
  description,
  children,
}: {
  trigger: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-11 px-2 font-normal text-navy-300 underline-offset-4 hover:bg-transparent hover:text-teal-300 hover:underline",
            focusRing
          )}
        >
          {trigger}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Footer() {
  // Widen the `as const` literal types so empty contact fields still type-check.
  const { email, phone, location, responseTime } = siteConfig.contact as {
    email: string;
    phone: string;
    location: string;
    responseTime: string;
  };
  const telHref = phone ? `tel:${phone.replace(/[^+\d]/g, "")}` : null;

  return (
    <footer className="mt-auto bg-navy-950 text-navy-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8 lg:py-16">
        {/* Brand */}
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-300">
            {siteConfig.description}
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1">
            {siteConfig.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${siteConfig.name} on ${social.label} (opens in new tab)`}
                  className={cn(
                    "inline-flex items-center gap-1.5 py-1 text-sm font-medium text-navy-200 transition-colors hover:text-teal-300",
                    focusRing
                  )}
                >
                  {social.label}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <nav aria-label="Footer services">
          <h2 className={columnHeading}>Services</h2>
          <ul className="mt-4">
            {serviceOptions.map((service) => (
              <li key={service.slug}>
                <a
                  href={
                    service.slug === "custom-solutions"
                      ? "/#solutions"
                      : `/services/${service.slug}`
                  }
                  className={cn(footerLink, focusRing)}
                >
                  {service.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Company */}
        <nav aria-label="Footer company">
          <h2 className={columnHeading}>Company</h2>
          <ul className="mt-4">
            {companyLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={cn(footerLink, focusRing)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h2 className={columnHeading}>Contact</h2>
          <ul className="mt-4 space-y-1 text-sm">
            <li>
              <a
                href={`mailto:${email}`}
                className={cn(
                  "inline-flex items-center gap-2 py-1 font-medium text-teal-300 transition-colors hover:text-teal-200",
                  focusRing
                )}
              >
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                {email}
              </a>
            </li>
            {telHref && (
              <li>
                <a
                  href={telHref}
                  className={cn(
                    "inline-flex items-center gap-2 py-1 text-navy-300 transition-colors hover:text-teal-300",
                    focusRing
                  )}
                >
                  <Phone className="size-4 shrink-0" aria-hidden="true" />
                  {phone}
                </a>
              </li>
            )}
            {location && (
              <li className="flex items-center gap-2 py-1 text-navy-300">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                {location}
              </li>
            )}
          </ul>
          <p className="mt-3 text-sm text-navy-300">{responseTime}</p>
          <Button
            size="sm"
            asChild
            variant="outline"
            className="mt-4 border-white/20 bg-white/5 text-white hover:bg-white/15 hover:text-white"
          >
            <a href="/#contact">Start a Project</a>
          </Button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 text-sm text-navy-300 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <LegalDialog
              trigger="Privacy Policy"
              title="Privacy Policy"
              description={`How ${siteConfig.name} handles the information you share through this site.`}
            >
              <p>
                When you submit an inquiry through the contact form on this
                site, we collect only the details you provide: your name, email
                address, company name, the service you are interested in,
                budget and timeline ranges, and your project description. We
                collect nothing else through the form.
              </p>
              <p>
                This information is used solely to respond to your inquiry and
                discuss your project. We do not sell, rent, or share your
                details with third parties for marketing purposes.
              </p>
              <p>
                To review or request removal of the details you shared, email
                us at{" "}
                <a
                  href={`mailto:${email}`}
                  className={cn(
                    "font-medium text-teal-300 underline underline-offset-2 hover:text-teal-200",
                    focusRing
                  )}
                >
                  {email}
                </a>{" "}
                and we will handle your request promptly.
              </p>
            </LegalDialog>

            <LegalDialog
              trigger="Terms of Service"
              title="Terms of Service"
              description={`The basics of working with ${siteConfig.name} and using this website.`}
            >
              <p>
                {siteConfig.name} provides application development, website
                development, business automation, and digital marketing
                services. The scope, pricing, and schedule of any engagement
                are agreed directly with clients in a written proposal or
                contract.
              </p>
              <p>
                Concept work, product mockups, and demo interfaces shown on
                this site are illustrative examples of our capabilities. They
                do not represent client endorsements, commitments, or
                guaranteed results.
              </p>
              <p>
                Inquiries submitted through this site are non-binding and do
                not create a contract. For questions about these terms, contact
                us at{" "}
                <a
                  href={`mailto:${email}`}
                  className={cn(
                    "font-medium text-teal-300 underline underline-offset-2 hover:text-teal-200",
                    focusRing
                  )}
                >
                  {email}
                </a>
                .
              </p>
            </LegalDialog>
          </div>
        </div>
      </div>
    </footer>
  );
}
