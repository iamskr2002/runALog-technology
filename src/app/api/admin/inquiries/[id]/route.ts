import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z
    .enum(["new", "read", "replied", "converted", "archived"])
    .optional(),
  notes: z.string().max(5000).nullable().optional(),
});

/** PATCH /api/admin/inquiries/:id — update status / admin notes. */
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
    const inquiry = await db.projectInquiry.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ ok: true, inquiry });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Inquiry not found." },
      { status: 404 }
    );
  }
}

/** DELETE /api/admin/inquiries/:id */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const { id } = await params;
  try {
    await db.projectInquiry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Inquiry not found." },
      { status: 404 }
    );
  }
}
