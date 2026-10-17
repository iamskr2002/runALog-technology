"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import {
  budgetOptions,
  serviceOptions,
  siteConfig,
  timelineOptions,
} from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Reveal } from "./reveal";

const PREFILL_EVENT = "runa:prefill-service";

const GENERIC_ERROR =
  "Something went wrong while sending your inquiry. Your details are still here — please try again.";

const inquirySchema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Please enter a valid email address."),
  company: z.string().optional(),
  service: z.string().min(1, "Please select a service."),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  description: z.string().min(20, "Please describe your project in at least 20 characters."),
  // Honeypot — must always be sent as an empty string from real users.
  website: z.string().optional(),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

const nextSteps = [
  "We review your inquiry — typically within one business day.",
  "A short intro call to understand your goals.",
  "A clear proposal with scope, timeline, and investment.",
];

type InquiryErrorResponse = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

async function readJsonResponse(response: Response): Promise<InquiryErrorResponse | null> {
  try {
    return (await response.json()) as InquiryErrorResponse;
  } catch {
    return null;
  }
}

export function Contact() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [rootError, setRootError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ fullName: string; email: string } | null>(null);

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      email: "",
      company: "",
      service: "",
      budget: "",
      timeline: "",
      description: "",
      website: "",
    },
  });

  /* Pre-fill the service field when other sections dispatch "runa:prefill-service".
     Unknown slugs are ignored; the dispatcher is responsible for scrolling. */
  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ service?: string }>;
      const slug = custom.detail?.service;
      if (!slug) return;
      const isValid = serviceOptions.some((option) => option.slug === slug);
      if (!isValid) return;
      form.setValue("service", slug, { shouldValidate: true, shouldDirty: true });
    };
    window.addEventListener(PREFILL_EVENT, handler);
    return () => window.removeEventListener(PREFILL_EVENT, handler);
  }, [form]);

  const onSubmit = async (values: InquiryFormValues) => {
    setStatus("submitting");
    setRootError(null);
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website: values.website ?? "" }),
      });

      if (response.ok) {
        const json = await readJsonResponse(response);
        if (json?.ok === true) {
          setSubmitted({ fullName: values.fullName, email: values.email });
          setStatus("success");
          return;
        }
        setRootError(GENERIC_ERROR);
        setStatus("error");
        return;
      }

      if (response.status === 400) {
        const json = await readJsonResponse(response);
        if (json?.errors) {
          for (const [key, message] of Object.entries(json.errors)) {
            form.setError(key as keyof InquiryFormValues, { message });
          }
        }
        setRootError("Please review the highlighted fields and try again.");
        setStatus("error");
        return;
      }

      if (response.status === 429) {
        setRootError(
          "You're sending inquiries too quickly. Please wait a minute and try again."
        );
        setStatus("error");
        return;
      }

      setRootError(GENERIC_ERROR);
      setStatus("error");
    } catch {
      setRootError(GENERIC_ERROR);
      setStatus("error");
    }
  };

  const handleReset = () => {
    form.reset();
    setRootError(null);
    setSubmitted(null);
    setStatus("idle");
  };

  const isSubmitting = form.formState.isSubmitting || status === "submitting";
  const firstName = submitted?.fullName.trim().split(/\s+/)[0] || "there";

  const selectTriggerClassName = "h-11 w-full data-[placeholder]:text-muted-foreground";

  return (
    <section id="contact" aria-labelledby="contact-heading" className="bg-background py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Intro */}
        <Reveal>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            <span aria-hidden="true" className="inline-block h-px w-6 bg-teal-600/60" />
            Contact
          </p>
          <h2
            id="contact-heading"
            className="mt-4 font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl"
          >
            Let&apos;s Build Something That Matters.
          </h2>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground">
            Tell us what you&apos;re working on, what challenges you&apos;re facing, or what
            you&apos;d like to improve. We&apos;ll help you explore the right digital solution.
          </p>
        </Reveal>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Left panel — what happens next + contact details */}
          <Reveal delay={80}>
            <div className="flex h-full flex-col rounded-2xl bg-navy-900 p-8 text-white sm:p-10">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-300">
                What happens next
              </h3>
              <ol className="mt-6 space-y-5">
                {nextSteps.map((step, i) => (
                  <li key={step} className="flex items-start gap-3.5">
                    <span
                      aria-hidden="true"
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-teal-400/10 text-xs font-bold text-teal-300"
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-navy-200">{step}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-auto pt-10">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-300">
                  Email
                </p>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="mt-1.5 inline-block break-all font-medium text-teal-300 transition-colors hover:text-teal-200 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300"
                >
                  {siteConfig.contact.email}
                </a>

                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  {siteConfig.socials.map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-sm text-sm text-navy-200 transition-colors hover:text-teal-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300"
                      >
                        {social.label}
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>

                {siteConfig.contact.responseTime ? (
                  <p className="mt-5 text-sm text-navy-300">
                    {siteConfig.contact.responseTime}
                  </p>
                ) : null}
              </div>
            </div>
          </Reveal>

          {/* Right card — inquiry form / success state */}
          <Reveal delay={120}>
            <div className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-card sm:p-8">
              {status === "success" && submitted ? (
                <div
                  role="status"
                  className="animate-in fade-in slide-in-from-bottom-4 flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center duration-500"
                >
                  <CheckCircle2 className="size-12 text-teal-600" aria-hidden="true" />
                  <h3 className="font-display text-xl font-semibold text-navy-900">
                    Inquiry received.
                  </h3>
                  <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                    Thank you, {firstName}. Your project inquiry has been sent — we&apos;ll reply
                    to <span className="font-medium text-navy-900">{submitted.email}</span> within
                    one business day.
                  </p>
                  <Button variant="outline" className="mt-2 h-11" onClick={handleReset}>
                    Send another inquiry
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    noValidate
                    aria-busy={status === "submitting"}
                    className="relative flex flex-col gap-5"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* Full Name */}
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Full Name{" "}
                              <span className="text-destructive" aria-hidden="true">
                                *
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                autoComplete="name"
                                placeholder="Jane Doe"
                                className="h-11"
                                aria-required="true"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Work Email */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Work Email{" "}
                              <span className="text-destructive" aria-hidden="true">
                                *
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                placeholder="jane@company.com"
                                className="h-11"
                                aria-required="true"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Company or Organization */}
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company or Organization</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                autoComplete="organization"
                                placeholder="Optional"
                                className="h-11"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Service Required */}
                      <FormField
                        control={form.control}
                        name="service"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Service Required{" "}
                              <span className="text-destructive" aria-hidden="true">
                                *
                              </span>
                            </FormLabel>
                            <Select value={field.value ?? ""} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger
                                  className={selectTriggerClassName}
                                  aria-required="true"
                                >
                                  <SelectValue placeholder="Select a service" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {serviceOptions.map((option) => (
                                  <SelectItem key={option.slug} value={option.slug}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Estimated Budget */}
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Budget</FormLabel>
                            <Select value={field.value ?? ""} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className={selectTriggerClassName}>
                                  <SelectValue placeholder="Optional" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {budgetOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Project Timeline */}
                      <FormField
                        control={form.control}
                        name="timeline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Timeline</FormLabel>
                            <Select value={field.value ?? ""} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className={selectTriggerClassName}>
                                  <SelectValue placeholder="Optional" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timelineOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Project Description */}
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>
                              Project Description{" "}
                              <span className="text-destructive" aria-hidden="true">
                                *
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                rows={5}
                                placeholder="What are you building? What problem should we solve? Any deadlines or integrations we should know about?"
                                className="min-h-32"
                                aria-required="true"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Honeypot — hidden from real users, catches bots */}
                    <div
                      aria-hidden="true"
                      className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
                    >
                      <label htmlFor="website">Website</label>
                      <input
                        id="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        {...form.register("website")}
                        defaultValue=""
                      />
                    </div>

                    {/* Root error alert */}
                    {rootError ? (
                      <div
                        role="alert"
                        className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3.5 text-sm text-destructive"
                      >
                        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        <span>{rootError}</span>
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-2.5">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="h-11 w-full sm:w-auto sm:self-end"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                            Sending…
                          </>
                        ) : (
                          "Send Project Inquiry"
                        )}
                      </Button>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground sm:justify-end">
                        <ShieldCheck className="size-3.5 text-teal-600" aria-hidden="true" />
                        Your details are used only to respond to this inquiry.
                      </p>
                    </div>
                  </form>
                </Form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
