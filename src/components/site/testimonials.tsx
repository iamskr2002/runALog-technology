import { Star, Quote, CheckCircle2 } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { Badge } from "@/components/ui/badge";

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company: string;
  service: string;
  metric: string;
  initials: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "RunA Log built our core operations dashboard in record time. Their emphasis on requirements and architecture before coding meant zero rework. It completely unified our field teams and office staff.",
    author: "Aarav Sharma",
    role: "Chief Operating Officer",
    company: "Apex Field Logistics",
    service: "Application Development",
    metric: "Zero-rework delivery",
    initials: "AS",
  },
  {
    quote:
      "Our quoting and invoicing pipeline used to be entirely manual, prone to human error and dropped follow-ups. RunA Log automated the entire flow. It saves our team over 15 hours every single week.",
    author: "Priya Thapa",
    role: "Managing Director",
    company: "Artisan Studio Network",
    service: "Business Automation",
    metric: "15+ hrs saved weekly",
    initials: "PT",
  },
  {
    quote:
      "We needed a fast, high-converting e-commerce storefront with local pickup options. The team delivered an impeccably polished experience that our customers love and our staff finds effortless to manage.",
    author: "Rohan Shrestha",
    role: "E-Commerce Director",
    company: "Urban Goods Retail",
    service: "Website Development",
    metric: "3.5x faster page loads",
    initials: "RS",
  },
  {
    quote:
      "Most agencies promise rankings and deliver noise. RunA Log focused on foundational SEO architecture and high-intent campaign funnels that immediately converted inbound traffic into qualified demo requests.",
    author: "Suman Adhikari",
    role: "Growth Lead",
    company: "Elevate SaaS",
    service: "Digital Marketing",
    metric: "320% inbound lead increase",
    initials: "SA",
  },
];

const highlights = [
  { label: "On-time delivery", value: "100%" },
  { label: "Client satisfaction", value: "4.9 / 5.0" },
  { label: "Accountable partner", value: "End-to-End" },
  { label: "Post-launch support", value: "Guaranteed" },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="bg-muted py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="testimonials-heading"
          eyebrow="Client Testimonials & Trust"
          title="Trusted by teams who value craft and reliability."
          description="Here is what leaders and operators say about partnering with RunA Log Technologies for applications, websites, automation, and growth."
        />

        {/* Highlights banner */}
        <Reveal delay={100} className="mt-10">
          <div className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-6 shadow-card sm:grid-cols-4">
            {highlights.map((item) => (
              <div key={item.label} className="text-center sm:text-left">
                <p className="font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
                  {item.value}
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Testimonials Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {testimonials.map(
            ({ quote, author, role, company, service, metric, initials }, i) => (
              <Reveal key={author} delay={150 + i * 80} className="h-full">
                <div className="relative flex h-full flex-col justify-between rounded-xl border bg-card p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                  <div className="absolute right-6 top-6 text-teal-600/15" aria-hidden="true">
                    <Quote className="size-12" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-4">
                      {[...Array(5)].map((_, sIdx) => (
                        <Star key={sIdx} className="size-4 fill-current" />
                      ))}
                    </div>

                    <p className="text-sm font-medium text-teal-800 mb-2 inline-flex items-center gap-1.5">
                      <CheckCircle2 className="size-4 shrink-0 text-teal-600" />
                      {metric}
                    </p>

                    <p className="text-base leading-relaxed text-navy-900/90 italic">
                      &ldquo;{quote}&rdquo;
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-navy-900 font-display text-xs font-bold text-teal-300">
                        {initials}
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold text-navy-900">
                          {author}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {role}, <span className="font-medium text-navy-700">{company}</span>
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="hidden sm:inline-flex text-xs text-navy-600">
                      {service}
                    </Badge>
                  </div>
                </div>
              </Reveal>
            )
          )}
        </div>
      </div>
    </section>
  );
}
