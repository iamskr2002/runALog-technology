/**
 * RunA Log Technologies — admin session helpers.
 *
 * Lightweight signed-cookie authentication for the admin panel (/admin).
 * - Password comes from the ADMIN_PASSWORD env var (with a documented
 *   development default so the panel works out of the box in this sandbox).
 * - The cookie value is `<expiresAtMs>.<hmac-sha256(expiresAtMs, secret)>`
 *   and is verified with Web Crypto, so the same helpers work in the Node
 *   runtime (route handlers, server components) — no middleware required.
 * - Override ADMIN_PASSWORD / ADMIN_SECRET in production.
 */

import { NextResponse } from "next/server";

export const ADMIN_COOKIE_NAME = "runa_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "runa-admin-2025";
}

function getAdminSecret(): string {
  return process.env.ADMIN_SECRET ?? `runa-log::${getAdminPassword()}`;
}

/** Constant-shape password comparison (length is leaked, contents are not). */
export function checkAdminPassword(input: string): boolean {
  const expected = getAdminPassword();
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
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
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return bufferToHex(signature);
}

/** Create a signed session token valid for SESSION_TTL_MS. */
export async function createSessionToken(): Promise<{
  token: string;
  maxAge: number;
}> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const signature = await hmacHex(String(expiresAt), getAdminSecret());
  return {
    token: `${expiresAt}.${signature}`,
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

/** Verify a signed session token (signature + expiry). */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expiresAt = Number(payload);
  if (!Number.isSafeInteger(expiresAt) || expiresAt < Date.now()) return false;
  const expected = await hmacHex(payload, getAdminSecret());
  if (signature.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

/** Extract the session token from a request's Cookie header. */
export function readSessionToken(request: Request): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === ADMIN_COOKIE_NAME) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

/** Guard for admin API route handlers. */
export async function isAdminRequest(request: Request): Promise<boolean> {
  return verifySessionToken(readSessionToken(request));
}

/** Standard 401 response for unauthenticated admin API calls. */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { ok: false, message: "Unauthorized. Please sign in again." },
    { status: 401 }
  );
}
