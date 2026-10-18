/**
 * RunA Log Technologies — staff session helpers.
 *
 * Signed-cookie authentication for the staff panel (/staff):
 * - The cookie value is `v1.<staffId>.<expiresAtMs>.<hmac-sha256(...)>`
 *   signed with STAFF_SECRET and verified with Web Crypto (works in both
 *   the Node runtime route handlers and server components).
 * - Role travels in the payload so API guards can branch without a DB hit:
 *   role "staff" sees only their assigned leads, "admin" sees everything.
 * - Sessions last 24 hours; signing out deletes the cookie. Deactivating
 *   or deleting a staff member is enforced on every request against the
 *   database (see requireStaff), so access is revoked immediately.
 */

import { NextResponse } from "next/server";

export const STAFF_COOKIE_NAME = "runa_staff_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export type StaffRole = "admin" | "staff";

export type StaffSession = {
  staffId: string;
  role: StaffRole;
};

function getStaffSecret(): string {
  return process.env.STAFF_SECRET ?? "runa-log-staff-dev-secret";
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  return bufferToHex(signature);
}

/** Create a signed session token for a staff member, valid for 24 hours. */
export async function createStaffToken(
  staffId: string,
  role: StaffRole
): Promise<{ token: string; maxAge: number }> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `v1.${staffId}.${role}.${expiresAt}`;
  const signature = await hmacHex(payload, getStaffSecret());
  return {
    token: `${payload}.${signature}`,
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

/** Parse + verify a staff session token (signature and expiry). */
export async function verifyStaffToken(
  token: string | undefined | null
): Promise<StaffSession | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 5 || parts[0] !== "v1") return null;
  const [, staffId, role, expiresAtRaw, signature] = parts;
  const expiresAt = Number(expiresAtRaw);
  if (!staffId || (role !== "admin" && role !== "staff")) return null;
  if (!Number.isSafeInteger(expiresAt) || expiresAt < Date.now()) return null;
  const payload = `v1.${staffId}.${role}.${expiresAtRaw}`;
  const expected = await hmacHex(payload, getStaffSecret());
  if (signature.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return null;
  return { staffId, role };
}

/** Extract the staff session token from a request's Cookie header. */
export function readStaffToken(request: Request): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === STAFF_COOKIE_NAME) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

/** Session for an API request, or null when missing/invalid. */
export async function getStaffSession(
  request: Request
): Promise<StaffSession | null> {
  return verifyStaffToken(readStaffToken(request));
}

/**
 * Session guard for staff API routes — verifies the token AND that the
 * account still exists and is active, so deactivation is instant.
 */
export async function requireStaff(
  request: Request
): Promise<StaffSession | null> {
  const session = await getStaffSession(request);
  if (!session) return null;
  const staff = await staffDbFetch(session.staffId);
  if (!staff || !staff.active) return null;
  // Trust the database over the cookie for the current role.
  return { staffId: staff.id, role: staff.role as StaffRole };
}

/** Standard 401 response for unauthenticated staff API calls. */
export function staffUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { ok: false, message: "Unauthorized. Please sign in again." },
    { status: 401 }
  );
}

/* ── Server-component helpers (cookies from next/headers) ─────────────── */

/** Verify the staff cookie inside a server component / layout. */
export async function verifyStaffCookie(
  token: string | undefined | null
): Promise<StaffSession | null> {
  return verifyStaffToken(token);
}

async function staffDbFetch(
  staffId: string
): Promise<{ id: string; active: boolean; role: string } | null> {
  // Imported lazily so this module can also be used where Prisma is not
  // initialised yet (e.g. during the very first request after a rebuild).
  const { db } = await import("@/lib/db");
  return db.staff.findUnique({
    where: { id: staffId },
    select: { id: true, active: true, role: true },
  });
}
