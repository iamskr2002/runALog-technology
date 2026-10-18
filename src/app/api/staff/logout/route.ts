import { NextResponse } from "next/server";
import { STAFF_COOKIE_NAME } from "@/lib/staff-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/staff/logout — clear the staff session cookie. */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(STAFF_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
