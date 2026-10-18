import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-session";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(200),
  role: z.enum(["admin", "staff"]).optional(),
});

/** GET /api/admin/staff — list team members with their lead counts. */
export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const staff = await db.staff.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
      _count: { select: { assignedLeads: true, activities: true } },
    },
  });

  return NextResponse.json({
    ok: true,
    staff: staff.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      active: member.active,
      lastLoginAt: member.lastLoginAt,
      createdAt: member.createdAt,
      leadCount: member._count.assignedLeads,
      activityCount: member._count.activities,
    })),
  });
}

/** POST /api/admin/staff — create a team member account. */
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Name, a valid email and a password of 8+ characters are required.",
      },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.staff.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { ok: false, message: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const staff = await db.staff.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      role: parsed.data.role ?? "staff",
    },
  });

  return NextResponse.json({ ok: true, staff });
}
