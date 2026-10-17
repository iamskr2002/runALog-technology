import {
  ClipboardList,
  KeyRound,
  LifeBuoy,
  MessagesSquare,
  ShieldCheck,
  Target,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

type Principle = {
  icon: LucideIcon;
  title: string;
  copy: string;
};

const principles: Principle[] = [
  {
    icon: ClipboardList,
    title: "Requirements before estimates",
    copy: "We scope carefully before quoting, so the number we give you is one we can stand behind.",
  },
  {
    icon: KeyRound,
    title: "You own what we build",
    copy: "Code, designs, and accounts are handed over to you — no lock-in, no black boxes.",
  },
  {
    icon: MessagesSquare,
    title: "Communication is part of the deliverable",
    copy: "Regular demos and plain-language updates are scheduled, not optional.",
  },
  {
    icon: Target,
    title: "Measurable improvements",
    copy: "Each phase ends with something working that you can evaluate against the goal.",
  },
  {
    icon: ShieldCheck,
    title: "Security & privacy by default",
    copy: "Form data, access control, and integrations are handled with care from day one.",
  },
  {
    icon: LifeBuoy,
    title: "Support beyond launch",
    copy: "Monitoring, maintenance, and iteration are planned before the first line of code.",
  },
];

export function Principles() {
  return (
    <section aria-labelledby="principles-heading" className="bg-muted py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="principles-heading"
          eyebrow="How We Work"
          title="Principles we hold every project to."
          description="We'd rather show you how we operate than fill this page with borrowed quotes — real client testimonials will appear here only when we have them, with permission."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map(({ icon: Icon, title, copy }, i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="h-full rounded-xl border bg-card p-6 shadow-card">
                <Icon className="size-5 text-teal-700" aria-hidden="true" />
                <h3 className="mt-3.5 font-display text-base font-semibold text-navy-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
