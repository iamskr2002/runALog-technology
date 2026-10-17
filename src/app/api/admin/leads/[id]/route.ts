import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().max(200).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  company: z.string().trim().max(150).nullable().optional(),
  status: z
    .enum(["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"])
    .optional(),
  value: z.number().min(0).max(1_000_000_000).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

/** GET /api/admin/leads/:id — lead detail with activity timeline. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const { id } = await params;
  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      activities: { orderBy: { scheduledAt: "desc" } },
      client: true,
    },
  });

  if (!lead) {
    return NextResponse.json(
      { ok: false, message: "Lead not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, lead });
}

/** PATCH /api/admin/leads/:id — update any lead field (status, value, notes…). */
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

  try {
    const lead = await db.lead.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ ok: true, lead });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Lead not found." },
      { status: 404 }
    );
  }
}

/** DELETE /api/admin/leads/:id — removes the lead and its scheduled activities. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const { id } = await params;
  try {
    await db.lead.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Lead not found." },
      { status: 404 }
    );
  }
}
