import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  leadId: z.string().min(1),
  type: z.enum(["call", "meeting", "email", "follow-up"]).optional(),
  title: z.string().trim().min(1).max(150),
  scheduledAt: z.string().datetime({ offset: true }).or(z.string().min(10)),
  notes: z.string().max(2000).nullable().optional(),
});

/**
 * GET /api/admin/activities?scope=upcoming|past|all&leadId=
 * Scheduled calls/meetings with their lead, for the Calls page.
 */
export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") ?? "all";
  const leadId = searchParams.get("leadId") ?? undefined;
  const now = new Date();

  const where: Prisma.ActivityWhereInput = {};
  if (leadId) where.leadId = leadId;
  if (scope === "upcoming") {
    where.status = "scheduled";
    where.scheduledAt = { gte: now };
  } else if (scope === "past") {
    where.OR = [{ status: { not: "scheduled" } }, { scheduledAt: { lt: now } }];
  }

  const activities = await db.activity.findMany({
    where,
    orderBy: scope === "past" ? { scheduledAt: "desc" } : { scheduledAt: "asc" },
    take: 300,
    include: {
      lead: { select: { id: true, name: true, company: true, status: true } },
    },
  });

  return NextResponse.json({ ok: true, activities });
}

/** POST /api/admin/activities — schedule a call / meeting / follow-up. */
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Lead, title and a valid date are required." },
      { status: 400 }
    );
  }

  const scheduledAt = new Date(parsed.data.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) {
    return NextResponse.json(
      { ok: false, message: "Invalid date and time." },
      { status: 400 }
    );
  }

  try {
    const activity = await db.activity.create({
      data: {
        leadId: parsed.data.leadId,
        type: parsed.data.type ?? "call",
        title: parsed.data.title,
        scheduledAt,
        notes: parsed.data.notes ?? null,
      },
      include: {
        lead: { select: { id: true, name: true, company: true, status: true } },
      },
    });
    return NextResponse.json({ ok: true, activity });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Lead not found." },
      { status: 404 }
    );
  }
}
