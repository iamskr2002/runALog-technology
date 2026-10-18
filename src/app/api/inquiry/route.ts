import { NextResponse } from "next/server";
import { z } from "zod";
import {
  budgetOptions,
  serviceOptions,
  timelineOptions,
} from "@/lib/site-config";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const serviceSlugs = serviceOptions.map((option) => option.slug) as [
  string,
  ...string[]
];

const budgetLabels = budgetOptions as readonly string[];
const timelineLabels = timelineOptions as readonly string[];

const optionalLabel = (allowed: readonly string[]) =>
  z
    .string()
    .max(60)
    .optional()
    .transform((value) => {
      const trimmed = value?.trim() ?? "";
      if (!trimmed) return null;
      return allowed.includes(trimmed) ? trimmed : undefined;
    });

const inquirySchema = z.object({
  fullName: z
    .string({ message: "Please enter your full name." })
    .trim()
    .min(2, "Please enter your full name.")
    .max(100, "Name is too long."),
  email: z
    .string({ message: "Please enter a valid email address." })
    .trim()
    .email("Please enter a valid email address.")
    .max(200, "Email is too long."),
  company: z
    .string()
    .trim()
    .max(150, "Company name is too long.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  service: z.enum(serviceSlugs, { message: "Please select a service." }),
  budget: optionalLabel(budgetLabels),
  timeline: optionalLabel(timelineLabels),
  description: z
    .string({ message: "Please describe your project." })
    .trim()
    .min(20, "Please describe your project in at least 20 characters.")
    .max(5000, "Description is too long (max 5000 characters)."),
  // Honeypot — must be absent or empty for real submissions.
  website: z.string().optional().default(""),
});

/* ------------------------------------------------------------------ */
/* Spam protection                                                     */
/* ------------------------------------------------------------------ */

/** Honeypot submissions are silently accepted (and discarded) so bots
    cannot distinguish success; real users never fill this field. */
function isSpam(website: string | undefined): boolean {
  return Boolean(website && website.trim().length > 0);
}

/** Simple in-memory sliding-window rate limiter (per IP).
    Suitable for a single-instance deployment; swap for a shared store
    (e.g. Redis) when scaling horizontally. */
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const rateBuckets = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  const timestamps = (rateBuckets.get(ip) ?? []).filter(
    (timestamp) => timestamp > windowStart
  );

  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(ip, timestamps);
    return true;
  }

  timestamps.push(now);
  rateBuckets.set(ip, timestamps);

  // Opportunistic cleanup to keep the map bounded.
  if (rateBuckets.size > 1000) {
    for (const [key, entries] of rateBuckets) {
      if (entries.every((timestamp) => timestamp <= windowStart)) {
        rateBuckets.delete(key);
      }
    }
  }

  return false;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/* ------------------------------------------------------------------ */
/* Handler                                                             */
/* ------------------------------------------------------------------ */

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request format." },
      { status: 400 }
    );
  }

  const parsed = inquirySchema.safeParse(payload);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !errors[key]) {
        errors[key] = issue.message;
      }
    }
    return NextResponse.json(
      {
        ok: false,
        message: "Please review the highlighted fields and try again.",
        errors,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Silently accept honeypot hits without storing anything.
  if (isSpam(data.website)) {
    return NextResponse.json({ ok: true });
  }

  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json(
      {
        ok: false,
        message: "Too many inquiries submitted. Please try again later.",
      },
      { status: 429 }
    );
  }

  try {
    const inquiry = await db.projectInquiry.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        company: data.company,
        service: data.service,
        budget: data.budget === undefined ? null : data.budget,
        timeline: data.timeline === undefined ? null : data.timeline,
        description: data.description,
      },
    });

    return NextResponse.json({ ok: true, id: inquiry.id });
  } catch (error) {
    // Log server-side only; never leak internals to the client.
    console.error("[/api/inquiry] Failed to store inquiry:", error);
    return NextResponse.json(
      { ok: false, message: "Unable to submit your inquiry right now." },
      { status: 500 }
    );
  }
}
