import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff, staffUnauthorizedResponse } from "@/lib/staff-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z
    .enum([
      "new",
      "contacted",
      "qualified",
      "proposal",
      "negotiation",
      "won",
      "lost",
    ])
    .optional(),
  value: z.number().min(0).max(1_000_000_000).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

/**
 * Guard helper: staff can only touch leads assigned to them.
 * Returns the lead (with assignedToId) or null when not found / forbidden.
 */
async function accessibleLead(id: string, session: {
  staffId: string;
  role: string;
}) {
  const lead = await db.lead.findUnique({
    where: { id },
    select: { id: true, assignedToId: true },
  });
  if (!lead) return null;
  if (session.role !== "admin" && lead.assignedToId !== session.staffId) {
    return null;
  }
  return lead;
}

/** GET /api/staff/leads/:id — lead detail with activity timeline. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireStaff(request);
  if (!session) return staffUnauthorizedResponse();

  const { id } = await params;
  if (!(await accessibleLead(id, session))) {
    return NextResponse.json(
      { ok: false, message: "Lead not found." },
      { status: 404 }
    );
  }

  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      activities: { orderBy: { scheduledAt: "desc" } },
      client: true,
      assignedTo: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ ok: true, lead });
}

/** PATCH /api/staff/leads/:id — update pipeline status, value and notes. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireStaff(request);
  if (!session) return staffUnauthorizedResponse();

  const { id } = await params;
  if (!(await accessibleLead(id, session))) {
    return NextResponse.json(
      { ok: false, message: "Lead not found." },
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

  const lead = await db.lead.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true, lead });
}
