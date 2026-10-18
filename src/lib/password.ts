/**
 * RunA Log Technologies — staff password hashing.
 *
 * scrypt from Node's built-in crypto module (no external dependency).
 * Stored format: `scrypt$<salt-hex>$<hash-hex>` with a 16-byte salt and a
 * 64-byte derived key. Verification uses a length-checked timing-safe
 * comparison.
 */

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number
) => Promise<Buffer>;

const KEY_LENGTH = 64;

/** Hash a plain-text password for storage in Staff.passwordHash. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

/** Verify a plain-text password against a stored scrypt hash. */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, saltHex, hashHex] = parts;
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== KEY_LENGTH) return false;
  const derived = await scrypt(password, Buffer.from(saltHex, "hex"), KEY_LENGTH);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
