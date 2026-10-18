import {
  AppWindow,
  Megaphone,
  MonitorSmartphone,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/* ── Service page content ─────────────────────────────────────────────────
   All copy below describes RunA Log's four service lines. Package scopes are
   INTENTIONALLY indicative: they name deliverables and rough timelines but no
   prices — final pricing is scoped in a free conversation. Do not add fake
   client counts, prices, or outcomes here. */

export type ServicePackage = {
  name: string;
  tagline: string;
  bestFor: string;
  timeline: string;
  features: string[];
  highlighted?: boolean;
};

export type ServiceFaq = { question: string; answer: string };

export type ServiceCapability = { title: string; description: string };

export type ServiceBenefit = { title: string; description: string };

export type ServiceDetail = {
  slug: string;
  index: string;
  icon: LucideIcon;
  title: string;
  tagline: string;
  heroDescription: string;
  overview: [string, string];
  capabilities: ServiceCapability[];
  benefits: ServiceBenefit[];
  packages: ServicePackage[];
  faqs: ServiceFaq[];
};

export const servicePageSlugs = [
  "application-development",
  "website-development",
  "business-automation",
  "digital-marketing",
] as const;

export type ServicePageSlug = (typeof servicePageSlugs)[number];

export const serviceDetails: ServiceDetail[] = [
  {
    slug: "application-development",
    index: "01",
    icon: AppWindow,
    title: "Application Development",
    tagline: "Custom software built around how your business actually operates.",
    heroDescription:
      "From internal tools to customer-facing products, we design and build web and mobile applications that fit your workflows, scale with your business, and stay maintainable long after launch.",
    overview: [
      "Off-the-shelf software forces your business to adapt to its limitations. We take the opposite approach: we study how your team actually works, then design and build applications that match your processes — not the other way around.",
      "Whether you need a business management system, a customer portal, an MVP to validate a new idea, or integrations between tools you already use, we deliver software that is reliable, secure, and easy to evolve as your requirements grow.",
    ],
    capabilities: [
      {
        title: "Custom web and mobile apps",
        description:
          "Purpose-built applications for your team or your customers, on the platforms they actually use.",
      },
      {
        title: "Business systems and dashboards",
        description:
          "Centralize operations, data, and reporting into one source of truth your team can trust.",
      },
      {
        title: "MVP development and prototyping",
        description:
          "Validate ideas quickly with a focused, working product before committing to a full build.",
      },
      {
        title: "API development and integrations",
        description:
          "Connect your applications and third-party tools so data flows automatically between them.",
      },
      {
        title: "Scalable, maintainable software",
        description:
          "Clean architecture, documentation, and testing so your product keeps moving as it grows.",
      },
      {
        title: "Something else in mind?",
        description:
          "If your requirements don't fit a category, bring them to a free scoping call — we'll tell you honestly what's involved.",
      },
    ],
    benefits: [
      {
        title: "Software that fits your process",
        description:
          "No more bending your operations to match generic tools — your system mirrors how you work.",
      },
      {
        title: "One source of truth",
        description:
          "Decisions get made on live, accurate data instead of scattered spreadsheets and chat threads.",
      },
      {
        title: "Fewer manual workarounds",
        description:
          "Automated flows replace copy-paste routines between disconnected tools.",
      },
      {
        title: "Built to grow with you",
        description:
          "Scalable foundations mean new features, users, and integrations don't require a rebuild.",
      },
    ],
    packages: [
      {
        name: "MVP Launch",
        tagline: "Prove the idea, fast.",
        bestFor: "Founders and teams validating a new product or service.",
        timeline: "4–8 weeks",
        features: [
          "One core module with essential workflows",
          "Responsive web application",
          "Basic admin area and user roles",
          "1–2 core tool integrations",
          "Deployment and handover documentation",
        ],
      },
      {
        name: "Business System",
        tagline: "Run your operations in one place.",
        bestFor:
          "Companies replacing spreadsheets or disconnected tools with a real system.",
        timeline: "8–16 weeks",
        highlighted: true,
        features: [
          "Multi-role business management system",
          "Operational dashboards and reporting",
          "Authentication, roles, and permissions",
          "API integrations across your tool stack",
          "Testing, documentation, and team training",
        ],
      },
      {
        name: "Scale & Evolve",
        tagline: "Grow without the rebuild.",
        bestFor: "Established products that need to expand reliably.",
        timeline: "Ongoing / phased",
        features: [
          "Architecture review and improvement roadmap",
          "New modules and customer-facing features",
          "Mobile expansion where it matters",
          "Performance, security, and reliability hardening",
          "Priority support and scheduled improvements",
        ],
      },
    ],
    faqs: [
      {
        question: "Can you take over an existing application?",
        answer:
          "Yes. We start with a technical review of your current codebase, identify risks and quick wins, and propose a phased plan — whether that's targeted improvements or a gradual rebuild.",
      },
      {
        question: "Who owns the code and the data?",
        answer:
          "You do. Every engagement includes full transfer of source code, documentation, and infrastructure access — no vendor lock-in.",
      },
      {
        question: "How do you keep projects on schedule?",
        answer:
          "We work in short, visible iterations with demos at every stage, so you always know what's built, what's next, and what it will cost.",
      },
    ],
  },
  {
    slug: "website-development",
    index: "02",
    icon: MonitorSmartphone,
    title: "Website Development",
    tagline: "Fast, polished websites that turn visitors into inquiries.",
    heroDescription:
      "Your website is often the first real conversation with a customer. We build corporate sites, online stores, and landing pages that load fast, look credible, and are engineered to convert.",
    overview: [
      "A website that merely looks fine is a missed opportunity. Every site we build starts with your business goals — inquiries, sales, bookings — and works backward to the design, structure, and copy that guide visitors toward them.",
      "From corporate websites and e-commerce stores to focused campaign landing pages, we handle design, implementation, SEO foundations, and performance — and we stay available for maintenance and optimization after launch.",
    ],
    capabilities: [
      {
        title: "Corporate and business websites",
        description:
          "Credible, well-structured sites that clearly explain who you are and what you do.",
      },
      {
        title: "E-commerce and online stores",
        description:
          "Product catalogs, cart and checkout flows, and order handling that customers trust.",
      },
      {
        title: "Conversion-focused landing pages",
        description:
          "Focused pages for campaigns and launches, each built around a single action.",
      },
      {
        title: "Responsive UI/UX implementation",
        description:
          "Designs that work beautifully on every screen size and device.",
      },
      {
        title: "Ongoing maintenance and optimization",
        description:
          "Updates, backups, monitoring, and performance tuning long after launch day.",
      },
      {
        title: "Something else in mind?",
        description:
          "Migrations, redesigns, accessibility improvements — bring the problem, we'll scope the solution.",
      },
    ],
    benefits: [
      {
        title: "A credible first impression",
        description:
          "Visitors decide in seconds — a polished, fast site instantly signals professionalism.",
      },
      {
        title: "Traffic that converts",
        description:
          "Clear structure and calls-to-action turn visitors into contacts, bookings, and orders.",
      },
      {
        title: "Better visibility and speed",
        description:
          "SEO foundations and fast page loads improve search ranking and reduce bounce.",
      },
      {
        title: "Easy to keep current",
        description:
          "Update content without touching code — or hand it to us with a maintenance plan.",
      },
    ],
    packages: [
      {
        name: "Online Presence",
        tagline: "Look established from day one.",
        bestFor: "Small businesses that need a professional first website.",
        timeline: "2–4 weeks",
        features: [
          "Up to 7 well-structured pages",
          "Responsive design on all devices",
          "Contact and inquiry forms",
          "SEO fundamentals and analytics setup",
          "Launch, hosting guidance, and handover",
        ],
      },
      {
        name: "E-commerce Store",
        tagline: "Sell online with confidence.",
        bestFor: "Retailers and brands moving their sales online.",
        timeline: "4–8 weeks",
        highlighted: true,
        features: [
          "Structured product catalog and search",
          "Cart, checkout, and payment integration",
          "Order and inventory management views",
          "Customer accounts and transactional email",
          "Analytics, performance, and SEO setup",
        ],
      },
      {
        name: "Growth Engine",
        tagline: "A site that keeps improving.",
        bestFor:
          "Businesses investing in campaigns and lead generation month after month.",
        timeline: "Ongoing / monthly",
        features: [
          "Conversion-focused page system",
          "A/B-ready sections and campaign landing pages",
          "Ongoing SEO and content structure work",
          "Performance monitoring and tuning",
          "Monthly reporting and improvement plan",
        ],
      },
    ],
    faqs: [
      {
        question: "Can you redesign our existing website?",
        answer:
          "Yes. We audit what's working — content, structure, SEO value — and redesign around it, preserving what serves you and rebuilding what doesn't.",
      },
      {
        question: "Can we update the content ourselves?",
        answer:
          "Absolutely. We can build on a headless CMS so your team edits text, images, and products without a developer.",
      },
      {
        question: "Do you handle hosting and domains?",
        answer:
          "Yes — we set up hosting, domains, SSL, and email routing with providers that fit your budget, and document everything for you.",
      },
    ],
  },
  {
    slug: "business-automation",
    index: "03",
    icon: Workflow,
    title: "Business Automation",
    tagline: "Practical automation that removes repetitive manual work.",
    heroDescription:
      "When your team re-types the same data, chases follow-ups, or compiles reports by hand, time and accuracy are lost. We connect your tools and automate the routine — so people focus on work that needs a human.",
    overview: [
      "Automation works best when it targets real bottlenecks, not novelty. We start by mapping where your team's hours actually go, identify the repetitive hand-offs between people and systems, and automate those first.",
      "The result is a set of reliable, observable workflows — form submissions that validate and route themselves, systems that stay in sync, notifications that reach the right person, and reports that compile themselves on schedule.",
    ],
    capabilities: [
      {
        title: "Workflow and process automation",
        description:
          "Multi-step processes that run consistently without manual chasing.",
      },
      {
        title: "API and software integrations",
        description:
          "Your CRM, forms, accounting, messaging, and storage tools working as one system.",
      },
      {
        title: "Automated notifications and reports",
        description:
          "The right alert to the right person — and reports that compile themselves on schedule.",
      },
      {
        title: "AI-assisted workflows",
        description:
          "Careful use of AI for drafting, classifying, and summarizing — only where it genuinely helps.",
      },
      {
        title: "Monitoring and error handling",
        description:
          "Every automation ships with alerts and fallback paths, so failures notify instead of disrupt.",
      },
      {
        title: "Something else in mind?",
        description:
          "If a process frustrates your team, describe it on a scoping call — we'll find the bottleneck.",
      },
    ],
    benefits: [
      {
        title: "Hours back, every week",
        description:
          "Routine work runs itself; your people handle exceptions and judgment calls.",
      },
      {
        title: "Fewer costly errors",
        description:
          "Validated, automated data entry removes copy-paste mistakes at the source.",
      },
      {
        title: "Every system in sync",
        description:
          "One change flows everywhere — no more conflicting copies of the same data.",
      },
      {
        title: "Operations you can see",
        description:
          "Automated reporting makes progress and bottlenecks visible in near real time.",
      },
    ],
    packages: [
      {
        name: "Quick Wins",
        tagline: "Automate the obvious first.",
        bestFor: "Teams with a few clearly repetitive tasks eating their week.",
        timeline: "1–3 weeks",
        features: [
          "Process mapping session",
          "Automation of 1–2 key workflows",
          "Automated notifications and alerts",
          "2–3 tool integrations",
          "Documentation and team handover",
        ],
      },
      {
        name: "Connected Operations",
        tagline: "Your tools, working as one.",
        bestFor: "Companies whose data lives across multiple systems.",
        timeline: "4–8 weeks",
        highlighted: true,
        features: [
          "Multi-system integration architecture",
          "Automated data sync and validation",
          "Scheduled reports and dashboards",
          "Error handling and monitoring",
          "Team training and runbooks",
        ],
      },
      {
        name: "Intelligent Operations",
        tagline: "Automation that keeps improving.",
        bestFor: "Organizations scaling operations end to end.",
        timeline: "Ongoing / phased",
        features: [
          "End-to-end process automation",
          "AI-assisted steps where appropriate",
          "Custom internal tooling where needed",
          "Continuous monitoring and optimization",
          "Quarterly automation roadmap reviews",
        ],
      },
    ],
    faqs: [
      {
        question: "Will automation replace our current tools?",
        answer:
          "Usually not. We connect the tools you already use and only recommend replacing something when it's genuinely the bottleneck.",
      },
      {
        question: "What happens if an automated step fails?",
        answer:
          "Every workflow we build includes error handling, alerts, and a manual fallback path — so a failure is a notification, not a crisis.",
      },
      {
        question: "Is AI involved in everything you automate?",
        answer:
          "No. We use AI only where it adds real value — drafting, classification, summarizing — and keep deterministic logic everywhere else.",
      },
    ],
  },
  {
    slug: "digital-marketing",
    index: "04",
    icon: Megaphone,
    title: "Digital Marketing",
    tagline: "Measurable campaigns that bring the right customers to you.",
    heroDescription:
      "Marketing that isn't measured is guesswork. We build search visibility, run focused campaigns, and track what actually turns attention into customers — so budget flows to what works.",
    overview: [
      "We treat marketing as a system, not a series of posts. Search structure, content, paid campaigns, and analytics work together to attract the right visitors and move them toward a decision.",
      "Because we also build the websites behind the campaigns, we can optimize the whole path — from the ad click or search result to the page, the message, and the conversion itself — without hand-waving about the funnel.",
    ],
    capabilities: [
      {
        title: "Search engine optimization",
        description:
          "Technical, on-page, and content SEO that compounds month after month.",
      },
      {
        title: "Social media management",
        description:
          "Consistent, on-brand presence on the platforms your customers actually use.",
      },
      {
        title: "Digital advertising campaigns",
        description:
          "Focused, budget-conscious campaigns with clear targets and full tracking.",
      },
      {
        title: "Content and campaign planning",
        description:
          "A realistic calendar of content and campaigns mapped to business goals.",
      },
      {
        title: "Analytics and conversion optimization",
        description:
          "Dashboards and experiments that show what's working — and what to fix next.",
      },
      {
        title: "Something else in mind?",
        description:
          "Rebranding support, email programs, local visibility — bring the goal, we'll map the path.",
      },
    ],
    benefits: [
      {
        title: "Found by the right people",
        description:
          "Search visibility aimed at the queries your best customers actually type.",
      },
      {
        title: "Budget spent on what works",
        description:
          "Every campaign is tracked, so underperformers get fixed or cut — quickly.",
      },
      {
        title: "A consistent, credible presence",
        description:
          "Regular, on-brand content keeps you visible between purchases.",
      },
      {
        title: "Decisions from data",
        description:
          "Clear reports show exactly where leads and sales come from — no hunches.",
      },
    ],
    packages: [
      {
        name: "Foundations",
        tagline: "Get the basics right.",
        bestFor: "Businesses starting structured marketing for the first time.",
        timeline: "2–4 weeks setup, then monthly",
        features: [
          "SEO audit and technical fixes",
          "Analytics and conversion tracking setup",
          "Google Business Profile optimization",
          "Keyword and competitor research",
          "One-channel content plan",
        ],
      },
      {
        name: "Campaign Engine",
        tagline: "Consistent, measurable growth.",
        bestFor: "Companies ready to invest in regular acquisition.",
        timeline: "Monthly retainer",
        highlighted: true,
        features: [
          "Ongoing SEO and content program",
          "Paid campaigns on 2–3 channels",
          "Monthly content and campaign calendar",
          "Campaign landing pages",
          "Monthly performance report and review call",
        ],
      },
      {
        name: "Full-Funnel Growth",
        tagline: "Optimize the entire path.",
        bestFor: "Teams scaling acquisition across channels.",
        timeline: "Ongoing / quarterly planning",
        features: [
          "Multi-channel strategy and management",
          "Conversion rate optimization experiments",
          "Marketing automation and email flows",
          "Custom analytics dashboards",
          "Quarterly strategy and budget planning",
        ],
      },
    ],
    faqs: [
      {
        question: "How soon will we see results?",
        answer:
          "Paid campaigns can produce traffic within days; SEO and content compound over months. We set expectations per channel in the first report — no overnight promises.",
      },
      {
        question: "Do you require long-term contracts?",
        answer:
          "No. After the initial setup period we work month to month — we'd rather earn the renewal than lock it in.",
      },
      {
        question: "Can you improve our existing site's conversion rate?",
        answer:
          "Yes — conversion optimization is often the highest-ROI first step, and we can implement changes directly because we build websites ourselves.",
      },
    ],
  },
];

export function getServiceDetail(slug: string): ServiceDetail | undefined {
  return serviceDetails.find((service) => service.slug === slug);
}
