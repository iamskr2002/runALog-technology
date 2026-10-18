import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff, staffUnauthorizedResponse } from "@/lib/staff-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
  outcome: z.string().max(2000).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  scheduledAt: z
    .string()
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Invalid date",
    })
    .optional(),
  title: z.string().trim().min(1).max(120).optional(),
});

/**
 * Guard helper: staff may only manage activities whose lead is assigned to
 * them. Returns the activity's lead scope check result.
 */
async function accessibleActivity(
  id: string,
  session: { staffId: string; role: string }
) {
  const activity = await db.activity.findUnique({
    where: { id },
    select: { id: true, lead: { select: { assignedToId: true } } },
  });
  if (!activity) return false;
  return (
    session.role === "admin" ||
    activity.lead.assignedToId === session.staffId
  );
}

/** PATCH /api/staff/activities/:id — complete, cancel, reschedule or add an outcome. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireStaff(request);
  if (!session) return staffUnauthorizedResponse();

  const { id } = await params;
  if (!(await accessibleActivity(id, session))) {
    return NextResponse.json(
      { ok: false, message: "Activity not found." },
      { status: 404 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid payload." },
      { status: 400 }
    );
  }

  const data = { ...parsed.data } as Record<string, unknown>;
  if (typeof data.scheduledAt === "string") {
    data.scheduledAt = new Date(data.scheduledAt);
  }

  try {
    const activity = await db.activity.update({
      where: { id },
      data,
      include: {
        lead: { select: { id: true, name: true, company: true, status: true } },
      },
    });
    return NextResponse.json({ ok: true, activity });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Activity not found." },
      { status: 404 }
    );
  }
}
