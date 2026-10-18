/**
 * Export all rows from the local SQLite database (db/custom.db) into a
 * Postgres-flavored SQL file: supabase/0002_data_export.sql.
 *
 * The output file is meant to be run against Supabase AFTER
 * supabase/migrations/0001_init.sql has created the schema (see
 * SUPABASE_MIGRATION.md for the full step-by-step guide).
 *
 * Behavior:
 *  - READ-ONLY for the database: uses Prisma findMany() only, never writes.
 *  - Exports tables in FK-safe order: ProjectInquiry -> Staff -> Lead ->
 *    Activity -> Client, so foreign keys are satisfied while inserting.
 *  - Output is wrapped in BEGIN; ... COMMIT; so it either fully applies
 *    or not at all, and should be run once against empty tables.
 *
 * Run with: bun scripts/export-sqlite-data.ts
 */

import { PrismaClient } from "@prisma/client";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const db = new PrismaClient({ log: [] });

const OUTPUT_PATH = path.join(process.cwd(), "supabase", "0002_data_export.sql");

/** Column order per table (matches prisma/schema.prisma field order). */
const COLUMNS = {
  ProjectInquiry: [
    "id",
    "fullName",
    "email",
    "company",
    "service",
    "budget",
    "timeline",
    "description",
    "status",
    "notes",
    "createdAt",
    "updatedAt",
  ],
  Staff: [
    "id",
    "name",
    "email",
    "passwordHash",
    "role",
    "active",
    "lastLoginAt",
    "createdAt",
    "updatedAt",
  ],
  Lead: [
    "id",
    "name",
    "email",
    "phone",
    "company",
    "source",
    "status",
    "value",
    "notes",
    "inquiryId",
    "assignedToId",
    "createdAt",
    "updatedAt",
  ],
  Activity: [
    "id",
    "leadId",
    "type",
    "title",
    "scheduledAt",
    "status",
    "outcome",
    "notes",
    "createdById",
    "createdAt",
    "updatedAt",
  ],
  Client: [
    "id",
    "leadId",
    "name",
    "email",
    "phone",
    "company",
    "service",
    "status",
    "value",
    "startDate",
    "notes",
    "createdAt",
    "updatedAt",
  ],
} as const;

/** Escape a string literal for SQL: double up single quotes. */
function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** Convert one Prisma scalar value into its Postgres SQL literal. */
function sqlValue(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (value instanceof Date) return `${sqlString(value.toISOString())}::timestamptz`;
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return String(value);
  return sqlString(String(value));
}

/** Build one INSERT statement for a row (keys must cover `columns`). */
function insertStatement(table: string, columns: readonly string[], row: Record<string, unknown>): string {
  const columnList = columns.map((column) => `"${column}"`).join(", ");
  const valueList = columns.map((column) => sqlValue(row[column])).join(", ");
  return `INSERT INTO "${table}" (${columnList}) VALUES (${valueList});`;
}

async function exportProjectInquiries(): Promise<string[]> {
  const rows = await db.projectInquiry.findMany({ orderBy: { createdAt: "asc" } });
  const columns = COLUMNS.ProjectInquiry;
  return rows.map((row) =>
    insertStatement("ProjectInquiry", columns, {
      id: row.id,
      fullName: row.fullName,
      email: row.email,
      company: row.company,
      service: row.service,
      budget: row.budget,
      timeline: row.timeline,
      description: row.description,
      status: row.status,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  );
}

async function exportStaff(): Promise<string[]> {
  const rows = await db.staff.findMany({ orderBy: { createdAt: "asc" } });
  const columns = COLUMNS.Staff;
  return rows.map((row) =>
    insertStatement("Staff", columns, {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role,
      active: row.active,
      lastLoginAt: row.lastLoginAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  );
}

async function exportLeads(): Promise<string[]> {
  // Scalar fields only (including the FK scalars inquiryId / assignedToId);
  // no relations are included, so nothing beyond the table itself is read.
  const rows = await db.lead.findMany({ orderBy: { createdAt: "asc" } });
  const columns = COLUMNS.Lead;
  return rows.map((row) =>
    insertStatement("Lead", columns, {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      source: row.source,
      status: row.status,
      value: row.value,
      notes: row.notes,
      inquiryId: row.inquiryId,
      assignedToId: row.assignedToId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  );
}

async function exportActivities(): Promise<string[]> {
  const rows = await db.activity.findMany({ orderBy: { scheduledAt: "asc" } });
  const columns = COLUMNS.Activity;
  return rows.map((row) =>
    insertStatement("Activity", columns, {
      id: row.id,
      leadId: row.leadId,
      type: row.type,
      title: row.title,
      scheduledAt: row.scheduledAt,
      status: row.status,
      outcome: row.outcome,
      notes: row.notes,
      createdById: row.createdById,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  );
}

async function exportClients(): Promise<string[]> {
  const rows = await db.client.findMany({ orderBy: { createdAt: "asc" } });
  const columns = COLUMNS.Client;
  return rows.map((row) =>
    insertStatement("Client", columns, {
      id: row.id,
      leadId: row.leadId,
      name: row.name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      service: row.service,
      status: row.status,
      value: row.value,
      startDate: row.startDate,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  );
}

async function main(): Promise<void> {
  // FK-safe order: parents first.
  const inquiries = await exportProjectInquiries();
  const staff = await exportStaff();
  const leads = await exportLeads();
  const activities = await exportActivities();
  const clients = await exportClients();

  const lines: string[] = [
    `-- Generated by scripts/export-sqlite-data.ts on ${new Date().toISOString()} — run AFTER 0001_init.sql`,
    `-- Source: local SQLite database (DATABASE_URL in .env, e.g. db/custom.db).`,
    `-- All statements are wrapped in a transaction: it either fully applies or not at all.`,
    `-- Run this file ONCE, against empty tables (fresh after 0001_init.sql).`,
    ``,
    `BEGIN;`,
    ``,
    `-- Table: ProjectInquiry (${inquiries.length} rows)`,
    ...inquiries,
    ``,
    `-- Table: Staff (${staff.length} rows)`,
    ...staff,
    ``,
    `-- Table: Lead (${leads.length} rows)`,
    ...leads,
    ``,
    `-- Table: Activity (${activities.length} rows)`,
    ...activities,
    ``,
    `-- Table: Client (${clients.length} rows)`,
    ...clients,
    ``,
    `COMMIT;`,
    ``,
  ];

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, lines.join("\n"), "utf8");

  console.log("SQLite data export complete.");
  console.log(`  ProjectInquiry: ${inquiries.length}`);
  console.log(`  Staff:          ${staff.length}`);
  console.log(`  Lead:           ${leads.length}`);
  console.log(`  Activity:       ${activities.length}`);
  console.log(`  Client:         ${clients.length}`);
  console.log(`Total rows:       ${inquiries.length + staff.length + leads.length + activities.length + clients.length}`);
  console.log(`Written to:       ${OUTPUT_PATH}`);
}

main()
  .catch((error) => {
    console.error("Export failed:", error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
