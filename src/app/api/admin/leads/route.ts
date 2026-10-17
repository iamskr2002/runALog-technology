import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  company: z.string().trim().max(150).nullable().optional(),
  source: z.enum(["manual", "import", "website"]).optional(),
  status: z.enum(LEAD_STATUSES as [string, ...string[]]).optional(),
  value: z.number().min(0).max(1_000_000_000).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

/** GET /api/admin/leads?status=&q= — list leads (newest first, with next scheduled activity). */
export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const where =
    status && status !== "all" && LEAD_STATUSES.includes(status)
      ? { status }
      : {};

  const now = new Date();

  const rows = await db.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      activities: {
        where: { status: "scheduled", scheduledAt: { gte: now } },
        orderBy: { scheduledAt: "asc" },
        take: 1,
      },
      client: { select: { id: true, name: true } },
    },
  });

  const leads = rows.map((lead) => ({
    ...lead,
    nextActivity: lead.activities[0] ?? null,
    activities: undefined,
  }));

  const filtered = query
    ? leads.filter((lead) =>
        [
          lead.name,
          lead.email ?? "",
          lead.phone ?? "",
          lead.company ?? "",
          lead.notes ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    : leads;

  return NextResponse.json({ ok: true, leads: filtered });
}

/** POST /api/admin/leads — create a lead manually. */
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Please provide at least a name." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const lead = await db.lead.create({
    data: {
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      company: data.company ?? null,
      source: data.source ?? "manual",
      status: data.status ?? "new",
      value: data.value ?? null,
      notes: data.notes ?? null,
    },
  });

  return NextResponse.json({ ok: true, lead });
}
