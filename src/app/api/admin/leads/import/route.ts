import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Normalise a spreadsheet header for mapping: "Full Name " → "fullname". */
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z]/g, "");
}

const HEADER_ALIASES: Record<string, string[]> = {
  name: ["name", "fullname", "contactname", "contact", "leadname", "clientname"],
  email: ["email", "emailaddress", "mail"],
  phone: ["phone", "phonenumber", "mobile", "contactnumber", "telephone", "tel"],
  company: ["company", "companyname", "organization", "organisation", "business", "businessname"],
  status: ["status", "stage", "leadstatus"],
  value: ["value", "dealvalue", "budget", "amount", "estimatedvalue", "dealvalueusd"],
  notes: ["notes", "note", "comment", "comments", "description", "remarks"],
};

function mapHeaders(sample: Record<string, unknown>): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const rawKey of Object.keys(sample)) {
    const normalized = normalizeKey(rawKey);
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(normalized) && !Object.values(mapping).includes(field)) {
        mapping[rawKey] = field;
        break;
      }
    }
  }
  return mapping;
}

const VALID_STATUSES = new Set([
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
]);

function normalizeStatus(input: unknown): string {
  const value = String(input ?? "").trim().toLowerCase();
  if (value === "open") return "new";
  if (value === "closed" || value === "converted") return "won";
  return VALID_STATUSES.has(value) ? value : "new";
}

function parseValue(input: unknown): number | null {
  if (input === null || input === undefined || input === "") return null;
  const numeric = Number(String(input).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

function cellToString(input: unknown): string | null {
  if (input === null || input === undefined) return null;
  const value = String(input).trim();
  return value.length > 0 ? value : null;
}

/**
 * POST /api/admin/leads/import — multipart/form-data with a `file` field.
 * Accepts .csv, .xlsx, .xls. Requires a "name" column (common aliases
 * recognised). Rows with an email that already exists are skipped.
 */
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Expected multipart form data with a `file` field." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { ok: false, message: "Please choose a CSV or XLSX file to import." },
      { status: 400 }
    );
  }

  let rows: Record<string, unknown>[] = [];
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer", raw: false });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new Error("Empty workbook");
    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Could not read the file. Please export it as .csv or .xlsx and try again.",
      },
      { status: 400 }
    );
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { ok: false, message: "The file does not contain any data rows." },
      { status: 400 }
    );
  }

  const mapping = mapHeaders(rows[0]);
  if (!Object.values(mapping).includes("name")) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'Could not find a "Name" column. Include a Name (or Full Name) column and try again.',
      },
      { status: 400 }
    );
  }

  const existingEmails = new Set(
    (
      await db.lead.findMany({
        where: { email: { not: null } },
        select: { email: true },
      })
    )
      .map((lead) => lead.email?.toLowerCase())
      .filter(Boolean) as string[]
  );

  let imported = 0;
  let skipped = 0;
  const errors: { row: number; reason: string }[] = [];

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const rowNumber = index + 2; // +1 header row, +1 for 1-based numbering

    const record: Record<string, unknown> = {};
    for (const [rawKey, field] of Object.entries(mapping)) {
      record[field] = row[rawKey];
    }

    const name = cellToString(record.name);
    if (!name) {
      skipped += 1;
      errors.push({ row: rowNumber, reason: "Missing name" });
      continue;
    }

    const email = cellToString(record.email);
    if (email && existingEmails.has(email.toLowerCase())) {
      skipped += 1;
      errors.push({ row: rowNumber, reason: `Duplicate email: ${email}` });
      continue;
    }

    try {
      const lead = await db.lead.create({
        data: {
          name: name.slice(0, 120),
          email: email ? email.slice(0, 200) : null,
          phone: cellToString(record.phone)?.slice(0, 40) ?? null,
          company: cellToString(record.company)?.slice(0, 150) ?? null,
          source: "import",
          status: normalizeStatus(record.status),
          value: parseValue(record.value),
          notes: cellToString(record.notes)?.slice(0, 5000) ?? null,
        },
      });
      if (email) existingEmails.add(email.toLowerCase());
      imported += 1;
      void lead;
    } catch {
      skipped += 1;
      errors.push({ row: rowNumber, reason: "Failed to save row" });
    }
  }

  return NextResponse.json({
    ok: true,
    imported,
    skipped,
    total: rows.length,
    errors: errors.slice(0, 50),
  });
}
