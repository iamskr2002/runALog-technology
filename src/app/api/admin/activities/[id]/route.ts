import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  type: z.enum(["call", "meeting", "email", "follow-up"]).optional(),
  title: z.string().trim().min(1).max(150).optional(),
  scheduledAt: z.string().min(10).optional(),
  status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
  outcome: z.string().max(2000).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

/** PATCH /api/admin/activities/:id — reschedule, complete (with outcome), or cancel. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid payload." },
      { status: 400 }
    );
  }

  const { scheduledAt, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (scheduledAt) {
    const date = new Date(scheduledAt);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json(
        { ok: false, message: "Invalid date and time." },
        { status: 400 }
      );
    }
    data.scheduledAt = date;
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

/** DELETE /api/admin/activities/:id */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const { id } = await params;
  try {
    await db.activity.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Activity not found." },
      { status: 404 }
    );
  }
}
