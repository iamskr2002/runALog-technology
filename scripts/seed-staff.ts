/**
 * Seed staff accounts for the RunA Log Technologies staff panel.
 *
 * Idempotent — safe to run repeatedly. Creates:
 *  1. Owner (admin role)  — admin@runalog.com / RunaAdmin@2025
 *  2. Demo staff member   — staff@runalog.com / RunaStaff@2025
 *     …and assigns up to 12 unassigned leads to the demo staff member so
 *     their dashboard has data on first sign-in.
 *
 * Run with: bun scripts/seed-staff.ts
 */

import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as scryptCallback } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number
) => Promise<Buffer>;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

const db = new PrismaClient({ log: [] });

const ACCOUNTS = [
  {
    email: "admin@runalog.com",
    name: "Owner (Admin)",
    password: "RunaAdmin@2025",
    role: "admin",
  },
  {
    email: "staff@runalog.com",
    name: "Alex Morgan",
    password: "RunaStaff@2025",
    role: "staff",
  },
];

async function main() {
  for (const account of ACCOUNTS) {
    const passwordHash = await hashPassword(account.password);
    const staff = await db.staff.upsert({
      where: { email: account.email },
      update: {}, // keep the existing password if the account already exists
      create: {
        email: account.email,
        name: account.name,
        passwordHash,
        role: account.role,
      },
    });
    console.log(
      `✓ ${account.role.padEnd(5)} ${staff.email} — password: ${account.password}`
    );
  }

  // Give the demo staff member some assigned leads (only when unassigned).
  const demo = await db.staff.findUnique({
    where: { email: "staff@runalog.com" },
    select: { id: true },
  });
  if (demo) {
    const unassigned = await db.lead.findMany({
      where: { assignedToId: null, status: { not: "won" } },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true },
    });
    if (unassigned.length > 0) {
      await db.lead.updateMany({
        where: { id: { in: unassigned.map((lead) => lead.id) } },
        data: { assignedToId: demo.id },
      });
      console.log(`✓ assigned ${unassigned.length} leads to staff@runalog.com`);
    }
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
