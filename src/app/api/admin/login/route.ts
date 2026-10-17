import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  checkAdminPassword,
  createSessionToken,
} from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/admin/login — exchange the admin password for a signed session cookie. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
  } | null;

  const password = typeof body?.password === "string" ? body.password : "";
  if (!password || !checkAdminPassword(password)) {
    return NextResponse.json(
      { ok: false, message: "Incorrect password." },
      { status: 401 }
    );
  }

  const { token, maxAge } = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
