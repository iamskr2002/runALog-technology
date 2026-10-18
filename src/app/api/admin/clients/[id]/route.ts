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
  service: z.string().trim().max(120).nullable().optional(),
  status: z
    .enum(["onboarding", "active", "paused", "completed", "churned"])
    .optional(),
  value: z.number().min(0).max(1_000_000_000).nullable().optional(),
  startDate: z.string().min(10).optional(),
  notes: z.string().max(5000).nullable().optional(),
});

/** PATCH /api/admin/clients/:id */
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

  const { startDate, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (startDate) {
    const date = new Date(startDate);
    if (!Number.isNaN(date.getTime())) data.startDate = date;
  }

  try {
    const client = await db.client.update({ where: { id }, data });
    return NextResponse.json({ ok: true, client });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Client not found." },
      { status: 404 }
    );
  }
}

/** DELETE /api/admin/clients/:id */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const { id } = await params;
  try {
    await db.client.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Client not found." },
      { status: 404 }
    );
  }
}
