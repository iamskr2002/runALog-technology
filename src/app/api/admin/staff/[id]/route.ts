import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-session";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  role: z.enum(["admin", "staff"]).optional(),
  active: z.boolean().optional(),
  /** Provide to reset the member's password (min 8 chars). */
  password: z.string().min(8).max(200).nullable().optional(),
});

/** PATCH /api/admin/staff/:id — update a team member / reset their password. */
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

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.role !== undefined) data.role = parsed.data.role;
  if (parsed.data.active !== undefined) data.active = parsed.data.active;
  if (parsed.data.password) {
    data.passwordHash = await hashPassword(parsed.data.password);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { ok: false, message: "Nothing to update." },
      { status: 400 }
    );
  }

  try {
    const staff = await db.staff.update({ where: { id }, data });
    return NextResponse.json({
      ok: true,
      staff: { ...staff, passwordHash: undefined },
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Staff member not found." },
      { status: 404 }
    );
  }
}

/** DELETE /api/admin/staff/:id — remove a team member; their leads become unassigned. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const { id } = await params;
  try {
    await db.staff.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Staff member not found." },
      { status: 404 }
    );
  }
}
