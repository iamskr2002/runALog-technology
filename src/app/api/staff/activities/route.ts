import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff, staffUnauthorizedResponse } from "@/lib/staff-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIVITY_TYPES = ["call", "meeting", "email", "follow-up"];

const createSchema = z.object({
  leadId: z.string().min(1).max(64),
  type: z.enum(ACTIVITY_TYPES as [string, ...string[]]),
  title: z.string().trim().min(1).max(120),
  scheduledAt: z
    .string()
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Invalid date",
    }),
  notes: z.string().max(2000).nullable().optional(),
});

/** GET /api/staff/activities?filter=upcoming|past|all — schedule for the signed-in staff member. */
export async function GET(request: Request) {
  const session = await requireStaff(request);
  if (!session) return staffUnauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") ?? "all";
  const now = new Date();

  // Scope: staff → activities on their assigned leads; admin → everything.
  const scope =
    session.role === "admin"
      ? {}
      : { lead: { assignedToId: session.staffId } };
  const where =
    filter === "upcoming"
      ? { ...scope, status: "scheduled" as const, scheduledAt: { gte: now } }
      : filter === "past"
        ? {
            ...scope,
            OR: [
              { status: { in: ["completed", "cancelled"] } },
              {
                status: "scheduled",
                scheduledAt: { lt: now },
              },
            ],
          }
        : scope;

  const activities = await db.activity.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
    take: 300,
    include: {
      lead: {
        select: { id: true, name: true, company: true, status: true },
      },
    },
  });

  return NextResponse.json({ ok: true, activities });
}

/** POST /api/staff/activities — schedule a call/meeting for one of the staff member's leads. */
export async function POST(request: Request) {
  const session = await requireStaff(request);
  if (!session) return staffUnauthorizedResponse();

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Please fill in every field correctly." },
      { status: 400 }
    );
  }

  // The lead must be one of theirs (or any lead for admins).
  const lead = await db.lead.findUnique({
    where: { id: parsed.data.leadId },
    select: { id: true, assignedToId: true },
  });
  if (
    !lead ||
    (session.role !== "admin" && lead.assignedToId !== session.staffId)
  ) {
    return NextResponse.json(
      { ok: false, message: "Lead not found." },
      { status: 404 }
    );
  }

  const activity = await db.activity.create({
    data: {
      leadId: lead.id,
      type: parsed.data.type,
      title: parsed.data.title,
      scheduledAt: new Date(parsed.data.scheduledAt),
      notes: parsed.data.notes ?? null,
      createdById: session.staffId,
    },
    include: {
      lead: { select: { id: true, name: true, company: true, status: true } },
    },
  });

  return NextResponse.json({ ok: true, activity });
}
