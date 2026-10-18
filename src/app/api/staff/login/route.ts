import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import {
  createStaffToken,
  STAFF_COOKIE_NAME,
  type StaffRole,
} from "@/lib/staff-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

/** POST /api/staff/login — exchange email + password for a signed staff cookie. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Please enter your email and password." },
      { status: 400 }
    );
  }

  const staff = await db.staff.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true, active: true, role: true, passwordHash: true },
  });

  // Same response shape for unknown email / wrong password / disabled
  // account so the endpoint does not leak which emails exist.
  if (!staff || !staff.active) {
    return NextResponse.json(
      { ok: false, message: "Invalid email or password." },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(parsed.data.password, staff.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { ok: false, message: "Invalid email or password." },
      { status: 401 }
    );
  }

  const { token, maxAge } = await createStaffToken(
    staff.id,
    staff.role as StaffRole
  );
  await db.staff.update({
    where: { id: staff.id },
    data: { lastLoginAt: new Date() },
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(STAFF_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
