/**
 * Concept project data — shared by the homepage #work section and the /work page.
 *
 * HONESTY: every item below is a CONCEPT / DEMONSTRATION project. There are
 * no real clients, metrics, or outcomes behind these cards. Context lines
 * always start with "Concept:" so the framing stays explicit everywhere the
 * data is rendered.
 */

export type ProjectVisualKind = "dashboard" | "ecommerce" | "workflow" | "campaign";

export type ConceptProject = {
  title: string;
  category: string;
  context: string;
  challenge: string;
  built: string;
  chips: string[];
  visual: ProjectVisualKind;
};

export const conceptProjects: ConceptProject[] = [
  {
    title: "Operations Control Dashboard",
    category: "Application Development",
    context: "Concept: a service business coordinating field teams and daily jobs.",
    challenge:
      "Job details scattered across spreadsheets and chat threads, with no single source of truth for schedules and status.",
    built:
      "A role-based web dashboard that centralizes jobs, schedules, and reporting, with API integrations into existing tools.",
    chips: ["Web app", "Dashboard", "Role-based access", "API integration"],
    visual: "dashboard",
  },
  {
    title: "Multi-Store E-commerce Platform",
    category: "Website Development",
    context: "Concept: a retailer moving from social selling to a full online store.",
    challenge:
      "Orders handled manually across channels, inconsistent product data, and a checkout experience that didn't build trust.",
    built:
      "A responsive storefront with a structured catalog, streamlined checkout, and an order management view for staff.",
    chips: ["E-commerce", "Responsive UX", "Checkout flow", "Performance"],
    visual: "ecommerce",
  },
  {
    title: "Workflow Automation Hub",
    category: "Business Automation",
    context: "Concept: back-office automation connecting forms, notifications, and reporting.",
    challenge:
      "Staff re-typed the same data into three systems and chased follow-ups by hand every week.",
    built:
      "An event-driven pipeline that validates submissions, syncs the CRM, sends notifications, and compiles scheduled reports.",
    chips: ["Integrations", "Notifications", "Reporting", "AI-assisted steps"],
    visual: "workflow",
  },
  {
    title: "Conversion-Focused Campaign Site",
    category: "Digital Marketing",
    context: "Concept: a launch site pairing SEO foundations with measurable campaigns.",
    challenge:
      "Traffic was arriving but bouncing — no clear funnel, weak search structure, and no measurement.",
    built:
      "A landing system with clear conversion paths, semantic SEO structure, analytics events, and A/B-ready sections.",
    chips: ["SEO", "Landing pages", "Analytics", "Campaign planning"],
    visual: "campaign",
  },
  {
    title: "ClinicFlow — Appointment Platform",
    category: "Application Development",
    context: "Concept: a small clinic coordinating appointments, doctors, and patient reminders.",
    challenge:
      "Bookings taken over the phone and tracked on paper, leading to double-booked slots and missed follow-ups.",
    built:
      "A scheduling dashboard with doctor calendars, appointment statuses, and automated patient reminders by email or SMS.",
    chips: ["Web app", "Scheduling", "Role-based access", "Notifications"],
    visual: "dashboard",
  },
  {
    title: "ShopLocal Storefront",
    category: "Website Development",
    context: "Concept: a neighborhood retailer selling online with in-store pickup.",
    challenge:
      "No online presence at all, so orders depended entirely on foot traffic and word of mouth.",
    built:
      "A simple storefront with a local product catalog, a pickup checkout option, and an easy stock view for staff to keep current.",
    chips: ["E-commerce", "Local pickup", "Responsive UX", "Checkout flow"],
    visual: "ecommerce",
  },
  {
    title: "InvoiceFlow Automation",
    category: "Business Automation",
    context: "Concept: a quoting → invoicing → payment reminder pipeline for a small studio.",
    challenge:
      "Quotes, invoices, and payment reminders were written by hand, and follow-ups regularly slipped through the cracks.",
    built:
      "A pipeline that turns approved quotes into invoices, sends them, and schedules polite payment reminders until settled.",
    chips: ["Integrations", "Notifications", "Scheduling", "Reporting"],
    visual: "workflow",
  },
  {
    title: "GrowthLens Campaign Console",
    category: "Digital Marketing",
    context: "Concept: planning and tracking multi-channel marketing campaigns in one place.",
    challenge:
      "Campaigns ran across email, social, and search with no shared calendar or single view of what was happening.",
    built:
      "A campaign console with a shared planning calendar, per-channel checklists, and simple analytics views to compare activity.",
    chips: ["Campaign planning", "Analytics", "SEO", "Multi-channel"],
    visual: "campaign",
  },
];
