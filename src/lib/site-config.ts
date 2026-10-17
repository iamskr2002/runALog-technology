/**
 * RunA Log Technologies — central site configuration.
 *
 * PLACEHOLDER NOTICE: contact details (email, phone, location, social links)
 * below are clearly-marked placeholders. Replace them with verified company
 * information before going live. Every consumer of this file renders exactly
 * what is configured here, so no restructuring is required.
 */

export const siteConfig = {
  name: "RunA Log Technologies",
  shortName: "RunA Log",
  tagline: "Technology That Moves Your Business Forward.",
  description:
    "We build powerful digital products, modern websites, and intelligent automations that help businesses work smarter, serve customers better, and grow faster.",
  // ── REPLACE with verified contact information ──────────────────────────
  contact: {
    email: "hello@runalog.example", // PLACEHOLDER — replace with verified email
    phone: "", // PLACEHOLDER — leave empty to hide, or add verified phone
    location: "", // PLACEHOLDER — leave empty to hide, or add verified address
    responseTime: "We typically reply within one business day.",
  },
  // ── REPLACE with verified professional profile URLs (or remove entries) ─
  socials: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/", // PLACEHOLDER
    },
    {
      label: "GitHub",
      href: "https://github.com/", // PLACEHOLDER
    },
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export type NavItem = { label: string; href: string };

/** Absolute paths (with hashes) so navigation works from subpages too. */
export const navItems: NavItem[] = [
  { label: "Home", href: "/#home" },
  { label: "Services", href: "/#services" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Our Work", href: "/work" },
  { label: "About Us", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

/** Service options shared by the Services section, solutions matching, and the inquiry form. */
export const serviceOptions = [
  {
    slug: "application-development",
    label: "Application Development",
  },
  {
    slug: "website-development",
    label: "Website Development",
  },
  {
    slug: "business-automation",
    label: "Business Automation",
  },
  {
    slug: "digital-marketing",
    label: "Digital Marketing",
  },
  {
    slug: "custom-solutions",
    label: "Other / Custom Solutions",
  },
] as const;

export type ServiceSlug = (typeof serviceOptions)[number]["slug"];

export const budgetOptions = [
  "Under $5,000",
  "$5,000 – $15,000",
  "$15,000 – $50,000",
  "$50,000+",
  "Not sure yet",
] as const;

export const timelineOptions = [
  "ASAP / urgent",
  "Within 1–3 months",
  "3–6 months",
  "Flexible / exploring",
] as const;
